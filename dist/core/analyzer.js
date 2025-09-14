import { logger } from '../utils/logger.js';
import { ContextEngine } from '../components/context-engine/index.js';
import { SmartFilter } from '../components/smart-filter/index.js';
import { FeatureDetector } from '../components/feature-detector/index.js';
import { RiskCalculator } from '../components/risk-calculator/index.js';
import { AIService } from '../services/ai.service.js';
export class BaselineAnalyzer {
    config;
    contextEngine;
    smartFilter;
    featureDetector;
    riskCalculator;
    aiService;
    constructor(config) {
        this.config = config;
        this.contextEngine = new ContextEngine();
        this.smartFilter = new SmartFilter();
        this.featureDetector = new FeatureDetector();
        this.riskCalculator = new RiskCalculator();
        this.aiService = new AIService(config.perplexityApiKey || process.env.PERPLEXITY_API_KEY);
        logger.info('Baseline Analyzer initialized with AI service');
    }
    async analyze(prData, codeChanges) {
        const startTime = Date.now();
        logger.info('Starting baseline analysis pipeline');
        try {
            logger.info('STAGE 1: Analyzing PR context');
            const prContext = await this.contextEngine.analyzePRContext(prData);
            const strategy = this.contextEngine.getAnalysisStrategy(prContext.size);
            logger.info(`PR Analysis: ${prContext.size} PR with ${prContext.filesChanged} files`);
            logger.info(`Strategy: ${strategy.filterAggressiveness} filtering, max ${strategy.maxReportedIssues} issues`);
            logger.info('STAGE 2: Applying smart filtering');
            let filteredChanges = await this.smartFilter.filterRelevantChanges(codeChanges);
            filteredChanges = this.smartFilter.applyContextualFiltering(filteredChanges, strategy);
            logger.info(`Filtered to ${filteredChanges.length} relevant changes from ${codeChanges.length} total`);
            logger.info('STAGE 3: Detecting web platform features');
            const detectedFeatures = await this.featureDetector.detectFeatures(filteredChanges);
            logger.info(`Detected ${detectedFeatures.length} web platform features`);
            logger.info('STAGE 4: Assessing compatibility risks');
            const allRisks = await this.riskCalculator.assessRisks(detectedFeatures, prContext, this.config);
            logger.info('STAGE 5: Applying large PR handling logic');
            const filteredRisks = this.applyLargePRLogic(allRisks, strategy);
            let aiAnalyses = [];
            if (this.config.enableAIReview && filteredRisks.length > 0) {
                logger.info('STAGE 6: Running AI analysis for intelligent suggestions');
                try {
                    aiAnalyses = await this.aiService.analyzeFeatures(filteredRisks, prContext);
                    logger.info(`AI analysis completed: ${aiAnalyses.length} features analyzed`);
                }
                catch (error) {
                    logger.warn('AI analysis failed:', error);
                }
            }
            logger.info('STAGE 7: Making final PR decision');
            const decision = this.makeDecision(filteredRisks, prContext);
            const summary = this.generateSummary(allRisks);
            const processingTime = Date.now() - startTime;
            const result = {
                prContext,
                totalFeaturesDetected: detectedFeatures.length,
                risksFound: filteredRisks,
                aiAnalyses: aiAnalyses.length > 0 ? aiAnalyses : undefined,
                summary,
                decision,
                processingTime,
            };
            logger.info(`Analysis complete in ${processingTime}ms`);
            logger.info(`Decision: ${decision.action} - ${decision.message}`);
            return result;
        }
        catch (error) {
            logger.error('Analysis pipeline failed', error);
            throw error;
        }
    }
    applyLargePRLogic(risks, strategy) {
        if (!strategy.focusOnCritical) {
            return risks
                .filter(risk => risk.risk !== 'IGNORE')
                .slice(0, strategy.maxReportedIssues);
        }
        const criticalRisks = risks.filter(risk => risk.risk === 'CRITICAL' || risk.risk === 'HIGH');
        const mediumRisks = risks.filter(risk => risk.risk === 'MEDIUM');
        let result = [...criticalRisks];
        if (result.length < strategy.maxReportedIssues) {
            const remainingSlots = strategy.maxReportedIssues - result.length;
            result = result.concat(mediumRisks.slice(0, remainingSlots));
        }
        const skipped = risks.length - result.length;
        if (skipped > 0) {
            logger.info(`Large PR: Reporting ${result.length} critical issues, skipping ${skipped} lower-priority items`);
        }
        return result;
    }
    makeDecision(risks, context) {
        if (risks.length === 0) {
            return {
                action: 'NONE',
                shouldBlock: false,
                message: 'No baseline compatibility issues found. Great job! 🎉',
            };
        }
        const criticalCount = risks.filter(r => r.risk === 'CRITICAL').length;
        const highCount = risks.filter(r => r.risk === 'HIGH').length;
        const mediumCount = risks.filter(r => r.risk === 'MEDIUM').length;
        const highRiskFeatures = risks.filter(r => r.risk === 'HIGH');
        if (highRiskFeatures.length > 0) {
            logger.warn(`🚨 HIGH RISK FEATURES DETECTED:`);
            highRiskFeatures.forEach(assessment => {
                logger.warn(`   - ${assessment.feature.name} (baseline: ${assessment.baseline?.status}) - ${assessment.reason}`);
            });
        }
        if (criticalCount > 0) {
            return {
                action: 'BLOCK_PR',
                shouldBlock: true,
                message: `🚨 CRITICAL: ${criticalCount} breaking compatibility ${criticalCount === 1 ? 'issue' : 'issues'} found. These will break your app in some browsers!`,
            };
        }
        if (highCount > 0) {
            return {
                action: 'BLOCK_PR',
                shouldBlock: true,
                message: `⚠️ HIGH RISK: ${highCount} serious compatibility ${highCount === 1 ? 'issue' : 'issues'} found. Please review and add fallbacks.`,
            };
        }
        if (mediumCount > 0) {
            const action = context.size === 'LARGE' || context.size === 'HUGE' ? 'COMMENT_ONLY' : 'REQUIRE_REVIEW';
            return {
                action,
                shouldBlock: action === 'REQUIRE_REVIEW',
                message: `🔍 MEDIUM RISK: ${mediumCount} compatibility ${mediumCount === 1 ? 'concern' : 'concerns'} found. Consider adding fallbacks for better support.`,
            };
        }
        return {
            action: 'COMMENT_ONLY',
            shouldBlock: false,
            message: `📝 LOW RISK: Found some minor compatibility notes. Review when convenient.`,
        };
    }
    generateSummary(risks) {
        return {
            critical: risks.filter(r => r.risk === 'CRITICAL').length,
            high: risks.filter(r => r.risk === 'HIGH').length,
            medium: risks.filter(r => r.risk === 'MEDIUM').length,
            low: risks.filter(r => r.risk === 'LOW').length,
        };
    }
    async analyzeCodeChanges(codeChanges) {
        const mockPRData = {
            number: 123,
            title: 'Test PR',
            body: 'Testing the analyzer',
            changed_files: codeChanges.length,
            additions: codeChanges.length * 10,
            deletions: 0,
            user: { login: 'developer' },
            base: {
                repo: {
                    owner: { login: 'test-org' },
                    name: 'test-repo',
                    private: false,
                },
            },
        };
        return this.analyze(mockPRData, codeChanges);
    }
}
//# sourceMappingURL=analyzer.js.map
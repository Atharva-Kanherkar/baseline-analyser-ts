import type { 
  AnalysisResult, 
  AnalyzerConfig, 
  CodeChange, 
  PRContext,
  RiskAssessment,
  ActionType
} from './types.js';
import { logger } from '../utils/logger.js';
import { ContextEngine } from '../components/context-engine/index.js';
import { SmartFilter } from '../components/smart-filter/index.js';
import { FeatureDetector } from '../components/feature-detector/index.js';
import { RiskCalculator } from '../components/risk-calculator/index.js';

/**
 * Main Analyzer - The Orchestrator
 * 
 * This is the heart of the system that:
 * 1. Coordinates all components in the analysis pipeline
 * 2. Implements the large PR handling logic
 * 3. Makes final decisions about PR actions
 * 4. Provides the complete analysis result
 * 
 * The key insight: Large PRs need different treatment than small ones!
 */
export class BaselineAnalyzer {
  private contextEngine: ContextEngine;
  private smartFilter: SmartFilter;
  private featureDetector: FeatureDetector;
  private riskCalculator: RiskCalculator;
  
  constructor(private config: AnalyzerConfig) {
    this.contextEngine = new ContextEngine();
    this.smartFilter = new SmartFilter();
    this.featureDetector = new FeatureDetector();
    this.riskCalculator = new RiskCalculator();
    
    logger.info('Baseline Analyzer initialized');
  }
  
  /**
   * Main analysis method - the complete pipeline!
   */
  async analyze(prData: unknown, codeChanges: CodeChange[]): Promise<AnalysisResult> {
    const startTime = Date.now();
    logger.info('Starting baseline analysis pipeline');
    
    try {
      // STAGE 1: Analyze PR Context
      logger.info('STAGE 1: Analyzing PR context');
      const prContext = await this.contextEngine.analyzePRContext(prData);
      const strategy = this.contextEngine.getAnalysisStrategy(prContext.size);
      
      logger.info(`PR Analysis: ${prContext.size} PR with ${prContext.filesChanged} files`);
      logger.info(`Strategy: ${strategy.filterAggressiveness} filtering, max ${strategy.maxReportedIssues} issues`);
      
      // STAGE 2: Smart Filtering
      logger.info('STAGE 2: Applying smart filtering');
      let filteredChanges = await this.smartFilter.filterRelevantChanges(codeChanges);
      
      // Apply contextual filtering based on PR size
      filteredChanges = this.smartFilter.applyContextualFiltering(filteredChanges, strategy);
      
      logger.info(`Filtered to ${filteredChanges.length} relevant changes from ${codeChanges.length} total`);
      
      // STAGE 3: Feature Detection  
      logger.info('STAGE 3: Detecting web platform features');
      const detectedFeatures = await this.featureDetector.detectFeatures(filteredChanges);
      
      logger.info(`Detected ${detectedFeatures.length} web platform features`);
      
      // STAGE 4: Risk Assessment
      logger.info('STAGE 4: Assessing compatibility risks');
      const allRisks = await this.riskCalculator.assessRisks(
        detectedFeatures, 
        prContext, 
        this.config
      );
      
      // STAGE 5: Large PR Intelligence - Apply the key insight!
      logger.info('STAGE 5: Applying large PR handling logic');
      const filteredRisks = this.applyLargePRLogic(allRisks, strategy);
      
      // STAGE 6: Final Decision Making
      logger.info('STAGE 6: Making final PR decision');
      const decision = this.makeDecision(filteredRisks, prContext);
      
      // Generate summary
      const summary = this.generateSummary(allRisks);
      
      const processingTime = Date.now() - startTime;
      
      const result: AnalysisResult = {
        prContext,
        totalFeaturesDetected: detectedFeatures.length,
        risksFound: filteredRisks,
        summary,
        decision,
        processingTime,
      };
      
      logger.info(`Analysis complete in ${processingTime}ms`);
      logger.info(`Decision: ${decision.action} - ${decision.message}`);
      
      return result;
      
    } catch (error) {
      logger.error('Analysis pipeline failed', error);
      throw error;
    }
  }
  
  /**
   * Large PR Logic - The Core Insight!
   * 
   * This is what makes our analyzer smart:
   * - Small PRs: Report everything
   * - Large PRs: Only report critical issues
   * - Huge PRs: Only report blocking issues
   */
  private applyLargePRLogic(
    risks: RiskAssessment[], 
    strategy: { focusOnCritical: boolean; maxReportedIssues: number }
  ): RiskAssessment[] {
    
    if (!strategy.focusOnCritical) {
      // Small/Medium PRs: report most issues (up to limit)
      return risks
        .filter(risk => risk.risk !== 'IGNORE')
        .slice(0, strategy.maxReportedIssues);
    }
    
    // Large/Huge PRs: Focus on critical issues only
    const criticalRisks = risks.filter(risk => 
      risk.risk === 'CRITICAL' || risk.risk === 'HIGH'
    );
    
    const mediumRisks = risks.filter(risk => risk.risk === 'MEDIUM');
    
    // For large PRs, include some medium risks if we have room
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
  
  /**
   * Makes the final decision about what action to take
   */
  private makeDecision(
    risks: RiskAssessment[], 
    context: PRContext
  ): { action: ActionType; shouldBlock: boolean; message: string } {
    
    if (risks.length === 0) {
      return {
        action: 'NONE',
        shouldBlock: false,
        message: 'No baseline compatibility issues found. Great job! 🎉',
      };
    }
    
    // Count risks by severity
    const criticalCount = risks.filter(r => r.risk === 'CRITICAL').length;
    const highCount = risks.filter(r => r.risk === 'HIGH').length;
    const mediumCount = risks.filter(r => r.risk === 'MEDIUM').length;
    
    // Log HIGH risk features for debugging
    const highRiskFeatures = risks.filter(r => r.risk === 'HIGH');
    if (highRiskFeatures.length > 0) {
      logger.warn(`🚨 HIGH RISK FEATURES DETECTED:`);
      highRiskFeatures.forEach(assessment => {
        logger.warn(`   - ${assessment.feature.name} (baseline: ${assessment.baseline?.status}) - ${assessment.reason}`);
      });
    }
    
    // Decision logic based on highest severity
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
    
    // Only low-risk issues
    return {
      action: 'COMMENT_ONLY',
      shouldBlock: false,
      message: `📝 LOW RISK: Found some minor compatibility notes. Review when convenient.`,
    };
  }
  
  /**
   * Generates a summary of all detected risks
   */
  private generateSummary(risks: RiskAssessment[]) {
    return {
      critical: risks.filter(r => r.risk === 'CRITICAL').length,
      high: risks.filter(r => r.risk === 'HIGH').length,
      medium: risks.filter(r => r.risk === 'MEDIUM').length,
      low: risks.filter(r => r.risk === 'LOW').length,
    };
  }
  
  /**
   * Utility method for testing - analyze just code changes without PR data
   */
  async analyzeCodeChanges(codeChanges: CodeChange[]): Promise<AnalysisResult> {
    // Create mock PR data for testing
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
import { logger } from '../../utils/logger.js';
export class RiskCalculator {
    async assessRisks(features, context, config) {
        logger.info(`Assessing risks for ${features.length} features in ${context.size} PR`);
        const assessments = [];
        const { BaselineService } = await import('../../services/baseline.service.js');
        const baselineService = new BaselineService();
        for (const feature of features) {
            const baseline = await baselineService.getBaselineInfo(feature.name);
            const risk = this.calculateRisk(feature, baseline, context);
            const actionRequired = this.determineAction(risk, context.size, config);
            const { reason, recommendation, hasBreakingChange } = this.generateRiskAnalysis(feature, baseline, context, risk);
            const assessment = {
                feature,
                baseline,
                risk,
                actionRequired,
                reason,
                recommendation,
                hasBreakingChange,
            };
            assessments.push(assessment);
        }
        logger.info(`Generated ${assessments.length} risk assessments`);
        return assessments;
    }
    calculateRisk(feature, baseline, context) {
        logger.debug(`Calculating risk for feature: ${feature.name}`);
        logger.debug(`Baseline data:`, baseline);
        if (!baseline) {
            logger.warn(`No baseline data found for ${feature.name}, assuming MEDIUM risk. Consider adding to fallback data.`);
            return 'MEDIUM';
        }
        const baseRisk = this.getBaseRiskFromBaseline(baseline);
        logger.debug(`Base risk for ${feature.name}: ${baseRisk} (baseline status: ${baseline.status})`);
        const contextAdjustedRisk = this.adjustRiskForContext(baseRisk, context);
        logger.debug(`Context-adjusted risk for ${feature.name}: ${contextAdjustedRisk}`);
        const finalRisk = this.adjustRiskForFeature(contextAdjustedRisk, feature);
        logger.debug(`Final risk for ${feature.name}: ${finalRisk}`);
        return finalRisk;
    }
    determineAction(risk, prSize, config) {
        if (risk === 'HIGH') {
            logger.warn(`🚨 HIGH RISK feature detected - will need fallbacks or consideration`);
        }
        if (risk === 'CRITICAL') {
            return 'BLOCK_PR';
        }
        if (risk === 'HIGH') {
            if (prSize === 'HUGE' && config.blockingLevel === 'CRITICAL') {
                return 'REQUIRE_REVIEW';
            }
            return 'BLOCK_PR';
        }
        if (risk === 'MEDIUM') {
            if (prSize === 'LARGE' || prSize === 'HUGE') {
                return 'COMMENT_ONLY';
            }
            return 'REQUIRE_REVIEW';
        }
        if (risk === 'LOW') {
            if (prSize === 'HUGE') {
                return 'NONE';
            }
            return 'COMMENT_ONLY';
        }
        return 'NONE';
    }
    getBaseRiskFromBaseline(baseline) {
        if (baseline.status === 'high') {
            return baseline.isWidelySupported ? 'LOW' : 'MEDIUM';
        }
        if (baseline.status === 'limited') {
            return 'MEDIUM';
        }
        if (baseline.status === 'low') {
            return 'HIGH';
        }
        if (baseline.status === 'unknown') {
            return 'MEDIUM';
        }
        return 'MEDIUM';
    }
    adjustRiskForContext(baseRisk, context) {
        if (context.size === 'HUGE') {
            if (baseRisk === 'HIGH')
                return 'MEDIUM';
            if (baseRisk === 'MEDIUM')
                return 'LOW';
        }
        if (context.size === 'LARGE') {
            if (baseRisk === 'MEDIUM')
                return 'LOW';
        }
        if (context.size === 'SMALL') {
            if (baseRisk === 'LOW')
                return 'LOW';
        }
        return baseRisk;
    }
    adjustRiskForFeature(baseRisk, feature) {
        if (feature.type === 'CSS') {
            if (baseRisk === 'HIGH')
                return 'MEDIUM';
        }
        if (feature.type === 'WEB_API') {
            if (baseRisk === 'MEDIUM')
                return 'HIGH';
        }
        if (feature.type === 'JAVASCRIPT') {
            if (feature.name.includes('=>') || feature.name.includes('async')) {
                if (baseRisk === 'MEDIUM')
                    return 'LOW';
            }
        }
        return baseRisk;
    }
    generateRiskAnalysis(feature, baseline, context, risk) {
        if (!baseline) {
            return {
                reason: `Unknown compatibility for "${feature.name}" - no baseline data available`,
                recommendation: 'Research browser support and add fallbacks if needed',
                hasBreakingChange: true,
            };
        }
        let reason = '';
        let recommendation = '';
        let hasBreakingChange = false;
        if (baseline.status === 'limited' || baseline.status === 'low') {
            const supportDate = baseline.dateSupported || 'unknown date';
            reason = `"${feature.name}" has limited browser support (${risk} risk - baseline: ${baseline.status}, supported since: ${supportDate})`;
            hasBreakingChange = true;
            if (feature.type === 'CSS') {
                recommendation = `Add @supports rule or provide CSS fallback for "${feature.name}"`;
            }
            else if (feature.type === 'JAVASCRIPT' || feature.type === 'WEB_API') {
                recommendation = `Add feature detection and polyfill for "${feature.name}"`;
            }
            else {
                recommendation = `Consider progressive enhancement for "${feature.name}"`;
            }
        }
        else if (baseline.status === 'high') {
            reason = `"${feature.name}" is widely supported (${risk} risk - ${baseline.status} baseline)`;
            recommendation = 'No action needed - feature is broadly compatible';
            hasBreakingChange = false;
        }
        else {
            reason = `"${feature.name}" has unknown support status (${risk} risk)`;
            recommendation = 'Verify browser compatibility and add fallbacks if needed';
            hasBreakingChange = true;
        }
        if (context.size === 'LARGE' || context.size === 'HUGE') {
            recommendation += ' (flagged due to large PR size - review carefully)';
        }
        return { reason, recommendation, hasBreakingChange };
    }
}
//# sourceMappingURL=index.js.map
import type { IRiskCalculator } from '../../core/interfaces.js';
import type { 
  DetectedFeature, 
  BaselineInfo, 
  RiskAssessment, 
  PRContext, 
  AnalyzerConfig,
  RiskLevel,
  ActionType
} from '../../core/types.js';
import { logger } from '../../utils/logger.js';

/**
 * Risk Calculator - The Intelligence Layer
 * 
 * This component combines:
 * - Detected features (what we found)
 * - Baseline data (browser compatibility)
 * - PR context (size, target browsers)
 * - Config (thresholds, preferences)
 * 
 * To produce actionable risk assessments that drive decision making
 */
export class RiskCalculator implements IRiskCalculator {
  
  /**
   * Assesses risks for all detected features given context and config
   */
  async assessRisks(
    features: DetectedFeature[],
    context: PRContext,
    config: AnalyzerConfig
  ): Promise<RiskAssessment[]> {
    logger.info(`Assessing risks for ${features.length} features in ${context.size} PR`);
    
    const assessments: RiskAssessment[] = [];
    
    // Get baseline service (would be injected in real implementation)
    const { BaselineService } = await import('../../services/baseline.service.js');
    const baselineService = new BaselineService();
    
    for (const feature of features) {
      // Get baseline compatibility data
      const baseline = await baselineService.getBaselineInfo(feature.name);
      
      // Calculate risk level
      const risk = this.calculateRisk(feature, baseline, context);
      
      // Determine required action
      const actionRequired = this.determineAction(risk, context.size, config);
      
      // Generate human-readable reason and recommendation
      const { reason, recommendation, hasBreakingChange } = this.generateRiskAnalysis(
        feature, 
        baseline, 
        context, 
        risk
      );
      
      const assessment: RiskAssessment = {
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
  
  /**
   * Calculates risk level for a single feature
   * This is the core risk algorithm!
   */
  calculateRisk(
    feature: DetectedFeature,
    baseline: BaselineInfo | null,
    context: PRContext
  ): RiskLevel {
    // Debug logging
    logger.debug(`Calculating risk for feature: ${feature.name}`);
    logger.debug(`Baseline data:`, baseline);
    
    // If we have no baseline data, assume medium risk instead of high
    // This prevents false positives for features that just aren't in our database
    if (!baseline) {
      logger.warn(`No baseline data found for ${feature.name}, assuming MEDIUM risk. Consider adding to fallback data.`);
      return 'MEDIUM';
    }
    
    // Risk matrix based on baseline status
    const baseRisk = this.getBaseRiskFromBaseline(baseline);
    logger.debug(`Base risk for ${feature.name}: ${baseRisk} (baseline status: ${baseline.status})`);
    
    // Adjust risk based on PR context
    const contextAdjustedRisk = this.adjustRiskForContext(baseRisk, context);
    logger.debug(`Context-adjusted risk for ${feature.name}: ${contextAdjustedRisk}`);
    
    // Adjust risk based on feature type and location
    const finalRisk = this.adjustRiskForFeature(contextAdjustedRisk, feature);
    logger.debug(`Final risk for ${feature.name}: ${finalRisk}`);
    
    return finalRisk;
  }
  
  /**
   * Determines what action should be taken based on risk and context
   */
  private determineAction(
    risk: RiskLevel, 
    prSize: string, 
    config: AnalyzerConfig
  ): ActionType {
    // For CRITICAL risks, always block
    if (risk === 'CRITICAL') {
      return 'BLOCK_PR';
    }
    
    // For HIGH risks, block unless it's a huge PR and config allows it
    if (risk === 'HIGH') {
      if (prSize === 'HUGE' && config.blockingLevel === 'CRITICAL') {
        return 'REQUIRE_REVIEW';
      }
      return 'BLOCK_PR';
    }
    
    // For MEDIUM risks, require review for small/medium PRs, comment for large
    if (risk === 'MEDIUM') {
      if (prSize === 'LARGE' || prSize === 'HUGE') {
        return 'COMMENT_ONLY';
      }
      return 'REQUIRE_REVIEW';
    }
    
    // For LOW risks, just comment (or none for huge PRs)
    if (risk === 'LOW') {
      if (prSize === 'HUGE') {
        return 'NONE';
      }
      return 'COMMENT_ONLY';
    }
    
    // IGNORE risks get no action
    return 'NONE';
  }
  
  /**
   * Gets base risk level from baseline compatibility data
   */
  private getBaseRiskFromBaseline(baseline: BaselineInfo): RiskLevel {
    // High baseline = low risk
    if (baseline.status === 'high') {
      return baseline.isWidelySupported ? 'LOW' : 'MEDIUM';
    }
    
    // Limited baseline = medium risk (more reasonable than blocking PRs)
    if (baseline.status === 'limited') {
      return 'MEDIUM';
    }
    
    // Low baseline = high risk (actually problematic features)
    if (baseline.status === 'low') {
      return 'HIGH';
    }
    
    // Unknown baseline = medium risk (don't block PRs for missing data)
    if (baseline.status === 'unknown') {
      return 'MEDIUM';
    }
    
    return 'MEDIUM';
  }
  
  /**
   * Adjusts risk based on PR context
   */
  private adjustRiskForContext(baseRisk: RiskLevel, context: PRContext): RiskLevel {
    // Large PRs: we're more lenient to avoid overwhelming developers
    if (context.size === 'HUGE') {
      if (baseRisk === 'HIGH') return 'MEDIUM';
      if (baseRisk === 'MEDIUM') return 'LOW';
    }
    
    if (context.size === 'LARGE') {
      if (baseRisk === 'MEDIUM') return 'LOW';
    }
    
    // Small PRs: we can be more strict since there's less noise
    if (context.size === 'SMALL') {
      if (baseRisk === 'LOW') return 'LOW'; // Keep as is for small PRs
    }
    
    return baseRisk;
  }
  
  /**
   * Adjusts risk based on feature characteristics
   */
  private adjustRiskForFeature(baseRisk: RiskLevel, feature: DetectedFeature): RiskLevel {
    // CSS features are often easier to polyfill
    if (feature.type === 'CSS') {
      if (baseRisk === 'HIGH') return 'MEDIUM';
    }
    
    // Web APIs are often harder to polyfill
    if (feature.type === 'WEB_API') {
      if (baseRisk === 'MEDIUM') return 'HIGH';
    }
    
    // JavaScript syntax issues can break everything
    if (feature.type === 'JAVASCRIPT') {
      // Arrow functions, async/await are now widely supported
      if (feature.name.includes('=>') || feature.name.includes('async')) {
        if (baseRisk === 'MEDIUM') return 'LOW';
      }
    }
    
    return baseRisk;
  }
  
  /**
   * Generates human-readable risk analysis
   */
  private generateRiskAnalysis(
    feature: DetectedFeature,
    baseline: BaselineInfo | null,
    context: PRContext,
    risk: RiskLevel
  ): { reason: string; recommendation: string; hasBreakingChange: boolean } {
    
    if (!baseline) {
      return {
        reason: `Unknown compatibility for "${feature.name}" - no baseline data available`,
        recommendation: 'Research browser support and add fallbacks if needed',
        hasBreakingChange: true,
      };
    }
    
    // Generate reason based on baseline status
    let reason = '';
    let recommendation = '';
    let hasBreakingChange = false;
    
    if (baseline.status === 'limited' || baseline.status === 'low') {
      const supportDate = baseline.dateSupported || 'unknown date';
      reason = `"${feature.name}" has limited browser support (${risk} risk - baseline: ${baseline.status}, supported since: ${supportDate})`;
      hasBreakingChange = true;
      
      if (feature.type === 'CSS') {
        recommendation = `Add @supports rule or provide CSS fallback for "${feature.name}"`;
      } else if (feature.type === 'JAVASCRIPT' || feature.type === 'WEB_API') {
        recommendation = `Add feature detection and polyfill for "${feature.name}"`;
      } else {
        recommendation = `Consider progressive enhancement for "${feature.name}"`;
      }
    } else if (baseline.status === 'high') {
      reason = `"${feature.name}" is widely supported (${risk} risk - ${baseline.status} baseline)`;
      recommendation = 'No action needed - feature is broadly compatible';
      hasBreakingChange = false;
    } else {
      reason = `"${feature.name}" has unknown support status (${risk} risk)`;
      recommendation = 'Verify browser compatibility and add fallbacks if needed';
      hasBreakingChange = true;
    }
    
    // Add PR size context to recommendation
    if (context.size === 'LARGE' || context.size === 'HUGE') {
      recommendation += ' (flagged due to large PR size - review carefully)';
    }
    
    return { reason, recommendation, hasBreakingChange };
  }
}

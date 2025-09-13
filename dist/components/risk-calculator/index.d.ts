import type { IRiskCalculator } from '../../core/interfaces.js';
import type { DetectedFeature, BaselineInfo, RiskAssessment, PRContext, AnalyzerConfig, RiskLevel } from '../../core/types.js';
export declare class RiskCalculator implements IRiskCalculator {
    assessRisks(features: DetectedFeature[], context: PRContext, config: AnalyzerConfig): Promise<RiskAssessment[]>;
    calculateRisk(feature: DetectedFeature, baseline: BaselineInfo | null, context: PRContext): RiskLevel;
    private determineAction;
    private getBaseRiskFromBaseline;
    private adjustRiskForContext;
    private adjustRiskForFeature;
    private generateRiskAnalysis;
}
//# sourceMappingURL=index.d.ts.map
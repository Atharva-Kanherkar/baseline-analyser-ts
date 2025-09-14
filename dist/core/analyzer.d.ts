import type { AnalysisResult, AnalyzerConfig, CodeChange } from './types.js';
export declare class BaselineAnalyzer {
    private config;
    private contextEngine;
    private smartFilter;
    private featureDetector;
    private riskCalculator;
    private aiService;
    constructor(config: AnalyzerConfig);
    analyze(prData: unknown, codeChanges: CodeChange[]): Promise<AnalysisResult>;
    private applyLargePRLogic;
    private makeDecision;
    private generateSummary;
    analyzeCodeChanges(codeChanges: CodeChange[]): Promise<AnalysisResult>;
}
//# sourceMappingURL=analyzer.d.ts.map
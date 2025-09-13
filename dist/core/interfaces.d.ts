import type { PRContext, CodeChange, DetectedFeature, RiskAssessment, AnalysisResult, AnalyzerConfig, BaselineInfo, PRSize, RiskLevel } from './types.js';
export interface IContextEngine {
    analyzePRContext(prData: unknown): Promise<PRContext>;
    determinePRSize(filesChanged: number): PRSize;
}
export interface ISmartFilter {
    filterRelevantChanges(changes: CodeChange[]): Promise<CodeChange[]>;
    shouldSkipFile(filePath: string): boolean;
    isRelevantChange(change: CodeChange): boolean;
}
export interface IFeatureDetector {
    detectFeatures(changes: CodeChange[]): Promise<DetectedFeature[]>;
    extractWebFeature(line: string, filePath: string): DetectedFeature | null;
}
export interface IBaselineService {
    getBaselineInfo(featureName: string): Promise<BaselineInfo | null>;
    isFeatureSupported(feature: string, browsers: string[]): Promise<boolean>;
}
export interface IRiskCalculator {
    assessRisks(features: DetectedFeature[], context: PRContext, config: AnalyzerConfig): Promise<RiskAssessment[]>;
    calculateRisk(feature: DetectedFeature, baseline: BaselineInfo | null, context: PRContext): RiskLevel;
}
export interface IReporter {
    generateReport(risks: RiskAssessment[], context: PRContext): Promise<AnalysisResult>;
    formatForGitHub(result: AnalysisResult): string;
}
export interface IGitHubService {
    getPRData(owner: string, repo: string, prNumber: number): Promise<PRContext>;
    getPRDiff(owner: string, repo: string, prNumber: number): Promise<string>;
    postComment(owner: string, repo: string, prNumber: number, comment: string): Promise<void>;
}
export interface IAIService {
    generateReview(risks: RiskAssessment[], context: PRContext): Promise<string>;
}
export interface IBaselineAnalyzer {
    analyze(owner: string, repo: string, prNumber: number, config?: Partial<AnalyzerConfig>): Promise<AnalysisResult>;
    analyzeWithContext(context: PRContext, diff: string, config?: Partial<AnalyzerConfig>): Promise<AnalysisResult>;
}
export declare abstract class BaselineAnalyzerError extends Error {
    readonly cause?: Error | undefined;
    abstract readonly code: string;
    abstract readonly statusCode: number;
    constructor(message: string, cause?: Error | undefined);
}
export declare class ConfigurationError extends BaselineAnalyzerError {
    readonly code = "CONFIGURATION_ERROR";
    readonly statusCode = 400;
}
export declare class GitHubAPIError extends BaselineAnalyzerError {
    readonly code = "GITHUB_API_ERROR";
    readonly statusCode = 502;
}
export declare class FeatureDetectionError extends BaselineAnalyzerError {
    readonly code = "FEATURE_DETECTION_ERROR";
    readonly statusCode = 500;
}
//# sourceMappingURL=interfaces.d.ts.map
import type { RiskAssessment, PRContext, AIAnalysis } from '../core/types.js';
export declare class AIService {
    private apiKey?;
    private readonly API_BASE_URL;
    private readonly API_TIMEOUT;
    private readonly MODEL;
    constructor(apiKey?: string | undefined);
    analyzeFeatures(risks: RiskAssessment[], prContext: PRContext): Promise<AIAnalysis[]>;
    private analyzeFeature;
    private buildAnalysisPrompt;
    private queryPerplexity;
    private parseAIResponse;
    private createFallbackAnalysis;
    generateAISummary(analyses: AIAnalysis[]): string;
}
//# sourceMappingURL=ai.service.d.ts.map
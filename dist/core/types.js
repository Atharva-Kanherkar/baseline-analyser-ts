import { z } from 'zod';
export const RiskLevel = z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'IGNORE']);
export const ActionType = z.enum(['BLOCK_PR', 'REQUIRE_REVIEW', 'COMMENT_ONLY', 'NONE']);
export const FeatureType = z.enum(['CSS', 'JAVASCRIPT', 'HTML', 'WEB_API']);
export const AnalyzerConfig = z.object({
    targetBrowsers: z.array(z.string()),
    blockingLevel: RiskLevel.default('HIGH'),
    largePRThreshold: z.number().default(20),
    hugePRThreshold: z.number().default(50),
    enableAIReview: z.boolean().default(false),
    githubToken: z.string(),
    openaiApiKey: z.string().optional(),
});
export const PRSize = z.enum(['SMALL', 'MEDIUM', 'LARGE', 'HUGE']);
export const PRContext = z.object({
    number: z.number(),
    title: z.string(),
    body: z.string().nullable(),
    filesChanged: z.number(),
    additions: z.number(),
    deletions: z.number(),
    size: PRSize,
    author: z.string(),
    repository: z.object({
        owner: z.string(),
        name: z.string(),
        isPrivate: z.boolean(),
    }),
});
export const CodeChange = z.object({
    file: z.string(),
    line: z.string(),
    lineNumber: z.number(),
    type: z.enum(['ADDED', 'REMOVED', 'MODIFIED']),
});
export const DetectedFeature = z.object({
    name: z.string(),
    type: FeatureType,
    location: z.object({
        file: z.string(),
        line: z.number(),
        snippet: z.string(),
    }),
});
export const BaselineStatus = z.enum(['high', 'limited', 'low', 'unknown']);
export const BaselineInfo = z.object({
    status: BaselineStatus,
    isBaseline2023: z.boolean(),
    isWidelySupported: z.boolean(),
    supportedBrowsers: z.array(z.object({
        browser: z.string(),
        version: z.string(),
    })),
    dateSupported: z.string().nullable(),
});
export const RiskAssessment = z.object({
    feature: DetectedFeature,
    baseline: BaselineInfo.nullable(),
    risk: RiskLevel,
    actionRequired: ActionType,
    reason: z.string(),
    recommendation: z.string(),
    hasBreakingChange: z.boolean(),
});
export const AnalysisResult = z.object({
    prContext: PRContext,
    totalFeaturesDetected: z.number(),
    risksFound: z.array(RiskAssessment),
    summary: z.object({
        critical: z.number(),
        high: z.number(),
        medium: z.number(),
        low: z.number(),
    }),
    decision: z.object({
        action: ActionType,
        shouldBlock: z.boolean(),
        message: z.string(),
    }),
    processingTime: z.number(),
});
//# sourceMappingURL=types.js.map
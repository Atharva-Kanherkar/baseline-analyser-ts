import { z } from 'zod';

// =============================================================================
// BASE TYPES
// =============================================================================

export const RiskLevel = z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'IGNORE']);
export type RiskLevel = z.infer<typeof RiskLevel>;

export const ActionType = z.enum(['BLOCK_PR', 'REQUIRE_REVIEW', 'COMMENT_ONLY', 'NONE']);
export type ActionType = z.infer<typeof ActionType>;

export const FeatureType = z.enum(['CSS', 'JAVASCRIPT', 'HTML', 'WEB_API']);
export type FeatureType = z.infer<typeof FeatureType>;

// =============================================================================
// CONFIGURATION TYPES
// =============================================================================

export const AnalyzerConfig = z.object({
  targetBrowsers: z.array(z.string()),
  blockingLevel: RiskLevel.default('HIGH'),
  largePRThreshold: z.number().default(20),
  hugePRThreshold: z.number().default(50),
  enableAIReview: z.boolean().default(false),
  githubToken: z.string(),
  openaiApiKey: z.string().optional(),
  perplexityApiKey: z.string().optional(),
});
export type AnalyzerConfig = z.infer<typeof AnalyzerConfig>;

// =============================================================================
// PR CONTEXT TYPES
// =============================================================================

export const PRSize = z.enum(['SMALL', 'MEDIUM', 'LARGE', 'HUGE']);
export type PRSize = z.infer<typeof PRSize>;

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
export type PRContext = z.infer<typeof PRContext>;

// =============================================================================
// FEATURE DETECTION TYPES
// =============================================================================

export const CodeChange = z.object({
  file: z.string(),
  line: z.string(),
  lineNumber: z.number(),
  type: z.enum(['ADDED', 'REMOVED', 'MODIFIED']),
});
export type CodeChange = z.infer<typeof CodeChange>;

export const DetectedFeature = z.object({
  name: z.string(),
  type: FeatureType,
  location: z.object({
    file: z.string(),
    line: z.number(),
    snippet: z.string(),
  }),
});
export type DetectedFeature = z.infer<typeof DetectedFeature>;

// =============================================================================
// BASELINE DATA TYPES
// =============================================================================

export const BaselineStatus = z.enum(['high', 'limited', 'low', 'unknown']);
export type BaselineStatus = z.infer<typeof BaselineStatus>;

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
export type BaselineInfo = z.infer<typeof BaselineInfo>;

// =============================================================================
// RISK ASSESSMENT TYPES
// =============================================================================

export const RiskAssessment = z.object({
  feature: DetectedFeature,
  baseline: BaselineInfo.nullable(),
  risk: RiskLevel,
  actionRequired: ActionType,
  reason: z.string(),
  recommendation: z.string(),
  hasBreakingChange: z.boolean(),
});
export type RiskAssessment = z.infer<typeof RiskAssessment>;

// =============================================================================
// ANALYSIS RESULT TYPES
// =============================================================================

// =============================================================================
// AI ANALYSIS TYPES
// =============================================================================

export const AISuggestion = z.object({
  type: z.enum(['alternative', 'workaround', 'polyfill', 'migration', 'best_practice']),
  title: z.string(),
  description: z.string(),
  code: z.string().optional(),
  resources: z.array(z.string()).optional(),
  impact: z.enum(['low', 'medium', 'high']),
});
export type AISuggestion = z.infer<typeof AISuggestion>;

export const AIAnalysis = z.object({
  feature: z.string(),
  baseline: BaselineInfo.nullable(),
  risk: RiskAssessment,
  suggestions: z.array(AISuggestion),
  reasoning: z.string(),
  confidence: z.number(),
});
export type AIAnalysis = z.infer<typeof AIAnalysis>;

export const AnalysisResult = z.object({
  prContext: PRContext,
  totalFeaturesDetected: z.number(),
  risksFound: z.array(RiskAssessment),
  aiAnalyses: z.array(AIAnalysis).optional(),
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
export type AnalysisResult = z.infer<typeof AnalysisResult>;
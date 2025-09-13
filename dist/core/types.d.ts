import { z } from 'zod';
export declare const RiskLevel: z.ZodEnum<["CRITICAL", "HIGH", "MEDIUM", "LOW", "IGNORE"]>;
export type RiskLevel = z.infer<typeof RiskLevel>;
export declare const ActionType: z.ZodEnum<["BLOCK_PR", "REQUIRE_REVIEW", "COMMENT_ONLY", "NONE"]>;
export type ActionType = z.infer<typeof ActionType>;
export declare const FeatureType: z.ZodEnum<["CSS", "JAVASCRIPT", "HTML", "WEB_API"]>;
export type FeatureType = z.infer<typeof FeatureType>;
export declare const AnalyzerConfig: z.ZodObject<{
    targetBrowsers: z.ZodArray<z.ZodString, "many">;
    blockingLevel: z.ZodDefault<z.ZodEnum<["CRITICAL", "HIGH", "MEDIUM", "LOW", "IGNORE"]>>;
    largePRThreshold: z.ZodDefault<z.ZodNumber>;
    hugePRThreshold: z.ZodDefault<z.ZodNumber>;
    enableAIReview: z.ZodDefault<z.ZodBoolean>;
    githubToken: z.ZodString;
    openaiApiKey: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    targetBrowsers: string[];
    blockingLevel: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "IGNORE";
    largePRThreshold: number;
    hugePRThreshold: number;
    enableAIReview: boolean;
    githubToken: string;
    openaiApiKey?: string | undefined;
}, {
    targetBrowsers: string[];
    githubToken: string;
    blockingLevel?: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "IGNORE" | undefined;
    largePRThreshold?: number | undefined;
    hugePRThreshold?: number | undefined;
    enableAIReview?: boolean | undefined;
    openaiApiKey?: string | undefined;
}>;
export type AnalyzerConfig = z.infer<typeof AnalyzerConfig>;
export declare const PRSize: z.ZodEnum<["SMALL", "MEDIUM", "LARGE", "HUGE"]>;
export type PRSize = z.infer<typeof PRSize>;
export declare const PRContext: z.ZodObject<{
    number: z.ZodNumber;
    title: z.ZodString;
    body: z.ZodNullable<z.ZodString>;
    filesChanged: z.ZodNumber;
    additions: z.ZodNumber;
    deletions: z.ZodNumber;
    size: z.ZodEnum<["SMALL", "MEDIUM", "LARGE", "HUGE"]>;
    author: z.ZodString;
    repository: z.ZodObject<{
        owner: z.ZodString;
        name: z.ZodString;
        isPrivate: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        owner: string;
        name: string;
        isPrivate: boolean;
    }, {
        owner: string;
        name: string;
        isPrivate: boolean;
    }>;
}, "strip", z.ZodTypeAny, {
    number: number;
    title: string;
    body: string | null;
    filesChanged: number;
    additions: number;
    deletions: number;
    size: "MEDIUM" | "SMALL" | "LARGE" | "HUGE";
    author: string;
    repository: {
        owner: string;
        name: string;
        isPrivate: boolean;
    };
}, {
    number: number;
    title: string;
    body: string | null;
    filesChanged: number;
    additions: number;
    deletions: number;
    size: "MEDIUM" | "SMALL" | "LARGE" | "HUGE";
    author: string;
    repository: {
        owner: string;
        name: string;
        isPrivate: boolean;
    };
}>;
export type PRContext = z.infer<typeof PRContext>;
export declare const CodeChange: z.ZodObject<{
    file: z.ZodString;
    line: z.ZodString;
    lineNumber: z.ZodNumber;
    type: z.ZodEnum<["ADDED", "REMOVED", "MODIFIED"]>;
}, "strip", z.ZodTypeAny, {
    type: "ADDED" | "REMOVED" | "MODIFIED";
    file: string;
    line: string;
    lineNumber: number;
}, {
    type: "ADDED" | "REMOVED" | "MODIFIED";
    file: string;
    line: string;
    lineNumber: number;
}>;
export type CodeChange = z.infer<typeof CodeChange>;
export declare const DetectedFeature: z.ZodObject<{
    name: z.ZodString;
    type: z.ZodEnum<["CSS", "JAVASCRIPT", "HTML", "WEB_API"]>;
    location: z.ZodObject<{
        file: z.ZodString;
        line: z.ZodNumber;
        snippet: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        file: string;
        line: number;
        snippet: string;
    }, {
        file: string;
        line: number;
        snippet: string;
    }>;
}, "strip", z.ZodTypeAny, {
    type: "CSS" | "JAVASCRIPT" | "HTML" | "WEB_API";
    name: string;
    location: {
        file: string;
        line: number;
        snippet: string;
    };
}, {
    type: "CSS" | "JAVASCRIPT" | "HTML" | "WEB_API";
    name: string;
    location: {
        file: string;
        line: number;
        snippet: string;
    };
}>;
export type DetectedFeature = z.infer<typeof DetectedFeature>;
export declare const BaselineStatus: z.ZodEnum<["high", "limited", "low", "unknown"]>;
export type BaselineStatus = z.infer<typeof BaselineStatus>;
export declare const BaselineInfo: z.ZodObject<{
    status: z.ZodEnum<["high", "limited", "low", "unknown"]>;
    isBaseline2023: z.ZodBoolean;
    isWidelySupported: z.ZodBoolean;
    supportedBrowsers: z.ZodArray<z.ZodObject<{
        browser: z.ZodString;
        version: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        browser: string;
        version: string;
    }, {
        browser: string;
        version: string;
    }>, "many">;
    dateSupported: z.ZodNullable<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "unknown" | "high" | "limited" | "low";
    isBaseline2023: boolean;
    isWidelySupported: boolean;
    supportedBrowsers: {
        browser: string;
        version: string;
    }[];
    dateSupported: string | null;
}, {
    status: "unknown" | "high" | "limited" | "low";
    isBaseline2023: boolean;
    isWidelySupported: boolean;
    supportedBrowsers: {
        browser: string;
        version: string;
    }[];
    dateSupported: string | null;
}>;
export type BaselineInfo = z.infer<typeof BaselineInfo>;
export declare const RiskAssessment: z.ZodObject<{
    feature: z.ZodObject<{
        name: z.ZodString;
        type: z.ZodEnum<["CSS", "JAVASCRIPT", "HTML", "WEB_API"]>;
        location: z.ZodObject<{
            file: z.ZodString;
            line: z.ZodNumber;
            snippet: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            file: string;
            line: number;
            snippet: string;
        }, {
            file: string;
            line: number;
            snippet: string;
        }>;
    }, "strip", z.ZodTypeAny, {
        type: "CSS" | "JAVASCRIPT" | "HTML" | "WEB_API";
        name: string;
        location: {
            file: string;
            line: number;
            snippet: string;
        };
    }, {
        type: "CSS" | "JAVASCRIPT" | "HTML" | "WEB_API";
        name: string;
        location: {
            file: string;
            line: number;
            snippet: string;
        };
    }>;
    baseline: z.ZodNullable<z.ZodObject<{
        status: z.ZodEnum<["high", "limited", "low", "unknown"]>;
        isBaseline2023: z.ZodBoolean;
        isWidelySupported: z.ZodBoolean;
        supportedBrowsers: z.ZodArray<z.ZodObject<{
            browser: z.ZodString;
            version: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            browser: string;
            version: string;
        }, {
            browser: string;
            version: string;
        }>, "many">;
        dateSupported: z.ZodNullable<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        status: "unknown" | "high" | "limited" | "low";
        isBaseline2023: boolean;
        isWidelySupported: boolean;
        supportedBrowsers: {
            browser: string;
            version: string;
        }[];
        dateSupported: string | null;
    }, {
        status: "unknown" | "high" | "limited" | "low";
        isBaseline2023: boolean;
        isWidelySupported: boolean;
        supportedBrowsers: {
            browser: string;
            version: string;
        }[];
        dateSupported: string | null;
    }>>;
    risk: z.ZodEnum<["CRITICAL", "HIGH", "MEDIUM", "LOW", "IGNORE"]>;
    actionRequired: z.ZodEnum<["BLOCK_PR", "REQUIRE_REVIEW", "COMMENT_ONLY", "NONE"]>;
    reason: z.ZodString;
    recommendation: z.ZodString;
    hasBreakingChange: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    feature: {
        type: "CSS" | "JAVASCRIPT" | "HTML" | "WEB_API";
        name: string;
        location: {
            file: string;
            line: number;
            snippet: string;
        };
    };
    baseline: {
        status: "unknown" | "high" | "limited" | "low";
        isBaseline2023: boolean;
        isWidelySupported: boolean;
        supportedBrowsers: {
            browser: string;
            version: string;
        }[];
        dateSupported: string | null;
    } | null;
    risk: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "IGNORE";
    actionRequired: "BLOCK_PR" | "REQUIRE_REVIEW" | "COMMENT_ONLY" | "NONE";
    reason: string;
    recommendation: string;
    hasBreakingChange: boolean;
}, {
    feature: {
        type: "CSS" | "JAVASCRIPT" | "HTML" | "WEB_API";
        name: string;
        location: {
            file: string;
            line: number;
            snippet: string;
        };
    };
    baseline: {
        status: "unknown" | "high" | "limited" | "low";
        isBaseline2023: boolean;
        isWidelySupported: boolean;
        supportedBrowsers: {
            browser: string;
            version: string;
        }[];
        dateSupported: string | null;
    } | null;
    risk: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "IGNORE";
    actionRequired: "BLOCK_PR" | "REQUIRE_REVIEW" | "COMMENT_ONLY" | "NONE";
    reason: string;
    recommendation: string;
    hasBreakingChange: boolean;
}>;
export type RiskAssessment = z.infer<typeof RiskAssessment>;
export declare const AnalysisResult: z.ZodObject<{
    prContext: z.ZodObject<{
        number: z.ZodNumber;
        title: z.ZodString;
        body: z.ZodNullable<z.ZodString>;
        filesChanged: z.ZodNumber;
        additions: z.ZodNumber;
        deletions: z.ZodNumber;
        size: z.ZodEnum<["SMALL", "MEDIUM", "LARGE", "HUGE"]>;
        author: z.ZodString;
        repository: z.ZodObject<{
            owner: z.ZodString;
            name: z.ZodString;
            isPrivate: z.ZodBoolean;
        }, "strip", z.ZodTypeAny, {
            owner: string;
            name: string;
            isPrivate: boolean;
        }, {
            owner: string;
            name: string;
            isPrivate: boolean;
        }>;
    }, "strip", z.ZodTypeAny, {
        number: number;
        title: string;
        body: string | null;
        filesChanged: number;
        additions: number;
        deletions: number;
        size: "MEDIUM" | "SMALL" | "LARGE" | "HUGE";
        author: string;
        repository: {
            owner: string;
            name: string;
            isPrivate: boolean;
        };
    }, {
        number: number;
        title: string;
        body: string | null;
        filesChanged: number;
        additions: number;
        deletions: number;
        size: "MEDIUM" | "SMALL" | "LARGE" | "HUGE";
        author: string;
        repository: {
            owner: string;
            name: string;
            isPrivate: boolean;
        };
    }>;
    totalFeaturesDetected: z.ZodNumber;
    risksFound: z.ZodArray<z.ZodObject<{
        feature: z.ZodObject<{
            name: z.ZodString;
            type: z.ZodEnum<["CSS", "JAVASCRIPT", "HTML", "WEB_API"]>;
            location: z.ZodObject<{
                file: z.ZodString;
                line: z.ZodNumber;
                snippet: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                file: string;
                line: number;
                snippet: string;
            }, {
                file: string;
                line: number;
                snippet: string;
            }>;
        }, "strip", z.ZodTypeAny, {
            type: "CSS" | "JAVASCRIPT" | "HTML" | "WEB_API";
            name: string;
            location: {
                file: string;
                line: number;
                snippet: string;
            };
        }, {
            type: "CSS" | "JAVASCRIPT" | "HTML" | "WEB_API";
            name: string;
            location: {
                file: string;
                line: number;
                snippet: string;
            };
        }>;
        baseline: z.ZodNullable<z.ZodObject<{
            status: z.ZodEnum<["high", "limited", "low", "unknown"]>;
            isBaseline2023: z.ZodBoolean;
            isWidelySupported: z.ZodBoolean;
            supportedBrowsers: z.ZodArray<z.ZodObject<{
                browser: z.ZodString;
                version: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                browser: string;
                version: string;
            }, {
                browser: string;
                version: string;
            }>, "many">;
            dateSupported: z.ZodNullable<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            status: "unknown" | "high" | "limited" | "low";
            isBaseline2023: boolean;
            isWidelySupported: boolean;
            supportedBrowsers: {
                browser: string;
                version: string;
            }[];
            dateSupported: string | null;
        }, {
            status: "unknown" | "high" | "limited" | "low";
            isBaseline2023: boolean;
            isWidelySupported: boolean;
            supportedBrowsers: {
                browser: string;
                version: string;
            }[];
            dateSupported: string | null;
        }>>;
        risk: z.ZodEnum<["CRITICAL", "HIGH", "MEDIUM", "LOW", "IGNORE"]>;
        actionRequired: z.ZodEnum<["BLOCK_PR", "REQUIRE_REVIEW", "COMMENT_ONLY", "NONE"]>;
        reason: z.ZodString;
        recommendation: z.ZodString;
        hasBreakingChange: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        feature: {
            type: "CSS" | "JAVASCRIPT" | "HTML" | "WEB_API";
            name: string;
            location: {
                file: string;
                line: number;
                snippet: string;
            };
        };
        baseline: {
            status: "unknown" | "high" | "limited" | "low";
            isBaseline2023: boolean;
            isWidelySupported: boolean;
            supportedBrowsers: {
                browser: string;
                version: string;
            }[];
            dateSupported: string | null;
        } | null;
        risk: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "IGNORE";
        actionRequired: "BLOCK_PR" | "REQUIRE_REVIEW" | "COMMENT_ONLY" | "NONE";
        reason: string;
        recommendation: string;
        hasBreakingChange: boolean;
    }, {
        feature: {
            type: "CSS" | "JAVASCRIPT" | "HTML" | "WEB_API";
            name: string;
            location: {
                file: string;
                line: number;
                snippet: string;
            };
        };
        baseline: {
            status: "unknown" | "high" | "limited" | "low";
            isBaseline2023: boolean;
            isWidelySupported: boolean;
            supportedBrowsers: {
                browser: string;
                version: string;
            }[];
            dateSupported: string | null;
        } | null;
        risk: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "IGNORE";
        actionRequired: "BLOCK_PR" | "REQUIRE_REVIEW" | "COMMENT_ONLY" | "NONE";
        reason: string;
        recommendation: string;
        hasBreakingChange: boolean;
    }>, "many">;
    summary: z.ZodObject<{
        critical: z.ZodNumber;
        high: z.ZodNumber;
        medium: z.ZodNumber;
        low: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        high: number;
        low: number;
        critical: number;
        medium: number;
    }, {
        high: number;
        low: number;
        critical: number;
        medium: number;
    }>;
    decision: z.ZodObject<{
        action: z.ZodEnum<["BLOCK_PR", "REQUIRE_REVIEW", "COMMENT_ONLY", "NONE"]>;
        shouldBlock: z.ZodBoolean;
        message: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        message: string;
        action: "BLOCK_PR" | "REQUIRE_REVIEW" | "COMMENT_ONLY" | "NONE";
        shouldBlock: boolean;
    }, {
        message: string;
        action: "BLOCK_PR" | "REQUIRE_REVIEW" | "COMMENT_ONLY" | "NONE";
        shouldBlock: boolean;
    }>;
    processingTime: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    prContext: {
        number: number;
        title: string;
        body: string | null;
        filesChanged: number;
        additions: number;
        deletions: number;
        size: "MEDIUM" | "SMALL" | "LARGE" | "HUGE";
        author: string;
        repository: {
            owner: string;
            name: string;
            isPrivate: boolean;
        };
    };
    totalFeaturesDetected: number;
    risksFound: {
        feature: {
            type: "CSS" | "JAVASCRIPT" | "HTML" | "WEB_API";
            name: string;
            location: {
                file: string;
                line: number;
                snippet: string;
            };
        };
        baseline: {
            status: "unknown" | "high" | "limited" | "low";
            isBaseline2023: boolean;
            isWidelySupported: boolean;
            supportedBrowsers: {
                browser: string;
                version: string;
            }[];
            dateSupported: string | null;
        } | null;
        risk: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "IGNORE";
        actionRequired: "BLOCK_PR" | "REQUIRE_REVIEW" | "COMMENT_ONLY" | "NONE";
        reason: string;
        recommendation: string;
        hasBreakingChange: boolean;
    }[];
    summary: {
        high: number;
        low: number;
        critical: number;
        medium: number;
    };
    decision: {
        message: string;
        action: "BLOCK_PR" | "REQUIRE_REVIEW" | "COMMENT_ONLY" | "NONE";
        shouldBlock: boolean;
    };
    processingTime: number;
}, {
    prContext: {
        number: number;
        title: string;
        body: string | null;
        filesChanged: number;
        additions: number;
        deletions: number;
        size: "MEDIUM" | "SMALL" | "LARGE" | "HUGE";
        author: string;
        repository: {
            owner: string;
            name: string;
            isPrivate: boolean;
        };
    };
    totalFeaturesDetected: number;
    risksFound: {
        feature: {
            type: "CSS" | "JAVASCRIPT" | "HTML" | "WEB_API";
            name: string;
            location: {
                file: string;
                line: number;
                snippet: string;
            };
        };
        baseline: {
            status: "unknown" | "high" | "limited" | "low";
            isBaseline2023: boolean;
            isWidelySupported: boolean;
            supportedBrowsers: {
                browser: string;
                version: string;
            }[];
            dateSupported: string | null;
        } | null;
        risk: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "IGNORE";
        actionRequired: "BLOCK_PR" | "REQUIRE_REVIEW" | "COMMENT_ONLY" | "NONE";
        reason: string;
        recommendation: string;
        hasBreakingChange: boolean;
    }[];
    summary: {
        high: number;
        low: number;
        critical: number;
        medium: number;
    };
    decision: {
        message: string;
        action: "BLOCK_PR" | "REQUIRE_REVIEW" | "COMMENT_ONLY" | "NONE";
        shouldBlock: boolean;
    };
    processingTime: number;
}>;
export type AnalysisResult = z.infer<typeof AnalysisResult>;
//# sourceMappingURL=types.d.ts.map
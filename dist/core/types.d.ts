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
    perplexityApiKey: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    targetBrowsers: string[];
    blockingLevel: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "IGNORE";
    largePRThreshold: number;
    hugePRThreshold: number;
    enableAIReview: boolean;
    githubToken: string;
    openaiApiKey?: string | undefined;
    perplexityApiKey?: string | undefined;
}, {
    targetBrowsers: string[];
    githubToken: string;
    blockingLevel?: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "IGNORE" | undefined;
    largePRThreshold?: number | undefined;
    hugePRThreshold?: number | undefined;
    enableAIReview?: boolean | undefined;
    openaiApiKey?: string | undefined;
    perplexityApiKey?: string | undefined;
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
export declare const AISuggestion: z.ZodObject<{
    type: z.ZodEnum<["alternative", "workaround", "polyfill", "migration", "best_practice"]>;
    title: z.ZodString;
    description: z.ZodString;
    code: z.ZodOptional<z.ZodString>;
    resources: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    impact: z.ZodEnum<["low", "medium", "high"]>;
}, "strip", z.ZodTypeAny, {
    type: "alternative" | "workaround" | "polyfill" | "migration" | "best_practice";
    title: string;
    description: string;
    impact: "high" | "low" | "medium";
    code?: string | undefined;
    resources?: string[] | undefined;
}, {
    type: "alternative" | "workaround" | "polyfill" | "migration" | "best_practice";
    title: string;
    description: string;
    impact: "high" | "low" | "medium";
    code?: string | undefined;
    resources?: string[] | undefined;
}>;
export type AISuggestion = z.infer<typeof AISuggestion>;
export declare const AIAnalysis: z.ZodObject<{
    feature: z.ZodString;
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
    risk: z.ZodObject<{
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
    suggestions: z.ZodArray<z.ZodObject<{
        type: z.ZodEnum<["alternative", "workaround", "polyfill", "migration", "best_practice"]>;
        title: z.ZodString;
        description: z.ZodString;
        code: z.ZodOptional<z.ZodString>;
        resources: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        impact: z.ZodEnum<["low", "medium", "high"]>;
    }, "strip", z.ZodTypeAny, {
        type: "alternative" | "workaround" | "polyfill" | "migration" | "best_practice";
        title: string;
        description: string;
        impact: "high" | "low" | "medium";
        code?: string | undefined;
        resources?: string[] | undefined;
    }, {
        type: "alternative" | "workaround" | "polyfill" | "migration" | "best_practice";
        title: string;
        description: string;
        impact: "high" | "low" | "medium";
        code?: string | undefined;
        resources?: string[] | undefined;
    }>, "many">;
    reasoning: z.ZodString;
    confidence: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    feature: string;
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
    risk: {
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
    };
    suggestions: {
        type: "alternative" | "workaround" | "polyfill" | "migration" | "best_practice";
        title: string;
        description: string;
        impact: "high" | "low" | "medium";
        code?: string | undefined;
        resources?: string[] | undefined;
    }[];
    reasoning: string;
    confidence: number;
}, {
    feature: string;
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
    risk: {
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
    };
    suggestions: {
        type: "alternative" | "workaround" | "polyfill" | "migration" | "best_practice";
        title: string;
        description: string;
        impact: "high" | "low" | "medium";
        code?: string | undefined;
        resources?: string[] | undefined;
    }[];
    reasoning: string;
    confidence: number;
}>;
export type AIAnalysis = z.infer<typeof AIAnalysis>;
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
    aiAnalyses: z.ZodOptional<z.ZodArray<z.ZodObject<{
        feature: z.ZodString;
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
        risk: z.ZodObject<{
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
        suggestions: z.ZodArray<z.ZodObject<{
            type: z.ZodEnum<["alternative", "workaround", "polyfill", "migration", "best_practice"]>;
            title: z.ZodString;
            description: z.ZodString;
            code: z.ZodOptional<z.ZodString>;
            resources: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            impact: z.ZodEnum<["low", "medium", "high"]>;
        }, "strip", z.ZodTypeAny, {
            type: "alternative" | "workaround" | "polyfill" | "migration" | "best_practice";
            title: string;
            description: string;
            impact: "high" | "low" | "medium";
            code?: string | undefined;
            resources?: string[] | undefined;
        }, {
            type: "alternative" | "workaround" | "polyfill" | "migration" | "best_practice";
            title: string;
            description: string;
            impact: "high" | "low" | "medium";
            code?: string | undefined;
            resources?: string[] | undefined;
        }>, "many">;
        reasoning: z.ZodString;
        confidence: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        feature: string;
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
        risk: {
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
        };
        suggestions: {
            type: "alternative" | "workaround" | "polyfill" | "migration" | "best_practice";
            title: string;
            description: string;
            impact: "high" | "low" | "medium";
            code?: string | undefined;
            resources?: string[] | undefined;
        }[];
        reasoning: string;
        confidence: number;
    }, {
        feature: string;
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
        risk: {
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
        };
        suggestions: {
            type: "alternative" | "workaround" | "polyfill" | "migration" | "best_practice";
            title: string;
            description: string;
            impact: "high" | "low" | "medium";
            code?: string | undefined;
            resources?: string[] | undefined;
        }[];
        reasoning: string;
        confidence: number;
    }>, "many">>;
    summary: z.ZodObject<{
        critical: z.ZodNumber;
        high: z.ZodNumber;
        medium: z.ZodNumber;
        low: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        high: number;
        low: number;
        medium: number;
        critical: number;
    }, {
        high: number;
        low: number;
        medium: number;
        critical: number;
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
        medium: number;
        critical: number;
    };
    decision: {
        message: string;
        action: "BLOCK_PR" | "REQUIRE_REVIEW" | "COMMENT_ONLY" | "NONE";
        shouldBlock: boolean;
    };
    processingTime: number;
    aiAnalyses?: {
        feature: string;
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
        risk: {
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
        };
        suggestions: {
            type: "alternative" | "workaround" | "polyfill" | "migration" | "best_practice";
            title: string;
            description: string;
            impact: "high" | "low" | "medium";
            code?: string | undefined;
            resources?: string[] | undefined;
        }[];
        reasoning: string;
        confidence: number;
    }[] | undefined;
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
        medium: number;
        critical: number;
    };
    decision: {
        message: string;
        action: "BLOCK_PR" | "REQUIRE_REVIEW" | "COMMENT_ONLY" | "NONE";
        shouldBlock: boolean;
    };
    processingTime: number;
    aiAnalyses?: {
        feature: string;
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
        risk: {
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
        };
        suggestions: {
            type: "alternative" | "workaround" | "polyfill" | "migration" | "best_practice";
            title: string;
            description: string;
            impact: "high" | "low" | "medium";
            code?: string | undefined;
            resources?: string[] | undefined;
        }[];
        reasoning: string;
        confidence: number;
    }[] | undefined;
}>;
export type AnalysisResult = z.infer<typeof AnalysisResult>;
//# sourceMappingURL=types.d.ts.map
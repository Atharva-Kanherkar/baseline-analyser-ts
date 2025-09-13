import { z } from 'zod';
declare const EnvironmentSchema: z.ZodObject<{
    NODE_ENV: z.ZodDefault<z.ZodEnum<["development", "production", "test"]>>;
    GITHUB_TOKEN: z.ZodString;
    OPENAI_API_KEY: z.ZodOptional<z.ZodString>;
    LOG_LEVEL: z.ZodDefault<z.ZodEnum<["error", "warn", "info", "debug"]>>;
    DEFAULT_BLOCKING_LEVEL: z.ZodDefault<z.ZodEnum<["CRITICAL", "HIGH", "MEDIUM", "LOW"]>>;
    LARGE_PR_THRESHOLD: z.ZodDefault<z.ZodNumber>;
    HUGE_PR_THRESHOLD: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    NODE_ENV: "development" | "production" | "test";
    GITHUB_TOKEN: string;
    LOG_LEVEL: "error" | "warn" | "info" | "debug";
    DEFAULT_BLOCKING_LEVEL: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
    LARGE_PR_THRESHOLD: number;
    HUGE_PR_THRESHOLD: number;
    OPENAI_API_KEY?: string | undefined;
}, {
    GITHUB_TOKEN: string;
    NODE_ENV?: "development" | "production" | "test" | undefined;
    OPENAI_API_KEY?: string | undefined;
    LOG_LEVEL?: "error" | "warn" | "info" | "debug" | undefined;
    DEFAULT_BLOCKING_LEVEL?: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | undefined;
    LARGE_PR_THRESHOLD?: number | undefined;
    HUGE_PR_THRESHOLD?: number | undefined;
}>;
export type Environment = z.infer<typeof EnvironmentSchema>;
export declare const env: Environment;
export declare function getConfig(): Environment;
export declare function validateConfig(): void;
export {};
//# sourceMappingURL=config.d.ts.map
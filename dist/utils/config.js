import { z } from 'zod';
import dotenv from 'dotenv';
dotenv.config();
const EnvironmentSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    GITHUB_TOKEN: z.string().min(1, 'GitHub token is required'),
    OPENAI_API_KEY: z.string().optional(),
    LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
    DEFAULT_BLOCKING_LEVEL: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']).default('HIGH'),
    LARGE_PR_THRESHOLD: z.coerce.number().default(20),
    HUGE_PR_THRESHOLD: z.coerce.number().default(50),
});
export const env = EnvironmentSchema.parse(process.env);
export function getConfig() {
    return env;
}
export function validateConfig() {
    try {
        EnvironmentSchema.parse(process.env);
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            const issues = error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join('\n');
            throw new Error(`Configuration validation failed:\n${issues}`);
        }
        throw error;
    }
}
//# sourceMappingURL=config.js.map
import type { IContextEngine } from '../../core/interfaces.js';
import type { PRContext, PRSize } from '../../core/types.js';
export declare class ContextEngine implements IContextEngine {
    analyzePRContext(prData: unknown): Promise<PRContext>;
    determinePRSize(filesChanged: number): PRSize;
    getAnalysisStrategy(prSize: PRSize): {
        reportAllRisks: boolean;
        filterAggressiveness: string;
        focusOnCritical: boolean;
        maxReportedIssues: number;
    };
    private isValidPRData;
}
//# sourceMappingURL=index.d.ts.map
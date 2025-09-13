import type { ISmartFilter } from '../../core/interfaces.js';
import type { CodeChange } from '../../core/types.js';
export declare class SmartFilter implements ISmartFilter {
    private skipPatterns;
    private relevantPatterns;
    filterRelevantChanges(changes: CodeChange[]): Promise<CodeChange[]>;
    shouldSkipFile(filePath: string): boolean;
    isRelevantChange(change: CodeChange): boolean;
    applyContextualFiltering(changes: CodeChange[], strategy: {
        filterAggressiveness: string;
    }): CodeChange[];
    private isWhitespaceOnly;
    private isComment;
    private isCriticalFile;
    private isLowImpactChange;
}
//# sourceMappingURL=index.d.ts.map
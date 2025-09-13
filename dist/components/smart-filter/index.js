import { logger } from '../../utils/logger.js';
export class SmartFilter {
    skipPatterns = [
        /\.(test|spec)\.(js|ts|jsx|tsx)$/i,
        /\.(md|txt|json)$/i,
        /package(-lock)?\.json$/i,
        /\.(config|conf)\.(js|ts)$/i,
        /\.(yaml|yml)$/i,
        /\.git/,
        /node_modules/,
        /dist/,
        /build/,
        /coverage/,
        /docs?/,
        /README/i,
        /LICENSE/i,
        /\.env/,
    ];
    relevantPatterns = [
        /\.(js|jsx|ts|tsx)$/i,
        /\.(css|scss|sass|less)$/i,
        /\.(html|htm)$/i,
        /\.(vue|svelte)$/i,
    ];
    async filterRelevantChanges(changes) {
        logger.info(`Filtering ${changes.length} code changes`);
        const filtered = changes.filter(change => {
            if (this.shouldSkipFile(change.file)) {
                return false;
            }
            if (!this.isRelevantChange(change)) {
                return false;
            }
            return true;
        });
        const skipped = changes.length - filtered.length;
        logger.info(`Filtered to ${filtered.length} relevant changes (skipped ${skipped})`);
        return filtered;
    }
    shouldSkipFile(filePath) {
        const shouldSkip = this.skipPatterns.some(pattern => pattern.test(filePath));
        if (shouldSkip) {
            return true;
        }
        const isRelevant = this.relevantPatterns.some(pattern => pattern.test(filePath));
        return !isRelevant;
    }
    isRelevantChange(change) {
        if (change.type === 'REMOVED') {
            return false;
        }
        if (this.isWhitespaceOnly(change.line)) {
            return false;
        }
        if (this.isComment(change.line, change.file)) {
            return false;
        }
        return true;
    }
    applyContextualFiltering(changes, strategy) {
        if (strategy.filterAggressiveness === 'low') {
            return changes;
        }
        if (strategy.filterAggressiveness === 'aggressive') {
            return changes.filter(change => this.isCriticalFile(change.file));
        }
        return changes.filter(change => !this.isLowImpactChange(change));
    }
    isWhitespaceOnly(line) {
        return line.trim().length === 0;
    }
    isComment(line, filePath) {
        const trimmed = line.trim();
        if (filePath.match(/\.(js|ts|jsx|tsx)$/i)) {
            return trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*');
        }
        if (filePath.match(/\.(css|scss|sass|less)$/i)) {
            return trimmed.startsWith('/*') || trimmed.startsWith('*') || trimmed.startsWith('//');
        }
        if (filePath.match(/\.(html|htm)$/i)) {
            return trimmed.startsWith('<!--');
        }
        return false;
    }
    isCriticalFile(filePath) {
        const criticalPatterns = [
            /src.*\.(js|ts|jsx|tsx)$/i,
            /components.*\.(js|ts|jsx|tsx)$/i,
            /pages.*\.(js|ts|jsx|tsx)$/i,
            /styles.*\.(css|scss|sass)$/i,
            /app\.(js|ts|jsx|tsx)$/i,
            /index\.(js|ts|jsx|tsx)$/i,
        ];
        return criticalPatterns.some(pattern => pattern.test(filePath));
    }
    isLowImpactChange(change) {
        const line = change.line.trim();
        if (line.includes('console.log') || line.includes('console.warn')) {
            return true;
        }
        if (line.startsWith('import ') || line.startsWith('require(')) {
            return true;
        }
        if (line.match(/^(const|let|var)\s+\w+\s*=\s*(null|undefined|''|""|0|true|false)\s*;?$/)) {
            return true;
        }
        return false;
    }
}
//# sourceMappingURL=index.js.map
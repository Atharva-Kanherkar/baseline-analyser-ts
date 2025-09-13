import { logger } from '../../utils/logger.js';
export class ContextEngine {
    async analyzePRContext(prData) {
        logger.info('Analyzing PR context from GitHub data');
        if (!this.isValidPRData(prData)) {
            throw new Error('Invalid PR data provided');
        }
        const filesChanged = prData.changed_files || 0;
        const additions = prData.additions || 0;
        const deletions = prData.deletions || 0;
        const context = {
            number: prData.number,
            title: prData.title,
            body: prData.body,
            filesChanged,
            additions,
            deletions,
            size: this.determinePRSize(filesChanged),
            author: prData.user?.login || 'unknown',
            repository: {
                owner: prData.base?.repo?.owner?.login || 'unknown',
                name: prData.base?.repo?.name || 'unknown',
                isPrivate: prData.base?.repo?.private || false,
            },
        };
        logger.info(`PR Context: ${context.size} PR with ${filesChanged} files, +${additions}/-${deletions} lines`);
        return context;
    }
    determinePRSize(filesChanged) {
        if (filesChanged <= 5)
            return 'SMALL';
        if (filesChanged <= 20)
            return 'MEDIUM';
        if (filesChanged <= 50)
            return 'LARGE';
        return 'HUGE';
    }
    getAnalysisStrategy(prSize) {
        const strategies = {
            SMALL: {
                reportAllRisks: true,
                filterAggressiveness: 'low',
                focusOnCritical: false,
                maxReportedIssues: 50,
            },
            MEDIUM: {
                reportAllRisks: true,
                filterAggressiveness: 'medium',
                focusOnCritical: false,
                maxReportedIssues: 20,
            },
            LARGE: {
                reportAllRisks: false,
                filterAggressiveness: 'high',
                focusOnCritical: true,
                maxReportedIssues: 10,
            },
            HUGE: {
                reportAllRisks: false,
                filterAggressiveness: 'aggressive',
                focusOnCritical: true,
                maxReportedIssues: 5,
            },
        };
        return strategies[prSize];
    }
    isValidPRData(data) {
        return (typeof data === 'object' &&
            data !== null &&
            'number' in data &&
            'title' in data);
    }
}
//# sourceMappingURL=index.js.map
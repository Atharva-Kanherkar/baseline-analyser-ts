import type { IContextEngine } from '../../core/interfaces.js';
import type { PRContext, PRSize } from '../../core/types.js';
import { logger } from '../../utils/logger.js';

/**
 * Context Engine - Analyzes PR metadata to determine analysis strategy
 * 
 * This is the brain that decides:
 * - How big is this PR?
 * - What analysis approach should we use?
 * - How aggressive should our filtering be?
 */
export class ContextEngine implements IContextEngine {
  
  /**
   * Analyzes raw PR data from GitHub and extracts structured context
   */
  async analyzePRContext(prData: unknown): Promise<PRContext> {
    logger.info('Analyzing PR context from GitHub data');
    
    // Type guard and validation
    if (!this.isValidPRData(prData)) {
      throw new Error('Invalid PR data provided');
    }
    
    const filesChanged = prData.changed_files || 0;
    const additions = prData.additions || 0;
    const deletions = prData.deletions || 0;
    
    const context: PRContext = {
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
  
  /**
   * Determines PR size category based on files changed
   * This drives our entire analysis strategy!
   */
  determinePRSize(filesChanged: number): PRSize {
    if (filesChanged <= 5) return 'SMALL';
    if (filesChanged <= 20) return 'MEDIUM'; 
    if (filesChanged <= 50) return 'LARGE';
    return 'HUGE';
  }
  
  /**
   * Gets the analysis strategy based on PR size
   * Large PRs need different handling than small ones!
   */
  getAnalysisStrategy(prSize: PRSize) {
    const strategies: Record<PRSize, {
      reportAllRisks: boolean;
      filterAggressiveness: string;
      focusOnCritical: boolean;
      maxReportedIssues: number;
    }> = {
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
  
  /**
   * Type guard for PR data validation
   */
  private isValidPRData(data: unknown): data is any {
    return (
      typeof data === 'object' &&
      data !== null &&
      'number' in data &&
      'title' in data
    );
  }
}

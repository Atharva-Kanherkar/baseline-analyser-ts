import type { ISmartFilter } from '../../core/interfaces.js';
import type { CodeChange } from '../../core/types.js';
import { logger } from '../../utils/logger.js';

/**
 * Smart Filter - Removes 80% of noise from PR changes
 * 
 * This component decides what to analyze and what to skip:
 * - Skip test files, config files, documentation
 * - Focus only on added/modified lines (not deletions)
 * - Filter out comments, whitespace changes
 * - Prioritize actual code changes
 */
export class SmartFilter implements ISmartFilter {
  
  // File patterns to skip (these rarely contain baseline-affecting features)
  private skipPatterns = [
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
  
  // File patterns that ARE relevant for baseline analysis
  private relevantPatterns = [
    /\.(js|jsx|ts|tsx)$/i,
    /\.(css|scss|sass|less)$/i,
    /\.(html|htm)$/i,
    /\.(vue|svelte)$/i,
  ];
  
  /**
   * Filters a list of code changes to only relevant ones
   */
  async filterRelevantChanges(changes: CodeChange[]): Promise<CodeChange[]> {
    logger.info(`Filtering ${changes.length} code changes`);
    
    const filtered = changes.filter(change => {
      // Skip files we don't care about
      if (this.shouldSkipFile(change.file)) {
        return false;
      }
      
      // Only analyze relevant change types
      if (!this.isRelevantChange(change)) {
        return false;
      }
      
      return true;
    });
    
    const skipped = changes.length - filtered.length;
    logger.info(`Filtered to ${filtered.length} relevant changes (skipped ${skipped})`);
    
    return filtered;
  }
  
  /**
   * Determines if a file should be skipped entirely
   */
  shouldSkipFile(filePath: string): boolean {
    // Check skip patterns first (more common)
    const shouldSkip = this.skipPatterns.some(pattern => pattern.test(filePath));
    if (shouldSkip) {
      return true;
    }
    
    // If not in skip patterns, check if it's in relevant patterns
    const isRelevant = this.relevantPatterns.some(pattern => pattern.test(filePath));
    return !isRelevant;
  }
  
  /**
   * Determines if a specific code change is relevant for analysis
   */
  isRelevantChange(change: CodeChange): boolean {
    // Only care about additions and modifications (not deletions)
    if (change.type === 'REMOVED') {
      return false;
    }
    
    // Skip empty lines and whitespace-only changes
    if (this.isWhitespaceOnly(change.line)) {
      return false;
    }
    
    // Skip comments (though this could be improved with proper parsing)
    if (this.isComment(change.line, change.file)) {
      return false;
    }
    
    return true;
  }
  
  /**
   * Advanced filtering based on PR size and strategy
   * Large PRs need more aggressive filtering
   */
  applyContextualFiltering(
    changes: CodeChange[],
    strategy: { filterAggressiveness: string }
  ): CodeChange[] {
    if (strategy.filterAggressiveness === 'low') {
      return changes; // Keep everything for small PRs
    }
    
    if (strategy.filterAggressiveness === 'aggressive') {
      // For huge PRs, only keep changes in critical files
      return changes.filter(change => this.isCriticalFile(change.file));
    }
    
    // Medium/high filtering - skip low-impact changes
    return changes.filter(change => !this.isLowImpactChange(change));
  }
  
  /**
   * Checks if a line is whitespace-only
   */
  private isWhitespaceOnly(line: string): boolean {
    return line.trim().length === 0;
  }
  
  /**
   * Checks if a line is a comment (basic detection)
   */
  private isComment(line: string, filePath: string): boolean {
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
  
  /**
   * Identifies critical files that should always be analyzed
   */
  private isCriticalFile(filePath: string): boolean {
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
  
  /**
   * Identifies low-impact changes that can be skipped in large PRs
   */
  private isLowImpactChange(change: CodeChange): boolean {
    const line = change.line.trim();
    
    // Skip console.log statements
    if (line.includes('console.log') || line.includes('console.warn')) {
      return true;
    }
    
    // Skip import statements (usually don't affect baseline)
    if (line.startsWith('import ') || line.startsWith('require(')) {
      return true;
    }
    
    // Skip variable declarations without interesting values
    if (line.match(/^(const|let|var)\s+\w+\s*=\s*(null|undefined|''|""|0|true|false)\s*;?$/)) {
      return true;
    }
    
    return false;
  }
}

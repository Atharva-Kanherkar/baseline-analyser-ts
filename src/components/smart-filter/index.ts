import type { ISmartFilter } from '../../core/interfaces.js';
import type { CodeChange } from '../../core/types.js';
import { logger } from '../../utils/logger.js';

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
  
  private isWhitespaceOnly(line: string): boolean {
    return line.trim().length === 0;
  }
  
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

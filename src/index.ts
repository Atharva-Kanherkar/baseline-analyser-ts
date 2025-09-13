// Main exports for the Baseline Analyzer
export { BaselineAnalyzer } from './core/analyzer.js';
export { run as runGitHubAction } from './actions/main.js';

// Export all types
export type * from './core/types.js';
export type * from './core/interfaces.js';

// Export individual components for advanced usage
export { ContextEngine } from './components/context-engine/index.js';
export { SmartFilter } from './components/smart-filter/index.js';
export { FeatureDetector } from './components/feature-detector/index.js';
export { RiskCalculator } from './components/risk-calculator/index.js';

// Export services
export { BaselineService } from './services/baseline.service.js';

// Export utilities
export { logger } from './utils/logger.js';
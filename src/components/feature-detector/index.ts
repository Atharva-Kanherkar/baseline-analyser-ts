import type { IFeatureDetector } from '../../core/interfaces.js';
import type { CodeChange, DetectedFeature, FeatureType } from '../../core/types.js';
import { logger } from '../../utils/logger.js';

export class FeatureDetector implements IFeatureDetector {
  
  async detectFeatures(changes: CodeChange[]): Promise<DetectedFeature[]> {
    logger.info(`Detecting features from ${changes.length} code changes`);
    
    const features: DetectedFeature[] = [];
    
    for (const change of changes) {
      const detected = this.extractWebFeature(change.line, change.file);
      if (detected) {
        // Add location info from the change
        detected.location.line = change.lineNumber;
        features.push(detected);
      }
    }
    
    // Remove duplicates (same feature detected multiple times)
    const uniqueFeatures = this.deduplicateFeatures(features);
    
    logger.info(`Detected ${uniqueFeatures.length} unique web platform features`);
    
    return uniqueFeatures;
  }
  
  extractWebFeature(line: string, filePath: string): DetectedFeature | null {
    const trimmedLine = line.trim();
    
    // Determine file type and use appropriate detector
    if (this.isCSSFile(filePath)) {
      return this.detectCSSFeature(trimmedLine, filePath);
    }
    
    if (this.isJSFile(filePath)) {
      return this.detectJSFeature(trimmedLine, filePath);
    }
    
    if (this.isHTMLFile(filePath)) {
      return this.detectHTMLFeature(trimmedLine, filePath);
    }
    
    return null;
  }
  
  private detectCSSFeature(line: string, filePath: string): DetectedFeature | null {
    // CSS Properties that might have baseline issues
    const cssProperties = [
      'display: grid',
      'display: flex',
      'display: contents',
      'position: sticky',
      'scroll-behavior',
      'aspect-ratio',
      'gap',
      'grid-template',
      'container-type',
      'container-name',
      '@container',
      'color-scheme',
      'accent-color',
      'backdrop-filter',
      'mask',
      'clip-path',
      'filter',
    ];
    
    // CSS Selectors that might have baseline issues
    const cssSelectors = [
      ':has(',
      ':is(',
      ':where(',
      ':not(',
      '::backdrop',
      '::marker',
      '::placeholder',
      ':focus-visible',
      ':focus-within',
      ':target-text',
    ];
    
    // CSS Functions that might have baseline issues
    const cssFunctions = [
      'clamp(',
      'min(',
      'max(',
      'calc(',
      'var(',
      'env(',
      'color-mix(',
      'color-contrast(',
      'oklch(',
      'oklab(',
    ];
    
    // Check for CSS properties
    for (const prop of cssProperties) {
      if (line.includes(prop)) {
        return {
          name: prop,
          type: 'CSS' as FeatureType,
          location: {
            file: filePath,
            line: 0, // Will be set by caller
            snippet: line,
          },
        };
      }
    }
    
    // Check for CSS selectors
    for (const selector of cssSelectors) {
      if (line.includes(selector)) {
        return {
          name: selector.replace('(', ''),
          type: 'CSS' as FeatureType,
          location: {
            file: filePath,
            line: 0, // Will be set by caller
            snippet: line,
          },
        };
      }
    }
    
    // Check for CSS functions
    for (const func of cssFunctions) {
      if (line.includes(func)) {
        return {
          name: func.replace('(', ''),
          type: 'CSS' as FeatureType,
          location: {
            file: filePath,
            line: 0, // Will be set by caller
            snippet: line,
          },
        };
      }
    }
    
    return null;
  }
  
  private detectJSFeature(line: string, filePath: string): DetectedFeature | null {
    // Web APIs that might have baseline issues
    const webAPIs = [
      'fetch(',
      'navigator.share(',
      'IntersectionObserver',
      'ResizeObserver',
      'MutationObserver',
      'requestIdleCallback',
      'matchMedia(',
      'getBoundingClientRect',
      'querySelector(',
      'querySelectorAll(',
      'addEventListener(',
      'AbortController',
      'FormData',
      'URLSearchParams',
      'structuredClone',
      'crypto.randomUUID',
      'navigator.clipboard',
      'navigator.geolocation',
      'localStorage',
      'sessionStorage',
      'indexedDB',
      'WebSocket',
      'EventSource',
      'BroadcastChannel',
      'ServiceWorker',
      'PushManager',
      'Notification',
    ];
    
    // Modern JavaScript syntax that might have baseline issues
    const modernSyntax = [
      'async function',
      'async (',
      'await ',
      '=>',
      'const ',
      'let ',
      '`', // Template literals
      '${', // Template interpolation
      '...', // Spread/rest
      'class ',
      'extends ',
      'import ',
      'export ',
      'Promise.',
      'Array.from',
      'Array.includes',
      'Object.assign',
      'Object.keys',
      'Object.values',
      'Object.entries',
      'String.includes',
      'String.startsWith',
      'String.endsWith',
      'Number.isNaN',
      'Number.isInteger',
    ];
    
    // Check for Web APIs
    for (const api of webAPIs) {
      if (line.includes(api)) {
        return {
          name: api.replace('(', ''),
          type: 'WEB_API' as FeatureType,
          location: {
            file: filePath,
            line: 0, // Will be set by caller
            snippet: line,
          },
        };
      }
    }
    
    // Check for modern syntax
    for (const syntax of modernSyntax) {
      if (line.includes(syntax)) {
        return {
          name: syntax.trim(),
          type: 'JAVASCRIPT' as FeatureType,
          location: {
            file: filePath,
            line: 0, // Will be set by caller
            snippet: line,
          },
        };
      }
    }
    
    return null;
  }
  
  private detectHTMLFeature(line: string, filePath: string): DetectedFeature | null {
    // HTML elements that might have baseline issues
    const htmlElements = [
      '<dialog',
      '<details',
      '<summary',
      '<template',
      '<slot',
      '<picture',
      '<source',
      '<track',
      '<datalist',
      '<output',
      '<progress',
      '<meter',
      '<time',
      '<mark',
      '<wbr',
    ];
    
    // HTML attributes that might have baseline issues
    const htmlAttributes = [
      'loading="lazy"',
      'decoding="async"',
      'enterkeyhint=',
      'inputmode=',
      'popover',
      'inert',
      'hidden',
      'contenteditable',
      'draggable',
      'spellcheck',
      'translate',
      'aria-',
      'role=',
      'data-',
    ];
    
    // Check for HTML elements
    for (const element of htmlElements) {
      if (line.includes(element)) {
        return {
          name: element.replace('<', ''),
          type: 'HTML' as FeatureType,
          location: {
            file: filePath,
            line: 0, // Will be set by caller
            snippet: line,
          },
        };
      }
    }
    
    // Check for HTML attributes
    for (const attr of htmlAttributes) {
      if (line.includes(attr)) {
        return {
          name: attr,
          type: 'HTML' as FeatureType,
          location: {
            file: filePath,
            line: 0, // Will be set by caller
            snippet: line,
          },
        };
      }
    }
    
    return null;
  }
  
  private deduplicateFeatures(features: DetectedFeature[]): DetectedFeature[] {
    const seen = new Set<string>();
    const unique: DetectedFeature[] = [];
    
    for (const feature of features) {
      const key = `${feature.name}-${feature.type}-${feature.location.file}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(feature);
      }
    }
    
    return unique;
  }
  
  private isCSSFile(filePath: string): boolean {
    return /\.(css|scss|sass|less)$/i.test(filePath);
  }
  
  private isJSFile(filePath: string): boolean {
    return /\.(js|jsx|ts|tsx)$/i.test(filePath);
  }
  
  private isHTMLFile(filePath: string): boolean {
    return /\.(html|htm)$/i.test(filePath);
  }
}

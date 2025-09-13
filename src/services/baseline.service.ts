import type { IBaselineService } from '../core/interfaces.js';
import type { BaselineInfo, BaselineStatus } from '../core/types.js';
import { logger } from '../utils/logger.js';

/**
 * Baseline Service - Integrates with NPM baseline packages
 * 
 * This service provides browser compatibility data for detected web features:
 * - Uses @web-platform-dx/web-features (when available)
 * - Provides fallback compatibility data
 * - Maps features to baseline status (high/limited/low)
 * - Determines browser support timelines
 */
export class BaselineService implements IBaselineService {
  
  // Cache for baseline data to avoid repeated lookups
  private baselineCache = new Map<string, BaselineInfo | null>();
  
  /**
   * Gets baseline compatibility info for a web platform feature
   */
  async getBaselineInfo(featureName: string): Promise<BaselineInfo | null> {
    // Check cache first
    if (this.baselineCache.has(featureName)) {
      return this.baselineCache.get(featureName) || null;
    }
    
    logger.debug(`Looking up baseline info for: ${featureName}`);
    
    // Try to get data from NPM packages (when available)
    let baselineData = await this.getFromWebFeaturesPackage(featureName);
    
    // Fallback to hardcoded compatibility data
    if (!baselineData) {
      baselineData = this.getFallbackBaselineData(featureName);
    }
    
    // Cache the result
    this.baselineCache.set(featureName, baselineData);
    
    return baselineData;
  }
  
  /**
   * Checks if a feature is supported in the target browsers
   */
  async isFeatureSupported(feature: string, browsers: string[]): Promise<boolean> {
    const baselineInfo = await this.getBaselineInfo(feature);
    
    if (!baselineInfo) {
      // If we don't have data, assume it's risky
      return false;
    }
    
    // Check if all target browsers support this feature
    for (const browser of browsers) {
      if (!this.isSupportedInBrowser(baselineInfo, browser)) {
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * Gets data from the official web-features package
   */
  private async getFromWebFeaturesPackage(featureName: string): Promise<BaselineInfo | null> {
    try {
      // Import the official web-features package
      const { features } = await import('web-features');
      
      // Map our detected feature names to web-features IDs
      const possibleIds = this.mapFeatureNameToWebFeatureId(featureName);
      
      for (const featureId of possibleIds) {
        const feature = features[featureId];
        if (feature && feature.status) {
          logger.debug(`Found web-features data for: ${featureName} (id: ${featureId})`);
          return this.convertWebFeatureToBaselineInfo(feature);
        }
      }
      
      // Try to find by BCD key using compute-baseline
      const bcdKey = this.mapFeatureNameToBCDKey(featureName);
      if (bcdKey) {
        try {
          const computeBaseline = await import('compute-baseline');
          const getStatus = (computeBaseline as any).getStatus;
          
          if (getStatus) {
            const status = getStatus(null, bcdKey);
            
            if (status) {
              logger.debug(`Found compute-baseline data for: ${featureName} (BCD: ${bcdKey})`);
              return this.convertComputeBaselineToBaselineInfo(status);
            }
          }
        } catch (error) {
          logger.debug(`Error using compute-baseline for ${bcdKey}: ${error}`);
        }
      }
      
      logger.debug(`No web-features data found for: ${featureName}`);
      return null;
      
    } catch (error) {
      logger.warn(`Error accessing web-features package: ${error}`);
      return null;
    }
  }
  
  /**
   * Maps our detected feature names to official web-features package IDs
   */
  private mapFeatureNameToWebFeatureId(featureName: string): string[] {
    const mappings: Record<string, string[]> = {
      // CSS Features
      'display: grid': ['grid'],
      'display: flex': ['flexbox'],
      ':has': ['has'],
      '@container': ['container-queries'],
      'container-type': ['container-queries'],
      'clamp': ['css-math-functions'],
      'min': ['css-math-functions'],
      'max': ['css-math-functions'],
      'aspect-ratio': ['aspect-ratio'],
      'gap': ['gap'],
      'scroll-behavior': ['scroll-behavior'],
      'position: sticky': ['sticky'],
      'backdrop-filter': ['backdrop-filter'],
      
      // JavaScript Features
      'fetch': ['fetch'],
      'async function': ['async-await'],
      'await ': ['async-await'],
      '=>': ['arrow-functions'],
      'IntersectionObserver': ['intersection-observer'],
      'ResizeObserver': ['resize-observer'],
      'Promise.': ['promises'],
      
      // HTML Features
      'dialog': ['dialog'],
      'loading="lazy"': ['loading-lazy'],
      'details': ['details'],
      'picture': ['picture'],
    };
    
    return mappings[featureName] || [featureName.toLowerCase()];
  }
  
  /**
   * Maps our detected feature names to BCD (Browser Compat Data) keys
   */
  private mapFeatureNameToBCDKey(featureName: string): string | null {
    const mappings: Record<string, string> = {
      // CSS Properties
      'display: grid': 'css.properties.display.grid',
      'display: flex': 'css.properties.display.flex',
      'position: sticky': 'css.properties.position.sticky',
      'aspect-ratio': 'css.properties.aspect-ratio',
      'gap': 'css.properties.gap',
      'scroll-behavior': 'css.properties.scroll-behavior',
      'backdrop-filter': 'css.properties.backdrop-filter',
      'container-type': 'css.properties.container-type',
      
      // CSS Selectors
      ':has': 'css.selectors.has',
      ':is': 'css.selectors.is',
      ':where': 'css.selectors.where',
      ':focus-visible': 'css.selectors.focus-visible',
      
      // CSS Functions
      'clamp': 'css.types.clamp',
      'min': 'css.types.min',
      'max': 'css.types.max',
      
      // JavaScript APIs
      'fetch': 'api.fetch',
      'IntersectionObserver': 'api.IntersectionObserver',
      'ResizeObserver': 'api.ResizeObserver',
      
      // HTML Elements
      'dialog': 'html.elements.dialog',
      'details': 'html.elements.details',
      'picture': 'html.elements.picture',
      
      // HTML Attributes
      'loading="lazy"': 'html.elements.img.loading',
    };
    
    return mappings[featureName] || null;
  }
  
  /**
   * Converts web-features package data to our BaselineInfo format
   */
  private convertWebFeatureToBaselineInfo(webFeature: any): BaselineInfo {
    const status = webFeature.status.baseline;
    
    // Convert web-features baseline status to our format
    let baselineStatus: BaselineStatus;
    if (status === 'high') {
      baselineStatus = 'high';
    } else if (status === 'low') {
      baselineStatus = 'limited';
    } else {
      baselineStatus = 'low';
    }
    
    // Extract browser support data
    const supportedBrowsers = [];
    const support = webFeature.status.support || {};
    
    for (const [browser, version] of Object.entries(support)) {
      if (typeof version === 'string') {
        // Map browser names to our format
        const browserMap: Record<string, string> = {
          'chrome': 'chrome',
          'chrome_android': 'chrome',
          'firefox': 'firefox',
          'firefox_android': 'firefox',
          'safari': 'safari',
          'safari_ios': 'safari',
          'edge': 'edge',
        };
        
        const mappedBrowser = browserMap[browser];
        if (mappedBrowser) {
          supportedBrowsers.push({
            browser: mappedBrowser,
            version: version,
          });
        }
      }
    }
    
    return {
      status: baselineStatus,
      isBaseline2023: Boolean(webFeature.status.baseline_high_date && 
                             new Date(webFeature.status.baseline_high_date).getFullYear() <= 2023),
      isWidelySupported: status === 'high',
      supportedBrowsers,
      dateSupported: webFeature.status.baseline_high_date || 
                     webFeature.status.baseline_low_date || null,
    };
  }
  
  /**
   * Converts compute-baseline data to our BaselineInfo format
   */
  private convertComputeBaselineToBaselineInfo(computeStatus: any): BaselineInfo {
    const status = computeStatus.baseline;
    
    let baselineStatus: BaselineStatus;
    if (status === 'high') {
      baselineStatus = 'high';
    } else if (status === 'low') {
      baselineStatus = 'limited';
    } else {
      baselineStatus = 'low';
    }
    
    // Extract browser support data
    const supportedBrowsers = [];
    const support = computeStatus.support || {};
    
    for (const [browser, version] of Object.entries(support)) {
      if (typeof version === 'string') {
        supportedBrowsers.push({
          browser: browser.toLowerCase(),
          version: version,
        });
      }
    }
    
    return {
      status: baselineStatus,
      isBaseline2023: Boolean(computeStatus.baseline_high_date && 
                             new Date(computeStatus.baseline_high_date).getFullYear() <= 2023),
      isWidelySupported: status === 'high',
      supportedBrowsers,
      dateSupported: computeStatus.baseline_high_date || 
                     computeStatus.baseline_low_date || null,
    };
  }
  
  /**
   * Provides fallback baseline data for common web features
   * This ensures the analyzer works even without NPM packages
   */
  private getFallbackBaselineData(featureName: string): BaselineInfo | null {
    const fallbackData: Record<string, BaselineInfo> = {
      // CSS Features
      'display: grid': {
        status: 'high' as BaselineStatus,
        isBaseline2023: true,
        isWidelySupported: true,
        supportedBrowsers: [
          { browser: 'chrome', version: '57' },
          { browser: 'firefox', version: '52' },
          { browser: 'safari', version: '10.1' },
          { browser: 'edge', version: '16' },
        ],
        dateSupported: '2017-03-01',
      },
      
      'display: flex': {
        status: 'high' as BaselineStatus,
        isBaseline2023: true,
        isWidelySupported: true,
        supportedBrowsers: [
          { browser: 'chrome', version: '29' },
          { browser: 'firefox', version: '28' },
          { browser: 'safari', version: '9' },
          { browser: 'edge', version: '12' },
        ],
        dateSupported: '2014-03-01',
      },
      
      ':has': {
        status: 'limited' as BaselineStatus,
        isBaseline2023: false,
        isWidelySupported: false,
        supportedBrowsers: [
          { browser: 'chrome', version: '105' },
          { browser: 'firefox', version: '103' },
          { browser: 'safari', version: '15.4' },
          { browser: 'edge', version: '105' },
        ],
        dateSupported: '2022-08-01',
      },
      
      '@container': {
        status: 'limited' as BaselineStatus,
        isBaseline2023: false,
        isWidelySupported: false,
        supportedBrowsers: [
          { browser: 'chrome', version: '105' },
          { browser: 'firefox', version: '110' },
          { browser: 'safari', version: '16' },
          { browser: 'edge', version: '105' },
        ],
        dateSupported: '2023-02-01',
      },
      
      'clamp': {
        status: 'high' as BaselineStatus,
        isBaseline2023: true,
        isWidelySupported: true,
        supportedBrowsers: [
          { browser: 'chrome', version: '79' },
          { browser: 'firefox', version: '75' },
          { browser: 'safari', version: '13.1' },
          { browser: 'edge', version: '79' },
        ],
        dateSupported: '2020-03-01',
      },
      
      // JavaScript Features
      'fetch': {
        status: 'high' as BaselineStatus,
        isBaseline2023: true,
        isWidelySupported: true,
        supportedBrowsers: [
          { browser: 'chrome', version: '42' },
          { browser: 'firefox', version: '39' },
          { browser: 'safari', version: '10.1' },
          { browser: 'edge', version: '14' },
        ],
        dateSupported: '2017-03-01',
      },
      
      'async function': {
        status: 'high' as BaselineStatus,
        isBaseline2023: true,
        isWidelySupported: true,
        supportedBrowsers: [
          { browser: 'chrome', version: '55' },
          { browser: 'firefox', version: '52' },
          { browser: 'safari', version: '10.1' },
          { browser: 'edge', version: '15' },
        ],
        dateSupported: '2017-03-01',
      },
      
      '=>': {
        status: 'high' as BaselineStatus,
        isBaseline2023: true,
        isWidelySupported: true,
        supportedBrowsers: [
          { browser: 'chrome', version: '45' },
          { browser: 'firefox', version: '22' },
          { browser: 'safari', version: '10' },
          { browser: 'edge', version: '12' },
        ],
        dateSupported: '2016-10-01',
      },
      
      'IntersectionObserver': {
        status: 'high' as BaselineStatus,
        isBaseline2023: true,
        isWidelySupported: true,
        supportedBrowsers: [
          { browser: 'chrome', version: '51' },
          { browser: 'firefox', version: '55' },
          { browser: 'safari', version: '12.1' },
          { browser: 'edge', version: '15' },
        ],
        dateSupported: '2019-03-01',
      },
      
      // HTML Features
      'dialog': {
        status: 'high' as BaselineStatus,
        isBaseline2023: true,
        isWidelySupported: true,
        supportedBrowsers: [
          { browser: 'chrome', version: '37' },
          { browser: 'firefox', version: '98' },
          { browser: 'safari', version: '15.4' },
          { browser: 'edge', version: '79' },
        ],
        dateSupported: '2022-03-01',
      },
      
      'loading="lazy"': {
        status: 'high' as BaselineStatus,
        isBaseline2023: true,
        isWidelySupported: true,
        supportedBrowsers: [
          { browser: 'chrome', version: '76' },
          { browser: 'firefox', version: '75' },
          { browser: 'safari', version: '15.4' },
          { browser: 'edge', version: '79' },
        ],
        dateSupported: '2022-03-01',
      },
    };
    
    const data = fallbackData[featureName];
    if (data) {
      logger.debug(`Found fallback baseline data for: ${featureName}`);
      return data;
    }
    
    // If no specific data, provide conservative estimate
    logger.debug(`No baseline data found for: ${featureName}, using conservative estimate`);
    return {
      status: 'unknown' as BaselineStatus,
      isBaseline2023: false,
      isWidelySupported: false,
      supportedBrowsers: [],
      dateSupported: null,
    };
  }
  
  /**
   * Checks if a feature is supported in a specific browser
   */
  private isSupportedInBrowser(baselineInfo: BaselineInfo, targetBrowser: string): boolean {
    // Parse target browser (e.g., "chrome >= 90", "ie >= 11")
    const [browser, version] = this.parseBrowserTarget(targetBrowser);
    
    // Find matching browser in baseline data
    const supportData = baselineInfo.supportedBrowsers.find(
      b => b.browser.toLowerCase() === browser.toLowerCase()
    );
    
    if (!supportData) {
      // If browser not in support data, assume not supported
      return false;
    }
    
    // Compare versions
    return this.compareVersions(supportData.version, version) <= 0;
  }
  
  /**
   * Parses browser target strings like "chrome >= 90" or "ie 11"
   */
  private parseBrowserTarget(target: string): [string, string] {
    const match = target.match(/(\w+)\s*(?:>=|>)?\s*(\d+(?:\.\d+)?)/);
    if (match && match[1] && match[2]) {
      return [match[1], match[2]];
    }
    
    // Fallback: assume it's just a browser name
    return [target, '0'];
  }
  
  /**
   * Simple version comparison (assumes semver-like: major.minor.patch)
   */
  private compareVersions(version1: string, version2: string): number {
    const v1parts = version1.split('.').map(Number);
    const v2parts = version2.split('.').map(Number);
    
    for (let i = 0; i < Math.max(v1parts.length, v2parts.length); i++) {
      const v1part = v1parts[i] || 0;
      const v2part = v2parts[i] || 0;
      
      if (v1part > v2part) return 1;
      if (v1part < v2part) return -1;
    }
    
    return 0;
  }
}
import { logger } from './logger.js';

/**
 * Debug utilities for testing GitHub webhooks and NPM packages
 * Run this with: npm run build && node dist/utils/debug.js
 */

/**
 * Debug helper to log actual GitHub webhook payload structure
 */
export function debugGitHubPayload(payload: unknown): void {
  logger.info('=== GITHUB WEBHOOK PAYLOAD DEBUG ===');
  
  if (payload && typeof payload === 'object') {
    logger.info('Top-level payload keys:', Object.keys(payload as any));
    
    const pr = (payload as any).pull_request;
    if (pr) {
      logger.info('PR object keys:', Object.keys(pr));
      logger.info('PR sample data:', {
        number: pr.number,
        title: pr.title,
        changed_files: pr.changed_files,
        additions: pr.additions,
        deletions: pr.deletions,
        user_login: pr.user?.login,
        base_repo_name: pr.base?.repo?.name,
        base_repo_owner: pr.base?.repo?.owner?.login,
        base_repo_private: pr.base?.repo?.private,
      });
    }
    
    // Also check the context structure
    const action = (payload as any).action;
    const repository = (payload as any).repository;
    
    logger.info('Webhook metadata:', {
      action,
      repository_name: repository?.name,
      repository_owner: repository?.owner?.login,
    });
  }
  
  logger.info('=== END GITHUB PAYLOAD DEBUG ===');
}

/**
 * Debug helper to test NPM package availability and data structure
 */
export async function debugNpmPackages(): Promise<void> {
  logger.info('=== NPM PACKAGES DEBUG ===');
  
  // Test web-features package
  try {
    // Import with comprehensive fallback handling for all bundling scenarios
    const webFeaturesModule = await import('web-features');
    
    // Handle ALL possible bundling scenarios with proper type casting
    const webFeatures = 
      (webFeaturesModule as any)?.default?.default ||  // Double-wrapped default
      (webFeaturesModule as any)?.default ||           // Single default wrapper
      webFeaturesModule;                               // Direct named exports

    // Extract data with multiple fallback patterns
    const features = 
      webFeatures?.features ||                // Direct access
      (webFeatures as any)?.default?.features ||       // Default wrapped
      ((webFeatures as any).default && (webFeatures as any).default.features); // Nested default
      
    const groups = 
      webFeatures?.groups ||
      (webFeatures as any)?.default?.groups ||
      ((webFeatures as any).default && (webFeatures as any).default.groups);
      
    const browsers = 
      webFeatures?.browsers ||
      (webFeatures as any)?.default?.browsers ||
      ((webFeatures as any).default && (webFeatures as any).default.browsers);
    
    if (features && typeof features === 'object' && Object.keys(features).length > 0) {
      
      if (features && groups && browsers) {
        logger.info('✅ web-features package available');
        logger.info(`📊 Features count: ${Object.keys(features).length}`);
        logger.info(`📊 Groups count: ${Object.keys(groups).length}`);
        logger.info(`📊 Browsers count: ${Object.keys(browsers).length}`);
        
        // Test some specific features we care about
        const testFeatures = ['grid', 'flexbox', 'has', 'container-queries', 'fetch'];
        logger.info('🔍 Testing specific features:');
        
        for (const featureId of testFeatures) {
          const feature = features[featureId];
          if (feature) {
            logger.info(`  ✅ ${featureId}: ${feature.name} - baseline: ${feature.status?.baseline}`);
            logger.info(`     Support: ${JSON.stringify(feature.status?.support || {})}`);
          } else {
            logger.info(`  ❌ ${featureId}: Not found`);
          }
        }
        
        // Test groups
        logger.info('🔍 Available groups:');
        Object.entries(groups).slice(0, 5).forEach(([id, group]: [string, any]) => {
          logger.info(`  📁 ${id}: ${group.name}`);
        });
      } else {
        logger.warn('❌ web-features: Invalid module structure');
      }
    } else {
      logger.warn('❌ web-features: Invalid module export');
    }
    
  } catch (error) {
    logger.warn('❌ web-features package error:', (error as Error).message);
  }
  
  // Test compute-baseline package
  try {
    const computeBaseline = await import('compute-baseline');
    logger.info('✅ compute-baseline package available');
    
    const getStatus = (computeBaseline as any).getStatus;
    if (getStatus) {
      logger.info('✅ getStatus function available');
      
      // Test some BCD keys
      const testBCDKeys = [
        'css.properties.display.grid',
        'css.selectors.has',
        'api.fetch',
        'html.elements.dialog'
      ];
      
      logger.info('🔍 Testing specific BCD keys:');
      for (const bcdKey of testBCDKeys) {
        try {
          const status = getStatus(null, bcdKey);
          if (status) {
            logger.info(`  ✅ ${bcdKey}: baseline: ${status.baseline}`);
            logger.info(`     Support: ${JSON.stringify(status.support || {})}`);
          } else {
            logger.info(`  ❌ ${bcdKey}: No data returned`);
          }
        } catch (error) {
          logger.info(`  ❌ ${bcdKey}: Error - ${(error as Error).message}`);
        }
      }
    } else {
      logger.warn('❌ getStatus function not found in compute-baseline');
    }
    
  } catch (error) {
    logger.warn('❌ compute-baseline package error:', (error as Error).message);
  }
  
  logger.info('=== END NPM DEBUG ===');
}

/**
 * Test our BaselineService with real NPM data
 */
export async function testBaselineService(): Promise<void> {
  logger.info('=== BASELINE SERVICE TEST ===');
  
  try {
    const { BaselineService } = await import('../services/baseline.service.js');
    const service = new BaselineService();
    
    // Test features we expect to find
    const testFeatures = [
      'display: grid',
      ':has',
      'fetch',
      'dialog',
      'clamp',
      'some-unknown-feature' // This should fallback
    ];
    
    for (const feature of testFeatures) {
      logger.info(`🔍 Testing feature: "${feature}"`);
      const baseline = await service.getBaselineInfo(feature);
      
      if (baseline) {
        logger.info(`  ✅ Status: ${baseline.status}`);
        logger.info(`  📅 Date: ${baseline.dateSupported}`);
        logger.info(`  🌐 Widely supported: ${baseline.isWidelySupported}`);
        logger.info(`  📱 Browser count: ${baseline.supportedBrowsers.length}`);
      } else {
        logger.info(`  ❌ No baseline data found`);
      }
    }
    
    // Test browser compatibility
    logger.info('🔍 Testing browser compatibility:');
    const isGridSupported = await service.isFeatureSupported('display: grid', [
      'chrome >= 90',
      'firefox >= 88',
      'safari >= 14'
    ]);
    logger.info(`  CSS Grid supported in modern browsers: ${isGridSupported}`);
    
    const isHasSupported = await service.isFeatureSupported(':has', [
      'ie >= 11' // This should be false
    ]);
    logger.info(`  :has() supported in IE11: ${isHasSupported}`);
    
  } catch (error) {
    logger.error('❌ BaselineService test failed:', error);
  }
  
  logger.info('=== END BASELINE SERVICE TEST ===');
}

/**
 * Main test runner
 */
async function runDebugTests(): Promise<void> {
  logger.info('🚀 Starting debug tests...');
  
  await debugNpmPackages();
  await testBaselineService();
  
  logger.info('✅ Debug tests complete!');
}

// Auto-run if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  runDebugTests().catch(error => {
    logger.error('Debug tests failed:', error);
    process.exit(1);
  });
}

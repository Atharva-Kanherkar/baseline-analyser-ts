import { logger } from './logger.js';


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

export async function debugWebPlatformAPI(): Promise<void> {
  logger.info('=== WEB PLATFORM STATUS API DEBUG ===');
  
  const API_BASE_URL = 'https://api.webstatus.dev/v1/features';
  
  // Test API connectivity
  try {
    logger.info('🔍 Testing API connectivity...');
    
    const testFeatures = ['grid', 'flexbox', 'has', 'container-queries', 'fetch'];
    
    for (const featureId of testFeatures) {
      try {
        const query = encodeURIComponent(`id:${featureId}`);
        const url = `${API_BASE_URL}?q=${query}`;
        
        const startTime = Date.now();
        const response = await fetch(url, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'baseline-analyzer-ts/1.0.0'
          }
        });
        const duration = Date.now() - startTime;
        
        if (response.ok) {
          const result = await response.json() as any;
          if (result.data && result.data.length > 0) {
            const feature = result.data[0];
            logger.info(`  ✅ ${featureId}: ${feature.name} (${duration}ms)`);
            if (feature.baseline) {
              logger.info(`     Baseline: ${feature.baseline.status}`);
              logger.info(`     High date: ${feature.baseline.high_date || 'N/A'}`);
              logger.info(`     Low date: ${feature.baseline.low_date || 'N/A'}`);
            }
          } else {
            logger.info(`  ❓ ${featureId}: No data found (${duration}ms)`);
          }
        } else {
          logger.warn(`  ❌ ${featureId}: HTTP ${response.status} (${duration}ms)`);
        }
      } catch (error) {
        logger.warn(`  💥 ${featureId}: ${(error as Error).message}`);
      }
    }
    
    // Test search functionality
    logger.info('🔍 Testing search functionality...');
    try {
      const searchQuery = encodeURIComponent('CSS Grid');
      const url = `${API_BASE_URL}?q=${searchQuery}`;
      
      const response = await fetch(url);
      if (response.ok) {
        const result = await response.json() as any;
        logger.info(`✅ Search returned ${result.data?.length || 0} results`);
        if (result.data && result.data.length > 0) {
          result.data.slice(0, 3).forEach((feature: any, index: number) => {
            logger.info(`  ${index + 1}. ${feature.name} (${feature.feature_id})`);
          });
        }
      }
    } catch (error) {
      logger.warn(`Search test failed: ${(error as Error).message}`);
    }
    
  } catch (error) {
    logger.warn('❌ Web Platform Status API error:', (error as Error).message);
  }
  
  logger.info('=== END API DEBUG ===');
}

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

async function runDebugTests(): Promise<void> {
  logger.info('🚀 Starting debug tests...');
  
  await debugWebPlatformAPI();
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

/**
 * Simple test script to verify the Web Platform Status API integration
 */
import { BaselineService } from './dist/services/baseline.service.js';

async function testBaselineService() {
  console.log('🧪 Testing Baseline Service with Web Platform Status API...\n');
  
  const baselineService = new BaselineService();
  
  // Test cases
  const testFeatures = [
    'display: grid',
    ':has',
    'fetch',
    'dialog',
    'container-queries',
    'unknown-feature'
  ];
  
  for (const feature of testFeatures) {
    console.log(`\n📝 Testing feature: "${feature}"`);
    
    try {
      const startTime = Date.now();
      const result = await baselineService.getBaselineInfo(feature);
      const duration = Date.now() - startTime;
      
      if (result) {
        console.log(`  ✅ Status: ${result.status}`);
        console.log(`  📅 Date supported: ${result.dateSupported || 'N/A'}`);
        console.log(`  🌐 Widely supported: ${result.isWidelySupported}`);
        console.log(`  🔢 Browser support count: ${result.supportedBrowsers.length}`);
        console.log(`  ⏱️  Query time: ${duration}ms`);
      } else {
        console.log(`  ❌ No data found (${duration}ms)`);
      }
    } catch (error) {
      console.log(`  💥 Error: ${error.message}`);
    }
  }
  
  console.log('\n🎉 Test completed!');
}

// Run the test
testBaselineService().catch(console.error);

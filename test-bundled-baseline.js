// Test the bundled baseline service directly
process.env.DEBUG_PACKAGES = 'true';

// Import from bundled version
const bundledModule = await import('./dist/bundled/index.js');

// Find the BaselineService in the bundled exports
let BaselineService;
for (const [key, value] of Object.entries(bundledModule)) {
  if (value && value.prototype && value.name === 'BaselineService') {
    BaselineService = value;
    break;
  }
}

if (!BaselineService) {
  console.log('Available exports:', Object.keys(bundledModule));
  process.exit(1);
}

console.log('=== TESTING BUNDLED BASELINE SERVICE ===');
const service = new BaselineService();

// Test the previously problematic features
const testFeatures = [
  'querySelectorAll',
  'addEventListener', 
  'display: grid'
];

for (const feature of testFeatures) {
  console.log(`\n🔍 Testing feature: "${feature}"`);
  try {
    const result = await service.getBaselineInfo(feature);
    if (result) {
      console.log(`  ✅ Status: ${result.status}`);
      console.log(`  📅 Date: ${result.dateSupported}`);
      console.log(`  🌐 Widely supported: ${result.isWidelySupported}`);
      console.log(`  📱 Browser count: ${result.supportedBrowsers.length}`);
      
      if (result.status === 'unknown') {
        console.log(`  ❌ PROBLEM: Feature marked as unknown!`);
      }
    } else {
      console.log(`  ❌ No data found`);
    }
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
  }
}

console.log('\n=== END BUNDLED BASELINE SERVICE TEST ===');

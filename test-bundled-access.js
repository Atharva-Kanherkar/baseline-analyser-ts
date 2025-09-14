#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

console.log('=== BUNDLED ENVIRONMENT FILE ACCESS TEST ===');
console.log('Current working directory:', process.cwd());

// Test the exact paths that the BaselineService tries
const relativePaths = [
    'node_modules/web-features/data.json',
    './data.json',
    '../data.json',
    '../../node_modules/web-features/data.json'
];

console.log('\n--- Testing relative paths ---');
for (const relativePath of relativePaths) {
    try {
        const exists = fs.existsSync(relativePath);
        console.log(`Path "${relativePath}": ${exists ? 'EXISTS' : 'NOT FOUND'}`);
        if (exists) {
            const stats = fs.statSync(relativePath);
            console.log(`  Size: ${stats.size} bytes`);
            
            // Try to read and parse
            try {
                const content = fs.readFileSync(relativePath, 'utf8');
                const data = JSON.parse(content);
                const featuresCount = Object.keys(data.features || {}).length;
                console.log(`  ✅ JSON parse successful, features: ${featuresCount}`);
            } catch (parseError) {
                console.log(`  ❌ JSON parse failed: ${parseError.message}`);
            }
        }
    } catch (error) {
        console.log(`Path "${relativePath}": ERROR - ${error.message}`);
    }
}

// Also test the web-features package import
console.log('\n--- Testing web-features package import ---');
try {
    const webFeaturesModule = await import('web-features');
    console.log('✅ web-features module imported successfully');
    console.log('Module keys:', Object.keys(webFeaturesModule));
    
    // Check the default export structure
    if (webFeaturesModule.default) {
        console.log('Default export keys:', Object.keys(webFeaturesModule.default));
        if (webFeaturesModule.default.default) {
            console.log('Nested default export keys:', Object.keys(webFeaturesModule.default.default));
        }
    }
} catch (error) {
    console.log('❌ web-features import failed:', error.message);
    console.log('Error stack:', error.stack);
}

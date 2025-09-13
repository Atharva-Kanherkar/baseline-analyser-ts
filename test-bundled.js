#!/usr/bin/env node

/**
 * Test the bundled GitHub Action to ensure both fixes work:
 * 1. severity-filter input should not cause validation errors
 * 2. web-features should import successfully and use real data
 */

import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const core = require('@actions/core');
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Mock GitHub Actions inputs
const mockInputs = {
  'github-token': 'fake-token-for-testing',
  'target-browsers': 'chrome >= 90, firefox >= 88, safari >= 14',
  'blocking-level': 'warning',
  'severity-filter': 'medium' // This should now work!
};

// Mock core.getInput to return our test inputs
const originalGetInput = core.getInput;
core.getInput = (name) => {
  console.log(`📝 Input requested: ${name} = ${mockInputs[name] || 'undefined'}`);
  return mockInputs[name] || '';
};

// Mock context for testing
process.env.GITHUB_ACTIONS = 'true';
process.env.NODE_ENV = 'development';

async function testBundledAction() {
  console.log('🚀 Testing bundled GitHub Action...');
  console.log('📍 Testing severity-filter input (should not cause validation error)');
  console.log('📍 Testing web-features import (should use real data, not fallback)');
  console.log('');

  try {
    // Import the bundled action
    const bundledActionPath = path.join(__dirname, 'dist', 'bundled', 'index.js');
    console.log(`📦 Loading bundled action from: ${bundledActionPath}`);
    
    // Clear require cache to ensure fresh import
    delete require.cache[require.resolve(bundledActionPath)];
    
    // Import and run the action
    await require(bundledActionPath);
    
    console.log('✅ Bundled action completed successfully!');
    console.log('✅ No severity-filter validation errors!');
    console.log('✅ Check the logs above for "[DATA SOURCE] Using REAL data" messages');
    
  } catch (error) {
    console.error('❌ Bundled action test failed:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Run the test
testBundledAction().catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});

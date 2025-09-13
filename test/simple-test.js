#!/usr/bin/env node

/**
 * Simple Local Test Runner - Test the analyzer with mock PR data
 * 
 * This script demonstrates how the Baseline Analyzer works with real data
 */

import { BaselineAnalyzer } from '../dist/core/analyzer.js';

async function runTest() {
  console.log('🧪 Testing Baseline Analyzer locally...\n');

  // Mock PR data in the expected format
  const mockPRData = {
    number: 123,
    title: 'Add modern CSS features and JavaScript APIs',
    body: 'This PR adds modern web platform features including CSS Grid, Container Queries, and modern JavaScript APIs',
    filesChanged: 4,
    additions: 45,
    deletions: 2,
    author: 'test-user',
    repository: {
      owner: 'test-user',
      name: 'test-repo',
      isPrivate: false
    }
  };

  // Mock code changes with modern web features
  const mockCodeChanges = [
    // CSS Grid - widely supported
    {
      file: 'src/styles/components.css',
      line: 'display: grid;',
      lineNumber: 2,
      type: 'ADDED'
    },
    // Container queries - newer feature
    {
      file: 'src/styles/components.css',
      line: 'container-type: inline-size;',
      lineNumber: 5,
      type: 'ADDED'
    },
    // :has() selector - newer feature
    {
      file: 'src/styles/components.css',
      line: '.card:has(.active) {',
      lineNumber: 13,
      type: 'ADDED'
    },
    // Fetch API - widely supported
    {
      file: 'src/js/api.js',
      line: 'const response = await fetch(\'/api/data\');',
      lineNumber: 4,
      type: 'ADDED'
    },
    // Optional chaining - check support
    {
      file: 'src/js/api.js',
      line: 'return data?.results?.items || [];',
      lineNumber: 8,
      type: 'ADDED'
    },
    // IntersectionObserver - widely supported
    {
      file: 'src/js/observers.js',
      line: 'const observer = new IntersectionObserver((entries) => {',
      lineNumber: 14,
      type: 'ADDED'
    },
    // HTML dialog element
    {
      file: 'src/components/Dialog.html',
      line: '<dialog id="modern-dialog">',
      lineNumber: 1,
      type: 'ADDED'
    },
    // Loading lazy attribute
    {
      file: 'src/components/Image.html',
      line: '<img src="image.jpg" loading="lazy">',
      lineNumber: 3,
      type: 'ADDED'
    }
  ];

  console.log('📊 Test Setup:');
  console.log(`  Repository: ${mockPRData.repository.owner}/${mockPRData.repository.name}`);
  console.log(`  PR #${mockPRData.number}: ${mockPRData.title}`);
  console.log(`  Files changed: ${mockCodeChanges.length}`);
  console.log('');

  try {
    // Initialize the analyzer
    const analyzer = new BaselineAnalyzer();

    // Run the analysis
    console.log('🔍 Running baseline analysis...\n');
    const results = await analyzer.analyze(mockPRData, mockCodeChanges);

    // Display results
    console.log('📋 Analysis Results:');
    console.log('===================\n');

    console.log(`🎯 PR Size: ${results.prContext.size} (${results.prContext.filesChanged} files)`);
    console.log(`⚠️  Total Features: ${results.totalFeaturesDetected}`);
    console.log(`🚨 Risks Found: ${results.risksFound.length}`);
    console.log(`⏱️  Processing Time: ${results.processingTime}ms\n`);

    if (results.risksFound.length > 0) {
      console.log('⚠️  Compatibility Risks:');
      results.risksFound.forEach((risk, index) => {
        console.log(`  ${index + 1}. ${risk.feature} (${risk.severity})`);
        console.log(`     ${risk.description}`);
        if (risk.recommendation) {
          console.log(`     💡 ${risk.recommendation}`);
        }
      });
      console.log('');
    }

    console.log('📝 Generated Summary:');
    console.log('====================');
    console.log(results.summary);

    console.log('\n✅ Local test completed successfully!');
    console.log('\n🎯 What this demonstrates:');
    console.log('   • Feature detection from code changes');
    console.log('   • Baseline compatibility analysis');
    console.log('   • Risk assessment and recommendations');
    console.log('   • PR comment generation');

  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Test large PR scenario
async function testLargePR() {
  console.log('\n🔬 Testing Large PR scenario...\n');

  const largePRData = {
    number: 456,
    title: 'Large refactor with grid layouts',
    body: 'This is a large PR that updates many files',
    filesChanged: 60,
    additions: 300,
    deletions: 50,
    author: 'test-user',
    repository: {
      owner: 'test',
      name: 'large-pr-test',
      isPrivate: false
    }
  };

  // Generate many code changes
  const largePRChanges = Array.from({ length: 60 }, (_, i) => ({
    file: `src/components/component-${i}.css`,
    line: 'display: grid;',
    lineNumber: 5,
    type: 'ADDED'
  }));

  try {
    const analyzer = new BaselineAnalyzer();
    const results = await analyzer.analyze(largePRData, largePRChanges);

    console.log(`✅ Large PR Analysis:`);
    console.log(`   Size: ${results.prContext.size}`);
    console.log(`   Features detected: ${results.totalFeaturesDetected}`);
    console.log(`   Risks reported: ${results.risksFound.length}`);
    console.log(`   Processing time: ${results.processingTime}ms`);

  } catch (error) {
    console.error('Large PR test failed:', error);
  }
}

// Run tests
if (import.meta.url === `file://${process.argv[1]}`) {
  runTest()
    .then(() => testLargePR())
    .then(() => {
      console.log('\n🏁 All tests completed!');
      console.log('\nNext steps:');
      console.log('1. Review the analysis output above');
      console.log('2. Try the GitHub Actions workflow for real PRs');
      console.log('3. Customize feature detection patterns as needed');
    })
    .catch(error => {
      console.error('Test runner failed:', error);
      process.exit(1);
    });
}

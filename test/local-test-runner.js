#!/usr/bin/env node

/**
 * Local Test Runner - Test the analyzer with mock PR data
 * 
 * This script simulates a real GitHub PR environment locally
 * so you can test the analyzer without creating actual PRs.
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { writeFileSync, mkdirSync } from 'fs';
import { BaselineAnalyzer } from '../dist/core/analyzer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runLocalTest() {
  console.log('🧪 Starting local Baseline Analyzer test...\n');

  // Create mock code changes in the format expected by the analyzer
  const mockCodeChanges = [
    {
      file: 'src/styles/components.css',
      line: 'display: grid;',
      lineNumber: 2,
      type: 'ADDED'
    },
    {
      file: 'src/styles/components.css',
      line: 'container-type: inline-size;',
      lineNumber: 5,
      type: 'ADDED'
    },
    {
      file: 'src/styles/components.css',
      line: 'aspect-ratio: 16/9;',
      lineNumber: 9,
      type: 'ADDED'
    },
    {
      file: 'src/styles/components.css',
      line: '.card:has(.active) {',
      lineNumber: 13,
      type: 'ADDED'
    },
    {
      file: 'src/js/modern-features.js',
      line: 'const response = await fetch(\'/api/data\');',
      lineNumber: 4,
      type: 'ADDED'
    },
    {
      file: 'src/js/modern-features.js',
      line: 'return data?.results?.items || [];',
      lineNumber: 8,
      type: 'ADDED'
    },
    {
      file: 'src/js/modern-features.js',
      line: 'const observer = new IntersectionObserver((entries) => {',
      lineNumber: 14,
      type: 'ADDED'
    },
    {
      file: 'src/components/Dialog.html',
      line: '<dialog id="modern-dialog" class="dialog">',
      lineNumber: 1,
      type: 'ADDED'
    },
    {
      file: 'src/components/Dialog.html',
      line: '<img src="image.jpg" alt="Example" loading="lazy">',
      lineNumber: 7,
      type: 'ADDED'
    },
    {
      file: 'src/styles/animations.css',
      line: 'view-transition-name: slide-content;',
      lineNumber: 11,
      type: 'ADDED'
    }
    },
    {
      filename: 'src/js/modern-features.js',
      status: 'modified',
      patch: `+class DataLoader {
+  async loadData() {
+    try {
+      const response = await fetch('/api/data');
+      const data = await response.json();
+      
+      // Use optional chaining
+      return data?.results?.items || [];
+    } catch (error) {
+      console.error('Failed to load data:', error);
+      return [];
+    }
+  }
+
+  setupIntersectionObserver() {
+    const observer = new IntersectionObserver((entries) => {
+      entries.forEach(entry => {
+        if (entry.isIntersecting) {
+          this.lazyLoadImage(entry.target);
+        }
+      });
+    }, { threshold: 0.1 });
+
+    document.querySelectorAll('[data-lazy]').forEach(img => {
+      observer.observe(img);
+    });
+  }
+}`
    },
    {
      filename: 'src/components/Dialog.html',
      status: 'added',
      patch: `+<dialog id="modern-dialog" class="dialog">
+  <form method="dialog">
+    <h2>Modern Dialog</h2>
+    <p>This uses the native HTML dialog element.</p>
+    
+    <picture>
+      <source srcset="image.webp" type="image/webp">
+      <img src="image.jpg" alt="Example" loading="lazy">
+    </picture>
+    
+    <details>
+      <summary>More options</summary>
+      <p>Additional content here...</p>
+    </details>
+    
+    <button value="cancel">Cancel</button>
+    <button value="confirm">Confirm</button>
+  </form>
+</dialog>`
    },
    {
      filename: 'src/styles/animations.css',
      status: 'added',
      patch: `+@keyframes slideIn {
+  from {
+    transform: translateX(-100%);
+    opacity: 0;
+  }
+  to {
+    transform: translateX(0);
+    opacity: 1;
+  }
+}
+
+.slide-transition {
+  animation: slideIn 0.3s ease-out;
+  view-transition-name: slide-content;
+}
+
+::view-transition-old(slide-content) {
+  transform: translateX(-100%);
+}
+
+::view-transition-new(slide-content) {
+  transform: translateX(100%);
+}`
    }
  ];

  // Mock PR data in the expected format
  const mockPRData = {
    number: 123,
    title: 'Add modern CSS features',
    body: 'This PR adds modern CSS Grid, Container Queries, and other new features',
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

  console.log('📊 Mock PR Context:');
  console.log(`  Repository: ${mockPRData.repository.owner}/${mockPRData.repository.name}`);
  console.log(`  PR #${mockPRData.number}: ${mockPRData.title}`);
  console.log(`  Files changed: ${mockCodeChanges.length}`);
  console.log('');

  // Initialize the analyzer
  const analyzer = new BaselineAnalyzer();

  try {
    // Run the analysis
    console.log('🔍 Running baseline analysis...\n');
    const results = await analyzer.analyze(mockPRData, mockCodeChanges);

    // Display results
    console.log('📋 Analysis Results:');
    console.log('==================\n');

    console.log(`🎯 PR Size: ${results.prContext.size} (${results.prContext.filesChanged} files)`);
    console.log(`📈 Strategy: ${results.prContext.analysisStrategy}`);
    console.log(`⚠️  Risk Level: ${results.overallRisk}\n`);

    if (results.features.length > 0) {
      console.log('🔍 Detected Features:');
      results.features.forEach(feature => {
        const riskIcon = feature.risk === 'high' ? '🚨' : 
                        feature.risk === 'medium' ? '⚠️' : '✅';
        console.log(`  ${riskIcon} ${feature.name} (${feature.type})`);
        if (feature.baselineInfo) {
          console.log(`     Status: ${feature.baselineInfo.status.toUpperCase()}`);
          console.log(`     Widely supported: ${feature.baselineInfo.isWidelySupported ? 'Yes' : 'No'}`);
        }
      });
      console.log('');
    }

    if (results.risks.length > 0) {
      console.log('⚠️  Compatibility Risks:');
      results.risks.forEach(risk => {
        console.log(`  • ${risk.feature}: ${risk.description}`);
        console.log(`    Severity: ${risk.severity.toUpperCase()}`);
        if (risk.recommendation) {
          console.log(`    💡 ${risk.recommendation}`);
        }
      });
      console.log('');
    }

    if (results.recommendations.length > 0) {
      console.log('💡 Recommendations:');
      results.recommendations.forEach((rec, index) => {
        console.log(`  ${index + 1}. ${rec}`);
      });
      console.log('');
    }

    // Show what the GitHub comment would look like
    console.log('📝 Generated GitHub Comment:');
    console.log('============================\n');
    console.log(results.summary);

    console.log('\n✅ Local test completed successfully!');
    console.log('\n🚀 Next steps:');
    console.log('   1. Review the analysis results above');
    console.log('   2. Test with different PR sizes and content');
    console.log('   3. Deploy as GitHub Action for real PR testing');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Create additional test scenarios
async function runTestScenarios() {
  console.log('\n🎯 Running additional test scenarios...\n');

  // Test large PR scenario
  const largePRChanges = Array.from({ length: 60 }, (_, i) => ({
    file: `src/file-${i}.js`,
    line: 'element.style.display = \'grid\';',
    lineNumber: 3,
    type: 'ADDED'
  }));

  const largePRData = {
    number: 456,
    title: 'Large refactor with modern features',
    body: 'This is a large PR that refactors many files',
    filesChanged: 60,
    additions: 180,
    deletions: 45,
    author: 'test-user',
    repository: {
      owner: 'test',
      name: 'large-pr-test',
      isPrivate: false
    }
  };

  console.log('📊 Testing Large PR scenario (60 files)...');
  const analyzer = new BaselineAnalyzer();
  const largeResults = await analyzer.analyze(largePRData, largePRChanges);
  
  console.log(`✅ Large PR Analysis:`);
  console.log(`   Size: ${largeResults.prContext.size}`);
  console.log(`   Strategy: ${largeResults.prContext.analysisStrategy}`);
  console.log(`   Features found: ${largeResults.features.length}`);
  console.log(`   Risks reported: ${largeResults.risks.length}`);
  
  console.log('\n🏁 All test scenarios completed!');
}

// Run the tests
if (import.meta.url === `file://${process.argv[1]}`) {
  runLocalTest()
    .then(() => runTestScenarios())
    .catch(error => {
      console.error('Test runner failed:', error);
      process.exit(1);
    });
}

export { runLocalTest };

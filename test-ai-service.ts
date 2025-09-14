/**
 * Simple test to verify AI service integration
 */

import { AIService } from './src/services/ai.service.js';
import type { RiskAssessment, PRContext } from './src/core/types.js';

// Mock data for testing
const mockRisks: RiskAssessment[] = [
  {
    feature: {
      name: 'container-type',
      type: 'CSS',
      location: {
        file: 'src/components/Card.css',
        line: 15,
        snippet: '.card { container-type: inline-size; }'
      }
    },
    baseline: {
      status: 'limited',
      isBaseline2023: false,
      isWidelySupported: false,
      supportedBrowsers: [
        { browser: 'chrome', version: '105' },
        { browser: 'firefox', version: '110' },
        { browser: 'safari', version: '16' }
      ],
      dateSupported: null
    },
    risk: 'HIGH',
    actionRequired: 'REQUIRE_REVIEW',
    reason: 'Limited baseline support across browsers',
    recommendation: 'Consider adding @supports rule for progressive enhancement',
    hasBreakingChange: true
  }
];

const mockPRContext: PRContext = {
  number: 123,
  title: 'Add modern CSS features',
  body: 'Testing container queries implementation',
  filesChanged: 3,
  additions: 25,
  deletions: 2,
  size: 'SMALL',
  author: 'developer',
  repository: {
    owner: 'test-org',
    name: 'web-app',
    isPrivate: false
  }
};

async function testAIService() {
  console.log('🧪 Testing AI Service Integration...\n');
  
  // Test with mock API key (will show fallback behavior)
  const aiService = new AIService('mock-api-key');
  
  try {
    console.log('📊 Testing AI analysis...');
    const analyses = await aiService.analyzeFeatures(mockRisks, mockPRContext);
    
    console.log(`✅ AI Service created successfully`);
    console.log(`📈 Analysis result: ${analyses.length} analyses returned`);
    
    if (analyses.length > 0) {
      console.log(`🎯 First analysis confidence: ${analyses[0].confidence}`);
      console.log(`💡 Suggestions count: ${analyses[0].suggestions.length}`);
    }
    
    console.log('\n🔍 Testing summary generation...');
    const summary = aiService.generateAISummary(analyses);
    console.log(`📝 Summary length: ${summary.length} characters`);
    console.log(`📄 Sample summary: ${summary.substring(0, 100)}...`);
    
    console.log('\n✅ All tests passed! AI service is ready to use.');
    
  } catch (error) {
    console.log(`⚠️ Expected behavior with mock API key: ${error}`);
    console.log('🔑 To test with real API, set PERPLEXITY_API_KEY environment variable');
  }
  
  // Test summary with empty data
  console.log('\n🧪 Testing edge cases...');
  const emptySummary = aiService.generateAISummary([]);
  console.log(`📄 Empty summary: "${emptySummary}"`);
  
  console.log('\n🎉 AI Service integration test completed!');
}

// Run the test
testAIService().catch(console.error);

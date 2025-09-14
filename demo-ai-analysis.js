#!/usr/bin/env node

/**
 * Test script to demonstrate AI-enhanced baseline analysis
 */

import { BaselineAnalyzer } from './src/core/analyzer.js';

// Mock configuration with AI enabled
const config = {
  targetBrowsers: ['chrome >= 88', 'firefox >= 85', 'safari >= 14'],
  blockingLevel: 'HIGH',
  largePRThreshold: 20,
  hugePRThreshold: 50,
  enableAIReview: true,
  githubToken: 'mock-token',
  perplexityApiKey: process.env.PERPLEXITY_API_KEY || 'mock-key', // You would set this in production
};

// Mock code changes with modern web features
const mockCodeChanges = [
  {
    file: 'src/components/Card.css',
    line: '.card { container-type: inline-size; aspect-ratio: 16/9; }',
    lineNumber: 15,
    type: 'ADDED',
  },
  {
    file: 'src/styles/layout.css', 
    line: '.interactive:has(.active) { border: 2px solid blue; }',
    lineNumber: 23,
    type: 'ADDED',
  },
  {
    file: 'src/scripts/animations.js',
    line: 'document.startViewTransition(() => { /* animation code */ });',
    lineNumber: 8,
    type: 'ADDED',
  },
  {
    file: 'src/components/Dialog.js',
    line: 'const dialog = document.querySelector("dialog"); dialog.showModal();',
    lineNumber: 12,
    type: 'ADDED',
  },
];

async function runAIEnhancedAnalysis() {
  console.log('🤖 Starting AI-Enhanced Baseline Analysis Demo\n');
  
  const analyzer = new BaselineAnalyzer(config);
  
  try {
    const result = await analyzer.analyzeCodeChanges(mockCodeChanges);
    
    console.log('📊 Analysis Results:');
    console.log(`- Features detected: ${result.totalFeaturesDetected}`);
    console.log(`- Risks found: ${result.risksFound.length}`);
    console.log(`- AI analyses: ${result.aiAnalyses?.length || 0}`);
    console.log(`- Processing time: ${result.processingTime}ms\n`);
    
    // Display AI suggestions if available
    if (result.aiAnalyses && result.aiAnalyses.length > 0) {
      console.log('🤖 AI Suggestions:');
      for (const analysis of result.aiAnalyses) {
        console.log(`\n🔍 Feature: ${analysis.feature}`);
        console.log(`💭 Reasoning: ${analysis.reasoning}`);
        console.log(`🎯 Confidence: ${Math.round(analysis.confidence * 100)}%`);
        
        for (const suggestion of analysis.suggestions) {
          console.log(`\n  💡 ${suggestion.title} (${suggestion.type})`);
          console.log(`     ${suggestion.description}`);
          if (suggestion.code) {
            console.log(`     Code: ${suggestion.code.substring(0, 100)}...`);
          }
        }
      }
    } else {
      console.log('ℹ️ No AI analysis available (check API key configuration)');
    }
    
    console.log(`\n✅ Demo completed successfully!`);
    console.log(`Decision: ${result.decision.action} - ${result.decision.message}`);
    
  } catch (error) {
    console.error('❌ Analysis failed:', error);
  }
}

// Run the demo
runAIEnhancedAnalysis();

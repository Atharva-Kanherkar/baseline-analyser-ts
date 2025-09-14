#!/usr/bin/env node

// Simulate a simple GitHub webhook payload to test DOM API handling
const payload = {
  pull_request: {
    diff_url: "https://github.com/test/repo/pull/1.diff"
  }
};

// Mock process.env
process.env.GITHUB_TOKEN = "fake-token";
process.env.INPUT_REPO_TOKEN = "fake-token";

console.log('=== DOM API BASELINE TEST ===');
console.log('Testing if DOM APIs like querySelectorAll get proper baseline data...\n');

// Import and run the action
import('./index.js');

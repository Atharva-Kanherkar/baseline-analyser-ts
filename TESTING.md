# Testing the Baseline Analyzer with Real PRs

## Overview

The Baseline Analyzer is a GitHub Action that automatically analyzes PRs for web platform compatibility issues. Here's how to test it with real PRs and understand the complete workflow.

## 🚀 Quick Setup for Testing

### 1. Publish as GitHub Action

First, you need to make this available as a GitHub Action:

```bash
# Build the project
npm run build

# Create a release tag
git tag -a v1.0.0 -m "Initial release"
git push origin v1.0.0
```

### 2. Create a GitHub Workflow

In any repository where you want to test, create `.github/workflows/baseline-analyzer.yml`:

```yaml
name: PR Baseline Analysis

on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  baseline-analysis:
    runs-on: ubuntu-latest
    name: Analyze PR for Web Compatibility
    
    steps:
    - name: Checkout
      uses: actions/checkout@v4
      with:
        fetch-depth: 0  # Need full history for PR diff
        
    - name: Run Baseline Analyzer
      uses: your-username/baseline-analyzer-ts@v1.0.0
      with:
        github-token: ${{ secrets.GITHUB_TOKEN }}
        # Optional: Configure analysis behavior
        large-pr-threshold: 50
        target-browsers: "chrome >= 90, firefox >= 88, safari >= 14"
        severity-filter: "medium"
```

## 📋 Testing Scenarios

### Scenario 1: Small PR with Modern CSS

Create a PR that adds modern CSS features:

```css
/* Add to styles.css */
.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  container-type: inline-size; /* New container query feature */
}

.card {
  aspect-ratio: 16/9; /* Modern aspect-ratio property */
  backdrop-filter: blur(10px); /* Backdrop filter */
}

.card:has(.active) { /* :has() selector - newer feature */
  border: 2px solid blue;
}
```

**Expected Analysis:**
- ✅ `display: grid` - HIGH baseline (widely supported)
- ✅ `gap` - HIGH baseline (widely supported)  
- ⚠️ `container-type` - LIMITED baseline (newer feature)
- ⚠️ `:has()` - LIMITED baseline (newer feature)
- ⚠️ `backdrop-filter` - May have limited support

### Scenario 2: JavaScript with Modern APIs

```javascript
// Add to app.js
class ModernFeatures {
  async loadData() {
    // Fetch API - widely supported
    const response = await fetch('/api/data');
    const data = await response.json();
    
    // Intersection Observer - widely supported
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.lazyLoad(entry.target);
        }
      });
    });
    
    // Optional chaining - check baseline status
    return data?.results?.items || [];
  }
}
```

**Expected Analysis:**
- ✅ `fetch` - HIGH baseline
- ✅ `async/await` - HIGH baseline
- ✅ `IntersectionObserver` - HIGH baseline
- ⚠️ Optional chaining (`?.`) - Check current baseline status

### Scenario 3: Large PR (50+ files)

For large PRs, the analyzer applies intelligent filtering:

- **Smart Focus:** Only reports CRITICAL compatibility issues
- **Noise Reduction:** Skips minor warnings that would overwhelm
- **Summary Format:** Provides high-level overview instead of file-by-file details

## 🔍 Understanding the Analysis Output

### PR Comment Format

The analyzer posts a comment on your PR like this:

```markdown
## 🔍 Web Platform Baseline Analysis

**PR Context:** Small PR (12 files changed) - Full analysis applied

### 🚨 Critical Issues Found (2)

#### `styles/components.css`
- **container-type: inline-size** - ⚠️ LIMITED baseline support
  - Chrome 105+, Firefox 110+, Safari 16+
  - Consider fallback or feature detection

#### `js/animations.js` 
- **View Transitions API** - ❌ LOW baseline support
  - Chrome 111+, Firefox: Not supported, Safari: Not supported
  - Requires polyfill or progressive enhancement

### ✅ Well-Supported Features (8)
- `display: grid`, `fetch()`, `async/await`, `IntersectionObserver`...

### 📊 Analysis Summary
- **Total Features Detected:** 10
- **High Baseline:** 8 features (80%)
- **Limited Baseline:** 1 feature (10%)
- **Low Baseline:** 1 feature (10%)
- **Risk Level:** MEDIUM

### 💡 Recommendations
1. Add feature detection for container queries
2. Consider polyfill for View Transitions
3. Test thoroughly in Firefox and Safari
```

## 🧪 Local Testing

### Test the Core Analyzer

```bash
# Build the project
npm run build

# Test with mock PR data
npm run test

# Debug with specific features
node dist/utils/debug.js
```

### Test GitHub Integration

Create a test script to simulate GitHub webhook data:

```javascript
// test-github-integration.js
import { run } from './dist/actions/main.js';

// Set up mock environment
process.env.GITHUB_TOKEN = 'your-test-token';
process.env.GITHUB_REPOSITORY = 'your-username/test-repo';
process.env.GITHUB_EVENT_NAME = 'pull_request';
process.env.GITHUB_EVENT_PATH = './test-pr-payload.json';

// Create mock PR payload
const testPayload = {
  pull_request: {
    number: 123,
    base: { ref: 'main' },
    head: { ref: 'feature-branch' }
  }
};

// Run the analyzer
await run();
```

## 📈 Monitoring and Debugging

### Action Logs

Check the GitHub Actions logs for detailed information:

- Feature detection results
- Baseline lookup results  
- Error messages and warnings
- Performance metrics

### Debug Mode

Enable debug logging by adding to your workflow:

```yaml
env:
  DEBUG: 'baseline-analyzer:*'
```

## 🎯 Real-World Integration

### Development Workflow

1. **Developer creates PR** with web platform features
2. **Baseline Analyzer triggers** automatically
3. **Analysis runs** in ~30-60 seconds
4. **Results posted** as PR comment
5. **Developer reviews** compatibility issues
6. **Optionally fixes** issues before merge

### Team Benefits

- **Proactive:** Catches compatibility issues before they reach production
- **Educational:** Teaches developers about web platform evolution
- **Intelligent:** Doesn't overwhelm with noise on large PRs
- **Actionable:** Provides specific version requirements and recommendations

## 🛠️ Customization Options

### Configure Analysis Behavior

```yaml
- name: Run Baseline Analyzer
  uses: your-username/baseline-analyzer-ts@v1.0.0
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    # Adjust these based on your needs:
    large-pr-threshold: 30        # Files count for "large PR"
    target-browsers: "chrome >= 88, firefox >= 85, safari >= 14, edge >= 88"
    severity-filter: "high"       # Only show high-severity issues
    include-patterns: "src/**,public/**"  # Only analyze these paths
    exclude-patterns: "node_modules/**,dist/**"  # Skip these paths
```

### Custom Feature Detection

Extend the feature detector for your specific needs:

```typescript
// Add to src/components/feature-detector/patterns/custom.ts
export const customPatterns = [
  {
    pattern: /your-custom-api\(/g,
    feature: 'your-custom-api',
    type: 'javascript' as const
  }
];
```

## 🔄 Continuous Integration

The analyzer integrates seamlessly with your existing CI/CD:

- **Non-blocking:** Runs as informational check, doesn't fail builds
- **Parallel:** Runs alongside other CI checks (tests, linting)
- **Fast:** Completes analysis in under 1 minute for most PRs
- **Reliable:** Uses cached NPM data and fallback compatibility info

## 📚 Next Steps

1. **Start Small:** Test with a few PRs to validate behavior
2. **Customize:** Adjust thresholds and browser targets for your needs
3. **Educate Team:** Share results and help developers understand baseline concepts
4. **Iterate:** Refine patterns and add custom feature detection as needed
5. **Scale:** Apply to all repositories once proven effective

The Baseline Analyzer becomes more valuable over time as your team learns to write more compatible code proactively!

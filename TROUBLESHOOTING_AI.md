# 🧪 Testing AI Features - Troubleshooting Guide

If AI reviews aren't showing up, here's how to debug and fix the issue:

## ✅ Quick Checklist

### 1. Verify Workflow Configuration
```yaml
- uses: Atharva-Kanherkar/baseline-analyser-ts@v1.3.0  # ← Latest version
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    enable-ai-review: true                              # ← Must be true
    perplexity-api-key: ${{ secrets.PERPLEXITY_API_KEY }} # ← API key secret
```

### 2. Check GitHub Secrets
- Go to Repository Settings → Secrets and Variables → Actions
- Verify `PERPLEXITY_API_KEY` exists and has correct value
- API key should start with `pplx-`

### 3. Verify Perplexity API Key
Test your API key with this curl command:
```bash
curl -X POST https://api.perplexity.ai/chat/completions \
  -H "Authorization: Bearer YOUR_API_KEY_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama-3.1-sonar-small-128k-online",
    "messages": [{"role": "user", "content": "Hello"}],
    "max_tokens": 10
  }'
```

## 🔍 Test PR Template

Create a PR with this code to trigger AI analysis:

### CSS Test (high risk features)
```css
/* src/test-features.css */
.container-query-test {
  container-type: inline-size;
  aspect-ratio: 16/9;
}

.has-selector-test:has(.active) {
  border: 2px solid blue;
}

.cascade-layers-test {
  @layer base, components;
  @layer base {
    color: red;
  }
}
```

### JavaScript Test
```javascript
// src/test-features.js
// View Transitions API (high risk)
document.startViewTransition(() => {
  // Animation code
});

// Web Locks API (limited support)
navigator.locks.request('my-lock', () => {
  // Critical section
});
```

## 🐛 Debugging Steps

### Step 1: Check Action Logs
1. Go to your PR → Actions tab
2. Click on the failing workflow run
3. Look for these log messages:
   ```
   STAGE 6: Running AI analysis for intelligent suggestions
   AI analysis completed: X features analyzed
   ```

### Step 2: Expected Log Messages
**If AI is working:**
```
[INFO] Baseline Analyzer initialized with AI service
[INFO] STAGE 6: Running AI analysis for intelligent suggestions  
[INFO] AI analysis completed: 2 features analyzed
```

**If AI key is missing:**
```
[WARN] Perplexity API key not provided. AI suggestions will be disabled.
[INFO] No AI analysis available (check API key configuration)
```

**If no high-risk features:**
```
[INFO] STAGE 6: Running AI analysis for intelligent suggestions
[INFO] AI analysis completed: 0 features analyzed
```

### Step 3: Common Issues & Fixes

#### Issue: "AI analysis completed: 0 features analyzed"
**Cause:** Only HIGH/CRITICAL risk features get AI analysis
**Fix:** Use the test code above, or add more modern/experimental features

#### Issue: "Perplexity API key not provided"
**Cause:** API key not configured correctly
**Fix:** 
1. Check secret name is exactly `PERPLEXITY_API_KEY`
2. Verify workflow uses `perplexity-api-key: ${{ secrets.PERPLEXITY_API_KEY }}`
3. Ensure API key is valid and has credits

#### Issue: "Perplexity API error: 401 Unauthorized"
**Cause:** Invalid or expired API key
**Fix:** 
1. Generate new API key at perplexity.ai
2. Update GitHub secret with new key
3. Verify account has sufficient credits

#### Issue: No AI suggestions in PR comment
**Cause:** Comment generation issue
**Fix:** Check for `### 🤖 AI-Powered Solutions` section in PR comment

## 🧪 Manual Testing

### Test Locally (for debugging)
```bash
# Clone and test locally
git clone https://github.com/Atharva-Kanherkar/baseline-analyser-ts.git
cd baseline-analyser-ts
npm install
npm run build

# Set environment variable
export PERPLEXITY_API_KEY="your-key-here"

# Run test
npx tsx test-ai-service.ts
```

### Expected Output
```
🧪 Testing AI Service Integration...
📊 Testing AI analysis...
✅ AI Service created successfully
📈 Analysis result: 1 analyses returned
🎯 First analysis confidence: 0.85
💡 Suggestions count: 2
```

## 🆘 Still Not Working?

### Option 1: Enable Debug Mode
Add to your workflow:
```yaml
env:
  DEBUG: 'baseline-analyzer:*'
```

### Option 2: Use Without AI (Fallback)
Remove AI configuration to verify base functionality:
```yaml
- uses: Atharva-Kanherkar/baseline-analyser-ts@v1.3.0
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    # enable-ai-review: true  ← Comment out
    # perplexity-api-key: ${{ secrets.PERPLEXITY_API_KEY }}  ← Comment out
```

### Option 3: Report Issue
If still having problems, create an issue with:
- Workflow YAML configuration
- PR with test features
- Action logs (without API key)
- Expected vs actual behavior

## 💡 Pro Tips

1. **Start Simple**: Test with one HIGH-risk CSS feature first
2. **Check Costs**: Monitor your Perplexity usage/billing
3. **Gradual Rollout**: Enable AI on specific branches first
4. **Team Training**: Share successful AI suggestions with team

The AI features should work immediately after fixing any configuration issues! 🚀

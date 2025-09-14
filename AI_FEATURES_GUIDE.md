# AI-Enhanced Baseline Analyzer - Usage Example

This document demonstrates how to use the new AI-powered features in the Baseline Analyzer.

## Setup

### 1. Basic GitHub Action (Traditional Analysis)

```yaml
name: Browser Compatibility Check
on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  compatibility:
    runs-on: ubuntu-latest
    steps:
      - uses: Atharva-Kanherkar/baseline-analyser-ts@v1.0.0
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          target-browsers: "chrome >= 88, firefox >= 85, safari >= 14"
          blocking-level: "warning"
```

### 2. AI-Enhanced Analysis (Recommended)

```yaml
name: Smart Compatibility Analysis
on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  compatibility:
    runs-on: ubuntu-latest
    steps:
      - uses: Atharva-Kanherkar/baseline-analyser-ts@v1.0.0
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          enable-ai-review: true
          perplexity-api-key: ${{ secrets.PERPLEXITY_API_KEY }}
          target-browsers: "chrome >= 88, firefox >= 85, safari >= 14"
          blocking-level: "warning"
```

## Getting Your Perplexity API Key

1. Go to [perplexity.ai](https://perplexity.ai)
2. Sign up or log in to your account
3. Navigate to API settings
4. Generate a new API key
5. Add it to your GitHub repository secrets as `PERPLEXITY_API_KEY`

## What AI Analysis Provides

### Traditional Output
```markdown
### ⚠️ Issues Found

#### 🟡 MEDIUM: CSS Container Queries (@container)
**Risk Level:** MEDIUM
**Issue:** Limited baseline support - Chrome 105+, Firefox 110+, Safari 16+
**Recommendation:** Consider adding fallbacks for better browser support
```

### AI-Enhanced Output
```markdown
### 🤖 AI-Powered Solutions

#### 💡 Solutions for `container-type`
Modern CSS Container Queries provide responsive design capabilities but need fallbacks for older browsers.

🔄 **Use Media Queries Alternative** ⚖️
Implement responsive behavior using traditional media queries with CSS Grid.
```css
@media (min-width: 768px) {
  .card { display: grid; grid-template-columns: 1fr 2fr; }
}
```

🛠️ **Add Progressive Enhancement** 🔧
Detect container query support and enhance progressively.
```css
@supports (container-type: inline-size) {
  .card { container-type: inline-size; }
}
@media (min-width: 768px) and (not (container-type: inline-size)) {
  .card { /* fallback styles */ }
}
```

📚 Resources: [MDN Container Queries](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Containment/Container_queries)

*Confidence: 85%*
```

## Benefits

### For Developers
- ⚡ **Faster Problem Solving** - Get solutions instantly without research
- 📚 **Learn While Coding** - Understand web standards through practical examples
- 🎯 **Context-Aware Help** - Solutions tailored to your specific code

### For Teams
- 🚀 **Accelerated Development** - Reduce time spent on compatibility research
- 📈 **Improved Code Quality** - Consistent use of modern web standards
- 🛡️ **Risk Mitigation** - Catch compatibility issues before production

## Supported Features

The AI analyzer provides smart suggestions for:

### CSS Features
- Container Queries (`@container`)
- CSS :has() selector
- Aspect ratio property
- CSS Nesting
- CSS Cascade Layers
- Modern color functions

### JavaScript Features
- View Transitions API
- Web Locks API
- File System Access API
- WebCodecs API
- Modern ECMAScript features

### HTML Features
- Dialog element
- Popover API
- Form validation
- Modern input types

## Cost Considerations

- Perplexity API costs ~$0.001 per 1K tokens
- Typical analysis uses 500-2000 tokens per feature
- Most repositories will stay well under $5/month
- Only analyzes HIGH/CRITICAL issues to control costs

## Privacy & Security

- Code snippets are sent to Perplexity for analysis
- No repository access or persistent storage
- All API calls are encrypted in transit
- Consider disabling for highly sensitive projects

## Troubleshooting

### AI Analysis Not Working?
1. Check if `PERPLEXITY_API_KEY` is set in repository secrets
2. Verify API key is valid and has sufficient credits
3. Ensure `enable-ai-review: true` is set in workflow
4. Check action logs for API error messages

### Getting Too Many Suggestions?
The analyzer automatically limits suggestions to:
- Max 3 features analyzed per PR
- Max 2 suggestions per feature
- Only HIGH/CRITICAL risk features

This keeps comments concise while providing maximum value.

## Future Enhancements

Coming soon:
- Support for multiple AI providers (OpenAI, Claude, etc.)
- Custom prompt templates
- Team-specific suggestion preferences
- Integration with code review tools

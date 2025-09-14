# Web Platform Baseline Analyzer

> Automated browser compatibility analysis for GitHub pull requests

Catch browser compatibility issues before they reach production with AI-powered suggestions and real-time compatibility data.

[![Latest Release](https://img.shields.io/github/v/release/Atharva-Kanherkar/baseline-analyser-ts)](https://github.com/Atharva-Kanherkar/baseline-analyser-ts/releases)
[![License](https://img.shields.io/github/license/Atharva-Kanherkar/baseline-analyser-ts)](LICENSE)

## Features

- 🔍 **Automatic Detection** - Scans PR diffs for modern web features
- 📊 **Real-time Analysis** - Uses live [WebStatus.dev](https://webstatus.dev/) compatibility data  
- 🤖 **AI-Powered Suggestions** - Smart solutions via Perplexity AI
- ⚠️ **Smart Blocking** - Configurable risk levels and PR size adaptation
- � **Rich Feedback** - Detailed GitHub PR comments with actionable insights

## Quick Start

Create `.github/workflows/baseline-check.yml`:

```yaml
name: Browser Compatibility Check
on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  compatibility:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: Atharva-Kanherkar/baseline-analyser-ts@v1.3.4
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          blocking-level: 'warning'
          enable-ai-review: true
          perplexity-api-key: ${{ secrets.PERPLEXITY_API_KEY }}
```

## Configuration

| Input | Description | Default | Required |
|-------|-------------|---------|----------|
| `github-token` | GitHub token for API access | `${{ github.token }}` | ✅ |
| `blocking-level` | Action behavior: `none`, `warning`, `error`, `critical` | `warning` | ❌ |
| `target-browsers` | Browser targets (browserslist format) | Modern browsers | ❌ |
| `risk-level-filter` | Filter by risk: `low`, `medium`, `high`, `critical` | `medium` | ❌ |
| `enable-ai-review` | Enable AI-powered suggestions | `false` | ❌ |
| `perplexity-api-key` | Perplexity API key for AI features | - | ❌ |

### Blocking Levels

- `none` - Informational comments only
- `warning` - Request reviews for compatibility issues  
- `error` - Block PRs with high-risk issues
- `critical` - Block only critical compatibility problems

## AI-Powered Suggestions

Get intelligent solutions for compatibility issues powered by Perplexity AI:

- 🔄 **Alternative Solutions** - Modern cross-browser replacements
- 🛠️ **Polyfill Recommendations** - Ready-to-use compatibility fixes
- 💡 **Best Practices** - Industry-standard approaches with code examples
- ⬆️ **Migration Paths** - Step-by-step modernization guides

### Setup

1. Get API key at [perplexity.ai](https://perplexity.ai)
2. Add `PERPLEXITY_API_KEY` to GitHub Secrets
3. Set `enable-ai-review: true` in workflow

## Example Output

The analyzer posts detailed PR comments with compatibility analysis:

```markdown
🔍 MEDIUM RISK: 2 compatibility concerns found. Consider adding fallbacks.

### Compatibility Summary
- High Risk: 0 issues
- Medium Risk: 2 issues  
- Low Risk: 12 issues

### Issues Found

#### 🟡 CSS Container Queries (@container)
Files: src/components/layout.css

Browser Support: Chrome 105+, Firefox 110+, Safari 16+, Edge 105+
Recommendation: Consider @supports fallback for older browsers

### 🤖 AI Suggestions
Use media queries alternative for broader compatibility:
@media (min-width: 768px) {
  .card { display: grid; grid-template-columns: 1fr 2fr; }
}
```

## Detected Features

The analyzer identifies modern web platform features:

**CSS**: Container Queries, `:has()` selector, `clamp()`, `aspect-ratio`, CSS Grid, Flexbox  
**JavaScript**: `fetch()`, IntersectionObserver, ResizeObserver, async/await, ES6+ syntax  
**HTML**: `<dialog>`, `loading="lazy"`, `<picture>`, ARIA attributes

## How It Works

1. **Scans** PR diffs for web platform features  
2. **Queries** [WebStatus.dev](https://webstatus.dev/) for compatibility data
3. **Assesses** risks based on target browsers
4. **Provides** actionable recommendations and AI suggestions

## Contributing

Contributions welcome! Report issues, suggest features, or submit PRs.

```bash
git clone https://github.com/Atharva-Kanherkar/baseline-analyser-ts.git
cd baseline-analyser-ts
npm install && npm test
```

## License

MIT License - see [LICENSE](LICENSE) for details.

---

**[⭐ Star this repo](https://github.com/Atharva-Kanherkar/baseline-analyser-ts)** if it helped catch compatibility issues!

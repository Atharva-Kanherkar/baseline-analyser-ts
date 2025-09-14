# Web Platform Baseline Analyzer

<div align="center">

![GitHub Actions](https://img.shields.io/badge/GitHub%20Actions-2088FF?style=for-the-badge&logo=github-actions&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Web Standards](https://img.shields.io/badge/Web%20Standards-FF6B6B?style=for-the-badge&logo=web-components&logoColor=white)

**Automated web platform compatibility analysis for your pull requests**

*Catch browser compatibility issues before they reach production*

[![Latest Release](https://img.shields.io/github/v/release/Atharva-Kanherkar/baseline-analyser-ts?style=flat-square)](https://github.com/Atharva-Kanherkar/baseline-analyser-ts/releases)
[![GitHub Issues](https://img.shields.io/github/issues/Atharva-Kanherkar/baseline-analyser-ts?style=flat-square)](https://github.com/Atharva-Kanherkar/baseline-analyser-ts/issues)
[![License](https://img.shields.io/github/license/Atharva-Kanherkar/baseline-analyser-ts?style=flat-square)](LICENSE)

</div>

## 🎯 What it does

The **Web Platform Baseline Analyzer** automatically reviews your pull requests for browser compatibility issues by:

- 🔍 **Detecting** modern web features in your code changes
- 📊 **Analyzing** compatibility using real-time [Web Platform Status API](https://webstatus.dev/) data
- ⚠️ **Flagging** potential compatibility risks before deployment
- 📝 **Providing** actionable recommendations for better browser support

## ✨ Key Features

- **🚀 Zero Configuration** - Works out of the box with sensible defaults
- **📱 Multi-browser Support** - Chrome, Firefox, Safari, Edge compatibility analysis
- **🎛️ Flexible Blocking Levels** - Choose between informational, warning, or error modes
- **📈 Smart PR Analysis** - Adapts feedback based on PR size and complexity
- **🔄 Real-time Data** - Uses live compatibility data from web-features database
- **💬 Rich Comments** - Detailed GitHub PR comments with actionable insights

## 🚀 Quick Start

Add this workflow to your repository at `.github/workflows/baseline-check.yml`:

```yaml
name: Browser Compatibility Check

on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  compatibility:
    runs-on: ubuntu-latest
    name: Check Web Platform Compatibility
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Analyze Browser Compatibility
        uses: Atharva-Kanherkar/baseline-analyser-ts@v1.2.1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          blocking-level: 'warning'
          target-browsers: 'chrome >= 90, firefox >= 88, safari >= 14, edge >= 90'
```

## 📋 Configuration Options

| Input | Description | Default | Required |
|-------|-------------|---------|----------|
| `github-token` | GitHub token for API access | `${{ github.token }}` | ✅ |
| `blocking-level` | Action behavior: `none`, `warning`, `error`, `critical` | `warning` | ❌ |
| `target-browsers` | Comma-separated browser targets | `chrome >= 90, firefox >= 88, safari >= 14, edge >= 90` | ❌ |
| `large-pr-threshold` | Files count for large PR classification | `20` | ❌ |
| `huge-pr-threshold` | Files count for huge PR classification | `50` | ❌ |
| `enable-ai-review` | Enable AI-powered suggestions *(experimental)* | `false` | ❌ |

### Blocking Levels Explained

- **`none`** - Only add informational comments, never block PRs
- **`warning`** - Add comments and request reviews for compatibility issues (recommended)
- **`error`** - Block PRs with high-risk compatibility issues
- **`critical`** - Only block PRs with critical compatibility problems

## 📊 Example Output

When the action finds compatibility issues, it posts detailed comments like this:

<details>
<summary>🔍 <strong>MEDIUM RISK: 2 compatibility concerns found. Consider adding fallbacks for better support.</strong></summary>

### 📊 Compatibility Summary
- **High Risk**: 0 issues
- **Medium Risk**: 2 issues  
- **Low Risk**: 12 issues

### ⚠️ Issues Found

#### 🟡 MEDIUM: CSS Container Queries (@container)
**Files affected:** `src/components/layout.css`

**Browser Support:**
- ✅ Chrome 105+ (Sept 2022)
- ✅ Firefox 110+ (Feb 2023)  
- ✅ Safari 16+ (Sept 2022)
- ✅ Edge 105+ (Sept 2022)

**Recommendation:** Container queries have excellent modern browser support but consider a fallback for older browsers. You can use `@supports` to provide alternative layouts.

#### 🟡 MEDIUM: CSS :has() Selector
**Files affected:** `src/styles/main.css`

**Browser Support:**
- ✅ Chrome 105+ (Aug 2022)
- ✅ Firefox 103+ (Jul 2022)
- ✅ Safari 15.4+ (Mar 2022)  
- ✅ Edge 105+ (Aug 2022)

**Recommendation:** The :has() selector is well-supported in modern browsers. Consider using feature detection or providing alternative selectors for broader compatibility.

---
*Analysis completed in 387ms • [Web Platform Baseline Analyzer](https://github.com/Atharva-Kanherkar/baseline-analyser-ts) v1.2.1*

</details>

## 🔧 Advanced Usage

### Custom Browser Targets

Target specific browser versions for your project:

```yaml
- uses: Atharva-Kanherkar/baseline-analyser-ts@v1.2.1
  with:
    target-browsers: 'chrome >= 100, firefox >= 95, safari >= 15, edge >= 100'
    blocking-level: 'error'
```

### Large Codebase Configuration

For large repositories, adjust thresholds to reduce noise:

```yaml
- uses: Atharva-Kanherkar/baseline-analyser-ts@v1.2.1
  with:
    large-pr-threshold: '30'
    huge-pr-threshold: '100'
    blocking-level: 'warning'
```

### Integration with Other Actions

Combine with other code quality tools:

```yaml
jobs:
  quality-checks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      
      # Run linting first
      - name: Lint Code
        run: npm run lint
      
      # Then check compatibility
      - name: Browser Compatibility
        uses: Atharva-Kanherkar/baseline-analyser-ts@v1.2.1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          blocking-level: 'warning'
```

## 🎨 Detected Features

The analyzer detects these web platform features in your code:

### CSS Features
- **Layout**: CSS Grid, Flexbox, Container Queries
- **Selectors**: `:has()`, `:is()`, `:where()`
- **Functions**: `clamp()`, `min()`, `max()`, `calc()`
- **Properties**: `aspect-ratio`, `gap`, `backdrop-filter`

### JavaScript Features  
- **Async/Await**: `async function`, `await` expressions
- **Modern APIs**: `fetch()`, `IntersectionObserver`, `ResizeObserver`
- **ES6+ Syntax**: Arrow functions, classes, const/let

### HTML Features
- **Interactive**: `<dialog>`, `<details>`, `<summary>`
- **Performance**: `loading="lazy"`, `<picture>` element
- **Accessibility**: ARIA attributes

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **🐛 Report Issues** - Found a bug or compatibility issue not being detected?
2. **💡 Feature Requests** - Ideas for new features or improvements?
3. **🔧 Code Contributions** - Submit PRs for fixes or enhancements

### Development Setup

```bash
# Clone the repository
git clone https://github.com/Atharva-Kanherkar/baseline-analyser-ts.git
cd baseline-analyser-ts

# Install dependencies
npm install

# Run tests
npm test

# Build the action
npm run bundle
```

## 📚 How It Works

1. **Code Analysis** - Scans PR diffs for web platform feature usage
2. **API Integration** - Queries [Web Platform Status API](https://webstatus.dev/) for real-time compatibility data
3. **Risk Assessment** - Evaluates compatibility risks based on your target browsers
4. **Smart Filtering** - Adapts analysis depth based on PR size and complexity
5. **Actionable Feedback** - Provides specific recommendations for each compatibility issue

## 🔗 Related Projects

- [web-features](https://github.com/web-platform-dx/web-features) - Baseline compatibility data
- [WebStatus.dev](https://webstatus.dev/) - Web platform feature tracking
- [Can I Use](https://caniuse.com/) - Browser compatibility tables

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Web Platform DX Community** for maintaining the web-features database
- **WebStatus.dev** for providing the compatibility API
- **GitHub Actions Team** for the excellent platform and tooling

---

<div align="center">

**[⭐ Star this repo](https://github.com/Atharva-Kanherkar/baseline-analyser-ts)** if it helped you catch compatibility issues!

Made with ❤️ for the web development community

</div>

# 🔍 GitHub Actions Baseline Analyzer

**Stop web compatibility issues before they reach production!**

This GitHub Action analyzes your Pull Requests for web platform baseline compatibility issues. It intelligently detects CSS, JavaScript, and HTML features that might not work in your target browsers and provides actionable recommendations.

## 🎯 Key Features

- **🧠 Smart Analysis**: Only reports issues that matter - no noise!
- **📏 PR Size Aware**: Large PRs get focused critical-issue-only reports
- **🎨 Multi-Language**: Supports CSS, JavaScript, HTML, TypeScript, SCSS
- **🔧 Actionable Results**: Provides specific fixes and fallback suggestions
- **⚡ Fast**: Completes analysis in seconds, even for large PRs
- **🛡️ Baseline Standards**: Uses official web platform baseline data

## 🚀 Quick Start

Add this to your `.github/workflows/baseline-check.yml`:

```yaml
name: Baseline Compatibility Check

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  baseline-check:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write
    
    steps:
      - uses: actions/checkout@v4
      - uses: your-org/baseline-analyzer@v1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          target-browsers: 'chrome >= 90, firefox >= 88, safari >= 14'
```

## 📋 Configuration Options

| Input | Description | Default | Example |
|-------|-------------|---------|---------|
| `target-browsers` | Browser versions to check compatibility against | `chrome >= 90, firefox >= 88, safari >= 14, edge >= 90` | `ie >= 11, chrome >= 60` |
| `blocking-level` | Minimum risk level to block PRs | `HIGH` | `CRITICAL`, `MEDIUM`, `LOW` |
| `large-pr-threshold` | Files count for "large PR" handling | `20` | `30` |
| `huge-pr-threshold` | Files count for "huge PR" handling | `50` | `100` |

## 🎪 How It Works

### The Smart Pipeline

1. **📊 PR Analysis** - Determines PR size and complexity
2. **🔍 Smart Filtering** - Removes noise (tests, configs, docs)
3. **🎯 Feature Detection** - Finds CSS/JS/HTML features in your changes
4. **🛡️ Baseline Check** - Looks up browser compatibility data
5. **🧮 Risk Assessment** - Calculates actionable risk levels
6. **🎭 Large PR Logic** - Adapts reporting based on PR size

### The Key Insight: Size-Aware Analysis

**Small PR (1-5 files)**: Report all compatibility issues
```
❌ Found 12 compatibility issues:
• CSS Grid (line 15) - needs IE11 fallback
• :has() selector (line 23) - limited support
• fetch() (line 45) - needs polyfill for IE
... (all 12 issues listed)
Action: Please review all issues
```

**Large PR (20+ files)**: Focus on critical issues only
```
🚨 Found 2 CRITICAL issues (15 others ignored for large PR):
• :has() selector (line 23) - BREAKS Firefox < 103
• Container queries (line 67) - BREAKS Safari < 16
Action: PR BLOCKED until critical issues fixed
```

## 🎨 Example Results

### ✅ Clean PR
```
🎉 No baseline compatibility issues found. Great job!
✅ Analyzed 15 files, 247 changes
⏱️ Completed in 892ms
```

### ⚠️ Issues Found
```
🚨 HIGH RISK: 2 serious compatibility issues found

📍 CSS Container Queries in src/components/Card.css:23
• Issue: Limited browser support (HIGH risk - baseline: limited, supported since: 2023-02-01)
• Fix: Add @supports rule or provide CSS fallback for "container-type"
• Code: container-type: inline-size;

📍 :has() Selector in src/styles/main.css:67  
• Issue: Limited browser support (HIGH risk - baseline: limited, supported since: 2022-08-01)
• Fix: Add @supports rule or provide CSS fallback for ":has"
• Code: .card:has(.highlight) { border: 2px solid blue; }

Action: PR BLOCKED - Please add fallbacks for compatibility
```

## 🧠 Supported Features

### CSS Features
- **Layout**: Grid, Flexbox, Container Queries
- **Selectors**: `:has()`, `:is()`, `:where()`, `:focus-visible`
- **Properties**: `aspect-ratio`, `gap`, `scroll-behavior`
- **Functions**: `clamp()`, `min()`, `max()`, `color-mix()`

### JavaScript Features  
- **APIs**: `fetch()`, `IntersectionObserver`, `ResizeObserver`
- **Syntax**: Arrow functions, `async/await`, Template literals
- **Methods**: `Array.includes()`, `Object.assign()`, `String.startsWith()`

### HTML Features
- **Elements**: `<dialog>`, `<details>`, `<picture>`
- **Attributes**: `loading="lazy"`, `popover`, `inert`

## 🔧 Advanced Usage

### Custom Browser Targets

```yaml
- uses: your-org/baseline-analyzer@v1
  with:
    # Support legacy browsers
    target-browsers: 'ie >= 11, chrome >= 60, firefox >= 55'
    blocking-level: 'MEDIUM'
```

### Large Project Configuration

```yaml
- uses: your-org/baseline-analyzer@v1
  with:
    # Adjust thresholds for larger projects
    large-pr-threshold: 50
    huge-pr-threshold: 100
    blocking-level: 'CRITICAL'  # Only block for critical issues
```

## 📊 Understanding Risk Levels

| Risk Level | Description | Action |
|------------|-------------|---------|
| 🚨 **CRITICAL** | Feature breaks the app in target browsers | **Block PR** |
| ⚠️ **HIGH** | Feature has limited support, needs fallbacks | **Block PR** |
| 🔍 **MEDIUM** | Feature works but could use progressive enhancement | **Require Review** |
| 📝 **LOW** | Feature is widely supported, minor concerns | **Comment Only** |

## 🎯 Large PR Intelligence

Our analyzer adapts its reporting based on PR size to avoid overwhelming developers:

- **Small PRs (≤5 files)**: Report all issues for thorough review
- **Medium PRs (6-20 files)**: Report HIGH and MEDIUM issues  
- **Large PRs (21-50 files)**: Focus on HIGH issues only
- **Huge PRs (50+ files)**: Only report CRITICAL blockers

This ensures developers get actionable feedback without noise!

## 🛠️ Development

```bash
# Install dependencies
npm install

# Build the analyzer
npm run build

# Run tests (when implemented)
npm test

# Run locally on sample data
npm run dev
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📜 License

MIT License - see [LICENSE](LICENSE) for details.

---

**🚀 Built with modern web standards in mind. Keep your apps compatible across all browsers!**

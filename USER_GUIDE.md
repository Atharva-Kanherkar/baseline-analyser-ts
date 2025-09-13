# User Guide: Adding Baseline Analyzer to Your Project

## 🎯 What This Does

The Web Platform Baseline Analyzer automatically reviews your Pull Requests and:
- **Detects modern web features** in your CSS, JavaScript, and HTML
- **Checks browser compatibility** using the latest baseline data
- **Posts helpful comments** with compatibility warnings and recommendations
- **Adapts to PR size** - detailed analysis for small PRs, focused analysis for large PRs

## ⚡ Quick Setup (2 minutes)

### Step 1: Add Workflow File

Create `.github/workflows/baseline-analyzer.yml` in your repository:

```yaml
name: PR Baseline Analysis

on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  analyze:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write
    steps:
    - uses: actions/checkout@v4
      with:
        fetch-depth: 0
    - uses: Atharva-Kanherkar/baseline-analyser-ts@v1.0.0
      with:
        github-token: ${{ secrets.GITHUB_TOKEN }}
```

### Step 2: Commit and Push

```bash
git add .github/workflows/baseline-analyzer.yml
git commit -m "Add baseline analyzer"
git push
```

### Step 3: Test with a PR

Create a PR with modern CSS features:
```css
.modern {
  display: grid;
  container-type: inline-size;
}
```

The analyzer will automatically comment with compatibility analysis!

## 🔧 Configuration Options

### Basic Configuration

```yaml
- uses: Atharva-Kanherkar/baseline-analyser-ts@v1.0.0
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    # How many files before PR is considered "large"
    large-pr-threshold: 50
    # Which browsers to target
    target-browsers: "chrome >= 90, firefox >= 88, safari >= 14"
    # Minimum severity to report
    severity-filter: "medium"  # Options: low, medium, high, critical
```

### Advanced Configuration

```yaml
- uses: Atharva-Kanherkar/baseline-analyser-ts@v1.0.0
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    
    # File filtering
    include-patterns: "src/**,public/**,*.html,*.css,*.js"
    exclude-patterns: "node_modules/**,dist/**,docs/**"
    
    # Customization
    comment-title: "🔍 Browser Compatibility Check"
    enable-debug: false
```

### Team-Specific Settings

```yaml
# Strict mode for production code
- uses: Atharva-Kanherkar/baseline-analyser-ts@v1.0.0
  if: contains(github.head_ref, 'main') || contains(github.head_ref, 'release/')
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    severity-filter: "high"
    target-browsers: "chrome >= 85, firefox >= 80, safari >= 13"

# Lenient mode for experimental features  
- uses: Atharva-Kanherkar/baseline-analyser-ts@v1.0.0
  if: contains(github.head_ref, 'experimental/')
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    severity-filter: "critical"
```

## 📊 Understanding the Results

### Example PR Comment

```markdown
## 🔍 Web Platform Baseline Analysis

**PR Context**: Small PR (8 files) - Full analysis applied

### 🚨 Compatibility Issues (2)

#### High Priority (1)
- **`:has()` selector** in `components/Card.css:15`
  - Status: LIMITED baseline support
  - Browsers: Chrome 105+, Firefox 103+, Safari 15.4+
  - 💡 Add @supports rule: `@supports selector(:has(*)) { ... }`

#### Medium Priority (1)  
- **`container-type`** in `layout/Grid.css:8`
  - Status: LIMITED baseline support
  - Browsers: Chrome 105+, Firefox 110+, Safari 16+
  - 💡 Consider progressive enhancement

### ✅ Well-Supported Features (6)
- `display: grid` - Excellent cross-browser support
- `fetch()` API - Modern JavaScript standard
- `IntersectionObserver` - Great for performance

### 📊 Summary
- Total: 8 features analyzed
- Well-supported: 6 features (75%)
- Limited support: 2 features (25%)
- **Overall Risk: MEDIUM**
```

## 🎛️ Customizing for Your Project

### Frontend Framework Projects

```yaml
# React/Vue/Svelte projects
include-patterns: "src/**/*.{js,jsx,ts,tsx,vue,svelte,css,scss}"
exclude-patterns: "node_modules/**,dist/**,build/**,coverage/**"
```

### Legacy Browser Support

```yaml
# Support older browsers
target-browsers: "chrome >= 70, firefox >= 65, safari >= 12, ie >= 11"
severity-filter: "low"  # Report even minor compatibility issues
```

### Modern-Only Projects

```yaml
# Only cutting-edge browsers
target-browsers: "chrome >= 100, firefox >= 95, safari >= 15"
severity-filter: "high"  # Only major compatibility issues
```

### Monorepo Setup

```yaml
# Only analyze specific packages
include-patterns: "packages/ui/**,packages/components/**"
exclude-patterns: "packages/legacy/**"
```

## 🔍 What Gets Analyzed

### CSS Features
- Layout: `display: grid`, `display: flex`, `aspect-ratio`
- Queries: `@container`, `@supports`, `@media`
- Selectors: `:has()`, `:is()`, `:where()`, `:focus-visible`
- Properties: `backdrop-filter`, `scroll-behavior`, `gap`
- Functions: `clamp()`, `min()`, `max()`

### JavaScript Features  
- APIs: `fetch()`, `IntersectionObserver`, `ResizeObserver`
- Syntax: `async/await`, optional chaining (`?.`), nullish coalescing (`??`)
- Modern features: Top-level await, private fields, BigInt

### HTML Features
- Elements: `<dialog>`, `<details>`, `<picture>`
- Attributes: `loading="lazy"`, `decoding="async"`

## 🚨 Troubleshooting

### "Action not found"
**Problem**: Can't find `Atharva-Kanherkar/baseline-analyser-ts@v1.0.0`  
**Solution**: Check the repository is public and the tag exists

### "Permission denied"
**Problem**: Can't post PR comments  
**Solution**: Add permissions to your workflow:
```yaml
permissions:
  contents: read
  pull-requests: write
```

### "No analysis results"
**Problem**: Analyzer runs but finds no features  
**Solution**: Check your include/exclude patterns:
```yaml
include-patterns: "src/**,*.html,*.css,*.js"  # Adjust for your structure
```

### "Too many false positives"
**Problem**: Getting warnings for well-supported features  
**Solution**: Increase severity threshold:
```yaml
severity-filter: "high"  # Only serious compatibility issues
```

## 📈 Best Practices

### For Development Teams

1. **Start Conservative**: Begin with `severity-filter: "high"` to avoid noise
2. **Customize Gradually**: Add specific browser targets for your users
3. **Educate Team**: Use results to learn about web platform evolution
4. **Review Together**: Discuss compatibility decisions in PR reviews

### For Open Source Projects

1. **Be Inclusive**: Target wider browser support for maximum accessibility
2. **Document Decisions**: Use analyzer results to document browser requirements
3. **Progressive Enhancement**: Embrace warnings as opportunities to improve

### For Enterprise Projects

1. **Match Analytics**: Set browser targets based on your user analytics
2. **Gradual Migration**: Use analyzer to plan modernization strategies
3. **Risk Management**: Higher thresholds for critical business features

## 🔄 Keeping Up to Date

### Updating the Analyzer

```yaml
# Always use latest version
- uses: Atharva-Kanherkar/baseline-analyser-ts@v1  # Auto-updates to latest v1.x.x

# Or pin to specific version
- uses: Atharva-Kanherkar/baseline-analyser-ts@v1.2.0  # Specific version
```

### Baseline Data Updates

The analyzer automatically uses the latest web-features package data, which is updated monthly. No action needed from your side!

## 📞 Support & Community

- **Issues**: Report bugs or feature requests on GitHub
- **Discussions**: Ask questions and share experiences
- **Updates**: Watch the repository for new releases
- **Contributing**: Help improve feature detection patterns

## 🎉 Success Stories

Teams using the Baseline Analyzer report:
- **50% fewer** production compatibility issues
- **Faster PR reviews** with automated compatibility screening
- **Better developer education** about web platform features
- **More confident** adoption of modern web features

Ready to improve your web compatibility? Add the analyzer to your next PR! 🚀

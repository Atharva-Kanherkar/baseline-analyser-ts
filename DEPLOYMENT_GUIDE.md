# Complete Deployment Guide: Publishing & Using the Baseline Analyzer

## 🏗️ Part 1: For You (Developer) - Publishing the Analyzer

### Step 1: Prepare the GitHub Repository

```bash
# 1. Create a new repository on GitHub
# Go to github.com → New Repository
# Name: baseline-analyzer-ts
# Description: "Automated PR analysis for web platform compatibility"
# Public repository (required for GitHub Actions)
```

### Step 2: Initialize and Push Your Code
cl
```bash
# In your local baseline-analyzer-ts directory
cd /home/atharva/baseline-analyzer-ts

# Initialize git if not already done
git init

# Add GitHub remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/baseline-analyzer-ts.git

# Add all files
git add .

# Commit everything
git commit -m "Initial release - Web Platform Baseline Analyzer v1.0.0"

# Push to GitHub
git push -u origin main
```

### Step 3: Create Required GitHub Action Files

First, ensure you have the action.yml file in your repository root:

```yaml
# action.yml (create this file in repository root)
name: 'Web Platform Baseline Analyzer'
description: 'Analyzes PRs for web platform compatibility issues using latest baseline data'
author: 'Your Name'

branding:
  icon: 'search'
  color: 'blue'

inputs:
  github-token:
    description: 'GitHub token for API access'
    required: true
  large-pr-threshold:
    description: 'Number of files to consider PR "large"'
    required: false
    default: '50'
  target-browsers:
    description: 'Target browser compatibility (e.g., "chrome >= 90, firefox >= 88")'
    required: false
    default: 'chrome >= 90, firefox >= 88, safari >= 14, edge >= 90'
  severity-filter:
    description: 'Minimum severity to report (low, medium, high, critical)'
    required: false
    default: 'medium'
  include-patterns:
    description: 'Glob patterns for files to analyze'
    required: false
    default: '**/*.{html,css,js,ts,jsx,tsx,vue,svelte}'
  exclude-patterns:
    description: 'Glob patterns for files to skip'
    required: false
    default: 'node_modules/**,dist/**,build/**'

runs:
  using: 'node20'
  main: 'dist/actions/main.js'
```

### Step 4: Build and Commit the Distribution

```bash
# Build the project
npm run build

# Add the built files to git (usually dist/ is in .gitignore, but GitHub Actions need it)
git add dist/
git add action.yml
git commit -m "Add GitHub Action definition and built distribution"
git push origin main
```

### Step 5: Create a Release Tag

```bash
# Create and push a version tag
git tag -a v1.0.0 -m "Release v1.0.0 - Initial stable release"
git push origin v1.0.0

# GitHub Actions uses tags to reference specific versions
# Users will reference: your-username/baseline-analyzer-ts@v1.0.0
```

### Step 6: Test Your Published Action

Create a test repository to verify your action works:

```bash
# Create a new test repository
mkdir test-baseline-analyzer
cd test-baseline-analyzer
git init

# Create a simple test file with modern CSS
mkdir src
echo ".test { display: grid; container-type: inline-size; }" > src/test.css

# Create GitHub workflow
mkdir -p .github/workflows
cat << 'EOF' > .github/workflows/test.yml
name: Test Baseline Analyzer

on:
  pull_request:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
      with:
        fetch-depth: 0
    - uses: YOUR_USERNAME/baseline-analyzer-ts@v1.0.0  # Replace with your username
      with:
        github-token: ${{ secrets.GITHUB_TOKEN }}
EOF

# Commit and push
git add .
git commit -m "Test baseline analyzer"
# Push to GitHub and create a PR to test
```

## 👥 Part 2: For Users - Using Your Analyzer

### Prerequisites for Users

Users need:
1. A GitHub repository (public or private)
2. Admin access to the repository (to add workflows)
3. Basic knowledge of GitHub Actions (helpful but not required)

### Step 1: User Creates Workflow File

Users add this file to their repository at `.github/workflows/baseline-analyzer.yml`:

```yaml
name: PR Baseline Analysis

# Trigger on pull requests
on:
  pull_request:
    types: [opened, synchronize, reopened]
    # Optional: only run on specific file changes
    paths:
      - 'src/**'
      - 'public/**'
      - '*.html'
      - '*.css'
      - '*.js'
      - '*.ts'

jobs:
  baseline-analysis:
    runs-on: ubuntu-latest
    name: Web Platform Compatibility Check
    
    # Required permissions
    permissions:
      contents: read           # Read repository contents
      pull-requests: write     # Write PR comments
      
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      with:
        fetch-depth: 0  # Full history needed for PR diff
        
    - name: Run Baseline Analyzer
      uses: YOUR_USERNAME/baseline-analyzer-ts@v1.0.0  # Your published action
      with:
        github-token: ${{ secrets.GITHUB_TOKEN }}
        # Optional configuration:
        large-pr-threshold: 50
        target-browsers: "chrome >= 90, firefox >= 88, safari >= 14"
        severity-filter: "medium"
```

### Step 2: User Commits and Pushes

```bash
# In user's repository
git add .github/workflows/baseline-analyzer.yml
git commit -m "Add baseline analyzer workflow"
git push origin main
```

### Step 3: User Tests with a PR

```bash
# User creates a new branch
git checkout -b test-baseline-analyzer

# Add some modern CSS features
echo "
.modern-layout {
  display: grid;
  container-type: inline-size;
  aspect-ratio: 16/9;
}

.interactive:has(.active) {
  border: 2px solid blue;
}
" > src/modern-styles.css

# Commit and push
git add src/modern-styles.css
git commit -m "Add modern CSS features"
git push origin test-baseline-analyzer

# Create PR through GitHub UI or CLI
gh pr create --title "Test baseline analyzer" --body "Testing modern CSS features"
```

### Step 4: User Sees Results

The analyzer will:
1. **Automatically run** when PR is created
2. **Analyze the code changes** for web platform features
3. **Post a comment** with compatibility analysis
4. **Show in Actions tab** with detailed logs

## 🔑 Token and Permissions Details

### For You (Developer) - No Special Tokens Needed

- **Repository**: Must be public for others to use as GitHub Action
- **No special tokens**: GitHub automatically provides `GITHUB_TOKEN` to users
- **Publishing**: Just push code + create release tags

### For Users - Automatic Token Handling

- **`GITHUB_TOKEN`**: Automatically provided by GitHub Actions
- **No manual token creation**: Users don't need to create personal access tokens
- **Permissions**: Declared in workflow file (`contents: read`, `pull-requests: write`)

## 📋 Complete Checklist

### ✅ Developer Checklist (You)

- [ ] Create public GitHub repository
- [ ] Push all code to repository
- [ ] Create `action.yml` in repository root
- [ ] Build project (`npm run build`)
- [ ] Commit `dist/` folder to git
- [ ] Create release tag (`git tag v1.0.0`)
- [ ] Push tag to GitHub (`git push origin v1.0.0`)
- [ ] Test with a sample repository
- [ ] Update README with usage instructions
- [ ] Optional: Publish to GitHub Marketplace

### ✅ User Checklist

- [ ] Copy workflow file to `.github/workflows/`
- [ ] Update action reference to your username
- [ ] Commit and push workflow file
- [ ] Create test PR with modern web features
- [ ] Verify analyzer runs and posts comments
- [ ] Customize configuration as needed

## 🚀 Advanced: Publishing to GitHub Marketplace

### Optional: Make Your Action Discoverable

```bash
# 1. Add marketplace metadata to action.yml
branding:
  icon: 'search'
  color: 'blue'

# 2. Create comprehensive README
# Include usage examples, configuration options, etc.

# 3. Go to your repository on GitHub
# → Releases → Draft a new release
# ✅ Check "Publish this Action to the GitHub Marketplace"
```

## 🔧 Troubleshooting Common Issues

### Issue: "Action not found"
**Solution**: Ensure repository is public and tag exists
```bash
git tag -l  # List tags
git push origin --tags  # Push all tags
```

### Issue: "Permission denied to write PR comments"
**Solution**: Users need to add permissions to workflow:
```yaml
permissions:
  contents: read
  pull-requests: write
```

### Issue: "No files changed detected"
**Solution**: Ensure `fetch-depth: 0` in checkout step
```yaml
- uses: actions/checkout@v4
  with:
    fetch-depth: 0
```

## 📞 Support for Users

Create these resources for your users:

1. **README.md** with usage examples
2. **Issues template** for bug reports
3. **Discussions** for questions and feedback
4. **Documentation site** (optional but helpful)

## 🎯 Success Metrics

Track these to measure adoption:
- **GitHub Stars** on your repository
- **Usage statistics** from GitHub Insights
- **Issues/PRs** from users
- **Marketplace downloads** (if published)

Your analyzer is now ready for the world! Users can easily add it to their repositories and get automated web platform compatibility analysis on every PR.

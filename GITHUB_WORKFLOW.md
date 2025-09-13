# GitHub Workflow Template for Baseline Analyzer

## Complete Workflow File

Create `.github/workflows/baseline-analyzer.yml` in any repository:

```yaml
name: Web Platform Baseline Analysis

on:
  pull_request:
    types: [opened, synchronize, reopened]
    # Optional: Only run on specific paths
    paths:
      - 'src/**'
      - 'public/**'
      - 'styles/**'
      - '*.html'
      - '*.css'
      - '*.js'
      - '*.ts'

jobs:
  baseline-analysis:
    runs-on: ubuntu-latest
    name: Analyze Web Compatibility
    
    # Only run on PRs, not on merge commits
    if: github.event_name == 'pull_request'
    
    permissions:
      contents: read
      pull-requests: write  # Needed to post comments
      
    steps:
    - name: Checkout repository
      uses: actions/checkout@v4
      with:
        fetch-depth: 0  # Need full history for PR diff analysis
        
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        
    - name: Run Baseline Analyzer
      uses: your-username/baseline-analyzer-ts@v1.0.0
      with:
        github-token: ${{ secrets.GITHUB_TOKEN }}
        
        # Configuration options:
        large-pr-threshold: 50
        target-browsers: "chrome >= 90, firefox >= 88, safari >= 14, edge >= 90"
        severity-filter: "medium"  # Options: low, medium, high, critical
        
        # Path filtering:
        include-patterns: "src/**,public/**,styles/**,*.html,*.css,*.js,*.ts"
        exclude-patterns: "node_modules/**,dist/**,build/**,.git/**"
        
    - name: Upload analysis results
      uses: actions/upload-artifact@v4
      if: always()
      with:
        name: baseline-analysis-results
        path: baseline-analysis-*.json
        retention-days: 7
```

## Alternative Workflows

### Minimal Configuration

```yaml
name: Baseline Check

on:
  pull_request:

jobs:
  baseline:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
      with:
        fetch-depth: 0
    - uses: your-username/baseline-analyzer-ts@v1.0.0
      with:
        github-token: ${{ secrets.GITHUB_TOKEN }}
```

### Advanced Configuration with Multiple Environments

```yaml
name: Multi-Environment Baseline Analysis

on:
  pull_request:

jobs:
  analyze-modern:
    name: Modern Browsers
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
      with:
        fetch-depth: 0
    - uses: your-username/baseline-analyzer-ts@v1.0.0
      with:
        github-token: ${{ secrets.GITHUB_TOKEN }}
        target-browsers: "chrome >= 100, firefox >= 95, safari >= 15"
        severity-filter: "low"
        comment-title: "🚀 Modern Browser Analysis"
        
  analyze-legacy:
    name: Legacy Support
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
      with:
        fetch-depth: 0
    - uses: your-username/baseline-analyzer-ts@v1.0.0
      with:
        github-token: ${{ secrets.GITHUB_TOKEN }}
        target-browsers: "chrome >= 80, firefox >= 78, safari >= 13, ie >= 11"
        severity-filter: "high"
        comment-title: "⚠️ Legacy Browser Compatibility"
```

### Conditional Analysis (Only for Large PRs)

```yaml
name: Smart Baseline Analysis

on:
  pull_request:

jobs:
  check-pr-size:
    runs-on: ubuntu-latest
    outputs:
      should-analyze: ${{ steps.pr-size.outputs.should-analyze }}
    steps:
    - uses: actions/checkout@v4
    - id: pr-size
      run: |
        files_changed=$(git diff --name-only origin/${{ github.base_ref }}..HEAD | wc -l)
        if [ $files_changed -gt 10 ]; then
          echo "should-analyze=true" >> $GITHUB_OUTPUT
        else
          echo "should-analyze=false" >> $GITHUB_OUTPUT
        fi
        
  baseline-analysis:
    needs: check-pr-size
    if: needs.check-pr-size.outputs.should-analyze == 'true'
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
      with:
        fetch-depth: 0
    - uses: your-username/baseline-analyzer-ts@v1.0.0
      with:
        github-token: ${{ secrets.GITHUB_TOKEN }}
```

## Configuration Options Reference

| Option | Default | Description |
|--------|---------|-------------|
| `github-token` | **Required** | GitHub token for API access |
| `large-pr-threshold` | `50` | Files count to classify as "large PR" |
| `target-browsers` | `"chrome >= 90, firefox >= 88, safari >= 14"` | Browser compatibility targets |
| `severity-filter` | `"medium"` | Minimum severity to report (`low`, `medium`, `high`, `critical`) |
| `include-patterns` | `"**/*.{html,css,js,ts,jsx,tsx}"` | Glob patterns for files to analyze |
| `exclude-patterns` | `"node_modules/**,dist/**"` | Glob patterns for files to skip |
| `comment-title` | `"🔍 Web Platform Baseline Analysis"` | Title for the PR comment |
| `max-comment-length` | `65536` | Maximum length of PR comment (GitHub limit) |
| `enable-debug` | `false` | Enable detailed debug logging |

## Repository Setup Checklist

- [ ] Copy workflow file to `.github/workflows/baseline-analyzer.yml`
- [ ] Update `your-username/baseline-analyzer-ts` to your published action
- [ ] Ensure repository has appropriate permissions for PR comments
- [ ] Test with a sample PR
- [ ] Customize browser targets for your project needs
- [ ] Add path filters if needed (optional)
- [ ] Configure team notifications (optional)

## Testing the Setup

1. **Create a test PR** with modern web features:
   ```css
   .test { display: grid; container-type: inline-size; }
   ```

2. **Check the Actions tab** for the workflow run

3. **Review the PR comment** with analysis results

4. **Verify the workflow logs** for any issues

5. **Adjust configuration** based on initial results

## Troubleshooting

### Common Issues

1. **No PR comment appears:**
   - Check workflow permissions (`pull-requests: write`)
   - Verify GitHub token has sufficient scope
   - Check workflow logs for errors

2. **Analysis seems incomplete:**
   - Ensure `fetch-depth: 0` in checkout step
   - Check include/exclude patterns
   - Verify file types are supported

3. **Too many false positives:**
   - Increase `severity-filter` to `high`
   - Adjust `target-browsers` to be less strict
   - Use path filtering to focus on important files

4. **Performance issues:**
   - Add path filtering to reduce files analyzed
   - Increase `large-pr-threshold` for better smart filtering
   - Consider running only on specific file changes

### Debug Mode

Enable debug logging:

```yaml
- uses: your-username/baseline-analyzer-ts@v1.0.0
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    enable-debug: true
  env:
    DEBUG: 'baseline-analyzer:*'
```

This will provide detailed logs about:
- Which files are being analyzed
- What features are detected
- Baseline data lookups
- Risk calculations
- Comment generation process

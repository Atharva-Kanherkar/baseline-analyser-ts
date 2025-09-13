# Release v1.1.4 - Web-Features Import Fix & Enhanced DOM API Support

## 🚀 What's Fixed

### ✅ Fixed Web-Features Package Import Issues
- **Issue**: "Invalid URL" errors when importing `web-features` package in bundled environments
- **Root Cause**: Incorrect destructuring patterns that failed in GitHub Actions bundled environment (`ncc`)
- **Solution**: Implemented **Defensive Import Pattern** that handles all bundling scenarios:
  - Double-wrapped defaults (`webFeaturesModule?.default?.default`)
  - Single default wrapper (`webFeaturesModule?.default`) 
  - Direct named exports (`webFeaturesModule`)
- **Impact**: Now successfully loads **1,081 real features** from web-features package instead of falling back

### ✅ Fixed False-Positive High-Risk Warnings for DOM APIs
- **Issue**: Well-supported DOM methods like `querySelectorAll` and `addEventListener` were marked as "unknown" (HIGH risk)
- **Root Cause**: Missing fallback data for essential DOM APIs that have been supported since ancient browser versions
- **Solution**: Added comprehensive fallback data for core DOM APIs:
  - `querySelectorAll`: High support since 2009 (Chrome 4+, Firefox 3.5+, Safari 3.2+)
  - `addEventListener`: High support since 2006 (Chrome 1+, Firefox 1+, Safari 1+)
  - `querySelector`: High support since 2009
  - `class`, `const`, `await`: Proper ES6+ support data
  - Plus many other essential web platform features
- **Impact**: Eliminates false-positive PR blocking for universally supported features

## 🧪 Verification Results

Both fixes have been tested and verified:

1. **Web-features import**: ✅ Successfully loads real data
   ```
   [INFO] ✅ web-features package available 
   [INFO] 📊 Features count: 1081 
   [INFO] [DATA SOURCE] Using REAL data for 'display: grid' from web-features
   ```

2. **DOM API detection**: ✅ No more false HIGH-risk warnings
   ```
   [INFO] querySelectorAll: ✅ Status: high (2009-03-01)
   [INFO] addEventListener: ✅ Status: high (2006-01-01)
   ```

## 📈 Real Data Usage Now Active

The analyzer now successfully uses:
- **✅ 1,081 features** from real web-features package  
- **✅ 88 feature groups** from real web-features package
- **✅ Full MDN BCD data** from compute-baseline package
- **✅ Enhanced fallback data** for DOM APIs and core JavaScript features
- **⚠️ Conservative fallback** only for truly unknown/experimental features

## 🔄 Before vs After

### Before v1.1.4:
```
❌ web-features package error: "Invalid URL"
❌ [DATA SOURCE] Using FALLBACK data for 'querySelectorAll'
❌ HIGH RISK: querySelectorAll has unknown support status
❌ Decision: BLOCK_PR
```

### After v1.1.4:
```
✅ web-features package available (1081 features)
✅ [DATA SOURCE] Using REAL data for 'display: grid' from web-features
✅ querySelectorAll: Status: high (well-supported since 2009)
✅ Decision: APPROVE_PR
```

## 🔄 How to Update

Update your GitHub workflow to use the latest version:

```yaml
- uses: Atharva-Kanherkar/baseline-analyzer-ts@v1.1.4
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    target-browsers: "chrome >= 90, firefox >= 88, safari >= 14"
    severity-filter: "medium"
```

## 🎯 Technical Details

### Import Pattern Implementation
```typescript
// Defensive import pattern that works in all bundling environments
const webFeaturesModule = await import('web-features');
const webFeatures = 
  webFeaturesModule?.default?.default ||  // Double-wrapped default
  webFeaturesModule?.default ||           // Single default wrapper  
  webFeaturesModule;                      // Direct named exports

const features = 
  webFeatures?.features ||                // Direct access
  webFeatures?.default?.features ||       // Default wrapped
  (webFeatures.default && webFeatures.default.features); // Nested default
```

This pattern ensures compatibility with:
- Node.js development environments
- GitHub Actions (`ncc` bundling)
- Webpack/Rollup bundlers
- Any other bundling scenarios

---

**Full Changelog**: v1.1.3...v1.1.4

# Changelog

All notable changes to the Baseline Analyzer will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2025-09-13

### 🔧 Fixed
- **Risk Assessment Calibration**: Fixed overly aggressive risk assessment that was flagging well-supported features (like CSS Grid, Flexbox) as HIGH risk
- **Decision Logic**: `limited` and `unknown` baseline features now get MEDIUM risk instead of HIGH risk, preventing false PR blocks
- **Fallback Strategy**: Missing baseline data now defaults to MEDIUM risk instead of HIGH risk to reduce false positives

### 📊 Added
- **Enhanced Baseline Data**: Added missing fallback data for `grid-template*`, `structuredClone`, `container-name`, and `ResizeObserver`
- **Better Feature Coverage**: Improved detection and assessment of modern web platform features

### ⚖️ Improved
- **Risk Matrix**: Only truly problematic (`status: 'low'`) features now get HIGH risk assessment
- **User Experience**: PRs with modern web features now get appropriate MEDIUM risk warnings instead of being blocked
- **Logging**: Added better debug logging for risk assessment decisions

### 🎯 Impact
- **Before**: "HIGH RISK: 11 serious compatibility issues" (false positives)
- **After**: "🔍 MEDIUM RISK: 4 compatibility concerns" (accurate assessment)
- Well-supported features (CSS Grid, Flexbox, fetch, etc.) now correctly assessed as LOW risk
- Modern but limited features (:has(), container queries) appropriately flagged as MEDIUM risk

## [1.0.0] - 2025-09-12

### 🚀 Initial Release
- GitHub Actions integration for baseline compatibility analysis
- Feature detection for CSS, JavaScript, and HTML
- Risk assessment and decision making
- Comprehensive test examples and documentation

#!/bin/bash

# Deployment Script for Baseline Analyzer
# Run this script to deploy your analyzer to GitHub

set -e  # Exit on any error

echo "🚀 Baseline Analyzer Deployment Script"
echo "======================================"

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -f "action.yml" ]; then
    echo "❌ Error: Please run this script from the baseline-analyzer-ts directory"
    exit 1
fi

# Get GitHub username
echo ""
read -p "Enter your GitHub username: " GITHUB_USERNAME

if [ -z "$GITHUB_USERNAME" ]; then
    echo "❌ Error: GitHub username is required"
    exit 1
fi

echo ""
echo "📋 Pre-deployment checklist:"
echo "✅ Ensure you have created a public repository: baseline-analyzer-ts"
echo "✅ Ensure you have git configured with your credentials"
echo ""
read -p "Press Enter to continue or Ctrl+C to abort..."

# Build the project
echo ""
echo "🔧 Building the project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix build errors and try again."
    exit 1
fi

# Initialize git if needed
if [ ! -d ".git" ]; then
    echo "📦 Initializing git repository..."
    git init
fi

# Add GitHub remote
echo "🔗 Setting up GitHub remote..."
git remote remove origin 2>/dev/null || true
git remote add origin "https://github.com/$GITHUB_USERNAME/baseline-analyzer-ts.git"

# Add all files
echo "📁 Adding files to git..."
git add .

# Commit
echo "💾 Creating initial commit..."
git commit -m "feat: Initial release - Web Platform Baseline Analyzer v1.0.0

- Complete feature detection for CSS, JavaScript, and HTML
- Integration with web-features package for accurate baseline data
- Smart PR size handling with focused analysis for large PRs
- Risk assessment with actionable recommendations
- GitHub Actions integration with PR comments"

# Push to main
echo "⬆️  Pushing to GitHub..."
git branch -M main
git push -u origin main

# Create release tag
echo "🏷️  Creating release tag..."
git tag -a v1.0.0 -m "Release v1.0.0

✨ Features:
- Automated web platform compatibility analysis
- Smart PR filtering and risk assessment  
- Integration with latest baseline data
- Production-ready GitHub Action

🔧 Technical:
- TypeScript codebase with full type safety
- NPM package integration (web-features, compute-baseline)
- Comprehensive test suite and validation
- Optimized performance (~27ms analysis time)"

git push origin v1.0.0

echo ""
echo "🎉 Deployment completed successfully!"
echo ""
echo "📝 Next Steps:"
echo "1. Go to: https://github.com/$GITHUB_USERNAME/baseline-analyzer-ts"
echo "2. Verify the repository looks correct"
echo "3. Test the action in a sample repository"
echo ""
echo "🔧 For users to use your analyzer, they should add this to their workflow:"
echo ""
echo "    - uses: $GITHUB_USERNAME/baseline-analyzer-ts@v1.0.0"
echo "      with:"
echo "        github-token: \${{ secrets.GITHUB_TOKEN }}"
echo ""
echo "📖 Full documentation available in:"
echo "   - DEPLOYMENT_GUIDE.md (for detailed setup)"
echo "   - HOW_IT_WORKS.md (for usage examples)"
echo "   - TESTING.md (for testing instructions)"

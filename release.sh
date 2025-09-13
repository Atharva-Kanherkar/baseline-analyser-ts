#!/bin/bash

# Release Script for Baseline Analyzer v1.1.0
# This script helps prepare and create a GitHub release

set -e

echo "🚀 Preparing Baseline Analyzer v1.1.0 Release"
echo "============================================="

# Check if we're on the right branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "master" ] && [ "$CURRENT_BRANCH" != "main" ]; then
    echo "⚠️  Warning: You're on branch '$CURRENT_BRANCH', not master/main"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Ensure everything is built
echo "📦 Building project..."
npm run bundle

# Check if git is clean
if ! git diff-index --quiet HEAD --; then
    echo "📝 You have uncommitted changes. Committing them..."
    git add .
    git commit -m "chore: release v1.1.0 - improved risk assessment and baseline data"
else
    echo "✅ Git working directory is clean"
fi

# Create and push the tag
echo "🏷️  Creating release tag..."
git tag -a v1.1.1 -m "Release v1.1.1: Improved Risk Assessment

🔧 Fixed overly aggressive risk assessment
📊 Enhanced baseline data coverage  
⚖️ Better decision logic for modern web features

Before: HIGH RISK: 11 serious compatibility issues (false positives)
After: MEDIUM RISK: 4 compatibility concerns (accurate assessment)"

echo "📡 Pushing to GitHub..."
git push origin $CURRENT_BRANCH
git push origin v1.1.1

echo ""
echo "✅ Release v1.1.1 prepared successfully!"
echo ""
echo "🌐 Next steps:"
echo "1. Go to: https://github.com/Atharva-Kanherkar/baseline-analyser-ts/releases/new"
echo "2. Select tag: v1.1.0"
echo "3. Title: 'v1.1.0: Improved Risk Assessment'"
echo "4. Copy the changelog content from CHANGELOG.md"
echo "5. Upload the bundled dist folder if needed"
echo "6. Publish the release"
echo ""
echo "📋 Key improvements to highlight:"
echo "- Fixed false HIGH RISK alerts for well-supported features"
echo "- Better baseline data coverage for modern web features"  
echo "- More reasonable PR blocking behavior"
echo "- CSS Grid, Flexbox, fetch now correctly assessed as LOW risk"
echo ""
echo "🎯 Users can now update their workflows to use:"
echo "   uses: Atharva-Kanherkar/baseline-analyser-ts@v1.1.0"

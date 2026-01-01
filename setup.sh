#!/bin/bash

# NOAI Prep - iOS App Setup Script
# This script helps set up the Xcode project

echo "🚀 NOAI Prep - Setup Script"
echo "=========================="
echo ""

# Check for Homebrew
if ! command -v brew &> /dev/null; then
    echo "⚠️  Homebrew not found. Installing..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
fi

# Check for xcodegen
if ! command -v xcodegen &> /dev/null; then
    echo "📦 Installing XcodeGen..."
    brew install xcodegen
fi

# Generate Xcode project
echo "🔨 Generating Xcode project..."
cd "$(dirname "$0")"
xcodegen generate

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Success! Xcode project generated."
    echo ""
    echo "📱 Next steps:"
    echo "   1. Open NOAIPrep.xcodeproj in Xcode"
    echo "   2. Select your development team in Signing & Capabilities"
    echo "   3. Select a simulator or device"
    echo "   4. Press Cmd+R to build and run"
    echo ""
    echo "🎉 Happy coding!"

    # Ask to open Xcode
    read -p "Open Xcode now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        open NOAIPrep.xcodeproj
    fi
else
    echo ""
    echo "❌ Error generating project. Please check the output above."
    echo ""
    echo "📝 Manual alternative:"
    echo "   1. Open Xcode"
    echo "   2. Create new iOS App project with SwiftUI"
    echo "   3. Name it 'NOAIPrep'"
    echo "   4. Copy files from NOAIPrep/ folder to your project"
fi

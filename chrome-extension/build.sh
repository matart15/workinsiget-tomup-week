#!/bin/bash

# WorkInsight Chrome Extension Build Script

echo "🚀 Building WorkInsight Chrome Extension..."

# Clean previous build
echo "📁 Cleaning previous build..."
rm -rf dist
mkdir -p dist

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Compile TypeScript
echo "⚙️  Compiling TypeScript..."
npx tsc

# Copy static assets
echo "📋 Copying static assets..."
cp manifest.json dist/
cp popup.html dist/
cp popup.css dist/
cp privacy.html dist/
cp terms.html dist/

# Copy icons if they exist
if [ -d "icons" ]; then
    echo "🎨 Copying icons..."
    cp -r icons dist/
fi

# Create popup.js from popup.ts (if not already compiled)
if [ ! -f "dist/popup.js" ]; then
    echo "⚠️  Warning: popup.js not found. Make sure popup.ts is compiled."
fi

# Create background.js from background.ts (if not already compiled)
if [ ! -f "dist/background.js" ]; then
    echo "⚠️  Warning: background.js not found. Make sure background.ts is compiled."
fi

# Create content.js from content.ts (if not already compiled)
if [ ! -f "dist/content.js" ]; then
    echo "⚠️  Warning: content.js not found. Make sure content.ts is compiled."
fi

echo "✅ Build complete! Extension is ready in dist/ folder."
echo ""
echo "📋 To load the extension in Chrome:"
echo "1. Open chrome://extensions/"
echo "2. Enable 'Developer mode'"
echo "3. Click 'Load unpacked'"
echo "4. Select the chrome-extension/dist folder"
echo ""
echo "🔧 For development, run: npm run dev" 

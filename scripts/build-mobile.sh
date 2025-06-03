#!/bin/bash

echo "🚀 Building Airdrops Hunter for Mobile (Ionic AppFlow)"
echo "=================================================="

# Set build target
export BUILD_TARGET=mobile

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist-mobile
rm -rf .next

# Install dependencies if needed
echo "📦 Installing dependencies..."
npm install

# Build for mobile
echo "🔨 Building for mobile platform..."
npm run build:mobile

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Mobile build completed successfully!"
    echo "📁 Output directory: dist-mobile"
    echo ""
    echo "Next steps:"
    echo "1. npx cap sync (to sync with Capacitor)"
    echo "2. npx cap open android (to open in Android Studio)"
    echo "3. Upload to Ionic AppFlow"
else
    echo "❌ Mobile build failed!"
    exit 1
fi

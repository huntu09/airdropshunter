#!/bin/bash

echo "🌐 Building Airdrops Hunter for Web"
echo "=================================="

# Set build target
export BUILD_TARGET=web

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf .next

# Install dependencies if needed
echo "📦 Installing dependencies..."
npm install

# Build for web
echo "🔨 Building for web platform..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Web build completed successfully!"
    echo "📁 Output directory: .next"
    echo ""
    echo "Next steps:"
    echo "1. npm run start (to test locally)"
    echo "2. Deploy to Vercel"
else
    echo "❌ Web build failed!"
    exit 1
fi

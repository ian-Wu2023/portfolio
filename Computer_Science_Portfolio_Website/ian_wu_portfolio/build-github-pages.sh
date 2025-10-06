
#!/bin/bash

echo "🚀 Building Ian Wu Portfolio for GitHub Pages..."

cd /home/ubuntu/ian_wu_portfolio/app

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf out
rm -rf .next

# Use the export configuration
echo "📝 Using export configuration..."
cp next.config.js next.config.backup.js
cp next.config.export.js next.config.js

# Build the static site
echo "🔨 Building static site..."
yarn build

# Restore original config
mv next.config.backup.js next.config.js

# Check if build was successful
if [ -d "build" ]; then
    echo "✅ Build successful! Static files are in the 'build' directory"
    echo ""
    echo "📦 Next steps to deploy to GitHub Pages:"
    echo "1. Create a new repository called 'ian-wu2023.github.io' on GitHub"
    echo "2. Run these commands:"
    echo ""
    echo "   cd /home/ubuntu/ian_wu_portfolio/app/build"
    echo "   git init"
    echo "   git add ."
    echo "   git commit -m 'Deploy Ian Wu Portfolio'"
    echo "   git branch -M main"
    echo "   git remote add origin https://github.com/ian-wu2023/ian-wu2023.github.io.git"
    echo "   git push -u origin main"
    echo ""
    echo "3. Wait a few minutes, then visit: https://ian-wu2023.github.io"
else
    echo "❌ Build failed! Check the errors above."
    exit 1
fi

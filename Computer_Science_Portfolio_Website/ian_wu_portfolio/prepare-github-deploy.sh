#!/bin/bash

echo "🚀 Preparing files for GitHub Pages deployment..."

# Create deployment directory
mkdir -p github-deploy

# Copy all necessary files
echo "📦 Copying project files..."
cp -r app/app github-deploy/
cp -r app/components github-deploy/
cp -r app/lib github-deploy/
cp -r app/public github-deploy/
cp app/package.json github-deploy/
cp app/next.config.js github-deploy/
cp app/tsconfig.json github-deploy/
cp app/tailwind.config.ts github-deploy/
cp app/postcss.config.js github-deploy/
cp app/components.json github-deploy/ 2>/dev/null || true

# Create .gitignore for the deployment
cat > github-deploy/.gitignore << 'GITIGNORE'
node_modules/
.next/
out/
build/
.env
.env.local
*.log
.DS_Store
GITIGNORE

# Create README for deployment
cat > github-deploy/README.md << 'README'
# Ian Wu Portfolio

Professional computer science portfolio showcasing statistical analysis projects using R, Python, and Java.

## Deployment

This repository is deployed on GitHub Pages.

## Local Development

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` to view the site.

## Building for Production

```bash
npm install
npm run build
npm start
```

## Tech Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- Shadcn/UI Components
README

echo "✅ Files prepared in 'github-deploy' directory!"
echo ""
echo "📝 Next steps:"
echo "1. cd github-deploy"
echo "2. git init"
echo "3. git add ."
echo "4. git commit -m 'Initial commit'"
echo "5. git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git"
echo "6. git push -u origin main"


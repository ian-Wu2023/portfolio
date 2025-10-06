
# Deploying Ian Wu Portfolio to GitHub Pages

This guide will help you deploy your portfolio to `ian-wu2023.github.io`.

## Prerequisites

1. A GitHub account (username: ian-wu2023)
2. Git installed on your system
3. Your portfolio built and ready to deploy

## Step 1: Build the Static Site

Run the build script to generate static files:

\`\`\`bash
cd /home/ubuntu/ian_wu_portfolio
chmod +x build-github-pages.sh
./build-github-pages.sh
\`\`\`

This will create a `build` directory with all the static files ready for GitHub Pages.

## Step 2: Create GitHub Repository

1. Go to [GitHub](https://github.com) and log in
2. Click the "+" icon in the top right, then "New repository"
3. **Important:** Name it exactly: `ian-wu2023.github.io`
4. Make it **Public**
5. Do NOT initialize with README, .gitignore, or license
6. Click "Create repository"

## Step 3: Deploy to GitHub Pages

Navigate to the build directory and push to GitHub:

\`\`\`bash
cd /home/ubuntu/ian_wu_portfolio/app/build
git init
git add .
git commit -m "Initial deployment of Ian Wu Portfolio"
git branch -M main
git remote add origin https://github.com/ian-wu2023/ian-wu2023.github.io.git
git push -u origin main
\`\`\`

## Step 4: Verify Deployment

1. Wait 2-3 minutes for GitHub Pages to build
2. Visit: https://ian-wu2023.github.io
3. Your portfolio should be live!

## Troubleshooting

### Build Errors

If the build fails, check:
- All dependencies are installed: `cd /home/ubuntu/ian_wu_portfolio/app && yarn install`
- TypeScript has no errors: `yarn tsc --noEmit`

### GitHub Push Errors

If you get authentication errors:
- Use a Personal Access Token instead of password
- Go to GitHub → Settings → Developer settings → Personal access tokens
- Generate a token with "repo" scope
- Use the token as your password when pushing

### Site Not Loading

If the site doesn't load after deployment:
- Check GitHub repository settings → Pages
- Ensure "Source" is set to "Deploy from a branch" and branch is "main"
- Clear your browser cache and try again

## Updating Your Portfolio

To update your portfolio after making changes:

\`\`\`bash
# 1. Rebuild the site
cd /home/ubuntu/ian_wu_portfolio
./build-github-pages.sh

# 2. Push updates
cd /home/ubuntu/ian_wu_portfolio/app/build
git add .
git commit -m "Update portfolio"
git push
\`\`\`

## Custom Domain (Optional)

To use a custom domain:
1. Buy a domain from a registrar
2. Add a CNAME file to the `build` directory with your domain
3. Configure DNS settings with your registrar
4. Update GitHub repository settings → Pages → Custom domain

---

**Need help?** Contact support or check the [GitHub Pages documentation](https://docs.github.com/en/pages).

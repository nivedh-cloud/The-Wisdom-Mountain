#!/bin/bash

# Quick GitHub Pages Deployment
# This will create a free permanent URL for your app

echo "Setting up GitHub Pages deployment..."

# Add deployment script to package.json
echo "Adding deploy script to package.json..."

# Install gh-pages if not already installed
echo "Installing gh-pages..."
npm install --save-dev gh-pages

echo ""
echo "=========================================="
echo "GITHUB PAGES SETUP INSTRUCTIONS"
echo "=========================================="
echo ""
echo "1. Create a GitHub repository:"
echo "   - Go to github.com"
echo "   - Click 'New repository'"
echo "   - Name it: TheBibleProject"
echo "   - Make it public"
echo "   - Don't initialize with README"
echo ""
echo "2. Push your code:"
echo "   git init"
echo "   git add ."
echo "   git commit -m 'Initial commit'"
echo "   git branch -M main"
echo "   git remote add origin https://github.com/YOURUSERNAME/TheBibleProject.git"
echo "   git push -u origin main"
echo ""
echo "3. Deploy to GitHub Pages:"
echo "   npm run deploy"
echo ""
echo "4. Your app will be available at:"
echo "   https://YOURUSERNAME.github.io/TheBibleProject"
echo ""
echo "5. Install on Android:"
echo "   - Open the GitHub Pages URL on your phone"
echo "   - Add to home screen"
echo "   - Works offline after first visit!"
echo ""

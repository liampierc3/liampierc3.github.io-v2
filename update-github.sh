#!/bin/bash

# Script to update GitHub repository and fix redirect issues

echo "Updating GitHub repository..."

# Make sure we're on the liampierc3.github.io branch
git checkout liampierc3.github.io 2>/dev/null || git checkout -b liampierc3.github.io

# Add all files
git add .

# Commit changes
git commit -m "Fix redirect issues and update site structure"

# Push specifically to the liampierc3.github.io branch
git push -u origin liampierc3.github.io

echo "Changes pushed to the liampierc3.github.io branch of your GitHub repository."
echo "Your site should update at https://liampierc3.github.io/ in a few minutes."
echo "If you still see a redirect, you might need to clear your browser cache or wait a bit longer for GitHub Pages to update." 
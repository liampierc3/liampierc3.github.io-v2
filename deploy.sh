#!/bin/bash

# Simple script to deploy the website to GitHub Pages

# Ensure we're in the right directory
echo "Checking current directory..."
if [ ! -f "index.html" ] || [ ! -f "gallery.html" ]; then
  echo "Error: index.html or gallery.html not found. Make sure you're in the website root directory."
  exit 1
fi

# Make sure .nojekyll file exists
echo "Ensuring .nojekyll file exists..."
touch .nojekyll

# Check if git is initialized
if [ ! -d ".git" ]; then
  echo "Initializing git repository..."
  git init
  git add .
  git commit -m "Initial commit"
else
  echo "Git repository already initialized."
fi

# Check if remote exists
if ! git remote | grep -q "origin"; then
  echo "Adding GitHub remote..."
  echo "Please enter your GitHub username:"
  read username
  git remote add origin "https://github.com/$username/$username.github.io.git"
else
  echo "Remote 'origin' already exists."
fi

# Add all files
echo "Adding files to git..."
git add .

# Commit changes
echo "Committing changes..."
echo "Enter commit message (or press enter for default message):"
read commit_message
if [ -z "$commit_message" ]; then
  commit_message="Update website with GitHub Pages compatibility"
fi
git commit -m "$commit_message"

# Push to GitHub
echo "Pushing to GitHub..."
git push -u origin main || git push -u origin master

echo "Deployment complete! Your website should be available at https://liampierc3.github.io/ shortly."
echo "Note: Make sure GitHub Pages is enabled in your repository settings with the source set to 'main' or 'master' branch." 
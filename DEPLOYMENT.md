# Deploying to GitHub Pages

Follow these steps to set up this repository as a GitHub Pages site:

## 1. Create a New GitHub Repository

1. Go to [GitHub](https://github.com) and sign in to your account
2. Click the "+" icon in the top right corner and select "New repository"
3. Name the repository `liampierc3.github.io` (this exact name is important for GitHub Pages)
4. Make the repository public
5. Click "Create repository"

## 2. Add Your Files to the Repository

### Option 1: Using Git on your local machine

1. Initialize Git in this directory if not already done:
   ```
   git init
   ```

2. Add the GitHub repository as the remote origin:
   ```
   git remote add origin https://github.com/liampierc3/liampierc3.github.io.git
   ```

3. Add all the files:
   ```
   git add .
   ```

4. Commit the files:
   ```
   git commit -m "Initial commit"
   ```

5. Push to GitHub:
   ```
   git push -u origin main
   ```

### Option 2: Using GitHub Desktop

1. Download and install [GitHub Desktop](https://desktop.github.com/) if you haven't already
2. Add this folder as a local repository
3. Publish the repository to GitHub as `liampierc3.github.io`

## 3. Configure GitHub Pages

1. Go to your repository on GitHub
2. Click on "Settings"
3. Scroll down to the "GitHub Pages" section (or click on "Pages" in the left sidebar)
4. For the "Source" section, select "Deploy from a branch"
5. For the "Branch" section, select "main" and "/ (root)" folder
6. Click "Save"

## 4. Verify Your Site

1. GitHub Pages will provide a URL like `https://liampierc3.github.io/`
2. It may take a few minutes for your site to be published
3. Visit the URL to ensure your site is working correctly

## File Structure

The repository is set up with the following structure:

- `index.html` - Main landing page
- `first-person-experience.html` - 3D first-person experience
- `3d-gallery.html` - 3D gallery experience
- `gallery.html` - 2D photo gallery
- `js/` - Directory containing JavaScript files
  - `three/` - Three.js library and examples
- `.nojekyll` - File that tells GitHub Pages not to use Jekyll
- `.github/workflows/static.yml` - GitHub Actions workflow for deployment

## Additional Notes

- The site uses local JavaScript files instead of CDN links to ensure reliability
- A `.nojekyll` file is included to prevent GitHub Pages from processing the site with Jekyll
- The GitHub Actions workflow automatically deploys changes when you push to the main branch

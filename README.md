# Babel Fish App

A React application for library staff and customer assistance.

## 🚀 Deployment Status

This project is configured for automatic deployment to GitHub Pages.

### GitHub Pages Setup

1. **Repository Settings**: Go to your GitHub repository settings
2. **Pages Section**: Navigate to "Pages" in the left sidebar
3. **Source**: Select "GitHub Actions" as the source
4. **Branch**: The deployment will automatically use the `gh-pages` branch created by the GitHub Actions workflow

### Automatic Deployment

The app is automatically deployed to GitHub Pages whenever you push changes to the `main` branch. The deployment process:

1. Builds the React app using `npm run build`
2. Deploys the built files to the `gh-pages` branch
3. Makes the site available at: https://cwrigh13.github.io/babel-fish

### Local Development

To run the app locally:

```bash
cd babel-fish-app
npm install
npm start
```

The app will be available at http://localhost:3000

### Project Structure

- `babel-fish-app/` - Main React application
  - `src/` - Source code
  - `public/` - Static assets
  - `build/` - Production build (generated)
- `.github/workflows/` - GitHub Actions deployment configuration

### Technologies Used

- React 18
- Firebase
- GitHub Actions for CI/CD
- GitHub Pages for hosting 
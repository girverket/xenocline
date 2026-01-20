# Xenocline Documentation Website

This directory contains the source code for the Xenocline documentation website, built with React and Vite.

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deployment

The documentation site is automatically deployed to GitHub Pages when changes are pushed to the `main` or `working` branches. The deployment is handled by the `.github/workflows/deploy-docs.yml` workflow.

The site will be available at: `https://girverket.github.io/xenocline/`

## Structure

- `src/App.jsx` - Main application component with all content
- `src/index.css` - Styles for the entire site
- `src/main.jsx` - Application entry point
- `index.html` - HTML template
- `vite.config.js` - Vite configuration

## Technology Stack

- **React 18** - UI framework
- **Vite 7** - Build tool and dev server
- **CSS Variables** - Theming with dark/light mode support
- **Google Fonts** - Outfit (headings) and IBM Plex Mono (code)

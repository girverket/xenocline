# Documentation Website Setup

## What Was Created

A complete documentation website for Xenocline, modeled after the Protokoll docs site:

### Files Created

```
docs/
├── .gitignore                 # Git ignore for docs directory
├── .npmrc                     # NPM configuration
├── package.json               # Dependencies and scripts
├── vite.config.js             # Vite build configuration
├── index.html                 # HTML template
├── README.md                  # Docs directory documentation
├── SETUP.md                   # This file
└── src/
    ├── App.jsx                # Main React component with all content
    ├── index.css              # Styles (purple/blue theme)
    └── main.jsx               # React entry point

.github/workflows/
└── deploy-docs.yml            # GitHub Actions workflow for deployment
```

## Features

The documentation website includes:

1. **Hero Section** - Eye-catching introduction with gradient title
2. **Core Concepts** - Phases, Nodes, and Processes explained
3. **Code Examples** - Interactive code samples showing:
   - Simple pipelines
   - Parallel execution with aggregation
   - Conditional routing with decisions
   - Event handling
4. **Use Cases** - ETL, workflows, event handling, middleware
5. **Type Safety Section** - TypeScript integration examples
6. **Quick Start Guide** - Getting started with Xenocline
7. **Responsive Design** - Works on mobile and desktop
8. **Dark/Light Mode** - Automatically adapts to system preference

## Theme

- **Primary Color**: Purple (#8b5cf6) - representing pipeline flow
- **Accent Color**: Cyan (#06b6d4) - for highlights
- **Typography**: Outfit for headings, IBM Plex Mono for code
- **Style**: Modern, clean, developer-focused

## GitHub Pages Deployment

The workflow (`.github/workflows/deploy-docs.yml`) will:

1. Trigger on pushes to `main` or `working` branches
2. Build the Xenocline library
3. Build the docs site
4. Deploy to GitHub Pages

Once enabled, the site will be available at:
**https://girverket.github.io/xenocline/**

## Enabling GitHub Pages

To enable GitHub Pages for the repository:

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Pages**
3. Under "Source", select **GitHub Actions**
4. The workflow will automatically deploy on the next push

## Local Development

```bash
# Navigate to docs directory
cd docs

# Install dependencies
npm install

# Start development server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Customization

### Content Changes

Edit `docs/src/App.jsx` to modify:
- Text content
- Code examples
- Sections
- Links

### Style Changes

Edit `docs/src/index.css` to modify:
- Colors (CSS variables at the top)
- Typography
- Spacing
- Animations

### Build Configuration

Edit `docs/vite.config.js` to modify:
- Base path (currently `/xenocline/`)
- Build options
- Plugins

## Next Steps

1. **Push the changes** to trigger the GitHub Actions workflow
2. **Enable GitHub Pages** in repository settings
3. **Customize content** in App.jsx as needed
4. **Add more examples** from your README if desired
5. **Update links** in the main README to point to the docs site

## Comparison with Protokoll

This setup mirrors the Protokoll documentation approach:

✓ Same tech stack (React + Vite)
✓ Similar visual design language
✓ GitHub Actions deployment workflow
✓ Single-page app with smooth scrolling
✓ Code-focused presentation
✓ Responsive and accessible

Adapted for Xenocline:
- Purple/blue theme (vs. green/teal for Protokoll)
- Pipeline/processor focus (vs. transcription focus)
- Examples showing phases, nodes, and processes
- Use cases relevant to data processing workflows

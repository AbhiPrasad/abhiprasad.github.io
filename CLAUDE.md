# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/claude-code) when working with this repository.

## Project Overview

This is a personal website built with Astro, a static site generator. The site displays presentations/talks, work experience, and social media links.

## Tech Stack

- **Framework**: Astro (static output)
- **Language**: TypeScript (strict mode)
- **Styling**: CSS with custom properties (no framework)
- **Hosting**: GitHub Pages

## Key Files

- `src/data/presentations.json` - Array of presentation objects
- `src/data/work.json` - Array of work experience objects
- `src/data/social.json` - Object with social media URLs
- `src/pages/index.astro` - Main page component
- `src/layouts/Layout.astro` - Layout with theme CSS variables

## Common Tasks

### Adding a presentation

Edit `src/data/presentations.json` and add an object:

```json
{
  "title": "Talk Title",
  "event": "Event Name",
  "date": "YYYY-MM-DD",
  "description": "Description (optional)",
  "slides": "Google Slides URL or null",
  "video": "Video URL or null",
  "slidePdf": "/slides/filename.pdf or null"
}
```

If uploading a PDF, place it in `public/slides/`.

### Adding work experience

Edit `src/data/work.json` and add an object:

```json
{
  "company": "Company Name",
  "role": "Job Title",
  "startDate": "YYYY-MM",
  "endDate": "YYYY-MM or null for current",
  "description": "Role description",
  "highlights": ["Achievement 1", "Achievement 2"]
}
```

### Updating social links

Edit `src/data/social.json`:

```json
{
  "github": "https://github.com/username",
  "linkedin": "https://linkedin.com/in/username",
  "twitter": "https://twitter.com/username",
  "letterboxd": "https://letterboxd.com/username"
}
```

## Build Commands

- `npm run dev` - Start development server (localhost:4321)
- `npm run build` - Build for production (outputs to `dist/`)
- `npm run preview` - Preview production build

## Slash Commands

Use these to quickly update content:

- `/add-talk` - Guided flow to add a presentation
- `/add-work` - Guided flow to add work experience

## Theme Colors

CSS custom properties in `src/layouts/Layout.astro`:

- `--color-primary`: Forest Green (#228B22)
- `--color-accent`: Gold (#DAA520)
- `--color-background`: White (#FFFFFF)

## Deployment

Automatic via GitHub Actions on push to `master`. The workflow builds the site and deploys to GitHub Pages.

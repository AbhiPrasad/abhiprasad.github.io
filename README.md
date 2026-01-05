# Personal Website

A personal website built with [Astro](https://astro.build), featuring presentations, work experience, and social links.

## Features

- **Presentations & Talks**: Showcase meetup talks and presentations with links to slides and videos
- **Work Experience**: Display professional history with descriptions and highlights
- **Social Links**: Connect to GitHub, LinkedIn, Twitter/X, and Letterboxd
- **Static Site**: Fast, SEO-friendly, and hosted on GitHub Pages

## Project Structure

```
/
├── public/
│   ├── favicon.svg
│   └── slides/           # PDF slides for presentations
├── src/
│   ├── data/
│   │   ├── presentations.json  # Talk/presentation data
│   │   ├── work.json           # Work experience data
│   │   └── social.json         # Social media links
│   ├── layouts/
│   │   └── Layout.astro        # Main layout with theme
│   └── pages/
│       └── index.astro         # Home page
├── .claude/
│   └── commands/               # Claude Code slash commands
│       ├── add-talk.md         # /add-talk command
│       └── add-work.md         # /add-work command
└── .github/
    └── workflows/
        └── deploy.yml          # GitHub Pages deployment
```

## Data Files

### presentations.json

Add talks with this structure:

```json
{
  "title": "Talk Title",
  "event": "Event Name",
  "date": "YYYY-MM-DD",
  "description": "Brief description",
  "slides": "https://docs.google.com/presentation/d/...",
  "video": "https://youtube.com/watch?v=...",
  "slidePdf": "/slides/filename.pdf"
}
```

### work.json

Add work experience with this structure:

```json
{
  "company": "Company Name",
  "role": "Job Title",
  "startDate": "YYYY-MM",
  "endDate": "YYYY-MM",
  "description": "Role description",
  "highlights": ["Achievement 1", "Achievement 2"]
}
```

Set `endDate` to `null` for current positions.

### social.json

Update social media links:

```json
{
  "github": "https://github.com/username",
  "linkedin": "https://linkedin.com/in/username",
  "twitter": "https://twitter.com/username",
  "letterboxd": "https://letterboxd.com/username"
}
```

## Commands

| Command           | Action                                      |
| :---------------- | :------------------------------------------ |
| `npm install`     | Install dependencies                        |
| `npm run dev`     | Start dev server at `localhost:4321`        |
| `npm run build`   | Build production site to `./dist/`          |
| `npm run preview` | Preview build locally before deploying      |

## Deployment

The site automatically deploys to GitHub Pages when changes are pushed to the `master` branch.

### Setup GitHub Pages

1. Go to repository Settings > Pages
2. Under "Build and deployment", select "GitHub Actions"
3. Push to `master` branch to trigger deployment

## Claude Code Integration

This project includes Claude Code slash commands for easy content updates:

- `/add-talk` - Add a new presentation or talk
- `/add-work` - Add or update work experience

## Theme

The site uses a forest green, white, and gold color scheme:

- Primary: Forest Green (`#228B22`)
- Background: White (`#FFFFFF`)
- Accent: Gold (`#DAA520`)

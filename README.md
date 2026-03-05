# Hackathon Projects

A static portfolio site displaying my hackathon builds on an interactive timeline. Built with vanilla HTML, CSS, and JavaScript.

## Projects

| Project | Hackathon | Stack | Award |
|---------|-----------|-------|-------|
| **knkt** | RaikesHacks 2026 | Flutter, Dart, FastAPI, MongoDB, OpenRouter | 1st Place in FindU Track |
| **Sanos** | TartanHacks 2026 | React, Next.js, FastAPI, SQLite, Dedalus Labs SDK | — |
| **Banana Coin** | CornHacks 2025 | React, Next.js, FastAPI, Redis, Firebase Auth | — |
| **RootCode** | UNL-Bayer Agtech Hackathon 2025 | Python, scikit-learn (SVR, GridSearchCV, PCA) | 1st Place Overall |
| **BeenDone** | Hack Midwest 2025 | React, Next.js, FastAPI, MongoDB Atlas, Google Gemini | 2nd Place in Best in Show |

## Structure

```
├── index.html              # Entry point
├── css/style.css           # All styles
├── js/app.js               # Timeline rendering and animations
├── data/projects.json      # Project data (edit this to add projects)
└── assets/
    ├── favicon.svg
    └── images/             # Thumbnails and logos
```

## Adding a Project

Add an entry to `data/projects.json`:

```json
{
  "id": "project-id",
  "title": "Project Name",
  "date": "YYYY-MM-DD",
  "hackathon": "Event Name",
  "description": "Short description.",
  "techStack": ["Tech1", "Tech2"],
  "teamSize": 3,
  "award": null,
  "links": {
    "repo": "https://github.com/...",
    "demo": "https://..."
  },
  "thumbnail": "assets/images/thumbnail.png",
  "logo": null
}
```

## Deployment

Static site, serve from any web server or deploy directly to GitHub Pages.

No build step required. Open `index.html` locally or push to a GitHub Pages-enabled repository.

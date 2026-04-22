# <img src="public/assets/favicon.svg" width="32" height="32" align="center" /> Aruneem's Hackathon Projects

A dynamic, interactive portfolio showcasing a timeline of hackathon projects. This version features an **AI Project Assistant** powered by Google Gemini, allowing visitors to ask questions about each build directly.

---

## 🚀 Key Features

- **Interactive Timeline**: A responsive, visual journey through past hackathons, sorted by date from most recent to earliest.
- **Project Detail Modals**: Expandable cards with full project descriptions, tech stacks, team size, awards, and links.
- **Mermaid Workflow Diagrams**: Each project includes architecture and flow diagrams rendered via Mermaid, with a zoomable lightbox view.
- **AI Assistant**: Per-project chat powered by **Google Gemini** — ask questions about any build's details, tech choices, or team role.
- **Live Stats & Skills Carousel**: Auto-computed hero metrics (projects, awards, technologies) and a rolling ticker of every tech used across all projects.
- **Dynamic Data**: All content is driven by `public/data/projects.json` — add a project there and the timeline, stats, and carousel update automatically.
- **Vercel Ready**: Optimized for Vercel with a serverless `api/ask.js` function handling the AI chat bridge.

---

## 📁 Project Structure

```text
├── api/
│   └── ask.js              # Serverless function for AI Chat (Vercel)
├── public/
│   ├── assets/             # Project icons and images
│   ├── css/                # Modern, responsive UI styles
│   ├── data/               # Project data (projects.json)
│   ├── js/                 # Timeline and chat logic
│   └── index.html          # Main entry point (Vercel automatic routing)
├── .env.example            # Environment variable template
├── .vercelignore           # Optimized deployment exclusion list
├── dev-server.js           # Local development server with AI bridge
├── package.json            # Scripts and dependencies
└── vercel.json             # Vercel configuration (clean URLs)
```

---

## 🛠️ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v20+)
- [Vercel CLI](https://vercel.com/docs/cli) (Recommended for local dev)
- A Google Gemini API Key (Get one at [Google AI Studio](https://aistudio.google.com/))

### Local Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/AruneemB/hackathons.git
   cd hackathons
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment**:
   Copy `.env.example` to `.env` and add your key:
   ```bash
   cp .env.example .env
   ```
   Or simply create a `.env` file in the root directory:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

4. **Run the Dev Server**:
   ```bash
   # Recommended (Vercel-like environment)
   npm run dev

   # Alternative (Custom Express server)
   node dev-server.js
   ```
   *The site will be available at `http://localhost:3000`.*

---

## ➕ Adding a Project

To add a new build, simply update `data/projects.json`. The timeline and stats will update automatically.

```json
{
  "id": "project-id",
  "title": "Project Name",
  "date": "YYYY-MM-DD",
  "hackathon": "Event Name",
  "description": "Short description.",
  "techStack": ["Tech1", "Tech2"],
  "teamSize": 3,
  "award": "1st Place (or null)",
  "links": {
    "repo": "https://github.com/...",
    "demo": "https://..."
  },
  "thumbnail": "assets/images/thumbnail.png",
  "logo": null
}
```

---

## 🏆 Current Highlights

| Project | Hackathon | Award | Stack |
|---------|-----------|-------|-------|
| **Lockey** | HackKU 2026 | 1st Place in Lockton Track | Next.js, TypeScript, MongoDB Atlas, Gemini |
| **knkt** | RaikesHacks 2026 | 1st Place in FindU Track | Flutter, FastAPI, MongoDB |
| **Sanos** | TartanHacks 2026 | — | Next.js, FastAPI, Dedalus Labs SDK |
| **Banana Coin** | CornHacks 2025 | — | Next.js, FastAPI, Redis |
| **RootCode** | UNL-Bayer Agtech 2025 | 1st Place Overall | Python, scikit-learn |
| **BeenDone** | Hack Midwest 2025 | 2nd Place in Best in Show | React, FastAPI, Gemini |

---

## ☁️ Deployment

This project is configured for **Vercel**. The `api/ask.js` file handles the serverless chat functionality.

1. Connect your repo to Vercel.
2. Add `GEMINI_API_KEY` to your environment variables.
3. Deploy!

---

*Built with time and effort by Aruneem*

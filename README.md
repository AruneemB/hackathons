# <img src="assets/favicon.svg" width="32" height="32" align="center" /> Aruneem's Hackathon Projects

A dynamic, interactive portfolio showcasing a timeline of hackathon projects. This version features an **AI Project Assistant** powered by Google Gemini, allowing visitors to ask questions about each build directly.

---

## 🚀 Key Features

- **Interactive Timeline**: A responsive, visual journey through past hackathons, from recent wins to early builds.
- **AI Assistant**: Integration with **Google Gemini (gemini-2.5-flash)** to provide context-aware answers about project details, tech stacks, and team roles.
- **Live Stats & Skills**: Automated hero section displaying key metrics and a rolling carousel of technologies used across all projects.
- **Dynamic Data**: All content is driven by a central `projects.json` file, making it easy to maintain and update.
- **Vercel Ready**: Optimized for deployment on Vercel with serverless function support for the AI chat bridge.

---

## 📁 Project Structure

```text
├── api/
│   └── ask.js              # Serverless function for AI Chat (Vercel)
├── assets/
│   ├── favicon.svg         # Project icon
│   └── images/             # Thumbnails and branding
├── css/
│   └── style.css           # Modern, responsive UI styles
├── data/
│   └── projects.json       # The single source of truth for project data
├── js/
│   └── app.js              # Timeline rendering and chat interface logic
├── dev-server.js           # Local development server with AI bridge
├── index.html              # Main entry point
└── package.json            # Dependencies for the AI assistant
```

---

## 🛠️ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
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
   Create a `.env` file in the root directory:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

4. **Run the Dev Server**:
   ```bash
   npm run dev
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
| **knkt** | RaikesHacks 2026 | 1st Place | Flutter, FastAPI, MongoDB |
| **Sanos** | TartanHacks 2026 | — | Next.js, FastAPI, Dedalus SDK |
| **RootCode** | UNL-Bayer Agtech 2025 | 1st Place | Python, scikit-learn |
| **BeenDone** | Hack Midwest 2025 | 2nd Place | React, FastAPI, Gemini |

---

## ☁️ Deployment

This project is configured for **Vercel**. The `api/ask.js` file handles the serverless chat functionality.

1. Connect your repo to Vercel.
2. Add `GEMINI_API_KEY` to your environment variables.
3. Deploy!

---

*Built with time and effort by Aruneem*

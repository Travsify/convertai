# ConvertAI — Fix Ads That Don't Convert

A full-stack web application that helps businesses analyze and improve their ad copy for better conversions.

## Features

- **Ad Copy Analyzer** — Score your ad 0-100 with detailed reasons why it fails
- **AI Rewrite Suggestions** — 3 improved versions using different conversion strategies
- **A/B Test Variant Generator** — 5 headline + 3 body copy variants for split testing
- **Landing Page Audit** — Flag conversion issues in landing page HTML or copy
- **Dashboard** — Usage stats, avg scores, top issues, recent analyses

## Stack

- Frontend: React 18 + Vite + Tailwind CSS
- Backend: Node.js + Express (port 3001)
- Database: SQLite (better-sqlite3)

## Getting Started

### 1. Start the Backend

```bash
cd backend
npm install
npm start
```

The API will be available at `http://localhost:3001`.

### 2. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/analyze | Analyze ad copy, returns score + issues |
| POST | /api/rewrite | Get 3 rewritten ad variants |
| POST | /api/ab-variants | Get A/B test headline + body variants |
| POST | /api/audit-landing | Audit landing page HTML or text |
| GET | /api/stats | Usage statistics from database |

## Scoring Criteria (Ad Analyzer)

| Criterion | Points |
|-----------|--------|
| Clear CTA | +20 |
| Value Proposition | +20 |
| Appropriate Length (50-300 chars) | +15 |
| Urgency Language | +15 |
| Social Proof | +15 |
| No Spam Words | +15 |
| **Total** | **100** |

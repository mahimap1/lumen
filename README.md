# Lumen

Academic planning, visual AI tutoring, and career analytics using synthetic UMBC data.

A local, demo-quality MVP: no auth, no accounts, no server-side session store.

- **Four Year Plan** — build and edit a four-year course plan from the campus catalog.
- **Alumni Pathways** — browse alumni profiles served from the API; each shows coursework with
  a prerequisite graph, internships, and post-graduation roles and salaries.
- **AI chat** — ask questions grounded in the campus SQLite dataset; replies can include an
  interactive HTML/SVG widget, which you can open in the visualizer, save, and revisit.
- **Widgets** — a gallery of the visualizations you've saved, reopenable in the visualizer.
- **Settings** — a model chooser, opened from the bottom of the sidebar.

## Run locally

Prerequisites: Node.js 22.12+ and Python 3.10+ recommended.

Install dependencies from the repository root:

```sh
npm ci --prefix frontend
python3 -m venv backend/.venv
backend/.venv/bin/python -m pip install -r backend/requirements.txt
cp backend/.env.example backend/.env
```

Add a Gemini API key (`GEMINI_API_KEY`) to `backend/.env` to enable AI chat and visual
generation. Gemini is the app's only provider, and its key stays server-side. Without a key,
the four-year plan and alumni pathways still work; chat explains that a key is needed.

Start the backend in one terminal:

```sh
cd backend
.venv/bin/python -m uvicorn main:app --host 127.0.0.1 --port 8000
```

Start the frontend in another terminal:

```sh
cd frontend
npm run dev
```

Open http://127.0.0.1:5173. API documentation is at http://127.0.0.1:8000/docs.
Vite proxies `/api` and `/static` to the backend. To use a different API server,
set `VITE_API_BASE_URL` in `frontend/.env.local` and restart Vite.

SQLite initializes automatically from `backend/data/*.csv` on first backend start.
Plans, sessions, and saved widgets are stored in this browser's localStorage.

## Model configuration

`GEMINI_MODEL` in `backend/.env` sets the backend's default Gemini model (defaults to
`gemini-3.5-flash-lite`). The Settings pane offers a model chooser; the chosen model is sent
with each chat request and overrides the default for that request. If a model is briefly
unavailable, the backend falls back across a small chain of current Gemini models.

## Checks

```sh
npm run build --prefix frontend
npm run lint --prefix frontend
```

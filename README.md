# Lumen

Academic planning, visual AI tutoring, and career analytics using synthetic UMBC data.

## Run locally

Prerequisites: Node.js 22.12+ and Python 3.10+ recommended.

Install dependencies from the repository root:

```sh
npm ci --prefix frontend
python3 -m venv backend/.venv
backend/.venv/bin/python -m pip install -r backend/requirements.txt
cp backend/.env.example backend/.env
```

Add a Gemini API key to `backend/.env` to enable AI chat and visual generation.
Backboard and ElevenLabs keys are optional. Without provider keys, the planner,
alumni pathways, and career analytics work; chat explains that a key is needed.
Provider keys belong only in the backend environment.

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
Vite forwards `/api` and `/static` to the backend. To use a different API server,
set `VITE_API_BASE_URL` in `frontend/.env.local` and restart Vite.

SQLite initializes automatically from `backend/data/*.csv` on first backend start.
Plans, sessions, and saved widgets are stored in this browser's localStorage.
Manim clips require existing video files; new clips are not rendered automatically.

## Checks

```sh
npm run build --prefix frontend
npm run lint --prefix frontend
```

# StudySpark AI:

AI-powered study platform built with React, Python Flask, and AI to generate study summaries, quizzes, and flashcards.
## Requirements

- Node.js (LTS recommended) and npm
- Python 3.10 or newer
- Tech stack: React · JavaScript · Python · Flask
- VS Code is optional


## Run the backend

Open a terminal in this extracted folder:

### macOS/Linux

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

### Windows PowerShell

```powershell
cd backend
py -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
py app.py
```

Keep this terminal running. Flask listens on port `8080`.

## Run the website

Open a second terminal at the extracted folder:

```bash
cd frontend
npm install
npm run dev
```

Open the local address printed by Vite (normally `http://localhost:5173`). The website forwards `/api` requests to Flask on port 8080.

An `OPENAI_API_KEY` environment variable is optional. Without it, StudySpark uses its built-in local generator. Never commit an API key into source code.

## Source map

- `frontend/src/App.jsx` — upload screen, generated study set, summary, quiz, and flashcards
- `frontend/src/index.css` — app theme and responsive styling
- `frontend/vite.config.js` — Vite configuration and local API proxy
- `backend/app.py` — PDF extraction, optional OpenAI generation, fallback generator, and API routes

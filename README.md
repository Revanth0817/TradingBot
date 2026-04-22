# SmartAPI Algo Trading App

Full-stack algorithmic trading web app with:

- Frontend: Next.js, Tailwind CSS, Zustand, Shadcn-style components.
- Backend: FastAPI.
- Broker: Angel One SmartAPI.

## Run Backend

```bash
cd backend
python -m venv .venv
.venv\\Scripts\\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload --port 8000
```

## Run Frontend

```bash
cd frontend
npm install
copy .env.local.example .env.local
npm run dev
```

## Product Features

- Manual secure API credential entry in settings modal.
- Global Paper vs Live trading mode toggle.
- Paper mode with user-defined virtual starting capital.
- Live mode with RMS margin fetch from SmartAPI backend.
- Intraday scalping strategy configuration per stock.
- Hardcoded live order product type to `INTRADAY`.
- Brokerage calculator with Indian intraday equity charges.

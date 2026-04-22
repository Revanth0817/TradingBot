# Backend (FastAPI + Angel One SmartAPI)

## Setup

1. Create virtual environment and install dependencies:

```bash
python -m venv .venv
.venv\\Scripts\\activate
pip install -r requirements.txt
```

2. Create `.env` from `.env.example` and adjust values.

3. Run server:

```bash
uvicorn app.main:app --reload --port 8000
```

## Key Endpoints

- `POST /api/v1/session/connect`: Angel auth + paper/live session creation.
- `GET /api/v1/session/{session_id}/capital`: fetch paper or live capital.
- `POST /api/v1/orders/execute`: place live MIS (`INTRADAY`) order or simulate paper fill.
- `POST /api/v1/brokerage/calculate`: intraday equity net PnL with charges.

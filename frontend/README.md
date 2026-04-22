# Frontend (Next.js + Tailwind + Zustand)

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` from `.env.local.example`.

3. Run app:

```bash
npm run dev
```

## Features

- Header toggle for Paper vs Live mode.
- API settings modal for Angel credentials (manual input).
- Paper mode virtual capital input.
- Live mode uses backend RMS capital from SmartAPI session.
- Strategy panel with symbol, qty, target/sl by points or percent.
- Execution uses backend `INTRADAY` product type for live orders.
- Brokerage widget for net intraday P/L after statutory charges.

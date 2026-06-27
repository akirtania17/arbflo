# arbflo

A sports-betting arbitrage and middling scanner that pulls live odds from The Odds API and surfaces bets that lock in a guaranteed profit across bookmakers.

## Overview

arbflo fetches odds for upcoming events, compares prices across books, and detects two kinds of opportunities:

- Arbitrage: a stake split across the outcomes of a market that guarantees a profit regardless of the result.
- Middles: pairs of spread/total bets on overlapping lines that always cover at least the stake and pay a bonus if the result lands in the gap between the lines.

It filters out opportunities that rely on soft/limit-happy books, rounds stakes to a usable increment, recomputes profit after rounding, and returns the guaranteed profit and per-outcome stakes.

The backend is FastAPI. The frontend is a React + shadcn/Vite single-page app.

## How it works

### Odds ingestion

`backend/arbflo/odds_api.py` calls The Odds API for the configured sport key (default `upcoming`), requesting the `h2h`, `spreads`, and `totals` markets in the `us` region with American odds. It reads the `x-requests-remaining` header so callers can track API quota.

`convert_event` (`arbitrage.py`) flattens each event into outcomes grouped by `(market_key, line)`. American prices are converted to decimal odds via `amer_to_dec`.

### Arbitrage detection

For each market group, `calculate_arb` picks the best available price per outcome across all books, then computes the inverse-odds sum `S = sum(1 / odds)`:

- If `S >= 1` there is no arbitrage, so the candidate is discarded.
- If `S < 1` the market is arbitrageable. Ideal stakes are `bankroll * (1 / odds) / S` per outcome, which equalizes the return on every outcome.

Validation guards reject longshots (any decimal odd over 15), require three-way markets to include a draw, and require differing lines for non-middle 2-way spreads/totals.

### Middle detection

`detect_middles` pairs opposing sides of spreads and totals and checks whether their lines overlap to form a middle (for example Over 5.5 against Under 7.5, leaving a 6 to 7 window). A valid middle must still be a standard arb (`S < 1`) on the two prices. Each middle records its window and, on top of the guaranteed arb profit, the larger payout if the result lands inside the window.

### Soft-book filtering

`config.py` lists soft/limit-happy books in `SOFT_BOOK_KEYS`. `is_soft_book_arb` flags any opportunity that depends on one of those books. When `FILTER_SOFT_BOOK_ARBS` is true, standard arbs that rely on a soft book are dropped; the rest are returned with a `soft_book_involved` flag so the UI can mark them.

### Stake sizing and profit calculation

Ideal stakes are rounded to `STAKE_ROUNDING_LEVEL` (default $1). Because rounding shifts the numbers, profit is recomputed from the rounded stakes: each outcome's return is `stake * odds`, the guaranteed return is the minimum of those, and profit is `guaranteed_return - total_staked`. If profit is no longer positive after rounding, the opportunity is discarded. Profit is reported as both an amount and a percentage of the total stake.

Results are sorted middles-first, then by profit percentage descending.

## Tech stack

- Backend: Python, FastAPI, Uvicorn, httpx (async), The Odds API
- Frontend: React, TypeScript, Vite, shadcn/ui, Tailwind CSS, TanStack Query

## Setup

### Backend

From `backend/`:

```
pip install -r requirements.txt
uvicorn api:app --reload
```

Set `ARBFLO_ODDS_API_KEY` in the environment (see `backend/.env.example`) before running, or odds fetches return empty.

The API serves on http://127.0.0.1:8000.

### Frontend

From `frontend/`:

```
npm install
npm run dev
```

The frontend reads its backend URL from `VITE_API_BASE` (`frontend/.env.local`, defaults to http://127.0.0.1:8000). Vite serves the UI on http://localhost:8080.

## Usage

### API endpoints

- `GET /health` health check; returns `{"status": "ok", "sport_key": ...}`.
- `GET /arbs` runs one scan and returns detected opportunities plus `remaining_requests`. Query params:
  - `bankroll` (float, default 100, min 1): bankroll to allocate per opportunity.
  - `min_profit_percent` (float, default 0, min 0): minimum profit % (after rounding) to include in results.

Example: `GET /arbs?bankroll=500&min_profit_percent=1.5`

## Project structure

```
.
├── backend/
│   ├── api.py                # FastAPI app: /health, /arbs
│   ├── requirements.txt
│   ├── .env.example
│   └── arbflo/
│       ├── config.py         # API key, sport/market settings, soft books, rounding
│       ├── odds_api.py       # async fetch from The Odds API
│       ├── arbitrage.py      # arb + middle detection, stake sizing, profit calc
│       └── service.py        # scan orchestration
├── frontend/                 # React + shadcn/Vite SPA
│   ├── .env.local            # VITE_API_BASE (non-secret)
│   └── src/
├── run_arbflo.sh
└── run_arbflo.cmd
```

## Limitations

- No automated tests.
- Depends on The Odds API and is bound by its request quota; the scan reports remaining requests but does not cache results.
- The frontend is partly boilerplate (shadcn scaffold and starter components).
- Odds-fetch errors are swallowed and return an empty result rather than surfacing an error to the client.

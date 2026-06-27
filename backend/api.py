# backend/api.py

from typing import Any, Dict, List

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware

from arbflo.config import DEFAULT_BANKROLL, SPORT_KEY
from arbflo.service import scan_arbitrage

app = FastAPI(
    title="ArbFlo.io API",
    version="1.0.0",
    description="Backend for ArbFlo.io sports arbitrage & middles finder.",
)

# CORS for local dev (adjust in production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8080",
        "http://127.0.0.1:8080",
        # keep any others you want:
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", summary="Health check")
async def health() -> Dict[str, Any]:
    return {"status": "ok", "sport_key": SPORT_KEY}


@app.get("/arbs", summary="Scan for arbitrage opportunities")
async def get_arbs(
    bankroll: float = Query(
        DEFAULT_BANKROLL,
        ge=1.0,
        description="Bankroll to allocate per arb",
    ),
    min_profit_percent: float = Query(
        0.0,
        ge=0.0,
        description="Minimum profit % threshold (after rounding) to include in results",
    ),
) -> Dict[str, Any]:
    """
    Run one scan and return arbitrage opportunities plus API usage info.
    """
    result = await scan_arbitrage(bankroll=bankroll)

    # result is a dict: {"arbs": [...], "remaining_requests": int | None}
    arbs = result["arbs"]
    remaining = result["remaining_requests"]

    if min_profit_percent > 0:
        arbs = [a for a in arbs if a["profit_percent"] >= min_profit_percent]

    return {
        "arbs": arbs,
        "remaining_requests": remaining,
    }

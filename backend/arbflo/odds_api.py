# backend/arbflo/odds_api.py

import httpx
from typing import List, Tuple, Optional

from .config import (
    API_KEY,
    BASE_URL,
    SPORT_KEY,
    MARKETS,
    REGIONS,
    HTTP_TIMEOUT,
    USER_AGENT,
)


async def fetch_odds() -> Tuple[List[dict], Optional[int]]:
    """
    Fetches odds data from The Odds API for the configured SPORT_KEY.

    Returns:
        (events, remaining_requests)
        - events: list of event dicts
        - remaining_requests: int or None if header is missing / error
    """
    url = f"{BASE_URL}/{SPORT_KEY}/odds"
    params = {
        "apiKey": API_KEY,
        "regions": REGIONS,
        "markets": MARKETS,
        "oddsFormat": "american",
    }
    headers = {"User-Agent": USER_AGENT}

    async with httpx.AsyncClient(timeout=HTTP_TIMEOUT, headers=headers) as client:
        try:
            r = await client.get(url, params=params)
            r.raise_for_status()

            remaining_header = r.headers.get("x-requests-remaining")
            remaining = int(remaining_header) if remaining_header is not None else None

            return r.json(), remaining
        except Exception as e:
            print(f"Error fetching odds: {e}")
            return [], None

# backend/arbflo/service.py

from typing import Any, Dict, List, Optional

from .config import DEFAULT_BANKROLL
from .odds_api import fetch_odds
from .arbitrage import convert_event, detect_arb_opportunities


async def scan_arbitrage(bankroll: Optional[float] = None) -> Dict[str, Any]:
    """
    High-level service function:
      - Fetch odds
      - Run arb detection
      - Return a dict with arbs and remaining_requests.

    Returns:
        {
            "arbs": [ ... ],
            "remaining_requests": int | None
        }
    """
    if bankroll is None:
        bankroll = DEFAULT_BANKROLL

    events, remaining_requests = await fetch_odds()
    all_arbs: List[Dict[str, Any]] = []

    for evt in events:
        sport_title = evt.get("sport_title", "Unknown Sport")
        grouped = convert_event(evt)
        arbs = detect_arb_opportunities(
            grouped_market_outcomes=grouped,
            bankroll=bankroll,
            event_data=evt,
            sport_title=sport_title,
        )
        all_arbs.extend(arbs)

    # Sort middles first, then by profit % descending
    all_arbs.sort(key=lambda x: (not x.get("is_middle", False), -x["profit_percent"]))

    return {
        "arbs": all_arbs,
        "remaining_requests": remaining_requests,
    }

# backend/arbflo/arbitrage.py

import math
from collections import defaultdict
from typing import Dict, List, Tuple, Any, Optional

from .config import (
    SOFT_BOOK_KEYS,
    FILTER_SOFT_BOOK_ARBS,
    STAKE_ROUNDING_LEVEL,
)


# ---------- Helper functions ----------

def amer_to_dec(price: float) -> float:
    """Converts American odds to decimal odds."""
    price = float(price)
    if price > 0:
        return 1.0 + price / 100.0
    else:
        return 1.0 + 100.0 / abs(price)


def round_stake(stake: float, level: float) -> float:
    """Rounds a stake amount to the nearest specified level (e.g., 1.0, 0.5)."""
    if level == 0.0:
        return stake
    return round(stake / level) * level


def is_soft_book_arb(arb_sources: List[dict]) -> bool:
    """
    Checks if any of the required bookmakers for the arb
    are in the SOFT_BOOK_KEYS set.
    """
    for src in arb_sources:
        if src["book"] in SOFT_BOOK_KEYS:
            return True
    return False


# ---------- Event conversion ----------

def convert_event(event: dict) -> Dict[Tuple[str, str], List[dict]]:
    """
    Parses event data and groups outcomes by (market_key, line_str).

    Returns a dict:
        {
            (market_key, line_str): [outcome_data, ...],
            ...
        }
    """
    grouped_markets: Dict[Tuple[str, str], List[dict]] = defaultdict(list)

    for b in event.get("bookmakers", []):
        book = b.get("key")

        for m in b.get("markets", []):
            market_key = m.get("key")

            # Need at least two outcomes to consider an arb
            if len(m.get("outcomes", [])) < 2:
                continue

            for o in m.get("outcomes", []):
                line = o.get("point")  # None for moneyline (h2h)
                comparison_key = (market_key, str(line))

                outcome_data = {
                    "book": book,
                    "market_id": market_key,
                    "outcome_name": o.get("name"),
                    "line": line,
                    "dec_odds": amer_to_dec(o.get("price")),
                }

                grouped_markets[comparison_key].append(outcome_data)

    return grouped_markets


# ---------- Arbitrage core ----------

def calculate_arb(
    unique_outcomes: List[str],
    outcomes: List[dict],
    bankroll: float,
    event_data: dict,
    sport_title: str,
    is_middle: bool = False,
) -> Optional[dict]:
    """
    Calculates a standard arbitrage or middle opportunity, including stake rounding.

    Returns:
        dict with arb details, or None if no profitable arb after rounding.
    """
    n_out = len(unique_outcomes)

    best_odds_by_name: Dict[str, float] = {name: 0.0 for name in unique_outcomes}
    best_src_by_name: Dict[str, Optional[dict]] = {name: None for name in unique_outcomes}

    # Pick best price per outcome
    for outcome in outcomes:
        name = outcome["outcome_name"]
        dec_odd = outcome["dec_odds"]

        if dec_odd > best_odds_by_name[name]:
            best_odds_by_name[name] = dec_odd
            best_src_by_name[name] = outcome

    # Ensure all outcomes have at least one book
    if any(src is None for src in best_src_by_name.values()):
        return None

    best_odds: List[float] = list(best_odds_by_name.values())
    best_src: List[dict] = list(best_src_by_name.values())  # type: ignore

    # --- DATA VALIDATION FILTERS ---

    # 1. Discard markets with huge longshots
    if any(o > 15.0 for o in best_odds):
        return None

    # 2. 3-way markets must be a draw-type market
    if n_out == 3 and "Draw" not in unique_outcomes and "draw" not in unique_outcomes:
        return None

    # 3. For 2-way spreads/totals (non-middle), lines must differ
    if n_out == 2 and best_src[0]["market_id"] in ["spreads", "totals"] and not is_middle:
        if best_src[0]["line"] == best_src[1]["line"]:
            return None

    # --- Arbitrage Calculation ---

    S = sum(1.0 / o for o in best_odds)

    # If S >= 1, no theoretical arb
    if S >= 1.0:
        return None

    # 1. Ideal stakes (unrounded)
    ideal_stakes = [(bankroll * (1.0 / o) / S) for o in best_odds]

    # 2. Apply stake rounding
    rounded_stakes = [round_stake(s, STAKE_ROUNDING_LEVEL) for s in ideal_stakes]

    # 3. Recalculate profit based on rounded stakes
    total_stake_rounded = sum(rounded_stakes)
    returns = [stake * odd for stake, odd in zip(rounded_stakes, best_odds)]
    guaranteed_return = min(returns)
    profit_amount = guaranteed_return - total_stake_rounded

    # Make sure it's still positive *after* rounding
    if profit_amount <= 0:
        return None

    profit_percent = (profit_amount / total_stake_rounded) * 100.0

    # Push potential flag (e.g. -3, -7, etc. on spreads/totals)
    is_push_market = (
        n_out == 2
        and best_src[0]["market_id"] in ["spreads", "totals"]
        and best_src[0]["line"] is not None
        and best_src[0]["line"] == int(best_src[0]["line"])
    )

    market_type = f"{n_out}-Way ({'Push Potential' if is_push_market else 'Standard'})"

    result: dict = {
        "sport_title": sport_title,
        "home_team": event_data.get("home_team"),
        "away_team": event_data.get("away_team"),
        "market_key": best_src[0]["market_id"],
        "arb_type": market_type,
        "line": best_src[0]["line"],
        "profit_percent": round(profit_percent, 2),
        "profit_amount": round(profit_amount, 2),
        "stakes": [round(s, 2) for s in rounded_stakes],
        "src": best_src,
        "total_stake": round(total_stake_rounded, 2),
        "is_middle": is_middle,
    }

    if is_middle:
        # If both bets win (middle hits), total payout is sum of returns
        middle_return = sum(returns)
        result["middle_profit_amount"] = round(middle_return - total_stake_rounded, 2)

    return result


# ---------- Middle detection ----------

def detect_middles(
    grouped_markets: Dict[Tuple[str, str], List[dict]],
    bankroll: float,
    event_data: dict,
    sport_title: str,
) -> List[dict]:
    """
    Detects arb middling opportunities for totals and spreads.

    Returns:
        A list of arb result dicts (each with is_middle=True).
    """
    middles: List[dict] = []

    for (market_key, _line_str), outcomes in grouped_markets.items():
        if market_key not in ["totals", "spreads"]:
            continue

        if market_key == "totals":
            side_A = [o for o in outcomes if o["outcome_name"] == "Over"]
            side_B = [o for o in outcomes if o["outcome_name"] == "Under"]

        elif market_key == "spreads":
            unique_team_names = list(set(o["outcome_name"] for o in outcomes))
            if len(unique_team_names) != 2:
                continue

            side_A = [o for o in outcomes if o["outcome_name"] == unique_team_names[0]]
            side_B = [o for o in outcomes if o["outcome_name"] == unique_team_names[1]]
        else:
            continue

        if not side_A or not side_B:
            continue

        for out_A in side_A:
            for out_B in side_B:
                line_A = out_A["line"]
                line_B = out_B["line"]

                if line_A is None or line_B is None:
                    continue

                is_middle = False
                middle_window = None

                if market_key == "totals":
                    if line_B > line_A:
                        is_middle = True
                        middle_window = f"{math.floor(line_A) + 1} to {math.ceil(line_B) - 1}"

                elif market_key == "spreads":
                    if (
                        out_A["line"] < 0
                        and out_B["line"] > 0
                        and out_B["line"] > abs(out_A["line"])
                    ):
                        is_middle = True
                        middle_window = f"{math.floor(abs(line_A)) + 1} to {math.ceil(line_B) - 1}"
                    elif (
                        out_B["line"] < 0
                        and out_A["line"] > 0
                        and out_A["line"] > abs(out_B["line"])
                    ):
                        is_middle = True
                        middle_window = f"{math.floor(abs(line_B)) + 1} to {math.ceil(line_A) - 1}"

                if not is_middle:
                    continue

                # Still must be a standard arb (S < 1)
                best_odds = [out_A["dec_odds"], out_B["dec_odds"]]
                S = (1.0 / best_odds[0]) + (1.0 / best_odds[1])

                if S >= 1.0:
                    continue

                unique_names = [out_A["outcome_name"], out_B["outcome_name"]]

                # Annotate for printing
                out_A["middle_window"] = middle_window
                out_B["middle_window"] = middle_window
                out_A["full_line"] = f"{out_A['outcome_name']} {line_A} vs {out_B['outcome_name']} {line_B}"
                out_B["full_line"] = out_A["full_line"]

                arb_result = calculate_arb(
                    unique_names,
                    [out_A, out_B],
                    bankroll,
                    event_data,
                    sport_title,
                    is_middle=True,
                )

                if arb_result:
                    arb_result["line"] = out_A["full_line"]
                    arb_result["middle_window"] = middle_window
                    middles.append(arb_result)

    return middles


# ---------- Combined arb detection ----------

def detect_arb_opportunities(
    grouped_market_outcomes: Dict[Tuple[str, str], List[dict]],
    bankroll: float,
    event_data: dict,
    sport_title: str,
) -> List[dict]:
    """
    Main function to run both standard arbs and middle detection for a single event.
    """
    all_arbs: List[dict] = []

    # 1. Standard arbs (2-way / 3-way / pushes)
    for (_market_key, _line_str), outcomes in grouped_market_outcomes.items():
        unique_outcomes = list(set(o["outcome_name"] for o in outcomes))
        n_out = len(unique_outcomes)

        if n_out in [2, 3]:
            arb_result = calculate_arb(unique_outcomes, outcomes, bankroll, event_data, sport_title)

            if arb_result:
                is_soft = is_soft_book_arb(arb_result["src"])
                arb_result["is_middle"] = False

                # Filter: hide standard arbs if they use a soft book AND filter is ON
                if FILTER_SOFT_BOOK_ARBS and is_soft:
                    continue

                arb_result["soft_book_involved"] = is_soft
                all_arbs.append(arb_result)

    # 2. Middles
    middles_result = detect_middles(grouped_market_outcomes, bankroll, event_data, sport_title)
    for middle in middles_result:
        middle["soft_book_involved"] = is_soft_book_arb(middle["src"])
        all_arbs.append(middle)

    return all_arbs

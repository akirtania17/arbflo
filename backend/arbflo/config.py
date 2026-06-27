# backend/arbflo/config.py

"""
Configuration and tunable parameters for the ArbFlo.io backend.
"""

import os

# --- API settings ---

# Read from the environment. Set ARBFLO_ODDS_API_KEY in your .env (see .env.example).
API_KEY = os.getenv("ARBFLO_ODDS_API_KEY", "")

BASE_URL = "https://api.the-odds-api.com/v4/sports"

# "upcoming" = all upcoming events. You can also set this to a specific sport key.
SPORT_KEY = os.getenv("ARBFLO_SPORT_KEY", "upcoming")

# Markets to request from the API
MARKETS = "h2h,spreads,totals"

# Regions (books) to include
REGIONS = "us"

# HTTP settings
HTTP_TIMEOUT = 10.0
USER_AGENT = "ArbFlo.io v1.0"

# --- Risk management / book settings ---

# Books you consider "soft" / limit-happy
SOFT_BOOK_KEYS = {
    "betrivers",
    "mybookieag",
    "bovada",
    "betonlineag",
    "betus",
    "lowvig",
}

# If True, standard arbs that rely on a soft book are filtered out.
FILTER_SOFT_BOOK_ARBS = True

# Stake rounding increment (e.g. 1.0 -> nearest $1, 0.5 -> nearest 50 cents)
STAKE_ROUNDING_LEVEL = 1.0

# Default bankroll per arb calculation
DEFAULT_BANKROLL = 100.0

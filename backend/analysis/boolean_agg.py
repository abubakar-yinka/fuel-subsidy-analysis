"""
Boolean aggregation module for multi-select coping strategy questions.

Parses the KoboToolbox boolean sub-columns (items 16–18), sums the 1.0 values
to get frequency counts, and computes percentages. NaN values should already
be filled with 0.0 during ingestion.
"""

import logging
from typing import Any, Dict, List

import pandas as pd

logger = logging.getLogger(__name__)

# Mapping of JSON keys to the question prefix for column identification
COPING_QUESTIONS = {
    "personal_transport": {
        "prefix": "16. Which personal transportation adjustments have you adopted?",
        "title": "Personal Transportation Adjustments",
    },
    "institutional": {
        "prefix": "17. What institutional adjustments help you mitigate the effects?",
        "title": "Institutional Adjustments",
    },
    "financial": {
        "prefix": "18. What financial coping strategies have you introduced?",
        "title": "Financial Coping Strategies",
    },
}


def aggregate_boolean(df: pd.DataFrame) -> Dict[str, List[Dict[str, Any]]]:
    """
    Aggregate multi-select boolean sub-columns for coping strategies.

    Args:
        df: Cleaned DataFrame (NaN in boolean cols already filled with 0.0).

    Returns:
        Dictionary keyed by coping category with list of dicts containing
        'strategy', 'count', and 'percentage', sorted by count descending.
    """
    total = len(df)
    result: Dict[str, List[Dict[str, Any]]] = {}

    for key, config in COPING_QUESTIONS.items():
        prefix = config["prefix"]

        # Find boolean sub-columns (those with "/" separator)
        sub_cols = [
            c for c in df.columns if c.startswith(prefix) and "/" in c
        ]

        if not sub_cols:
            logger.warning("No boolean sub-columns found for '%s'.", prefix)
            result[key] = []
            continue

        entries: List[Dict[str, Any]] = []
        for col in sub_cols:
            # Extract the strategy name by finding the KoboToolbox
            # separator: "(Select all that apply)/<option_label>"
            # This preserves option labels containing "/" such as
            # "Ajo/Esusu" or "carpooling / ride-sharing"
            marker = "(Select all that apply)/"
            marker_idx = col.find(marker)
            if marker_idx != -1:
                strategy_name = col[marker_idx + len(marker):].strip()
            else:
                # Fallback: split after the prefix
                sep_idx = col.find("/")
                strategy_name = col[sep_idx + 1:].strip() if sep_idx != -1 else col

            # Sum the 1.0 values to get the frequency count
            count = int(df[col].sum())
            percentage = round((count / total) * 100, 1)

            entries.append(
                {
                    "strategy": strategy_name,
                    "count": count,
                    "percentage": percentage,
                }
            )

        # Sort by count descending
        entries.sort(key=lambda x: x["count"], reverse=True)
        result[key] = entries

        logger.info(
            "Coping '%s': %d strategies aggregated.", key, len(entries)
        )

    return result

"""
Likert scale transformation and weighted-mean analysis module.

Maps Likert text responses to integers, calculates weighted means,
and assigns decision flags for items 10–15 (Section C).
"""

import logging
from typing import Any, Dict, List

import pandas as pd

logger = logging.getLogger(__name__)

# Likert text-to-integer mapping (from KoboToolbox choices sheet)
LIKERT_MAP = {
    "Strongly Agree (SA)": 4,
    "Agree (A)": 3,
    "Disagree (D)": 2,
    "Strongly Disagree (SD)": 1,
}

# Reverse map for frequency labels
LIKERT_LABELS = {4: "SA", 3: "A", 2: "D", 1: "SD"}

# Likert items with their column names, numbers, and sub-section grouping
LIKERT_ITEMS = [
    {
        "item_number": 10,
        "column": "10. The 35% wage award is insufficient to offset the high cost of transportation.",
        "section": "Socio-Economic Effects",
    },
    {
        "item_number": 11,
        "column": "11. Increased operational costs in the hospital hinder my professional efficiency.",
        "section": "Socio-Economic Effects",
    },
    {
        "item_number": 12,
        "column": "12. Increased fuel costs have significantly reduced my disposable household income.",
        "section": "Socio-Economic Effects",
    },
    {
        "item_number": 13,
        "column": "13. High commuting costs have forced me to alter my nutrition, healthcare, or housing expenditure.",
        "section": "Physical Effects on Living Standards",
    },
    {
        "item_number": 14,
        "column": "14. Economic strain and commuting difficulties have increased my physical and mental fatigue.",
        "section": "Physical Effects on Living Standards",
    },
    {
        "item_number": 15,
        "column": "15. Financial constraints limit my ability to attend professional clinical trainings.",
        "section": "Physical Effects on Living Standards",
    },
]

DECISION_THRESHOLD = 2.5


def analyze_likert(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Transform Likert responses and calculate weighted means.

    Args:
        df: Imputed DataFrame.

    Returns:
        Dictionary with 'items' (list of item-level analysis) and
        'overall_mean' (grand mean across all items).
    """
    items_result: List[Dict[str, Any]] = []
    all_means: List[float] = []
    section_means: Dict[str, List[float]] = {}

    for item_info in LIKERT_ITEMS:
        col = item_info["column"]
        item_num = item_info["item_number"]
        section = item_info["section"]

        if col not in df.columns:
            logger.warning("Likert column '%s' not found.", col)
            continue

        # Map text responses to integers
        numeric_series = df[col].map(LIKERT_MAP)

        # Count frequencies for each level
        freq_counts = numeric_series.value_counts().sort_index(ascending=False)
        frequencies = {}
        for score, label in LIKERT_LABELS.items():
            frequencies[label] = int(freq_counts.get(score, 0))

        # Calculate weighted mean
        valid = numeric_series.dropna()
        if len(valid) == 0:
            weighted_mean = 0.0
        else:
            weighted_mean = round(float(valid.mean()), 2)

        # Decision flag
        decision = (
            "Positive Effect"
            if weighted_mean >= DECISION_THRESHOLD
            else "Negative Effect"
        )

        all_means.append(weighted_mean)

        # Track section means
        if section not in section_means:
            section_means[section] = []
        section_means[section].append(weighted_mean)

        # Truncate statement for cleaner display (remove the item number prefix)
        statement = col

        items_result.append(
            {
                "item_number": item_num,
                "statement": statement,
                "section": section,
                "frequencies": frequencies,
                "total_responses": int(valid.count()),
                "weighted_mean": weighted_mean,
                "decision": decision,
            }
        )

        logger.info(
            "Likert Item %d: mean=%.2f → %s", item_num, weighted_mean, decision
        )

    # Compute overall (grand) mean
    overall_mean = round(sum(all_means) / len(all_means), 2) if all_means else 0.0

    # Compute section means
    section_summaries = {}
    for section_name, means_list in section_means.items():
        section_summaries[section_name] = round(
            sum(means_list) / len(means_list), 2
        )

    return {
        "items": items_result,
        "overall_mean": overall_mean,
        "section_means": section_summaries,
    }

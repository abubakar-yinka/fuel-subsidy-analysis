"""
Demographic frequency analysis module.

Computes frequency counts and percentages for each demographic variable
(Section A, Items 1–6).
"""

import logging
from typing import Any, Dict, List

import pandas as pd

logger = logging.getLogger(__name__)

# Mapping of JSON keys to DataFrame column names
DEMOGRAPHIC_COLUMNS = {
    "sex": "1. Sex",
    "age_group": "2. Age Group",
    "marital_status": "3. Marital Status",
    "professional_cadre": "4. Professional Cadre (Strata)",
    "work_experience": "5. Years of Work Experience",
    "income_level": "6. Estimated Monthly Income / Grade Level",
}

# Preferred display order for each demographic variable
DISPLAY_ORDER = {
    "sex": ["Male", "Female"],
    "age_group": [
        "20 – 29 years",
        "30 – 39 years",
        "40 – 49 years",
        "50 years and above",
    ],
    "marital_status": ["Single", "Married", "Divorced / Separated", "Widowed"],
    "professional_cadre": [
        "Doctor",
        "Nurse / Midwife",
        "Pharmacist",
        "Laboratory Scientist",
        "Radiologist / Other Clinical Staff",
    ],
    "work_experience": [
        "Under 5 years",
        "5 – 10 years",
        "11 – 15 years",
        "Above 15 years",
    ],
    "income_level": [
        "Low Income (CONHESS 1-6 / CONMESS 1)",
        "Middle Income (CONHESS 7-11 / CONMESS 2-4)",
        "High Income (CONHESS 12+ / CONMESS 5+)",
    ],
}


def analyze_demographics(df: pd.DataFrame) -> Dict[str, List[Dict[str, Any]]]:
    """
    Compute frequency tables for all demographic variables.

    Args:
        df: Imputed DataFrame.

    Returns:
        Dictionary keyed by demographic variable (e.g., 'sex') with list of
        dicts containing 'category', 'count', and 'percentage'.
    """
    total = len(df)
    result: Dict[str, List[Dict[str, Any]]] = {}

    for key, col_name in DEMOGRAPHIC_COLUMNS.items():
        if col_name not in df.columns:
            logger.warning("Demographic column '%s' not found.", col_name)
            continue

        counts = df[col_name].value_counts()

        # Order according to preferred display order if available
        order = DISPLAY_ORDER.get(key)
        if order:
            # Reindex to get preferred order, filling missing categories with 0
            counts = counts.reindex(order, fill_value=0)

        entries = []
        for category, count in counts.items():
            entries.append(
                {
                    "category": str(category),
                    "count": int(count),
                    "percentage": round((int(count) / total) * 100, 1),
                }
            )

        result[key] = entries
        logger.info("Demographics '%s': %d categories computed.", key, len(entries))

    return result

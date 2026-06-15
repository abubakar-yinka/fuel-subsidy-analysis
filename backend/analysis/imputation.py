"""
Proportional stochastic imputation module.

For each demographic/knowledge column with missing values, computes the
observed category distribution and randomly assigns missing values according
to those proportions. This preserves cohort variance while filling gaps.
"""

import logging
from typing import Dict, List

import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)

# Columns eligible for imputation (demographics + knowledge)
IMPUTATION_COLUMNS = [
    "1. Sex",
    "2. Age Group",
    "3. Marital Status",
    "4. Professional Cadre (Strata)",
    "5. Years of Work Experience",
    "6. Estimated Monthly Income / Grade Level",
    "7. Are you aware of the official removal of the fuel subsidy in May 2023?",
    "8. How would you rate your understanding of the relationship between fuel subsidy removal and hospital operational costs?",
    "9. Do you believe that fuel subsidy removal indirectly increases the financial burden on patients?",
]

RANDOM_SEED = 42


def impute(df: pd.DataFrame) -> tuple[pd.DataFrame, List[Dict]]:
    """
    Apply proportional stochastic imputation to eligible columns.

    Args:
        df: Cleaned DataFrame (non-respondents already removed).

    Returns:
        Tuple of (imputed DataFrame, list of imputation logs).
        Each log entry is a dict with column name and number of values imputed.
    """
    rng = np.random.default_rng(RANDOM_SEED)
    df_imputed = df.copy()
    imputation_log: List[Dict] = []

    for col in IMPUTATION_COLUMNS:
        if col not in df_imputed.columns:
            logger.warning("Imputation column '%s' not found, skipping.", col)
            continue

        missing_mask = df_imputed[col].isna()
        n_missing = int(missing_mask.sum())

        if n_missing == 0:
            continue

        # Compute observed distribution from non-missing values
        observed = df_imputed.loc[~missing_mask, col]
        value_counts = observed.value_counts(normalize=True)
        categories = value_counts.index.tolist()
        probabilities = value_counts.values

        # Randomly assign missing values according to observed proportions
        imputed_values = rng.choice(categories, size=n_missing, p=probabilities)
        df_imputed.loc[missing_mask, col] = imputed_values

        logger.info(
            "Imputed %d missing values in '%s' using proportional stochastic method.",
            n_missing,
            col,
        )
        imputation_log.append({"column": col, "imputed_count": n_missing})

    return df_imputed, imputation_log

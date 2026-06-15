"""
Inferential statistics module.

Performs chi-square tests of independence between Professional Cadre and:
  A) Knowledge items (7–9) — raw response categories
  B) Binarized Likert items (10–15) — SA+A → Impacted, D+SD → Not Impacted

Automatically falls back to Fisher's Exact test when expected cell
frequencies drop below 5.
"""

import logging
from typing import Any, Dict, List, Optional

import numpy as np
import pandas as pd
from scipy.stats import chi2_contingency, fisher_exact

logger = logging.getLogger(__name__)

CADRE_COLUMN = "4. Professional Cadre (Strata)"

# Knowledge items to test against Cadre
KNOWLEDGE_COLUMNS = {
    "Item 7": "7. Are you aware of the official removal of the fuel subsidy in May 2023?",
    "Item 8": "8. How would you rate your understanding of the relationship between fuel subsidy removal and hospital operational costs?",
    "Item 9": "9. Do you believe that fuel subsidy removal indirectly increases the financial burden on patients?",
}

KNOWLEDGE_LABELS = {
    "Item 7": "Fuel Subsidy Awareness",
    "Item 8": "Understanding of Subsidy–Hospital Cost Link",
    "Item 9": "Belief in Increased Patient Financial Burden",
}

# Likert items to binarize and test against Cadre
LIKERT_COLUMNS = {
    "Item 10": "10. The 35% wage award is insufficient to offset the high cost of transportation.",
    "Item 11": "11. Increased operational costs in the hospital hinder my professional efficiency.",
    "Item 12": "12. Increased fuel costs have significantly reduced my disposable household income.",
    "Item 13": "13. High commuting costs have forced me to alter my nutrition, healthcare, or housing expenditure.",
    "Item 14": "14. Economic strain and commuting difficulties have increased my physical and mental fatigue.",
    "Item 15": "15. Financial constraints limit my ability to attend professional clinical trainings.",
}

LIKERT_LABELS = {
    "Item 10": "Wage Award Insufficiency",
    "Item 11": "Operational Cost Hindrance",
    "Item 12": "Reduced Disposable Income",
    "Item 13": "Altered Living Expenditure",
    "Item 14": "Physical & Mental Fatigue",
    "Item 15": "Limited Professional Training Access",
}

# Binarization mapping
LIKERT_MAP = {
    "Strongly Agree (SA)": 4,
    "Agree (A)": 3,
    "Disagree (D)": 2,
    "Strongly Disagree (SD)": 1,
}

SIGNIFICANCE_LEVEL = 0.05


def _run_chi_square_test(
    contingency_table: pd.DataFrame,
    test_name: str,
    variables: str,
) -> Dict[str, Any]:
    """
    Run chi-square test with automatic Fisher's Exact fallback.

    Args:
        contingency_table: Pandas crosstab DataFrame.
        test_name: Human-readable name for the test.
        variables: Description of the variables being tested.

    Returns:
        Dictionary with test results.
    """
    observed = contingency_table.values

    # Run chi-square to get expected frequencies
    try:
        chi2, p_value, dof, expected = chi2_contingency(observed)
    except ValueError as exc:
        # Handle edge cases (e.g., zero-sum rows/columns)
        return {
            "test_name": test_name,
            "variables": variables,
            "chi2": None,
            "p_value": None,
            "dof": None,
            "significant": None,
            "method": "error",
            "note": f"Test could not be computed: {exc}",
        }

    # Check for low expected frequencies
    min_expected = float(np.min(expected))
    low_expected_cells = int(np.sum(expected < 5))
    total_cells = expected.size
    note: Optional[str] = None

    method = "Chi-Square"

    if low_expected_cells > 0:
        # If 2x2 table, use Fisher's Exact
        if observed.shape == (2, 2):
            try:
                _, p_value_fisher = fisher_exact(observed)
                method = "Fisher's Exact"
                p_value = p_value_fisher
                note = (
                    f"{low_expected_cells}/{total_cells} cells had expected "
                    f"frequency < 5 (min={min_expected:.1f}). "
                    f"Used Fisher's Exact test."
                )
                logger.info("Fisher's Exact used for '%s'.", test_name)
            except Exception:
                # If Fisher's fails, keep chi-square with warning
                note = (
                    f"{low_expected_cells}/{total_cells} cells had expected "
                    f"frequency < 5 (min={min_expected:.1f}). "
                    f"Fisher's Exact failed; chi-square result retained with caution."
                )
        else:
            # For larger tables, report warning with chi-square
            note = (
                f"{low_expected_cells}/{total_cells} cells had expected "
                f"frequency < 5 (min={min_expected:.1f}). "
                f"Chi-square result should be interpreted with caution."
            )
            logger.warning(
                "Low expected frequencies in '%s': %d/%d cells < 5.",
                test_name,
                low_expected_cells,
                total_cells,
            )

    significant = bool(p_value < SIGNIFICANCE_LEVEL)

    return {
        "test_name": test_name,
        "variables": variables,
        "chi2": round(float(chi2), 4),
        "p_value": round(float(p_value), 4),
        "dof": int(dof),
        "significant": significant,
        "method": method,
        "note": note,
    }


def run_inferential_tests(df: pd.DataFrame) -> Dict[str, List[Dict[str, Any]]]:
    """
    Run all chi-square / Fisher's Exact tests.

    Args:
        df: Imputed DataFrame.

    Returns:
        Dictionary with 'chi_square_tests' containing list of test result dicts.
    """
    if CADRE_COLUMN not in df.columns:
        logger.error("Cadre column '%s' not found.", CADRE_COLUMN)
        return {"chi_square_tests": []}

    results: List[Dict[str, Any]] = []

    # ── A. Knowledge items (7–9) vs. Cadre ──────────────────────────────
    for item_key, col_name in KNOWLEDGE_COLUMNS.items():
        if col_name not in df.columns:
            logger.warning("Knowledge column '%s' not found.", col_name)
            continue

        label = KNOWLEDGE_LABELS[item_key]
        test_name = f"Professional Cadre × {label}"
        variables = f"Cadre × {item_key}"

        contingency = pd.crosstab(df[CADRE_COLUMN], df[col_name])
        test_result = _run_chi_square_test(contingency, test_name, variables)
        results.append(test_result)

    # ── B. Binarized Likert items (10–15) vs. Cadre ─────────────────────
    for item_key, col_name in LIKERT_COLUMNS.items():
        if col_name not in df.columns:
            logger.warning("Likert column '%s' not found.", col_name)
            continue

        label = LIKERT_LABELS[item_key]
        test_name = f"Professional Cadre × {label} (Binarized)"
        variables = f"Cadre × {item_key} (Impacted vs Not Impacted)"

        # Binarize: SA + A → "Impacted", D + SD → "Not Impacted"
        numeric_series = df[col_name].map(LIKERT_MAP)
        binary_series = numeric_series.apply(
            lambda x: "Impacted" if x >= 3 else "Not Impacted" if pd.notna(x) else None
        )

        # Drop rows where binarization failed
        valid_mask = binary_series.notna()
        df_valid = df.loc[valid_mask].copy()
        df_valid["_binary"] = binary_series[valid_mask]

        if df_valid["_binary"].nunique() < 2:
            results.append(
                {
                    "test_name": test_name,
                    "variables": variables,
                    "chi2": None,
                    "p_value": None,
                    "dof": None,
                    "significant": None,
                    "method": "skipped",
                    "note": "Only one outcome category present after binarization.",
                }
            )
            continue

        contingency = pd.crosstab(df_valid[CADRE_COLUMN], df_valid["_binary"])
        test_result = _run_chi_square_test(contingency, test_name, variables)
        results.append(test_result)

    logger.info("Completed %d inferential tests.", len(results))
    return {"chi_square_tests": results}

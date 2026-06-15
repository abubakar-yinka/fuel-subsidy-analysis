"""
Data ingestion and cleaning module.

Reads the KoboToolbox Excel export, drops metadata columns,
separates non-respondent rows (participants who did not consent),
fills NaN in boolean sub-columns with 0.0, and returns a cleaned DataFrame
along with response-rate metadata.
"""

import io
import logging
from dataclasses import dataclass

import pandas as pd

logger = logging.getLogger(__name__)

# KoboToolbox metadata columns to drop
METADATA_COLUMNS = [
    "INFORMED CONSENT",
    "May we begin?",
    "_id",
    "_uuid",
    "_submission_time",
    "_validation_status",
    "_notes",
    "_status",
    "_submitted_by",
    "__version__",
    "_tags",
    "meta/rootUuid",
    "_index",
]

# Columns that define "survey content" — if ALL are null, the row is a non-respondent
SURVEY_MARKER_COLUMN = "1. Sex"


@dataclass
class IngestionResult:
    """Result of ingesting the uploaded Excel file."""

    df: pd.DataFrame
    total_sample_size: int
    completed_responses: int
    non_respondents: int
    response_rate: float


def ingest(file_bytes: bytes) -> IngestionResult:
    """
    Ingest the uploaded Excel file and return a cleaned DataFrame.

    Args:
        file_bytes: Raw bytes of the uploaded .xlsx file.

    Returns:
        IngestionResult with cleaned DataFrame and response metadata.

    Raises:
        ValueError: If the file cannot be read or is missing expected columns.
    """
    # Read the Excel file from an in-memory buffer
    try:
        buffer = io.BytesIO(file_bytes)
        df = pd.read_excel(buffer, engine="openpyxl")
    except Exception as exc:
        raise ValueError(f"Failed to read Excel file: {exc}") from exc

    total_sample_size = len(df)
    logger.info("Loaded %d rows from uploaded file.", total_sample_size)

    # Drop KoboToolbox metadata columns (ignore missing ones silently)
    cols_to_drop = [c for c in METADATA_COLUMNS if c in df.columns]
    df = df.drop(columns=cols_to_drop)

    # Validate that critical survey columns exist
    if SURVEY_MARKER_COLUMN not in df.columns:
        raise ValueError(
            f"Expected column '{SURVEY_MARKER_COLUMN}' not found. "
            f"Available columns: {list(df.columns[:10])}..."
        )

    # ── Separate non-respondents ──────────────────────────────────────────
    # Non-respondents are rows where the first survey question is null
    # (participants who did not consent)
    non_respondent_mask = df[SURVEY_MARKER_COLUMN].isna()
    non_respondents = int(non_respondent_mask.sum())
    df_clean = df[~non_respondent_mask].copy()
    completed_responses = len(df_clean)

    logger.info(
        "Non-respondents (no consent): %d | Completed: %d",
        non_respondents,
        completed_responses,
    )

    # ── Fill NaN in boolean sub-columns with 0.0 ─────────────────────────
    # KoboToolbox sometimes leaves unselected multi-select options as NaN
    # rather than 0.0. Identify boolean sub-columns by the "/" separator.
    boolean_cols = [c for c in df_clean.columns if "/" in c]
    if boolean_cols:
        df_clean[boolean_cols] = df_clean[boolean_cols].fillna(0.0)
        logger.info(
            "Filled NaN with 0.0 in %d boolean sub-columns.", len(boolean_cols)
        )

    # Calculate response rate
    response_rate = round((completed_responses / total_sample_size) * 100, 1)

    return IngestionResult(
        df=df_clean,
        total_sample_size=total_sample_size,
        completed_responses=completed_responses,
        non_respondents=non_respondents,
        response_rate=response_rate,
    )

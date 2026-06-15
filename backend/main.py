"""
FastAPI application for the Fuel Subsidy Research Analysis Engine.

Provides a POST /api/analyze endpoint that accepts an uploaded .xlsx file,
runs the full analysis pipeline, and returns JSON results with a base64-encoded
Excel report.
"""

import base64
import logging

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from analysis.boolean_agg import aggregate_boolean
from analysis.demographics import analyze_demographics
from analysis.imputation import impute
from analysis.inferential import run_inferential_tests
from analysis.ingestion import ingest
from analysis.likert import analyze_likert
from analysis.report import generate_report

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

# ── FastAPI App ───────────────────────────────────────────────────────────────
app = FastAPI(
    title="Fuel Subsidy Research Analysis API",
    description="Statistical analysis engine for Chapter 4 of the fuel subsidy removal study.",
    version="1.0.0",
)

# ── CORS Configuration ───────────────────────────────────────────────────────
# Explicitly allow the Next.js frontend origin for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Knowledge items analysis (parallels demographics structure)
KNOWLEDGE_COLUMNS = {
    "awareness": {
        "column": "7. Are you aware of the official removal of the fuel subsidy in May 2023?",
        "order": ["Yes", "No"],
    },
    "understanding": {
        "column": "8. How would you rate your understanding of the relationship between fuel subsidy removal and hospital operational costs?",
        "order": ["High Understanding", "Moderate Understanding", "Low Understanding"],
    },
    "financial_burden": {
        "column": "9. Do you believe that fuel subsidy removal indirectly increases the financial burden on patients?",
        "order": ["Yes", "No", "Uncertain"],
    },
}


def _analyze_knowledge(df):
    """Compute frequency tables for knowledge/awareness items (Section B)."""
    total = len(df)
    result = {}

    for key, config in KNOWLEDGE_COLUMNS.items():
        col_name = config["column"]
        order = config["order"]

        if col_name not in df.columns:
            continue

        counts = df[col_name].value_counts()
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

    return result


@app.post("/api/analyze")
async def analyze(file: UploadFile = File(...)):
    """
    Upload a KoboToolbox .xlsx export and receive full Chapter 4 analysis.

    Returns JSON with demographics, knowledge, Likert analysis, coping
    strategies, inferential statistics, and a base64-encoded Excel report.
    """
    # ── Validate file type ────────────────────────────────────────────────
    if not file.filename or not file.filename.endswith(".xlsx"):
        raise HTTPException(
            status_code=400,
            detail="Invalid file type. Please upload an .xlsx file.",
        )

    # ── Read file bytes ───────────────────────────────────────────────────
    try:
        file_bytes = await file.read()
    except Exception as exc:
        raise HTTPException(
            status_code=400,
            detail=f"Failed to read uploaded file: {exc}",
        )

    if len(file_bytes) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    # ── Step 1: Ingest ────────────────────────────────────────────────────
    try:
        ingestion_result = ingest(file_bytes)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))

    df = ingestion_result.df
    logger.info(
        "Ingestion complete. %d completed responses.",
        ingestion_result.completed_responses,
    )

    # ── Step 2: Impute ────────────────────────────────────────────────────
    df_imputed, imputation_log = impute(df)
    logger.info("Imputation complete. %d columns imputed.", len(imputation_log))

    # ── Step 3: Analyze Demographics ──────────────────────────────────────
    demographics = analyze_demographics(df_imputed)

    # ── Step 4: Analyze Knowledge ─────────────────────────────────────────
    knowledge = _analyze_knowledge(df_imputed)

    # ── Step 5: Analyze Likert ────────────────────────────────────────────
    likert = analyze_likert(df_imputed)

    # ── Step 6: Aggregate Coping Strategies ───────────────────────────────
    coping = aggregate_boolean(df_imputed)

    # ── Step 7: Inferential Statistics ────────────────────────────────────
    inferential = run_inferential_tests(df_imputed)

    # ── Step 8: Generate Excel Report ─────────────────────────────────────
    metadata = {
        "total_sample_size": ingestion_result.total_sample_size,
        "completed_responses": ingestion_result.completed_responses,
        "non_respondents": ingestion_result.non_respondents,
        "response_rate": ingestion_result.response_rate,
    }

    report_bytes = generate_report(
        metadata=metadata,
        demographics=demographics,
        knowledge=knowledge,
        likert=likert,
        coping=coping,
        inferential=inferential,
    )
    report_base64 = base64.b64encode(report_bytes).decode("utf-8")

    # ── Build response payload ────────────────────────────────────────────
    payload = {
        "metadata": metadata,
        "demographics": demographics,
        "knowledge": knowledge,
        "likert": likert,
        "coping_strategies": coping,
        "inferential": inferential,
        "report_base64": report_base64,
    }

    logger.info("Analysis complete. Returning payload.")
    return payload


@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "fuel-subsidy-analysis"}

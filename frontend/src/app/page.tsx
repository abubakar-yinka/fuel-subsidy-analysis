/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import axios from "axios";
import FileUpload from "./components/FileUpload";
import DemographicsTable from "./components/DemographicsTable";
import KnowledgeCharts from "./components/KnowledgeCharts";
import LikertDashboard from "./components/LikertDashboard";
import CopingStrategies from "./components/CopingStrategies";
import InferentialStats from "./components/InferentialStats";
import DownloadButton from "./components/DownloadButton";

type AppState = "idle" | "uploading" | "results" | "error";

interface AnalysisResult {
  metadata: {
    total_sample_size: number;
    completed_responses: number;
    non_respondents: number;
    response_rate: number;
  };
  demographics: any;
  knowledge: any;
  likert: any;
  coping_strategies: any;
  inferential: any;
  report_base64: string;
}

export default function Home() {
  const [state, setState] = useState<AppState>("idle");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (file: File) => {
    setState("uploading");
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post<AnalysisResult>(
        "/api/analyze",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          timeout: 120000,
        }
      );

      setResult(response.data);
      setState("results");
    } catch (err: any) {
      const message =
        err.response?.data?.detail ||
        err.message ||
        "An unexpected error occurred.";
      setError(message);
      setState("error");
    }
  };

  const handleReset = () => {
    setState("idle");
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-navy-900/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h1
                className="font-heading text-lg sm:text-xl font-bold gradient-text cursor-pointer"
                onClick={handleReset}
              >
                Research Analysis Dashboard
              </h1>
              <p className="text-xs text-white/40 mt-0.5">
                Fuel Subsidy Removal Impact Study — Chapter 4 Analysis
              </p>
            </div>

            {state === "results" && result && (
              <div className="flex items-center gap-4">
                <button
                  onClick={handleReset}
                  className="text-xs text-white/40 hover:text-white/70 transition-colors px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/20"
                >
                  ← New Analysis
                </button>
                <DownloadButton reportBase64={result.report_base64} />
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Main Content ────────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Idle / Upload State */}
        {(state === "idle" || state === "uploading") && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
            {/* Hero */}
            <div className="text-center max-w-2xl animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-300 text-xs font-medium">
                  Statistical Analysis Engine
                </span>
              </div>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white mb-4">
                Perceived Effects of{" "}
                <span className="gradient-text">Fuel Subsidy Removal</span>
              </h2>
              <p className="text-white/50 text-sm leading-relaxed">
                Upload your KoboToolbox dataset to automatically generate
                demographic frequencies, Likert-scale weighted means, chi-square
                tests, and a publication-ready Excel report for Chapter 4.
              </p>
            </div>

            {/* Upload Zone */}
            <FileUpload
              onUpload={handleUpload}
              isUploading={state === "uploading"}
            />

            {/* Feature pills */}
            {state === "idle" && (
              <div className="flex flex-wrap justify-center gap-3 animate-fade-in-up delay-200">
                {[
                  "Demographic Analysis",
                  "Likert Weighted Means",
                  "Chi-Square Tests",
                  "Coping Strategies",
                  "Excel Report",
                ].map((feature) => (
                  <span
                    key={feature}
                    className="px-3 py-1.5 text-xs text-white/40 bg-white/3 border border-white/5 rounded-full"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Error State */}
        {state === "error" && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 animate-fade-in-up">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-rose-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <div className="text-center max-w-md">
              <h3 className="text-lg font-semibold text-white mb-2">
                Analysis Failed
              </h3>
              <p className="text-white/50 text-sm mb-6">{error}</p>
              <button
                onClick={handleReset}
                className="btn-download"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Results State */}
        {state === "results" && result && (
          <div className="space-y-8">
            {/* Response Rate Banner */}
            <div className="glass-card p-5 animate-fade-in-up">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">
                    Response Metrics
                  </h3>
                  <p className="text-xs text-white/30 mt-1">
                    Sample overview and response rate
                  </p>
                </div>
                <div className="flex flex-wrap gap-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">
                      {result.metadata.total_sample_size}
                    </p>
                    <p className="text-xs text-white/40">
                      Total Sample
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-emerald-400">
                      {result.metadata.completed_responses}
                    </p>
                    <p className="text-xs text-white/40">
                      Completed
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-rose-400">
                      {result.metadata.non_respondents}
                    </p>
                    <p className="text-xs text-white/40">
                      Non-Consent
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold gradient-text">
                      {result.metadata.response_rate}%
                    </p>
                    <p className="text-xs text-white/40">
                      Response Rate
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Dashboard Sections */}
            <DemographicsTable data={result.demographics} />
            <KnowledgeCharts data={result.knowledge} />
            <LikertDashboard data={result.likert} />
            <CopingStrategies data={result.coping_strategies} />
            <InferentialStats data={result.inferential} />

            {/* Bottom Download CTA */}
            <div className="glass-card p-8 text-center animate-fade-in-up delay-500">
              <h3 className="font-heading text-xl font-bold text-white mb-2">
                Analysis Complete
              </h3>
              <p className="text-white/50 text-sm mb-6 max-w-md mx-auto">
                All statistical computations have been processed. Download the
                publication-ready Excel report containing all tables and results.
              </p>
              <DownloadButton reportBase64={result.report_base64} />
            </div>
          </div>
        )}
      </main>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/5 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-xs text-white/20">
            Research Analysis Dashboard • Prince Audu Abubakar University Teaching
            Hospital, Anyigba • {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}

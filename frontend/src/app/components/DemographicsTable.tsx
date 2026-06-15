"use client";

import { useState } from "react";

interface DemographicEntry {
  category: string;
  count: number;
  percentage: number;
}

interface DemographicsTableProps {
  data: {
    sex: DemographicEntry[];
    age_group: DemographicEntry[];
    marital_status: DemographicEntry[];
    professional_cadre: DemographicEntry[];
    work_experience: DemographicEntry[];
    income_level: DemographicEntry[];
  };
}

const TAB_CONFIG = [
  { key: "sex", label: "Sex" },
  { key: "age_group", label: "Age Group" },
  { key: "marital_status", label: "Marital Status" },
  { key: "professional_cadre", label: "Professional Cadre" },
  { key: "work_experience", label: "Work Experience" },
  { key: "income_level", label: "Income Level" },
] as const;

export default function DemographicsTable({ data }: DemographicsTableProps) {
  const [activeTab, setActiveTab] = useState<string>("sex");

  const activeData = data[activeTab as keyof typeof data] || [];
  const totalCount = activeData.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="glass-card p-6 animate-fade-in-up">
      <h2 className="section-header gradient-text">
        Section A: Demographic Profile
      </h2>
      <p className="section-subtitle">
        Socio-demographic characteristics of respondents
      </p>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 mb-6">
        {TAB_CONFIG.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`tab-button ${activeTab === tab.key ? "active" : ""}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Data Table */}
      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Category</th>
              <th style={{ textAlign: "center" }}>Frequency (n)</th>
              <th style={{ textAlign: "center" }}>Percentage (%)</th>
              <th style={{ width: "40%" }}>Distribution</th>
            </tr>
          </thead>
          <tbody>
            {activeData.map((item, index) => (
              <tr
                key={item.category}
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <td className="font-medium text-white/90">{item.category}</td>
                <td style={{ textAlign: "center" }}>{item.count}</td>
                <td style={{ textAlign: "center" }}>{item.percentage}%</td>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full gradient-emerald transition-all duration-700 ease-out"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                </td>
              </tr>
            ))}
            {/* Total row */}
            <tr className="border-t border-white/10">
              <td className="font-bold text-white">Total</td>
              <td style={{ textAlign: "center" }} className="font-bold text-white">
                {totalCount}
              </td>
              <td style={{ textAlign: "center" }} className="font-bold text-white">
                100.0%
              </td>
              <td />
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

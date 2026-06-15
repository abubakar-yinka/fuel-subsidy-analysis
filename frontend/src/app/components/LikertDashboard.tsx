"use client";

interface LikertItem {
  item_number: number;
  statement: string;
  section: string;
  frequencies: {
    SA: number;
    A: number;
    D: number;
    SD: number;
  };
  total_responses: number;
  weighted_mean: number;
  decision: string;
}

interface LikertDashboardProps {
  data: {
    items: LikertItem[];
    overall_mean: number;
    section_means: Record<string, number>;
  };
}

const LIKERT_COLORS = {
  SA: "#10b981",
  A: "#06b6d4",
  D: "#f59e0b",
  SD: "#f43f5e",
};

const LIKERT_LABELS = {
  SA: "Strongly Agree",
  A: "Agree",
  D: "Disagree",
  SD: "Strongly Disagree",
};

export default function LikertDashboard({ data }: LikertDashboardProps) {
  const { items, overall_mean, section_means } = data;

  // Group items by section
  const sections = items.reduce<Record<string, LikertItem[]>>((acc, item) => {
    if (!acc[item.section]) acc[item.section] = [];
    acc[item.section].push(item);
    return acc;
  }, {});

  return (
    <div className="glass-card p-6 animate-fade-in-up delay-200">
      <h2 className="section-header gradient-text">
        Section C: Perceived Effects
      </h2>
      <p className="section-subtitle">
        Weighted mean analysis of socio-economic and physical effects on health workers
      </p>

      {/* Grand Mean Summary */}
      <div className="glass-card p-5 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-white/50 text-sm font-medium uppercase tracking-wider">
              Overall Grand Mean
            </p>
            <p className="text-xs text-white/30 mt-1">
              Across all 6 Likert items (threshold: 2.50)
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p
                className={`text-3xl font-bold ${
                  overall_mean >= 2.5 ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {overall_mean.toFixed(2)}
              </p>
            </div>
            <span
              className={`badge ${
                overall_mean >= 2.5 ? "badge-positive" : "badge-negative"
              }`}
            >
              {overall_mean >= 2.5 ? "Positive Effect" : "Negative Effect"}
            </span>
          </div>
        </div>
        {/* Mean gauge bar */}
        <div className="mt-4">
          <div className="relative h-3 bg-white/5 rounded-full overflow-hidden">
            <div
              className={`absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out ${
                overall_mean >= 2.5 ? "gradient-emerald" : "gradient-rose"
              }`}
              style={{ width: `${(overall_mean / 4) * 100}%` }}
            />
            {/* Threshold marker */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-white/30"
              style={{ left: "62.5%" }}
              title="Threshold: 2.50"
            />
          </div>
          <div className="flex justify-between mt-1.5 text-xs text-white/30">
            <span>1.00</span>
            <span className="text-white/50">2.50</span>
            <span>4.00</span>
          </div>
        </div>
      </div>

      {/* Section Means */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {Object.entries(section_means).map(([section, mean]) => (
          <div key={section} className="glass-card p-4">
            <p className="text-xs text-white/40 font-medium uppercase tracking-wider mb-2">
              {section}
            </p>
            <div className="flex items-center gap-3">
              <span
                className={`text-2xl font-bold ${
                  mean >= 2.5 ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {mean.toFixed(2)}
              </span>
              <span
                className={`badge text-xs ${
                  mean >= 2.5 ? "badge-positive" : "badge-negative"
                }`}
              >
                {mean >= 2.5 ? "Positive" : "Negative"}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-6">
        {(Object.entries(LIKERT_COLORS) as [keyof typeof LIKERT_COLORS, string][]).map(
          ([key, color]) => (
            <div key={key} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: color }}
              />
              <span className="text-xs text-white/50">
                {LIKERT_LABELS[key]}
              </span>
            </div>
          )
        )}
      </div>

      {/* Items by Section */}
      {Object.entries(sections).map(([sectionName, sectionItems]) => (
        <div key={sectionName} className="mb-8 last:mb-0">
          <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4 flex items-center gap-2">
            <div className="h-px flex-1 bg-white/8" />
            <span>{sectionName}</span>
            <div className="h-px flex-1 bg-white/8" />
          </h3>

          <div className="space-y-4">
            {sectionItems.map((item, index) => {
              const total =
                item.frequencies.SA +
                item.frequencies.A +
                item.frequencies.D +
                item.frequencies.SD;
              const pctSA = (item.frequencies.SA / total) * 100;
              const pctA = (item.frequencies.A / total) * 100;
              const pctD = (item.frequencies.D / total) * 100;
              const pctSD = (item.frequencies.SD / total) * 100;

              return (
                <div
                  key={item.item_number}
                  className="glass-card p-4 animate-fade-in-up"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Item number */}
                    <div className="shrink-0 w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                      <span className="text-sm font-bold text-white/60">
                        {item.item_number}
                      </span>
                    </div>

                    {/* Statement & bar */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white/80 mb-3 leading-relaxed">
                        {item.statement}
                      </p>

                      {/* Stacked horizontal bar */}
                      <div className="flex h-4 rounded-full overflow-hidden bg-white/5">
                        <div
                          className="transition-all duration-700"
                          style={{
                            width: `${pctSA}%`,
                            backgroundColor: LIKERT_COLORS.SA,
                          }}
                          title={`SA: ${item.frequencies.SA} (${pctSA.toFixed(1)}%)`}
                        />
                        <div
                          className="transition-all duration-700"
                          style={{
                            width: `${pctA}%`,
                            backgroundColor: LIKERT_COLORS.A,
                          }}
                          title={`A: ${item.frequencies.A} (${pctA.toFixed(1)}%)`}
                        />
                        <div
                          className="transition-all duration-700"
                          style={{
                            width: `${pctD}%`,
                            backgroundColor: LIKERT_COLORS.D,
                          }}
                          title={`D: ${item.frequencies.D} (${pctD.toFixed(1)}%)`}
                        />
                        <div
                          className="transition-all duration-700"
                          style={{
                            width: `${pctSD}%`,
                            backgroundColor: LIKERT_COLORS.SD,
                          }}
                          title={`SD: ${item.frequencies.SD} (${pctSD.toFixed(1)}%)`}
                        />
                      </div>

                      {/* Frequency labels */}
                      <div className="flex gap-4 mt-2 text-xs text-white/40">
                        <span>
                          SA:{" "}
                          <span className="text-white/70 font-medium">
                            {item.frequencies.SA}
                          </span>
                        </span>
                        <span>
                          A:{" "}
                          <span className="text-white/70 font-medium">
                            {item.frequencies.A}
                          </span>
                        </span>
                        <span>
                          D:{" "}
                          <span className="text-white/70 font-medium">
                            {item.frequencies.D}
                          </span>
                        </span>
                        <span>
                          SD:{" "}
                          <span className="text-white/70 font-medium">
                            {item.frequencies.SD}
                          </span>
                        </span>
                      </div>
                    </div>

                    {/* Mean & Decision */}
                    <div className="shrink-0 flex items-center gap-3 lg:flex-col lg:items-end lg:gap-2">
                      <p
                        className={`text-2xl font-bold ${
                          item.weighted_mean >= 2.5
                            ? "text-emerald-400"
                            : "text-rose-400"
                        }`}
                      >
                        {item.weighted_mean.toFixed(2)}
                      </p>
                      <span
                        className={`badge text-xs ${
                          item.decision === "Positive Effect"
                            ? "badge-positive"
                            : "badge-negative"
                        }`}
                      >
                        {item.decision}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

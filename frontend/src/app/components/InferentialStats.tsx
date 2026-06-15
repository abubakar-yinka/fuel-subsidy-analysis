"use client";

interface ChiSquareTest {
  test_name: string;
  variables: string;
  chi2: number | null;
  p_value: number | null;
  dof: number | null;
  significant: boolean | null;
  method: string;
  note: string | null;
}

interface InferentialStatsProps {
  data: {
    chi_square_tests: ChiSquareTest[];
  };
}

export default function InferentialStats({ data }: InferentialStatsProps) {
  const { chi_square_tests } = data;

  // Separate tests into knowledge vs. binarized likert
  const knowledgeTests = chi_square_tests.filter(
    (t) => !t.test_name.includes("(Binarized)")
  );
  const likertTests = chi_square_tests.filter((t) =>
    t.test_name.includes("(Binarized)")
  );

  const renderTestTable = (tests: ChiSquareTest[], title: string, description: string) => (
    <div className="glass-card p-5 mb-6">
      <h3 className="text-sm font-semibold text-white/70 mb-1">{title}</h3>
      <p className="text-xs text-white/40 mb-4">{description}</p>

      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Test</th>
              <th style={{ textAlign: "center" }}>χ² Statistic</th>
              <th style={{ textAlign: "center" }}>df</th>
              <th style={{ textAlign: "center" }}>p-value</th>
              <th style={{ textAlign: "center" }}>Significant</th>
              <th style={{ textAlign: "center" }}>Method</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {tests.map((test, index) => (
              <tr
                key={index}
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <td className="font-medium text-white/80 max-w-xs">
                  {test.test_name}
                </td>
                <td style={{ textAlign: "center" }} className="font-mono">
                  {test.chi2 !== null ? test.chi2.toFixed(4) : "N/A"}
                </td>
                <td style={{ textAlign: "center" }} className="font-mono">
                  {test.dof !== null ? test.dof : "N/A"}
                </td>
                <td style={{ textAlign: "center" }}>
                  <span
                    className={`font-mono font-semibold ${
                      test.p_value !== null && test.p_value < 0.05
                        ? "text-emerald-400"
                        : "text-white/60"
                    }`}
                  >
                    {test.p_value !== null ? test.p_value.toFixed(4) : "N/A"}
                  </span>
                </td>
                <td style={{ textAlign: "center" }}>
                  {test.significant !== null ? (
                    <span
                      className={`badge text-xs ${
                        test.significant
                          ? "badge-significant"
                          : "badge-not-significant"
                      }`}
                    >
                      {test.significant ? "Yes" : "No"}
                    </span>
                  ) : (
                    <span className="text-white/30">N/A</span>
                  )}
                </td>
                <td style={{ textAlign: "center" }}>
                  <span className="badge badge-neutral text-xs">
                    {test.method}
                  </span>
                </td>
                <td className="text-xs text-white/40 max-w-xs">
                  {test.note || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="glass-card p-6 animate-fade-in-up delay-400">
      <h2 className="section-header gradient-text">
        Inferential Statistics
      </h2>
      <p className="section-subtitle">
        Chi-Square tests of independence between Professional Cadre and survey
        responses (α = 0.05)
      </p>

      {knowledgeTests.length > 0 &&
        renderTestTable(
          knowledgeTests,
          "Knowledge × Professional Cadre",
          "Testing the relationship between professional cadre and knowledge/awareness responses (Items 7–9)"
        )}

      {likertTests.length > 0 &&
        renderTestTable(
          likertTests,
          "Binarized Likert × Professional Cadre",
          "Likert responses binarized: SA + A → Impacted | D + SD → Not Impacted, then cross-tabulated against cadre (Items 10–15)"
        )}

      {/* Footnotes */}
      <div className="mt-4 glass-card p-4">
        <h4 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">
          Methodology Notes
        </h4>
        <ul className="space-y-1 text-xs text-white/40">
          <li>
            • Significance level: α = 0.05. Tests with p-value &lt; 0.05 are
            considered statistically significant.
          </li>
          <li>
            • Default method: Chi-Square Test of Independence
            (scipy.stats.chi2_contingency).
          </li>
          <li>
            • When expected cell frequencies fall below 5 in a 2×2 table,
            Fisher&apos;s Exact test is used as a fallback.
          </li>
          <li>
            • Binarization: For Likert items, &quot;Strongly Agree&quot; and
            &quot;Agree&quot; are grouped as &quot;Impacted&quot;;
            &quot;Disagree&quot; and &quot;Strongly Disagree&quot; as &quot;Not
            Impacted&quot;.
          </li>
        </ul>
      </div>
    </div>
  );
}

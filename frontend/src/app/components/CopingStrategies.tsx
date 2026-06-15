"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";

interface CopingEntry {
  strategy: string;
  count: number;
  percentage: number;
}

interface CopingStrategiesProps {
  data: {
    personal_transport: CopingEntry[];
    institutional: CopingEntry[];
    financial: CopingEntry[];
  };
}

const SECTION_CONFIG = [
  {
    key: "personal_transport" as const,
    title: "Item 16: Personal Transportation Adjustments",
    subtitle: "Which personal transportation adjustments have you adopted?",
    color: "#10b981",
    gradient: ["#10b981", "#059669"],
  },
  {
    key: "institutional" as const,
    title: "Item 17: Institutional Adjustments",
    subtitle: "What institutional adjustments help you mitigate the effects?",
    color: "#3b82f6",
    gradient: ["#3b82f6", "#2563eb"],
  },
  {
    key: "financial" as const,
    title: "Item 18: Financial Coping Strategies",
    subtitle: "What financial coping strategies have you introduced?",
    color: "#8b5cf6",
    gradient: ["#8b5cf6", "#7c3aed"],
  },
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-navy-800/95 border border-white/10 rounded-lg px-4 py-3 backdrop-blur-sm">
        <p className="text-white/90 font-medium text-sm mb-1">
          {payload[0].payload.strategy}
        </p>
        <p className="text-white/60 text-sm">
          Count: <span className="text-white font-medium">{payload[0].value}</span>
        </p>
        <p className="text-white/60 text-sm">
          Percentage: <span className="text-white font-medium">{payload[0].payload.percentage}%</span>
        </p>
      </div>
    );
  }
  return null;
};

export default function CopingStrategies({ data }: CopingStrategiesProps) {
  return (
    <div className="glass-card p-6 animate-fade-in-up delay-300">
      <h2 className="section-header gradient-text">
        Section D: Coping Strategies
      </h2>
      <p className="section-subtitle">
        Strategies adopted by healthcare workers to adapt to the effects of fuel
        subsidy removal
      </p>

      <div className="grid grid-cols-1 gap-6">
        {SECTION_CONFIG.map((section) => {
          const sectionData = data[section.key] || [];
          // Truncate long strategy names for chart display
          const chartData = sectionData.map((item) => ({
            ...item,
            shortName:
              item.strategy.length > 35
                ? item.strategy.substring(0, 35) + "..."
                : item.strategy,
          }));

          return (
            <div key={section.key} className="glass-card p-5">
              <h3 className="text-sm font-semibold text-white/70 mb-1">
                {section.title}
              </h3>
              <p className="text-xs text-white/40 mb-4">{section.subtitle}</p>

              <ResponsiveContainer width="100%" height={Math.max(200, chartData.length * 55)}>
                <BarChart
                  data={chartData}
                  layout="vertical"
                  margin={{ top: 0, right: 60, left: 10, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.05)"
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
                    tickLine={false}
                    axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
                  />
                  <YAxis
                    type="category"
                    dataKey="shortName"
                    tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    width={200}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="count"
                    radius={[0, 6, 6, 0]}
                    maxBarSize={28}
                  >
                    {chartData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={section.color}
                        fillOpacity={0.8 - index * 0.1}
                      />
                    ))}
                    <LabelList
                      dataKey="count"
                      position="right"
                      fill="rgba(255,255,255,0.6)"
                      fontSize={12}
                      fontWeight={600}
                      formatter={(value: any) => `${value ?? ""}`}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          );
        })}
      </div>
    </div>
  );
}

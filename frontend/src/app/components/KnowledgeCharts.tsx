"use client";

import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface KnowledgeEntry {
  category: string;
  count: number;
  percentage: number;
}

interface KnowledgeChartsProps {
  data: {
    awareness: KnowledgeEntry[];
    understanding: KnowledgeEntry[];
    financial_burden: KnowledgeEntry[];
  };
}

const PIE_COLORS = ["#10b981", "#f43f5e", "#f59e0b"];
const BAR_COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6"];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-navy-800/95 border border-white/10 rounded-lg px-4 py-3 backdrop-blur-sm">
        <p className="text-white/90 font-medium text-sm">
          {payload[0].name || payload[0].payload.category}
        </p>
        <p className="text-white/60 text-sm">
          Count: <span className="text-white font-medium">{payload[0].value}</span>
        </p>
        {payload[0].payload.percentage !== undefined && (
          <p className="text-white/60 text-sm">
            Percentage: <span className="text-white font-medium">{payload[0].payload.percentage}%</span>
          </p>
        )}
      </div>
    );
  }
  return null;
};

const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  name,
}: any) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize="13"
      fontWeight="600"
    >
      {`${(percent * 100).toFixed(1)}%`}
    </text>
  );
};

export default function KnowledgeCharts({ data }: KnowledgeChartsProps) {
  return (
    <div className="glass-card p-6 animate-fade-in-up delay-100">
      <h2 className="section-header gradient-text">
        Section B: Knowledge & Awareness
      </h2>
      <p className="section-subtitle">
        Health workers&apos; knowledge about fuel subsidy removal and its effects
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Item 7 - Pie Chart */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-white/70 mb-1">Item 7</h3>
          <p className="text-xs text-white/40 mb-4">
            Are you aware of the official removal of the fuel subsidy in May 2023?
          </p>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={data.awareness}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={110}
                innerRadius={50}
                dataKey="count"
                nameKey="category"
                strokeWidth={2}
                stroke="#0a0f1e"
              >
                {data.awareness.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={PIE_COLORS[index % PIE_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                formatter={(value) => (
                  <span className="text-white/70 text-sm">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Item 8 - Bar Chart */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-white/70 mb-1">Item 8</h3>
          <p className="text-xs text-white/40 mb-4">
            How would you rate your understanding of the relationship between
            fuel subsidy removal and hospital operational costs?
          </p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={data.understanding}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="category"
                tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
              />
              <YAxis
                tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="count"
                radius={[6, 6, 0, 0]}
                maxBarSize={60}
              >
                {data.understanding.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={BAR_COLORS[index % BAR_COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Item 9 - Bar Chart */}
        <div className="glass-card p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold text-white/70 mb-1">Item 9</h3>
          <p className="text-xs text-white/40 mb-4">
            Do you believe that fuel subsidy removal indirectly increases the
            financial burden on patients?
          </p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={data.financial_burden}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="category"
                tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
              />
              <YAxis
                tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="count"
                radius={[6, 6, 0, 0]}
                maxBarSize={80}
              >
                {data.financial_burden.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={PIE_COLORS[index % PIE_COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

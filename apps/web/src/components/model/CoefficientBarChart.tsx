"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ModelVersion } from "@crypto-signals/shared";

interface CoefficientBarChartProps {
  model: ModelVersion;
}

/**
 * Horizontal-style bar chart of surviving coefficients (excluding const).
 * Bars left of zero = negative coef, right of zero = positive.
 * Mirrors the intent of `coefplot` from the old Final Product.py.
 */
export function CoefficientBarChart({ model }: CoefficientBarChartProps) {
  const data = Object.entries(model.coefficients)
    .filter(([k]) => k !== "const")
    .map(([feature, coef]) => ({ feature, coef }))
    .sort((a, b) => a.coef - b.coef);

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={Math.max(200, data.length * 22)}>
        <BarChart data={data} layout="vertical" margin={{ left: 80, right: 24, top: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
          <XAxis type="number" stroke="rgba(255,255,255,0.35)" tick={{ fontSize: 11, fill: "rgba(255,255,255,0.52)" }} />
          <YAxis
            type="category"
            dataKey="feature"
            stroke="rgba(255,255,255,0.35)"
            tick={{ fontSize: 10, fill: "rgba(255,255,255,0.52)", fontFamily: "ui-monospace, monospace" }}
            width={140}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(12,18,36,0.96)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 16,
              fontSize: 12,
              color: "#f7f4ea",
            }}
            formatter={(v: number) => v.toExponential(3)}
          />
          <ReferenceLine x={0} stroke="rgba(255,255,255,0.22)" />
          <Bar dataKey="coef" fill="#ffb84e" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

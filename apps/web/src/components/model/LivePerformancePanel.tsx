"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ModelPerformance, ModelVersion } from "@crypto-signals/shared";

interface LivePerformancePanelProps {
  model: ModelVersion;
  perf: ModelPerformance | null;
}

function Cell({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="metric-panel text-left">
      <p className="section-label">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-white">
        {value}
      </p>
      {sub && <p className="mt-2 text-xs text-white/45">{sub}</p>}
    </div>
  );
}

function ConfusionMatrix({ tp, fp, tn, fn }: { tp: number; fp: number; tn: number; fn: number }) {
  const total = tp + fp + tn + fn || 1;
  const cells = [
    { label: "True Long", value: tp, color: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300" },
    { label: "False Long", value: fp, color: "border-red-400/20 bg-red-400/10 text-red-300" },
    { label: "False Short", value: fn, color: "border-red-400/20 bg-red-400/10 text-red-300" },
    { label: "True Short", value: tn, color: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300" },
  ];

  return (
    <div>
      <p className="section-label mb-3">Confusion matrix</p>
      <div className="grid grid-cols-2 gap-2">
        {cells.map((c) => (
          <div key={c.label} className={`rounded-[22px] border p-4 ${c.color}`}>
            <p className="text-xs text-current/60">{c.label}</p>
            <p className="text-lg font-bold">{c.value}</p>
            <p className="text-xs opacity-60">{((c.value / total) * 100).toFixed(0)}%</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LivePerformancePanel({ model, perf }: LivePerformancePanelProps) {
  const testHit = model.hit_rate != null ? `${(model.hit_rate * 100).toFixed(1)}%` : "—";
  const liveHit = perf?.hit_rate != null ? `${(perf.hit_rate * 100).toFixed(1)}%` : "—";

  const gap =
    model.hit_rate != null && perf?.hit_rate != null
      ? ((model.hit_rate - perf.hit_rate) * 100).toFixed(1)
      : null;

  const gapTag =
    gap == null
      ? null
      : Math.abs(Number(gap)) <= 3
        ? { label: "honest", color: "text-emerald-300" }
        : Number(gap) > 8
          ? { label: "overfit", color: "text-red-300" }
        : Number(gap) > 3
            ? { label: "mild overfit", color: "text-[#ffd9a8]" }
            : { label: "regime luck", color: "text-cyan-300" };

  const confusion = perf?.confusion;
  const n = confusion ? Object.values(confusion).reduce((a, b) => a + b, 0) : 0;

  return (
    <Card>
      <CardHeader className="border-b border-white/10 pb-5">
        <CardTitle className="text-2xl font-semibold tracking-[-0.04em] text-white">
          Backtest vs live — {model.symbol}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="grid gap-4 sm:grid-cols-3">
            <Cell label="Test hit rate" value={testHit} sub="held-out set" />
            <Cell
              label="Live hit rate"
              value={liveHit}
              sub={n > 0 ? `n=${n} predictions` : "no live data yet"}
            />
            {gap != null && (
              <div className="metric-panel">
                <p className="section-label">Gap</p>
                <p className={`mt-3 text-3xl font-semibold tracking-[-0.05em] ${gapTag?.color}`}>
                  {Number(gap) > 0 ? "+" : ""}{gap} pp
                </p>
                {gapTag && (
                  <p className={`mt-2 text-xs font-medium uppercase tracking-[0.2em] ${gapTag.color}`}>
                    {gapTag.label}
                  </p>
                )}
              </div>
            )}
          </div>

          {confusion && n > 0 && (
            <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
              <ConfusionMatrix
                tp={confusion.tp}
                fp={confusion.fp}
                tn={confusion.tn}
                fn={confusion.fn}
              />
            </div>
          )}
        </div>

        {!perf && (
          <p className="mt-4 text-sm text-white/50">
            Live metrics appear after the first evaluation cycle (runs hourly).
          </p>
        )}
      </CardContent>
    </Card>
  );
}

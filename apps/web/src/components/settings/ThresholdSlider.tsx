"use client";

import { useUserPrefs } from "@/hooks/use-user-prefs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const STEPS = [0.0005, 0.001, 0.002, 0.003, 0.005, 0.008, 0.01, 0.015, 0.02];

export function ThresholdSlider() {
  const { prefs, loading, update } = useUserPrefs();

  if (loading) return <div className="h-48 rounded-[28px] bg-muted/30 animate-pulse" />;

  const current = prefs?.signal_threshold ?? 0.002;
  // Find the closest step to the stored value (handles floating-point drift)
  const idx = STEPS.reduce(
    (best, s, i) => (Math.abs(s - current) < Math.abs(STEPS[best] - current) ? i : best),
    0
  );

  const pct = (current * 100).toFixed(2);

  return (
    <Card>
      <CardHeader className="border-b border-white/10 pb-4">
        <div className="section-label">Signal threshold</div>
        <CardTitle className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">
          Signal threshold
        </CardTitle>
        <CardDescription>
          Only trade when the model predicts a log-return at least this large.
          Higher = fewer trades, higher conviction.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-[24px] border border-white/10 bg-black/20 px-4 py-4">
          <div className="section-label">Current band</div>
          <div className="mt-3 flex items-end justify-between gap-3">
            <span className="text-sm text-white/45">Min sensitivity</span>
            <span className="text-3xl font-semibold font-mono tracking-[-0.04em] text-white">
              ±{pct}%
            </span>
            <span className="text-sm text-white/45">Max conviction</span>
          </div>
        </div>
        <input
          type="range"
          min={0}
          max={STEPS.length - 1}
          step={1}
          value={idx}
          onChange={(e) => update({ signal_threshold: STEPS[Number(e.target.value)] })}
          className="w-full accent-[#ffb84e]"
        />
        <div className="grid gap-2 sm:grid-cols-3">
          {STEPS.map((step) => {
            const active = step === STEPS[idx];
            const stepPct = (step * 100).toFixed(2);

            return (
              <button
                key={step}
                type="button"
                onClick={() => update({ signal_threshold: step })}
                className={`rounded-[18px] border px-3 py-2 text-sm transition-colors ${
                  active
                    ? "border-amber-400/25 bg-amber-400/12 text-[#ffd9a8]"
                    : "border-white/10 bg-black/20 text-white/58 hover:bg-white/[0.06] hover:text-white"
                }`}
              >
                ±{stepPct}%
              </button>
            );
          })}
        </div>
        <p className="text-xs text-white/45">
          At ±{pct}%, the model needs to predict a {pct}% move before signalling BUY or SELL.
        </p>
      </CardContent>
    </Card>
  );
}

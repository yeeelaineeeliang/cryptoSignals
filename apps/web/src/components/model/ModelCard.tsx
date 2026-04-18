import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatRelativeTime } from "@/lib/format";
import { CoefficientBarChart } from "./CoefficientBarChart";
import { VifTraceChart } from "./VifTraceChart";
import type { ModelVersion } from "@crypto-signals/shared";

interface ModelCardProps {
  model: ModelVersion;
}

interface MetricChipProps {
  label: string;
  value: number | null;
  precision?: number;
  hint?: string;
}

function MetricChip({ label, value, precision = 4, hint }: MetricChipProps) {
  if (value == null || Number.isNaN(value)) {
    return (
      <div>
        <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
        <div className="font-mono text-base text-muted-foreground">—</div>
        {hint && <div className="mt-1 text-[10px] text-white/40 leading-tight">{hint}</div>}
      </div>
    );
  }
  const display = value.toFixed(precision);
  const tone = value < 0 ? "text-red-400" : value > 0 ? "text-green-400" : "text-foreground";
  return (
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className={`font-mono text-base ${tone}`}>{display}</div>
      {hint && <div className="mt-1 text-[10px] text-white/40 leading-tight">{hint}</div>}
    </div>
  );
}

export function ModelCard({ model }: ModelCardProps) {
  const droppedFeatures = (model.vif_trace ?? [])
    .filter((e) => e.dropped)
    .map((e) => e.dropped as string);
  const totalCandidates = model.selected_features.length + droppedFeatures.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between flex-wrap gap-2">
          <span className="text-xl font-bold">{model.symbol}</span>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono text-[10px]">
              v{model.id}
            </Badge>
            <Badge className="bg-green-500/15 text-green-400 border border-green-500/30 text-[10px]">
              live
            </Badge>
            <span className="text-[11px] text-muted-foreground">
              trained {formatRelativeTime(model.trained_at)}
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Plain-English summary up top */}
        <p className="text-xs text-white/60 leading-relaxed">
          This model considered{" "}
          <strong className="text-white">{totalCandidates}</strong> different signals
          (price, volume, time-of-day, momentum, …), automatically threw out{" "}
          <strong className="text-white">{droppedFeatures.length}</strong> that were
          redundant or unhelpful, and kept{" "}
          <strong className="text-white">{model.selected_features.length}</strong>{" "}
          for live predictions.
        </p>

        {/* Metrics with hover-friendly hints */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <MetricChip
            label="features kept"
            value={model.selected_features.length}
            precision={0}
            hint="how many signals the model uses"
          />
          <MetricChip
            label="train fit (R²)"
            value={model.r_squared}
            hint="how well the model fits the training data (0–1, higher is better)"
          />
          <MetricChip
            label="test score (OSR²)"
            value={model.osr2}
            hint="performance on unseen data vs. always guessing the average. Negative = worse than average."
          />
          <MetricChip
            label="hit rate"
            value={model.hit_rate}
            hint="how often the up/down direction is right. 0.50 = coin flip."
          />
          <MetricChip
            label="typical error"
            value={model.rmse}
            precision={6}
            hint="average size of the prediction miss (in log-returns)"
          />
        </div>

        <div>
          <h3 className="text-sm font-semibold text-white mb-1">Coefficients</h3>
          <p className="text-xs text-muted-foreground mb-2">
            Each bar is one signal the model uses. Bars to the right push the price
            prediction up; bars to the left push it down. Hover for exact values.
          </p>
          <CoefficientBarChart model={model} />
        </div>

        {model.vif_trace && model.vif_trace.length > 1 && (
          <div>
            <h3 className="text-sm font-semibold text-white mb-1">
              How the model trimmed itself ({model.vif_trace.length} steps)
            </h3>
            <p className="text-xs text-muted-foreground mb-2">
              <span className="text-orange-400 font-semibold">Orange:</span> how
              redundant the most-redundant feature is at each step (lower is
              cleaner).{" "}
              <span className="text-blue-400 font-semibold">Blue:</span> the
              model&apos;s test-set score along the way. Hover any point to see
              which signal got dropped.
            </p>
            <VifTraceChart trace={model.vif_trace} />
          </div>
        )}

        {droppedFeatures.length > 0 && (
          <details className="rounded-lg border border-white/10 bg-muted/20 p-3">
            <summary className="cursor-pointer text-xs font-semibold text-white/80">
              Signals the model decided not to use ({droppedFeatures.length})
            </summary>
            <p className="mt-2 text-[11px] text-muted-foreground">
              These were thrown out either because they overlapped too much with
              another signal (collinearity) or didn&apos;t help predictions on
              held-out data.
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5 text-[11px] font-mono">
              {droppedFeatures.map((feat) => (
                <span
                  key={feat}
                  className="rounded border border-white/10 bg-muted/30 px-2 py-0.5 text-muted-foreground"
                >
                  {feat}
                </span>
              ))}
            </div>
          </details>
        )}
      </CardContent>
    </Card>
  );
}

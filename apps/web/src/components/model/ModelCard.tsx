import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatRelativeTime } from "@/lib/format";
import { CoefficientBarChart } from "./CoefficientBarChart";
import { VifTraceChart } from "./VifTraceChart";
import type { ModelVersion } from "@crypto-signals/shared";

interface ModelCardProps {
  model: ModelVersion;
}

interface MetricProps {
  label: string;
  value: number | null;
  precision?: number;
  hint?: string;
}

function Metric({ label, value, precision = 4, hint }: MetricProps) {
  const display =
    value == null || Number.isNaN(value) ? "—" : value.toFixed(precision);
  const tone =
    value == null || Number.isNaN(value)
      ? "text-white/35"
      : value < 0
        ? "text-red-300"
        : value > 0
          ? "text-emerald-300"
          : "text-white";
  return (
    <div title={hint} className="metric-panel cursor-help">
      <div className="section-label">{label}</div>
      <div className={`mt-3 font-mono text-3xl font-bold ${tone}`}>{display}</div>
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
      <CardHeader className="border-b border-white/10 pb-5">
        <CardTitle className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <div className="section-label">Active symbol</div>
            <span className="mt-2 block text-3xl font-semibold tracking-[-0.05em] text-white">
              {model.symbol}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="border border-emerald-400/20 bg-emerald-400/10 text-emerald-300">
              live
            </Badge>
            <span className="text-sm text-white/45">
              {formatRelativeTime(model.trained_at)}
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Metric
            label={`uses ${model.selected_features.length} of ${totalCandidates}`}
            value={model.selected_features.length}
            precision={0}
            hint="signals the model uses, out of all candidates considered"
          />
          <Metric
            label="train fit"
            value={model.r_squared}
            hint="R² on training data — how well the model fits the past (0 to 1, higher is better)"
          />
          <Metric
            label="test score"
            value={model.osr2}
            hint="OSR² on unseen data. Negative = worse than always guessing the average."
          />
          <Metric
            label="hit rate"
            value={model.hit_rate}
            hint="how often up/down direction is right. 0.50 = coin flip."
          />
        </div>

        <div>
          <div className="section-label">Coefficient stack</div>
          <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">
            Surviving coefficients
          </h3>
          <div className="mt-4 rounded-[24px] border border-white/10 bg-black/20 p-4">
            <CoefficientBarChart model={model} />
          </div>
        </div>

        {model.vif_trace && model.vif_trace.length > 1 && (
          <div>
            <div className="mb-3 flex items-baseline justify-between">
              <div>
                <div className="section-label">Feature pruning</div>
                <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">
                  Trim history
                </h3>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 text-white/58">
                  <span className="h-2 w-2 rounded-full bg-orange-400" /> overlap
                </span>
                <span className="flex items-center gap-1.5 text-white/58">
                  <span className="h-2 w-2 rounded-full bg-cyan-400" /> score
                </span>
              </div>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
              <VifTraceChart trace={model.vif_trace} />
            </div>
          </div>
        )}

        {droppedFeatures.length > 0 && (
          <details className="rounded-[24px] border border-white/10 bg-black/20 p-4">
            <summary className="cursor-pointer text-sm font-semibold text-white/78">
              Dropped signals ({droppedFeatures.length})
            </summary>
            <div className="mt-3 flex flex-wrap gap-1.5 text-xs font-mono">
              {droppedFeatures.map((feat) => (
                <span
                  key={feat}
                  className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-white/50"
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

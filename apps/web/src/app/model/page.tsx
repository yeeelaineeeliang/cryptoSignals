import { createPublicSupabaseClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/PageHeader";
import { ModelCard } from "@/components/model/ModelCard";
import { PipelineDiagram } from "@/components/model/PipelineDiagram";
import { LivePerformancePanel } from "@/components/model/LivePerformancePanel";
import { formatRelativeTime } from "@/lib/format";
import type { ModelPerformance, ModelVersion } from "@crypto-signals/shared";

export const dynamic = "force-dynamic";

export default async function ModelPage() {
  const supabase = createPublicSupabaseClient();

  const [modelsRes, perfRes] = await Promise.all([
    supabase.from("model_versions").select("*").eq("is_active", true).order("symbol"),
    supabase
      .from("model_performance")
      .select("*")
      .order("evaluated_at", { ascending: false })
      .limit(20),
  ]);

  const models = (modelsRes.data ?? []) as ModelVersion[];
  const perfs = (perfRes.data ?? []) as ModelPerformance[];

  // Latest performance per model_version_id
  const latestPerf = new Map<number, ModelPerformance>();
  for (const p of perfs) {
    if (!latestPerf.has(p.model_version_id)) latestPerf.set(p.model_version_id, p);
  }

  const latestTrain =
    models.reduce<string | null>((latest, model) => {
      if (!model.trained_at) return latest;
      if (!latest) return model.trained_at;
      return new Date(model.trained_at) > new Date(latest) ? model.trained_at : latest;
    }, null) ?? null;

  return (
    <div className="page-shell space-y-8 pt-6 sm:pt-8">
      <PageHeader
        eyebrow="Model room"
        title="The math behind every call stays on display."
        description="This page is the opposite of a black box: you can inspect the feature pipeline, the surviving coefficients, and how live behavior compares with held-out validation."
        meta={
          <>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-sm text-white/70">
              OLS regression
            </span>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-sm text-white/70">
              VIF pruning
            </span>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-sm text-white/70">
              Hourly evaluation
            </span>
          </>
        }
        stats={[
          { label: "Active models", value: `${models.length}` },
          { label: "Performance snapshots", value: `${perfs.length}` },
          {
            label: "Latest training run",
            value: latestTrain ? formatRelativeTime(latestTrain) : "No models",
          },
          {
            label: "Latest evaluation",
            value: perfs[0] ? formatRelativeTime(perfs[0].evaluated_at) : "Waiting",
          },
        ]}
      />

      <PipelineDiagram />

      {models.length === 0 ? (
        <div className="rounded-[28px] border border-dashed border-white/15 bg-black/20 p-10 text-center text-white/50">
          No active models yet.
        </div>
      ) : (
        <section className="space-y-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="section-label">Active regressions</div>
              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-white">
                Coefficients and live honesty checks
              </h2>
            </div>
            <p className="max-w-2xl text-sm leading-6 text-white/52">
              Each symbol gets its own model card and a live-vs-backtest panel
              so you can see whether the in-sample story survives contact with
              recent data.
            </p>
          </div>

          {models.map((model) => (
            <div key={model.id} className="space-y-4">
              <ModelCard model={model} />
              <LivePerformancePanel
                model={model}
                perf={latestPerf.get(model.id) ?? null}
              />
            </div>
          ))}
        </section>
      )}
    </div>
  );
}

import { createPublicSupabaseClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/PageHeader";
import { PairPicker } from "@/components/settings/PairPicker";
import { ThresholdSlider } from "@/components/settings/ThresholdSlider";
import { CapitalForm } from "@/components/settings/CapitalForm";
import type { Pair } from "@crypto-signals/shared";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = createPublicSupabaseClient();
  const { data } = await supabase
    .from("pairs")
    .select("*")
    .eq("is_active", true)
    .order("display_name");
  const pairs = (data ?? []) as Pair[];

  return (
    <div className="page-shell space-y-8 pt-6 sm:pt-8">
      <PageHeader
        eyebrow="Desk settings"
        title="Tune what the worker surfaces and how your paper desk reacts."
        description="Preferences are stored per user. The live worker keeps broadcasting the full market feed, but your dashboard and simulator only act on the pairs and thresholds selected here."
        meta={
          <>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-sm text-white/70">
              Per-user persistence
            </span>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-sm text-white/70">
              Applied on next tick
            </span>
          </>
        }
        stats={[
          { label: "Active pairs available", value: `${pairs.length}` },
          { label: "Signal presets", value: "9 bands" },
          { label: "Capital modes", value: "Preset or custom" },
          { label: "Scope", value: "Your account only" },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <PairPicker pairs={pairs} />
        <div className="space-y-6">
          <ThresholdSlider />
          <CapitalForm />
        </div>
      </div>
    </div>
  );
}

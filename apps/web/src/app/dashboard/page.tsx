import { createPublicSupabaseClient } from "@/lib/supabase/server";
import { PriceTickerGrid } from "@/components/dashboard/PriceTickerGrid";
import { SignalsPanel } from "@/components/dashboard/SignalsPanel";
import { IntroBanner } from "@/components/dashboard/IntroBanner";
import { PageHeader } from "@/components/layout/PageHeader";
import { formatRelativeTime } from "@/lib/format";
import type { Pair, Prediction, Price } from "@crypto-signals/shared";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = createPublicSupabaseClient();

  const [pairsRes, pricesRes, predictionsRes] = await Promise.all([
    supabase.from("pairs").select("*").eq("is_active", true).order("display_name"),
    supabase.from("prices").select("*"),
    supabase
      .from("predictions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  const pairs = (pairsRes.data ?? []) as Pair[];
  const prices = (pricesRes.data ?? []) as Price[];
  const predictions = (predictionsRes.data ?? []) as Prediction[];

  const now = new Intl.DateTimeFormat("en-US", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date());

  return (
    <div className="page-shell space-y-8 pt-6 sm:pt-8">
      <PageHeader
        eyebrow="Live desk"
        title="The trading floor for your watched pairs."
        description="This view stays focused on the market tape and the decision stream: prices on the left, current calls on the right, and just enough framing to keep the simulator legible."
        meta={
          <>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-sm text-white/70">
              Coinbase spot feed
            </span>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-sm text-white/70">
              Supabase Realtime
            </span>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-sm text-white/70">
              User watchlists
            </span>
          </>
        }
        stats={[
          { label: "Active pairs", value: `${pairs.length}` },
          { label: "Price feeds", value: `${prices.length}` },
          {
            label: "Latest model batch",
            value: predictions[0] ? formatRelativeTime(predictions[0].created_at) : "Waiting",
          },
          { label: "Rendered", value: now },
        ]}
      />

      <IntroBanner />

      <section className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="section-label">Market tape</div>
            <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-white">
              Live prices
            </h2>
          </div>
          <p className="max-w-2xl text-sm leading-6 text-white/52">
            The grid only shows the pairs selected in settings, so the
            dashboard behaves like a personal watchlist instead of a wall of
            noise.
          </p>
        </div>
        <PriceTickerGrid pairs={pairs} initialPrices={prices} />
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="section-label">Decision stream</div>
            <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-white">
              Model calls
            </h2>
          </div>
          <p className="max-w-2xl text-sm leading-6 text-white/52">
            Cards summarize the latest conviction per pair while the feed on
            the right preserves the recent sequence of buys, sells, and holds.
          </p>
        </div>
        <SignalsPanel pairs={pairs} initialPredictions={predictions} />
      </section>
    </div>
  );
}

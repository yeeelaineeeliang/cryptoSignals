import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/PageHeader";
import { PortfolioClient } from "./PortfolioClient";
import { formatRelativeTime, formatUSD } from "@/lib/format";
import type { PaperTrade, Portfolio } from "@crypto-signals/shared";

export const dynamic = "force-dynamic";

export default async function PortfolioPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const supabase = await createServerSupabaseClient();

  const [portfolioRes, tradesRes] = await Promise.all([
    supabase.from("portfolios").select("*").eq("user_id", userId).maybeSingle(),
    supabase
      .from("paper_trades")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(100),
  ]);

  const portfolio = (portfolioRes.data as Portfolio) ?? null;
  const trades = (tradesRes.data as PaperTrade[]) ?? [];

  return (
    <div className="page-shell space-y-8 pt-6 sm:pt-8">
      <PageHeader
        eyebrow="Paper desk"
        title="Your personal simulator, isolated from the public tape."
        description="Positions, equity, and trade history are scoped to your account. This is the execution layer for the signal platform, but it stays strictly in paper-trading mode."
        meta={
          <>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-sm text-white/70">
              User scoped
            </span>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-sm text-white/70">
              Trade history preserved
            </span>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-sm text-white/70">
              No real capital
            </span>
          </>
        }
        stats={[
          {
            label: "Starting capital",
            value: portfolio ? formatUSD(portfolio.starting_capital) : formatUSD(10_000),
          },
          { label: "Recent trades loaded", value: `${trades.length}` },
          {
            label: "Latest trade",
            value: trades[0] ? formatRelativeTime(trades[0].created_at) : "No trades",
          },
          {
            label: "Open positions",
            value: portfolio ? `${Object.keys(portfolio.positions ?? {}).length}` : "0",
          },
        ]}
      />

      <PortfolioClient
        initialPortfolio={portfolio}
        initialTrades={trades}
      />
    </div>
  );
}

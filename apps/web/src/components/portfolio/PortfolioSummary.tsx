"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatUSD } from "@/lib/format";
import type { Portfolio } from "@crypto-signals/shared";

interface PortfolioSummaryProps {
  portfolio: Portfolio | null;
}

export function PortfolioSummary({ portfolio }: PortfolioSummaryProps) {
  if (!portfolio) {
    return (
      <Card className="h-full">
        <CardContent className="py-10 text-center text-sm text-white/50">
          No portfolio yet — trades appear once a signal fires above your threshold.
        </CardContent>
      </Card>
    );
  }

  const equity = portfolio.equity_usd;
  const start = portfolio.starting_capital;
  const pnl = equity - start;
  const pnlPct = start > 0 ? (pnl / start) * 100 : 0;
  const isUp = pnl >= 0;

  const positions = portfolio.positions ?? {};
  const hasPositions = Object.keys(positions).length > 0;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="section-label">Equity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tracking-[-0.05em] text-white">
              {formatUSD(equity)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="section-label">Cash</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tracking-[-0.05em] text-white">
              {formatUSD(portfolio.cash_usd)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="section-label">Total P&amp;L</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-3xl font-semibold tracking-[-0.05em] ${isUp ? "text-emerald-300" : "text-red-300"}`}>
              {isUp ? "+" : ""}{formatUSD(pnl)}
            </p>
            <p className={`mt-1 text-xs ${isUp ? "text-emerald-300/70" : "text-red-300/70"}`}>
              {isUp ? "+" : ""}{pnlPct.toFixed(2)}%
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="h-full">
        <CardHeader className="border-b border-white/10 pb-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="section-label">Position book</div>
              <CardTitle className="mt-2 text-2xl font-semibold text-white">
                Open positions
              </CardTitle>
            </div>
            <div className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-xs uppercase tracking-[0.2em] text-white/45">
              {Object.keys(positions).length} active
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!hasPositions ? (
            <p className="text-sm text-white/50">No open positions</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(positions).map(([sym, pos]) => (
                <div
                  key={sym}
                  className="grid grid-cols-[1fr_auto] gap-3 rounded-[22px] border border-white/10 bg-black/20 px-4 py-3 text-sm"
                >
                  <div>
                    <span className="font-semibold text-white">{sym}</span>
                    <p className="mt-1 font-mono text-xs text-white/45">
                      {Number(pos.qty).toFixed(6)} units
                    </p>
                  </div>
                  <span className="text-right font-mono text-white/58">
                    avg {formatUSD(Number(pos.avg_cost))}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatUSD, formatRelativeTime } from "@/lib/format";
import type { PaperTrade } from "@crypto-signals/shared";

interface TradeHistoryTableProps {
  trades: PaperTrade[];
}

export function TradeHistoryTable({ trades }: TradeHistoryTableProps) {
  return (
    <Card>
      <CardHeader className="border-b border-white/10 pb-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="section-label">Execution log</div>
            <CardTitle className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">
              Trade history
            </CardTitle>
          </div>
          <div className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-xs uppercase tracking-[0.2em] text-white/45">
            {Math.min(trades.length, 50)} rows
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {trades.length === 0 ? (
          <p className="py-4 text-center text-sm text-white/50">No trades yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-[0.2em] text-white/35">
                  <th className="pb-2 text-left">Time</th>
                  <th className="pb-2 text-left">Pair</th>
                  <th className="pb-2 text-left">Side</th>
                  <th className="pb-2 text-right">Qty</th>
                  <th className="pb-2 text-right">Price</th>
                  <th className="pb-2 text-right">Notional</th>
                  <th className="pb-2 text-right">Fee</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {trades.slice(0, 50).map((t) => (
                  <tr key={t.id} className="group">
                    <td className="py-3 text-xs font-mono text-white/45">
                      {formatRelativeTime(t.created_at)}
                    </td>
                    <td className="py-3 font-semibold text-white">{t.symbol}</td>
                    <td className="py-3">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-bold ${
                          t.side === "BUY"
                            ? "border border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                            : "border border-red-400/20 bg-red-400/10 text-red-300"
                        }`}
                      >
                        {t.side}
                      </span>
                    </td>
                    <td className="py-3 text-right font-mono text-white/70">
                      {Number(t.qty).toFixed(6)}
                    </td>
                    <td className="py-3 text-right font-mono text-white/70">
                      {formatUSD(t.price)}
                    </td>
                    <td className="py-3 text-right font-mono text-white/70">
                      {formatUSD(t.notional_usd)}
                    </td>
                    <td className="py-3 text-right font-mono text-xs text-white/45">
                      {formatUSD(t.fee_usd)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatUSD } from "@/lib/format";
import type { PaperTrade, Portfolio } from "@crypto-signals/shared";

interface EquityCurveProps {
  trades: PaperTrade[];
  portfolio: Portfolio | null;
}

interface DataPoint {
  time: string;
  equity: number;
}

function buildCurve(trades: PaperTrade[], portfolio: Portfolio | null): DataPoint[] {
  if (!portfolio) return [];
  const start = portfolio.starting_capital;

  // Walk trades in chronological order; track running cash
  const sorted = [...trades].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  const points: DataPoint[] = [{ time: "Start", equity: start }];
  let cash = start;
  // Track qty per symbol so we can value positions at each trade's price
  const positions: Record<string, { qty: number; lastPrice: number }> = {};

  for (const t of sorted) {
    const sym = t.symbol;
    if (!positions[sym]) positions[sym] = { qty: 0, lastPrice: t.price };

    if (t.side === "BUY") {
      cash -= t.notional_usd + t.fee_usd;
      positions[sym].qty += t.qty;
    } else {
      cash += t.notional_usd - t.fee_usd;
      positions[sym].qty = Math.max(0, positions[sym].qty - t.qty);
    }
    positions[sym].lastPrice = t.price;

    // Equity = cash + sum of all open position values at current trade prices
    const posValue = Object.values(positions).reduce(
      (sum, p) => sum + p.qty * p.lastPrice,
      0
    );

    const label = new Date(t.created_at).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    points.push({ time: label, equity: cash + posValue });
  }

  // Append current live equity
  if (portfolio && sorted.length > 0) {
    points.push({ time: "Now", equity: portfolio.equity_usd });
  }

  return points;
}

export function EquityCurve({ trades, portfolio }: EquityCurveProps) {
  const data = buildCurve(trades, portfolio);
  const start = portfolio?.starting_capital ?? 10_000;
  const current = portfolio?.equity_usd ?? start;
  const isUp = current >= start;
  const pnl = current - start;

  if (data.length < 2) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-white">Equity curve</CardTitle>
        </CardHeader>
        <CardContent className="py-8 text-center text-sm text-white/50">
          Waiting for first trade…
        </CardContent>
      </Card>
    );
  }

  const color = isUp ? "#059669" : "#dc2626";

  return (
    <Card className="h-full">
      <CardHeader className="border-b border-white/10 pb-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="section-label">Performance path</div>
            <CardTitle className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">
              Equity curve
            </CardTitle>
          </div>
          <div className="rounded-[22px] border border-white/10 bg-black/20 px-4 py-3">
            <div className="section-label">Net change</div>
            <div className={`mt-2 text-xl font-semibold ${isUp ? "text-emerald-300" : "text-red-300"}`}>
              {isUp ? "+" : ""}{formatUSD(pnl)}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.25} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
            <XAxis
              dataKey="time"
              tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`}
              tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={48}
            />
            <Tooltip
              formatter={(v: number) => [formatUSD(v), "Equity"]}
              contentStyle={{
                background: "rgba(12,18,36,0.96)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 16,
                fontSize: 12,
                color: "#f7f4ea",
              }}
              labelStyle={{ color: "rgba(255,255,255,0.6)" }}
            />
            <Area
              type="monotone"
              dataKey="equity"
              stroke={color}
              strokeWidth={2}
              fill="url(#equityGrad)"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

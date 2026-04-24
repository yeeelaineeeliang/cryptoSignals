"use client";

import { useState } from "react";
import { usePortfolio } from "@/hooks/use-portfolio";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatUSD } from "@/lib/format";

const PRESETS = [1_000, 5_000, 10_000, 25_000, 100_000];

export function CapitalForm() {
  const { portfolio, resetPortfolio } = usePortfolio();
  const [custom, setCustom] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState(false);

  const current = portfolio?.starting_capital ?? 10_000;

  const handleReset = async (amount: number) => {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    setPending(true);
    await resetPortfolio(amount);
    setPending(false);
    setConfirming(false);
    setCustom("");
  };

  return (
    <Card>
      <CardHeader className="border-b border-white/10 pb-4">
        <div className="section-label">Portfolio reset</div>
        <CardTitle className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">
          Starting capital
        </CardTitle>
        <CardDescription>
          Reset your paper portfolio to a fresh starting balance. Open positions are cleared; trade history is preserved.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-[24px] border border-white/10 bg-black/20 px-4 py-4">
          <div className="section-label">Current baseline</div>
          <p className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-white">
            {formatUSD(current)}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {PRESETS.map((amount) => (
            <button
              key={amount}
              type="button"
              onClick={() => handleReset(amount)}
              disabled={pending}
              className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm font-medium text-white/70 transition-colors hover:bg-white/[0.06] hover:text-white disabled:opacity-40"
            >
              {formatUSD(amount)}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Custom amount"
            value={custom}
            onChange={(e) => { setCustom(e.target.value); setConfirming(false); }}
            className="flex-1 rounded-[18px] border border-white/10 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-[#ffb84e]/35"
          />
          <button
            type="button"
            onClick={() => handleReset(Number(custom))}
            disabled={!custom || Number(custom) <= 0 || pending}
            className="rounded-[18px] border border-white/10 bg-black/20 px-4 py-2 text-sm font-medium text-white/70 transition-colors hover:bg-white/[0.06] hover:text-white disabled:opacity-40"
          >
            Set
          </button>
        </div>

        {confirming && (
          <p className="rounded-[18px] border border-amber-400/25 bg-amber-400/10 px-3 py-2 text-sm text-[#ffd9a8]">
            Click again to confirm — this clears your open positions and resets cash.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  formatLogretPct,
  formatRelativeTime,
  signalCopy,
} from "@/lib/format";
import type { Pair, Prediction } from "@crypto-signals/shared";

interface SignalCardProps {
  pair: Pair;
  latest: Prediction | undefined;
}

const TONE_STYLES = {
  up: "bg-green-500/15 text-green-400 border-green-500/30",
  down: "bg-red-500/15 text-red-400 border-red-500/30",
  flat: "bg-white/5 text-white/60 border-white/10",
} as const;

const NUMBER_TONE = {
  up: "text-green-400",
  down: "text-red-400",
  flat: "text-foreground",
} as const;

export function SignalCard({ pair, latest }: SignalCardProps) {
  const copy = signalCopy(latest?.signal);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            {pair.display_name}
          </span>
          <Badge className={`${TONE_STYLES[copy.tone]} border font-semibold`}>
            <span className="mr-1">{copy.arrow}</span> {copy.label}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <span className={`text-3xl font-mono font-bold ${NUMBER_TONE[copy.tone]}`}>
            {formatLogretPct(latest?.predicted_logret ?? null)}
          </span>
          <span className="text-xs text-muted-foreground">in next 5 minutes</span>
        </div>
        <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
          {latest
            ? `${copy.blurb}. Updated ${formatRelativeTime(latest.created_at)}.`
            : "Waiting for first prediction…"}
        </p>
      </CardContent>
    </Card>
  );
}

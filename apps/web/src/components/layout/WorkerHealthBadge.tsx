"use client";

import { useWorkerHealth, type WorkerStatus } from "@/hooks/use-worker-health";

const STATUS: Record<WorkerStatus, { label: string; dot: string; text: string }> = {
  live:    { label: "Live",    dot: "bg-green-400 animate-pulse", text: "text-green-400" },
  stale:   { label: "Stale",   dot: "bg-amber-400",               text: "text-amber-400" },
  down:    { label: "Down",    dot: "bg-red-500",                  text: "text-red-400"   },
  unknown: { label: "...",     dot: "bg-white/20",                 text: "text-white/30"  },
};

export function WorkerHealthBadge() {
  const { status } = useWorkerHealth();
  const s = STATUS[status];

  return (
    <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1">
      <span className={`h-2 w-2 rounded-full ${s.dot}`} />
      <span className={`text-xs font-medium ${s.text}`}>{s.label}</span>
    </div>
  );
}

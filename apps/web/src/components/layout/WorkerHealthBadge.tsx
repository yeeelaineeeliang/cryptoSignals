"use client";

import { useWorkerHealth, type WorkerStatus } from "@/hooks/use-worker-health";

const STATUS: Record<WorkerStatus, { label: string; dot: string; text: string }> = {
  live: { label: "Feed live", dot: "bg-emerald-400 animate-pulse", text: "text-emerald-300" },
  stale: { label: "Lagging", dot: "bg-amber-400", text: "text-amber-300" },
  down: { label: "Feed down", dot: "bg-red-500", text: "text-red-300" },
  unknown: { label: "Checking", dot: "bg-white/20", text: "text-white/40" },
};

export function WorkerHealthBadge() {
  const { status } = useWorkerHealth();
  const s = STATUS[status];

  return (
    <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <span className={`h-2.5 w-2.5 rounded-full ${s.dot}`} />
      <span className={`text-[0.72rem] font-medium uppercase tracking-[0.18em] ${s.text}`}>
        {s.label}
      </span>
    </div>
  );
}

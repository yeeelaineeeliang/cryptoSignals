"use client";

import { useEffect, useState } from "react";
import { useSupabaseClient } from "@/lib/supabase/client";
import type { WorkerHeartbeat } from "@crypto-signals/shared";

export type WorkerStatus = "live" | "stale" | "down" | "unknown";

function statusFromHeartbeat(hb: WorkerHeartbeat | null): WorkerStatus {
  if (!hb) return "unknown";
  const ageSec = (Date.now() - new Date(hb.last_poll_at).getTime()) / 1000;
  if (ageSec < 15) return "live";
  if (ageSec < 120) return "stale";
  return "down";
}

export function useWorkerHealth() {
  const supabase = useSupabaseClient();
  const [heartbeat, setHeartbeat] = useState<WorkerHeartbeat | null>(null);

  useEffect(() => {
    // Initial fetch
    supabase
      .from("worker_heartbeats")
      .select("*")
      .eq("id", 1)
      .maybeSingle()
      .then(({ data }) => setHeartbeat(data as WorkerHeartbeat | null));

    // Realtime: worker upserts this row every poll (every 5s)
    const channel = supabase
      .channel("worker-health")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "worker_heartbeats", filter: "id=eq.1" },
        (payload) => setHeartbeat(payload.new as WorkerHeartbeat)
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [supabase]);

  return { heartbeat, status: statusFromHeartbeat(heartbeat) };
}

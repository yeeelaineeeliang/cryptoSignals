/**
 * Compact legend plus platform reminder. This sits between the page hero and
 * the data widgets so users can parse color and action language immediately.
 */
export function IntroBanner() {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/[0.04] px-5 py-5 shadow-[0_24px_80px_-48px_rgba(0,0,0,0.9)] backdrop-blur-xl">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="section-label">Signal legend</div>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/58">
            The platform maps raw model output into a simple action band before
            it touches the paper trader. Nothing here routes real orders.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <Legend dot="bg-emerald-300" label="▲ Buy" />
          <Legend dot="bg-red-300" label="▼ Sell" />
          <Legend dot="bg-white/50" label="• Wait" />
          <span className="rounded-full border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/65">
            Paper trading only
          </span>
        </div>
      </div>
    </div>
  );
}

function Legend({ dot, label }: { dot: string; label: string }) {
  return (
    <span className="flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-2 text-white/78">
      <span className={`h-2.5 w-2.5 rounded-full ${dot}`} />
      <span className="text-sm font-semibold">{label}</span>
    </span>
  );
}

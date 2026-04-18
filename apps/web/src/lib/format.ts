// Numeric formatting helpers for crypto prices, returns, and durations.

const usdFmt = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const usdCompact = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const pctFmt = new Intl.NumberFormat("en-US", {
  style: "percent",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  signDisplay: "exceptZero",
});

const pctPlain = new Intl.NumberFormat("en-US", {
  style: "percent",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatUSD(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return "—";
  return Math.abs(value) >= 10_000 ? usdCompact.format(value) : usdFmt.format(value);
}

export function formatPrice(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return "—";
  // Crypto often has sub-cent precision; keep 2 decimals for USD pairs
  return usdFmt.format(value);
}

export function formatPct(value: number | null | undefined, signed = false): string {
  if (value == null || !Number.isFinite(value)) return "—";
  return (signed ? pctFmt : pctPlain).format(value);
}

export function formatLogret(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return "—";
  // Log-returns are small; show in bps for readability (1 bps = 0.01%)
  return `${(value * 10_000).toFixed(1)} bps`;
}

export function formatRelativeTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  const then = new Date(iso).getTime();
  const secs = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

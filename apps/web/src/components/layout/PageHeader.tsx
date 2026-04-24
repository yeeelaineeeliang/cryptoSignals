import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeaderStat {
  label: string;
  value: ReactNode;
}

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  description: string;
  meta?: ReactNode;
  stats?: PageHeaderStat[];
  className?: string;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  meta,
  stats = [],
  className,
}: PageHeaderProps) {
  return (
    <header className={cn("page-hero", className)}>
      <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <span className="page-kicker">{eyebrow}</span>
          <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl">
            {title}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/68 sm:text-lg">
            {description}
          </p>
          {meta ? <div className="mt-5 flex flex-wrap gap-2.5">{meta}</div> : null}
        </div>

        {stats.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[24rem]">
            {stats.map((stat) => (
              <div key={stat.label} className="metric-panel">
                <div className="section-label">{stat.label}</div>
                <div className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-white">
                  {stat.value}
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </header>
  );
}

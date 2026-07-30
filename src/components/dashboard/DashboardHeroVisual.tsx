"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

interface DashboardHeroVisualProps {
  className?: string;
  fillRate?: number;
  weekSessions?: number;
  staffUtilization?: number;
}

const dayBars = [
  { label: "M", h: 42 },
  { label: "T", h: 68 },
  { label: "W", h: 55 },
  { label: "T", h: 82 },
  { label: "F", h: 74 },
  { label: "S", h: 38 },
  { label: "S", h: 28 },
];

/**
 * Operations card — primary for emphasis; secondary only as a quiet ambient wash.
 */
export function DashboardHeroVisual({
  className,
  fillRate = 0,
  weekSessions = 0,
  staffUtilization = 0,
}: DashboardHeroVisualProps) {
  const reduce = useReducedMotion();
  const fill = Math.min(100, Math.max(0, fillRate));
  const util = Math.min(100, Math.max(0, staffUtilization));
  const todayIndex = Math.min(
    6,
    Math.max(0, new Date().getDay() === 0 ? 6 : new Date().getDay() - 1)
  );

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl border border-border bg-card shadow-[0_20px_50px_-36px_rgba(11,18,32,0.28)]",
        className
      )}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at top right, color-mix(in srgb, var(--primary) 12%, transparent), transparent 52%), radial-gradient(ellipse at bottom left, color-mix(in srgb, var(--brand-secondary) 6%, transparent), transparent 55%)",
        }}
      />

      <div className="relative z-10 flex h-full min-h-[220px] flex-col p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-muted">
              This week
            </p>
            <p className="mt-1 text-base font-semibold tracking-tight text-ink">
              Floor rhythm
            </p>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-primary/15 px-2.5 py-1">
            <span className="relative flex h-1.5 w-1.5">
              {!reduce && (
                <span className="absolute inset-0 animate-ping rounded-full bg-primary opacity-40" />
              )}
              <span className="relative h-1.5 w-1.5 rounded-full bg-primary" />
            </span>
            <span className="text-[10px] font-semibold text-accent-foreground">
              Live
            </span>
          </div>
        </div>

        <div className="mt-5 flex h-[96px] items-end gap-2">
          {dayBars.map((d, i) => {
            const active = i === todayIndex;
            return (
              <div
                key={`${d.label}-${i}`}
                className="flex h-full flex-1 flex-col items-center justify-end gap-2"
              >
                <motion.div
                  className={cn(
                    "w-full max-w-[28px] rounded-md origin-bottom",
                    active ? "bg-primary" : "bg-ink/[0.08]"
                  )}
                  initial={reduce ? false : { scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{
                    duration: 0.55,
                    delay: reduce ? 0 : 0.05 * i,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  style={{ height: `${d.h}%` }}
                />
                <span
                  className={cn(
                    "text-[10px] font-semibold",
                    active ? "text-accent-foreground" : "text-ink-muted"
                  )}
                >
                  {d.label}
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3 border-t border-border pt-4">
          <Metric label="Sessions" value={String(weekSessions)} />
          <Metric label="Fill" value={`${fill}%`} bar={fill} />
          <Metric label="Util." value={`${util}%`} bar={util} />
        </div>
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  bar,
}: {
  label: string;
  value: string;
  bar?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <div>
      <p className="text-[10px] font-medium uppercase tracking-wider text-ink-muted">
        {label}
      </p>
      <p className="mt-0.5 text-lg font-bold tracking-tight text-ink">{value}</p>
      {typeof bar === "number" && (
        <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-canvas">
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={reduce ? false : { width: 0 }}
            animate={{ width: `${bar}%` }}
            transition={{
              duration: 0.7,
              ease: [0.22, 1, 0.36, 1],
              delay: 0.2,
            }}
          />
        </div>
      )}
    </div>
  );
}

"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

const ease = [0.22, 1, 0.36, 1] as const;

interface PageRevealProps {
  children: ReactNode;
  className?: string;
}

/** Calm fade-up entrance for dashboard pages. */
export function PageReveal({ children, className }: PageRevealProps) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease }}
    >
      {children}
    </motion.div>
  );
}

/** Container opacity must stay at 1 — otherwise children that mount after
 *  the first animate cycle (e.g. when a query finishes) stay stuck invisible. */
export const staggerContainer = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.055, delayChildren: 0.06 },
  },
};

export const staggerItem = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease },
  },
};

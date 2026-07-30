"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";
import { useAuth } from "@/providers/auth-context";
import { getBrandThemeStyle } from "@/lib/brand-theme";

const BRAND_VAR_KEYS = [
  "--primary",
  "--primary-foreground",
  "--ring",
  "--sidebar-primary",
  "--sidebar-primary-foreground",
  "--sidebar-ring",
  "--chart-1",
  "--chart-2",
  "--brand-secondary",
  "--brand-secondary-foreground",
  "--accent",
  "--accent-foreground",
  "--sidebar-accent",
  "--sidebar-accent-foreground",
] as const;

/**
 * Writes tenant brand tokens onto <html> so portaled UI inherits branding.
 * Recomputes soft accents when light/dark mode changes.
 */
export function BrandThemeSync() {
  const { branding } = useAuth();
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const root = document.documentElement;
    const mode = resolvedTheme === "dark" ? "dark" : "light";
    const style = getBrandThemeStyle(branding, mode) as Record<string, string>;

    for (const key of BRAND_VAR_KEYS) {
      if (style[key]) {
        root.style.setProperty(key, style[key]);
      } else {
        root.style.removeProperty(key);
      }
    }

    return () => {
      for (const key of BRAND_VAR_KEYS) {
        root.style.removeProperty(key);
      }
    };
  }, [branding, resolvedTheme]);

  return null;
}

"use client";

import { BrandThemeSync } from "@/components/dashboard/BrandThemeSync";

/** Client island for brand CSS sync under AuthProvider. */
export function BrandThemeRoot({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BrandThemeSync />
      {children}
    </>
  );
}

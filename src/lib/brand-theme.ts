import type { CSSProperties } from 'react';
import type { TenantBranding } from '@/types/api-types';

/** Default GymFlow primary — used when tenant has no branding. */
export const DEFAULT_PRIMARY = '#a8dd07';
export const DEFAULT_PRIMARY_FOREGROUND = '#1a1a14';

function parseHex(hex: string): { r: number; g: number; b: number } | null {
  const raw = hex.trim().replace('#', '');
  if (!/^[0-9a-fA-F]{3}$|^[0-9a-fA-F]{6}$/.test(raw)) return null;
  const full =
    raw.length === 3
      ? raw
          .split('')
          .map((c) => c + c)
          .join('')
      : raw;
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
}

function relativeLuminance(hex: string): number {
  const rgb = parseHex(hex);
  if (!rgb) return 0.5;
  const toLin = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  const r = toLin(rgb.r);
  const g = toLin(rgb.g);
  const b = toLin(rgb.b);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Dark ink on light primaries, white on dark primaries. */
export function contrastingForeground(hex: string): string {
  return relativeLuminance(hex) > 0.45 ? '#1a1a14' : '#ffffff';
}

/**
 * Maps tenant branding onto CSS variables.
 * Does NOT set page background — canvas stays light/dark from theme.
 * Primary replaces default green; secondary is available as --brand-secondary.
 */
export function getBrandThemeStyle(
  branding: TenantBranding | null | undefined,
  mode: 'light' | 'dark' = 'light'
): CSSProperties {
  const primary = branding?.primary_color?.trim();
  if (!primary) return {};

  const secondary = branding?.secondary_color?.trim() || '#64748b';
  const onPrimary = contrastingForeground(primary);
  const isDark = mode === 'dark';

  return {
    '--primary': primary,
    '--primary-foreground': onPrimary,
    '--ring': primary,
    '--sidebar-primary': primary,
    '--sidebar-primary-foreground': onPrimary,
    '--sidebar-ring': primary,
    '--chart-1': primary,
    '--chart-2': secondary,
    '--brand-secondary': secondary,
    '--brand-secondary-foreground': contrastingForeground(secondary),
    '--accent': isDark
      ? `color-mix(in srgb, ${primary} 22%, #141b2b)`
      : `color-mix(in srgb, ${primary} 16%, white)`,
    '--accent-foreground': isDark
      ? `color-mix(in srgb, ${primary} 55%, white)`
      : `color-mix(in srgb, ${primary} 72%, black)`,
    '--sidebar-accent': isDark
      ? `color-mix(in srgb, ${primary} 18%, #141b2b)`
      : `color-mix(in srgb, ${primary} 14%, white)`,
    '--sidebar-accent-foreground': isDark
      ? `color-mix(in srgb, ${primary} 55%, white)`
      : `color-mix(in srgb, ${primary} 68%, black)`,
  } as CSSProperties;
}

"use client";

/**
 * Soft ambient depth — primary + brand-secondary tints.
 * Background stays canvas; blobs are low-opacity only.
 */
export function AmbientAurora() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
    >
      <style>{`
        @keyframes dash-aurora {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(4%, -3%) scale(1.06); }
        }
        @media (prefers-reduced-motion: reduce) {
          .dash-aurora-blob { animation: none !important; }
        }
      `}</style>
      {/* Primary wash */}
      <div
        className="dash-aurora-blob absolute -right-24 -top-32 h-[28rem] w-[28rem] rounded-full blur-[100px] opacity-80"
        style={{
          animation: "dash-aurora 18s ease-in-out infinite",
          background:
            "radial-gradient(circle, color-mix(in srgb, var(--primary) 28%, transparent), transparent 70%)",
        }}
      />
      {/* Secondary wash — very soft so any tenant secondary stays quiet */}
      <div
        className="dash-aurora-blob absolute -bottom-40 -left-20 h-[24rem] w-[24rem] rounded-full blur-[90px] opacity-40"
        style={{
          animation: "dash-aurora 22s ease-in-out infinite reverse",
          background:
            "radial-gradient(circle, color-mix(in srgb, var(--brand-secondary) 10%, transparent), transparent 70%)",
        }}
      />
      <div
        className="dash-aurora-blob absolute left-1/3 top-1/2 h-[16rem] w-[16rem] -translate-y-1/2 rounded-full blur-[80px] opacity-60"
        style={{
          animation: "dash-aurora 26s ease-in-out infinite",
          background:
            "radial-gradient(circle, color-mix(in srgb, var(--primary) 12%, transparent), transparent 70%)",
        }}
      />
    </div>
  );
}

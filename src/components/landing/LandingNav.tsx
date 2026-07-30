"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Dumbbell } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LandingNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4">
      <nav
        className={cn(
          "flex items-center justify-between gap-8 transition-all duration-500 ease-out",
          scrolled
            ? "w-full max-w-3xl rounded-full border border-ink/8 bg-white/80 px-5 py-2.5 shadow-[0_12px_40px_-20px_rgba(11,18,32,0.35)] backdrop-blur-xl"
            : "w-full max-w-6xl rounded-2xl border border-transparent bg-transparent px-2 py-3"
        )}
      >
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink text-primary">
            <Dumbbell className="h-4 w-4" />
          </span>
          <span className="text-sm font-bold tracking-tight text-ink">
            GymFlow
          </span>
        </Link>

        <div className="hidden items-center gap-7 text-sm font-medium text-ink-muted sm:flex">
          <a href="#product" className="transition-colors hover:text-ink">
            Product
          </a>
          <a href="#footer" className="transition-colors hover:text-ink">
            Company
          </a>
        </div>

        <Link
          href="/login"
          className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition-transform hover:scale-[1.02]"
        >
          Sign in
        </Link>
      </nav>
    </header>
  );
}

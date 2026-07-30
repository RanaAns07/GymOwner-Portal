"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import HeroVisual from "./HeroVisual";
import LandingNav from "./LandingNav";

export default function HeroSection() {
    const containerRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const prefersReduced =
            typeof window !== "undefined" &&
            window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (prefersReduced) return;

        const ctx = gsap.context(() => {
            if (textRef.current) {
                gsap.from(textRef.current.children, {
                    y: 28,
                    opacity: 0,
                    duration: 0.9,
                    stagger: 0.08,
                    ease: "power3.out",
                });
            }
        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            id="product"
            ref={containerRef}
            className="relative min-h-screen w-full overflow-hidden bg-canvas"
        >
            <LandingNav />

            {/* Quiet lime / charcoal atmosphere */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(168,221,7,0.12),_transparent_55%)]" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(11,18,32,0.05),_transparent_50%)]" />
            <div
                className="pointer-events-none absolute inset-0 opacity-[0.35]"
                style={{
                    backgroundImage:
                        "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E\")",
                }}
            />

            <div className="relative z-10 container mx-auto px-6 min-h-screen flex items-center py-24 lg:py-0">
                <div className="grid w-full grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-12 items-center">
                    <div ref={textRef} className="relative max-w-xl">
                        <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.24em] text-ink-muted">
                            Enterprise gym operations
                        </p>
                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-[-0.04em] leading-[0.95] mb-6 text-ink">
                            Run your gym
                            <br />
                            <span className="text-gradient">like a business</span>
                        </h1>
                        <p className="text-lg md:text-xl text-ink-muted mb-9 max-w-md leading-relaxed">
                            Staff, schedules, pricing, and clients — one calm
                            operating system for multi-location fitness brands.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Link
                                href="/login"
                                className="px-6 py-3.5 bg-ink text-white rounded-full font-semibold text-base flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform shadow-[0_16px_40px_-18px_rgba(11,18,32,0.55)]"
                            >
                                Open owner portal <ArrowRight className="w-4 h-4" />
                            </Link>
                            <a
                                href="#footer"
                                className="px-6 py-3.5 rounded-full font-semibold text-base flex items-center justify-center border border-ink/10 bg-white/60 text-ink backdrop-blur-sm hover:bg-white transition-colors"
                            >
                                Talk to sales
                            </a>
                        </div>
                    </div>

                    <div className="relative flex justify-center lg:justify-end lg:pl-4">
                        <HeroVisual />
                    </div>
                </div>
            </div>
        </section>
    );
}

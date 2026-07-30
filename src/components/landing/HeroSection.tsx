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

            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,color-mix(in_srgb,var(--primary)_14%,transparent),transparent_55%)]" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,color-mix(in_srgb,var(--ink)_6%,transparent),transparent_50%)]" />

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
                                className="px-6 py-3.5 bg-primary text-primary-foreground rounded-full font-semibold text-base flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform shadow-lg shadow-primary/20"
                            >
                                Open owner portal <ArrowRight className="w-4 h-4" />
                            </Link>
                            <a
                                href="#footer"
                                className="px-6 py-3.5 rounded-full font-semibold text-base flex items-center justify-center border border-border bg-card/70 text-ink backdrop-blur-sm hover:bg-card transition-colors"
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

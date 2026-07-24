"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import HeroVisual from "./HeroVisual";

export default function HeroSection() {
    const containerRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            if (textRef.current) {
                gsap.from(textRef.current.children, {
                    y: 40,
                    opacity: 0,
                    duration: 1.2,
                    stagger: 0.1,
                    ease: "power3.out",
                });
            }
        });

        return () => ctx.revert();
    }, []);

    return (
        <section
            ref={containerRef}
            className="relative min-h-screen w-full overflow-hidden bg-[#f7f8fb]"
        >
            {/* Quiet atmosphere — no loud blobs */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(14,165,233,0.08),_transparent_55%)]" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(15,23,42,0.04),_transparent_50%)]" />

            <div className="relative z-10 container mx-auto px-6 min-h-screen flex items-center py-20 lg:py-0">
                <div className="grid w-full grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-10 items-center">
                    <div ref={textRef} className="relative max-w-xl">
                        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                            Gym management platform
                        </p>
                        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-[0.95] mb-6 text-slate-950">
                            ELEVATE YOUR <br />
                            <span className="text-gradient">GYM EMPIRE</span>
                        </h1>
                        <p className="text-lg md:text-xl text-slate-500 mb-8 max-w-md leading-relaxed">
                            The ultimate management platform designed for modern fitness business owners.
                            Streamline operations, engage members, and grow faster.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link
                                href="/login"
                                className="px-6 py-3.5 bg-slate-950 text-white rounded-full font-bold text-base flex items-center justify-center gap-2 hover:scale-[1.03] transition-transform shadow-lg shadow-slate-950/20"
                            >
                                Get Started Now <ArrowRight className="w-5 h-5" />
                            </Link>
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

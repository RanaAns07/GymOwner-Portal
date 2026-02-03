"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useRef } from "react";
import { gsap } from "gsap";
import Experience from "./Experience";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { PresentationControls, Float } from "@react-three/drei";
import Link from "next/link";

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
            className="relative h-screen w-full overflow-hidden bg-background"
        >
            {/* 3D Canvas - Now with explicit z-index and full interaction */}
            <div className="absolute inset-0 z-[1]">
                <Canvas
                    camera={{ position: [0, 0, 8], fov: 50 }}
                    dpr={[1, 2]}
                    gl={{ antialias: true, powerPreference: "high-performance" }}
                >
                    <Suspense fallback={null}>
                        <PresentationControls
                            global
                            rotation={[0, 0.3, 0]}
                            polar={[-Math.PI / 3, Math.PI / 3]}
                            azimuth={[-Math.PI / 1.4, Math.PI / 1.4]}
                            snap={true} // Fixed: boolean only
                            speed={2} // Increased rotation speed
                        >
                            <Experience />
                        </PresentationControls>
                    </Suspense>
                </Canvas>
            </div>

            {/* Hero Content - Positioned on the LEFT side only, with NO overlay on canvas */}
            <div className="absolute inset-0 z-[2] pointer-events-none">
                <div className="container mx-auto px-6 h-full flex items-center">
                    <div ref={textRef} className="max-w-xl w-full md:w-5/12 select-none">
                        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-tight mb-6 pointer-events-auto cursor-default">
                            ELEVATE YOUR <br />
                            <span className="text-gradient">GYM EMPIRE</span>
                        </h1>
                        <p className="text-lg md:text-xl text-muted-foreground mb-8 pointer-events-auto cursor-default">
                            The ultimate management platform designed for modern fitness business owners.
                            Streamline operations, engage members, and grow faster.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 pointer-events-auto">
                            <Link
                                href="/login"
                                className="px-6 py-3 bg-primary text-primary-foreground rounded-full font-bold text-base flex items-center justify-center gap-2 hover:scale-105 transition-transform"
                            >
                                Get Started Now <ArrowRight className="w-5 h-5" />
                            </Link>
                            <button className="px-6 py-3 glass rounded-full font-bold text-base hover:bg-white/10 transition-colors">
                                Watch Demo
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Background Glows - Behind everything */}
            <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[120px] z-0 pointer-events-none" />
            <div className="absolute bottom-1/4 left-0 w-[400px] h-[400px] bg-purple-500/20 rounded-full blur-[100px] z-0 pointer-events-none" />
        </section>
    );
}
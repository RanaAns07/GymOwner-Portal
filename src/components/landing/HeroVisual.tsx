"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

const hours = ["6 AM", "8 AM", "10 AM", "12 PM", "2 PM", "4 PM"];

const blocks = [
    {
        day: 0,
        top: "18%",
        height: "14%",
        label: "Strength",
        time: "7:00–8:00",
        color: "bg-sky-500",
    },
    {
        day: 1,
        top: "34%",
        height: "18%",
        label: "HIIT",
        time: "9:30–10:45",
        color: "bg-indigo-500",
    },
    {
        day: 2,
        top: "22%",
        height: "12%",
        label: "Yoga",
        time: "8:00–9:00",
        color: "bg-teal-500",
    },
    {
        day: 3,
        top: "48%",
        height: "16%",
        label: "PT Session",
        time: "12:00–1:15",
        color: "bg-amber-500",
    },
    {
        day: 4,
        top: "28%",
        height: "20%",
        label: "Open Gym",
        time: "9:00–11:00",
        color: "bg-slate-700",
    },
];

const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];

export default function HeroVisual() {
    const rootRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const root = rootRef.current;
        if (!root) return;

        const ctx = gsap.context(() => {
            const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

            tl.from(".hv-stage", {
                opacity: 0,
                y: 36,
                duration: 1,
            })
                .from(
                    ".hv-chrome",
                    { opacity: 0, y: 20, duration: 0.8 },
                    "-=0.55"
                )
                .from(
                    ".hv-block",
                    {
                        opacity: 0,
                        y: 14,
                        scale: 0.96,
                        duration: 0.55,
                        stagger: 0.07,
                    },
                    "-=0.35"
                )
                .from(
                    ".hv-stat",
                    { opacity: 0, x: 18, duration: 0.6, stagger: 0.1 },
                    "-=0.4"
                );

            gsap.to(".hv-stage", {
                y: -6,
                duration: 4.5,
                yoyo: true,
                repeat: -1,
                ease: "sine.inOut",
            });

            gsap.to(".hv-glow", {
                opacity: 0.55,
                scale: 1.06,
                duration: 3.2,
                yoyo: true,
                repeat: -1,
                ease: "sine.inOut",
            });

            gsap.to(".hv-live-dot", {
                scale: 1.35,
                opacity: 0.35,
                duration: 1.4,
                yoyo: true,
                repeat: -1,
                ease: "sine.inOut",
            });

            gsap.fromTo(
                ".hv-now-line",
                { scaleX: 0, transformOrigin: "left" },
                {
                    scaleX: 1,
                    duration: 1.2,
                    ease: "power2.out",
                    delay: 1,
                }
            );
        }, root);

        return () => ctx.revert();
    }, []);

    return (
        <div
            ref={rootRef}
            className="relative w-full max-w-[540px] mx-auto select-none"
            aria-hidden
        >
            {/* Soft backlight */}
            <div className="hv-glow pointer-events-none absolute -inset-8 rounded-[40px] bg-gradient-to-br from-sky-300/25 via-transparent to-indigo-300/20 blur-2xl" />

            <div
                className="hv-stage relative"
                style={{ perspective: "1400px" }}
            >
                <div
                    className="hv-chrome relative rounded-[24px] border border-slate-200/80 bg-white shadow-[0_40px_100px_-30px_rgba(15,23,42,0.35)] overflow-hidden lg:[transform:rotateY(-8deg)_rotateX(4deg)]"
                >
                    {/* Window chrome */}
                    <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/90 px-4 py-3">
                        <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                        <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                        <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                        <div className="ml-3 flex-1 rounded-full bg-white border border-slate-200 px-3 py-1">
                            <p className="text-[10px] text-slate-400 font-medium tracking-wide truncate">
                                app.gymflow.io / schedule
                            </p>
                        </div>
                        <div className="relative flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1">
                            <span className="hv-live-dot absolute left-2.5 h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            <span className="relative h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            <span className="text-[10px] font-semibold text-emerald-700">
                                Live
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-[1fr_128px] gap-0">
                        {/* Schedule canvas */}
                        <div className="p-4 sm:p-5 sm:border-r border-slate-100">
                            <div className="mb-4 flex items-end justify-between gap-3">
                                <div>
                                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-semibold">
                                        This week
                                    </p>
                                    <p className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                                        Jul 20 — 26
                                    </p>
                                </div>
                                <p className="text-[11px] text-slate-500 font-medium">
                                    36 sessions
                                </p>
                            </div>

                            {/* Day headers */}
                            <div className="mb-2 grid grid-cols-[36px_repeat(5,1fr)] gap-1.5">
                                <div />
                                {days.map((d, i) => (
                                    <div
                                        key={d}
                                        className={`text-center text-[10px] font-semibold ${
                                            i === 3
                                                ? "text-sky-600"
                                                : "text-slate-400"
                                        }`}
                                    >
                                        {d}
                                        <div
                                            className={`mx-auto mt-1 flex h-6 w-6 items-center justify-center rounded-full text-[11px] ${
                                                i === 3
                                                    ? "bg-sky-600 text-white"
                                                    : "text-slate-700"
                                            }`}
                                        >
                                            {20 + i}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Grid */}
                            <div className="relative grid grid-cols-[36px_repeat(5,1fr)] gap-1.5 h-[220px] sm:h-[250px]">
                                {/* Time labels */}
                                <div className="relative">
                                    {hours.map((h, i) => (
                                        <p
                                            key={h}
                                            className="absolute left-0 text-[9px] text-slate-400 font-medium -translate-y-1/2"
                                            style={{ top: `${(i / (hours.length - 1)) * 100}%` }}
                                        >
                                            {h}
                                        </p>
                                    ))}
                                </div>

                                {/* Day columns */}
                                {days.map((_, dayIndex) => (
                                    <div
                                        key={dayIndex}
                                        className="relative rounded-xl bg-slate-50 border border-slate-100 overflow-hidden"
                                    >
                                        {/* hour lines */}
                                        {[20, 40, 60, 80].map((t) => (
                                            <div
                                                key={t}
                                                className="absolute left-0 right-0 border-t border-slate-200/70"
                                                style={{ top: `${t}%` }}
                                            />
                                        ))}

                                        {blocks
                                            .filter((b) => b.day === dayIndex)
                                            .map((b) => (
                                                <div
                                                    key={`${b.day}-${b.label}`}
                                                    className={`hv-block absolute left-1 right-1 rounded-lg ${b.color} px-1.5 py-1 text-white shadow-sm shadow-slate-900/10`}
                                                    style={{
                                                        top: b.top,
                                                        height: b.height,
                                                    }}
                                                >
                                                    <p className="text-[9px] font-bold leading-tight truncate">
                                                        {b.label}
                                                    </p>
                                                    <p className="text-[8px] opacity-80 leading-tight truncate hidden sm:block">
                                                        {b.time}
                                                    </p>
                                                </div>
                                            ))}

                                        {/* Now line on Thursday */}
                                        {dayIndex === 3 && (
                                            <div
                                                className="hv-now-line absolute left-0 right-0 z-10 flex items-center"
                                                style={{ top: "58%" }}
                                            >
                                                <span className="h-2 w-2 rounded-full bg-rose-500 shrink-0 -ml-0.5" />
                                                <span className="h-[2px] flex-1 bg-rose-500" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Side insight rail — no overlap */}
                        <div className="bg-slate-950 text-white p-4 flex flex-row sm:flex-col justify-between gap-4 border-t sm:border-t-0 border-slate-100">
                            <div className="grid grid-cols-3 sm:grid-cols-1 gap-4 sm:gap-0 flex-1 sm:flex-none">
                                <div className="hv-stat sm:mb-5">
                                    <p className="text-[10px] text-slate-400 mb-1">
                                        Fill rate
                                    </p>
                                    <p className="text-xl sm:text-2xl font-bold tracking-tight">
                                        91%
                                    </p>
                                    <div className="mt-2 h-1.5 rounded-full bg-slate-800 overflow-hidden hidden sm:block">
                                        <div className="h-full w-[91%] rounded-full bg-gradient-to-r from-sky-400 to-cyan-300" />
                                    </div>
                                </div>
                                <div className="hv-stat sm:mb-5">
                                    <p className="text-[10px] text-slate-400 mb-1">
                                        Check-ins
                                    </p>
                                    <p className="text-xl sm:text-2xl font-bold tracking-tight">
                                        +124
                                    </p>
                                    <p className="text-[10px] text-emerald-400 font-semibold mt-1 hidden sm:block">
                                        vs yesterday
                                    </p>
                                </div>
                                <div className="hv-stat">
                                    <p className="text-[10px] text-slate-400 mb-1">
                                        Revenue
                                    </p>
                                    <p className="text-xl sm:text-2xl font-bold tracking-tight">
                                        $48k
                                    </p>
                                    <p className="text-[10px] text-emerald-400 font-semibold mt-1 hidden sm:block">
                                        ↑ 12% MoM
                                    </p>
                                </div>
                            </div>

                            <div className="hv-stat rounded-xl bg-white/5 border border-white/10 p-3 hidden sm:block">
                                <p className="text-[10px] text-slate-400 mb-2">
                                    On the floor
                                </p>
                                <div className="flex -space-x-2 mb-2">
                                    {["#38bdf8", "#818cf8", "#34d399", "#fbbf24"].map(
                                        (c) => (
                                            <span
                                                key={c}
                                                className="h-6 w-6 rounded-full border-2 border-slate-950"
                                                style={{ backgroundColor: c }}
                                            />
                                        )
                                    )}
                                </div>
                                <p className="text-xs font-semibold">
                                    6 trainers live
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

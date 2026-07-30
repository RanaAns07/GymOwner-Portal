"use client";

import { Linkedin } from "lucide-react";
import Link from "next/link";

export default function Footer() {
    return (
        <footer id="footer" className="border-t border-border bg-ink text-white">
            <div className="container mx-auto px-6 py-16">
                <div className="flex flex-col md:flex-row justify-between gap-12">
                    <div className="max-w-sm">
                        <h2 className="text-2xl font-extrabold tracking-tight">
                            Gym<span className="text-primary">Flow</span>
                        </h2>
                        <p className="mt-3 text-sm text-white/55 leading-relaxed">
                            The operating system for fitness businesses that
                            outgrow spreadsheets — built for owners running
                            serious gyms.
                        </p>
                    </div>

                    <div className="flex gap-14">
                        <div className="flex flex-col gap-3">
                            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/40">
                                Product
                            </span>
                            <Link
                                href="/login"
                                className="text-sm text-white/70 hover:text-primary transition-colors"
                            >
                                Owner portal
                            </Link>
                            <a
                                href="#product"
                                className="text-sm text-white/70 hover:text-primary transition-colors"
                            >
                                Overview
                            </a>
                        </div>
                        <div className="flex flex-col gap-3">
                            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/40">
                                Company
                            </span>
                            <a
                                href="#"
                                className="text-sm text-white/70 hover:text-primary transition-colors"
                            >
                                Contact
                            </a>
                            <a
                                href="#"
                                className="text-sm text-white/70 hover:text-primary transition-colors"
                            >
                                Security
                            </a>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 md:items-end">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/40">
                            Connect
                        </span>
                        <a
                            href="#"
                            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/70 hover:border-primary/40 hover:text-primary transition-colors"
                            aria-label="LinkedIn"
                        >
                            <Linkedin className="w-4 h-4" />
                        </a>
                    </div>
                </div>

                <div className="mt-14 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-white/40 text-xs">
                    <p>© 2026 GymFlow. All rights reserved.</p>
                    <div className="flex gap-6">
                        <a href="#" className="hover:text-white/70 transition-colors">
                            Privacy
                        </a>
                        <a href="#" className="hover:text-white/70 transition-colors">
                            Terms
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}

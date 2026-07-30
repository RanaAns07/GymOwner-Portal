"use client";

import { useState } from "react";
import { Dumbbell, ArrowRight, Mail, Lock, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useAuth } from "../../providers/auth-context";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export default function LoginPage() {
    const { login } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            await login(email, password);
        } catch (err: unknown) {
            console.error("Login Error:", err);
            const message =
                err instanceof Error
                    ? err.message
                    : "Invalid email or password. Please try again.";
            setError(message);
            setIsLoading(false);
        }
    };

    return (
        <main className="relative min-h-screen flex items-center justify-center overflow-hidden bg-canvas px-6 py-12">
            <div className="absolute right-4 top-4 z-20 sm:right-6 sm:top-6">
                <ThemeToggle />
            </div>
            <div className="pointer-events-none absolute top-0 right-0 w-[520px] h-[520px] bg-primary/15 rounded-full blur-[120px]" />
            <div className="pointer-events-none absolute bottom-0 left-0 w-[420px] h-[420px] bg-ink/5 rounded-full blur-[100px]" />

            <div className="relative z-10 w-full max-w-md">
                <div className="mb-10 text-center">
                    <Link href="/" className="inline-flex flex-col items-center gap-4 group">
                        <div className="w-14 h-14 rounded-2xl bg-[#0b1220] text-primary dark:bg-primary dark:text-primary-foreground flex items-center justify-center shadow-[0_16px_40px_-18px_rgba(11,18,32,0.55)] group-hover:scale-105 transition-transform">
                            <Dumbbell className="w-7 h-7" />
                        </div>
                        <div>
                            <p className="text-[11px] font-semibold tracking-[0.22em] uppercase text-ink-muted mb-2">
                                Owner Portal
                            </p>
                            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight text-ink">
                                Welcome to{" "}
                                <span className="text-gradient">GymFlow</span>
                            </h1>
                        </div>
                    </Link>
                    <p className="mt-3 text-ink-muted text-base">
                        Sign in to manage your fitness business.
                    </p>
                </div>

                <div className="rounded-3xl border border-border bg-card/90 backdrop-blur-xl shadow-[0_24px_60px_-28px_rgba(11,18,32,0.2)] p-8 sm:p-10">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 p-3.5 rounded-2xl flex items-start gap-2.5 text-sm">
                                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label
                                className="text-sm font-medium text-ink"
                                htmlFor="email"
                            >
                                Email Address
                            </label>
                            <div className="relative group">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted group-focus-within:text-ink transition-colors" />
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@gym.com"
                                    autoComplete="email"
                                    className="flex h-12 w-full rounded-full border border-border bg-canvas/50 pl-10 pr-4 text-sm text-ink placeholder:text-ink-muted outline-none transition-all focus:border-primary/40 focus:bg-card focus:ring-4 focus:ring-primary/15"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label
                                    className="text-sm font-medium text-ink"
                                    htmlFor="password"
                                >
                                    Password
                                </label>
                                <a
                                    href="#"
                                    className="text-xs font-medium text-ink-muted hover:text-ink transition-colors"
                                >
                                    Forgot password?
                                </a>
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted group-focus-within:text-ink transition-colors" />
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    autoComplete="current-password"
                                    className="flex h-12 w-full rounded-full border border-border bg-canvas/50 pl-10 pr-4 text-sm text-ink placeholder:text-ink-muted outline-none transition-all focus:border-primary/40 focus:bg-card focus:ring-4 focus:ring-primary/15"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-2 h-12 mt-2 rounded-full bg-primary text-primary-foreground font-bold text-base hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg shadow-primary/20"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                            ) : (
                                <>
                                    Sign In
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <p className="mt-8 text-center text-sm text-ink-muted">
                    <Link href="/" className="hover:text-ink transition-colors">
                        ← Back to home
                    </Link>
                </p>
            </div>
        </main>
    );
}

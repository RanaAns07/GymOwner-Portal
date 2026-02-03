"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dumbbell, ArrowRight, Mail, Lock, AlertCircle } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { setTokens } from "../../lib/auth";

const MovingDumbbell = dynamic(() => import("../../components/landing/MovingDumbbell"), { ssr: false });
const Clouds = dynamic(() => import("../../components/landing/Clouds"), { ssr: false });

export default function LoginPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch("/api/proxy/v1/users/auth/login/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                // Success: store tokens and redirect
                setTokens(data.access, data.refresh);
                router.push("/dashboard");
            } else {
                // Error: show message
                setError(data.message || data.detail || "Invalid email or password. Please try again.");
            }
        } catch (err) {
            console.error("Login Error:", err);
            setError("Something went wrong. Please check your connection and try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-b from-sky-200 via-blue-100 to-white">
            {/* 3D Moving Dumbbell Background */}
            <MovingDumbbell />

            {/* Animated Clouds - more visible on light bg */}
            <Clouds />

            {/* Very subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-white/60 via-transparent to-sky-100/30 z-[1] pointer-events-none" />

            {/* Soft glow effects - lighter colors */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-300/20 rounded-full blur-[100px] z-[2]" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-200/20 rounded-full blur-[80px] z-[2]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-sky-200/10 rounded-full blur-[120px] z-[2]" />

            <div className="w-full max-w-md px-6 relative z-10">
                {/* Card with glass effect - adjusted for light theme */}
                <div className="relative rounded-3xl p-8 md:p-10 shadow-2xl overflow-hidden border border-white/40">
                    {/* Gradient background - lighter purple */}
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-500/90 via-purple-600/90 to-fuchsia-600/90" />

                    {/* Glass overlay */}
                    <div className="absolute inset-0 backdrop-blur-2xl bg-white/5" />

                    {/* Shine effects */}
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                    {/* Subtle inner glow */}
                    <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full blur-3xl" />

                    {/* Content */}
                    <div className="relative z-10">
                        <div className="flex flex-col items-center mb-10 text-center">
                            <Link href="/" className="mb-6 group">
                                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:bg-white/30 group-hover:scale-110 transition-all duration-300 border border-white/30 shadow-lg">
                                    <Dumbbell className="w-8 h-8 text-white" />
                                </div>
                            </Link>
                            <h1 className="text-3xl font-bold tracking-tight mb-2 text-white drop-shadow-md">
                                Welcome Back
                            </h1>
                            <p className="text-purple-100">Log in to manage your fitness empire</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="bg-red-500/20 border border-red-500/50 text-white p-3 rounded-xl flex items-center gap-2 text-sm backdrop-blur-md animate-in fade-in slide-in-from-top-2">
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none text-white/90" htmlFor="email">
                                    Email Address
                                </label>
                                <div className="relative group">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-200 group-focus-within:text-white transition-colors" />
                                    <input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="name@gym.com"
                                        className="flex h-12 w-full rounded-xl border border-white/20 bg-black/20 pl-10 pr-3 py-2 text-sm text-white placeholder:text-purple-200/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:border-white/30 transition-all backdrop-blur-md hover:bg-black/30"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium leading-none text-white/90" htmlFor="password">
                                        Password
                                    </label>
                                    <a href="#" className="text-xs text-pink-200 hover:text-white hover:underline transition-colors">Forgot password?</a>
                                </div>
                                <div className="relative group">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-200 group-focus-within:text-white transition-colors" />
                                    <input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="flex h-12 w-full rounded-xl border border-white/20 bg-black/20 pl-10 pr-3 py-2 text-sm text-white placeholder:text-purple-200/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:border-white/30 transition-all backdrop-blur-md hover:bg-black/30"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex items-center justify-center gap-2 h-12 px-4 py-2 bg-white text-purple-700 rounded-xl font-bold hover:shadow-lg hover:shadow-purple-500/30 hover:scale-[1.02] transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-purple-300 border-t-purple-600 rounded-full animate-spin" />
                                ) : (
                                    <>Sign In <ArrowRight className="w-4 h-4" /></>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </main>
    );
}

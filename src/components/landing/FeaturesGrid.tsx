"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Users, BarChart3, Calendar, Shield, Zap, Globe } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const features = [
    {
        icon: <Users className="w-8 h-8" />,
        title: "Member Management",
        description: "Effortlessly track attendance, memberships, and personal training sessions."
    },
    {
        icon: <BarChart3 className="w-8 h-8" />,
        title: "Advanced Analytics",
        description: "Real-time insights into your gym's financial health and growth trends."
    },
    {
        icon: <Calendar className="w-8 h-8" />,
        title: "Automated Scheduling",
        description: "Manage classes and trainer schedules with an intuitive drag-and-drop interface."
    },
    {
        icon: <Shield className="w-8 h-8" />,
        title: "Secure Payments",
        description: "Integrated billing with automatic recurring payments and fraud protection."
    },
    {
        icon: <Zap className="w-8 h-8" />,
        title: "Performance Tracking",
        description: "Allow members to log workouts and track progress through their own portal."
    },
    {
        icon: <Globe className="w-8 h-8" />,
        title: "Global Scalability",
        description: "Manage multiple locations from a single, centralized dashboard."
    }
];

export default function FeaturesGrid() {
    const gridRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (gridRef.current) {
            const cards = gridRef.current.querySelectorAll(".feature-card");

            gsap.from(cards, {
                scrollTrigger: {
                    trigger: gridRef.current,
                    start: "top 80%",
                },
                y: 60,
                opacity: 0,
                duration: 0.8,
                stagger: 0.1,
                ease: "power2.out"
            });
        }
    }, []);

    return (
        <section className="py-24 bg-background relative overflow-hidden">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-6xl font-bold mb-4">Precision Engineered Features</h2>
                    <p className="text-muted-foreground text-xl max-w-2xl mx-auto">
                        Everything you need to run a world-class fitness facility at your fingertips.
                    </p>
                </div>

                <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="feature-card p-8 rounded-3xl glass transition-all duration-300 hover:scale-[1.02] hover:bg-white/10 group"
                        >
                            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                {feature.icon}
                            </div>
                            <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

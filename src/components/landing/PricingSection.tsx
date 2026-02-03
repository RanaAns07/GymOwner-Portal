"use client";

import { Check } from "lucide-react";

const plans = [
    {
        name: "Starter",
        price: "$49",
        description: "Perfect for boutique studios and newcomers.",
        features: ["Up to 100 members", "Standard Analytics", "Class Scheduling", "Email Support"]
    },
    {
        name: "Professional",
        price: "$99",
        description: "Optimized for growing gyms with multiple trainers.",
        features: ["Unlimited members", "Advanced Analytics", "Trainer Portals", "Priority Support", "Automated Billing"],
        popular: true
    },
    {
        name: "Enterprise",
        price: "Custom",
        description: "For multi-location franchises and large chains.",
        features: ["Franchise Management", "Custom API Access", "Dedicated Success Manager", "White-label Options"]
    }
];

export default function PricingSection() {
    return (
        <section className="py-24 bg-background/50">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-6xl font-bold mb-4">Scalable Pricing</h2>
                    <p className="text-muted-foreground text-xl max-w-2xl mx-auto">
                        Choose the plan that fits your gym's size and ambitions.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {plans.map((plan, index) => (
                        <div
                            key={index}
                            className={`p-8 rounded-3xl glass flex flex-col relative transition-transform duration-300 hover:translate-y-[-10px] ${plan.popular ? "border-primary/50 ring-2 ring-primary/20" : ""
                                }`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground text-sm font-bold rounded-full">
                                    MOST POPULAR
                                </div>
                            )}
                            <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                            <div className="flex items-baseline gap-1 mb-4">
                                <span className="text-5xl font-bold">{plan.price}</span>
                                {plan.price !== "Custom" && <span className="text-muted-foreground">/mo</span>}
                            </div>
                            <p className="text-muted-foreground mb-8">{plan.description}</p>

                            <ul className="space-y-4 mb-10 flex-grow">
                                {plan.features.map((feature, fIndex) => (
                                    <li key={fIndex} className="flex items-center gap-3">
                                        <div className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                                            <Check className="w-3 h-3" />
                                        </div>
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <button className={`w-full py-4 rounded-full font-bold transition-colors ${plan.popular ? "bg-primary text-primary-foreground hover:bg-primary/90" : "glass hover:bg-white/10"
                                }`}>
                                Choose {plan.name}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

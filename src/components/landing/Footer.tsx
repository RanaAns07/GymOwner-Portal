"use client";

import { Instagram, Twitter, Linkedin, Github } from "lucide-react";

export default function Footer() {
    return (
        <footer className="py-12 border-t border-border bg-background">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex flex-col gap-2">
                        <h2 className="text-2xl font-bold tracking-tighter">GYM<span className="text-primary">OWNER</span></h2>
                        <p className="text-muted-foreground text-sm max-w-xs">
                            Empowering fitness business owners with state-of-the-art management tools and analytics.
                        </p>
                    </div>

                    <div className="flex gap-8">
                        <div className="flex flex-col gap-3">
                            <span className="font-bold text-sm">Product</span>
                            <a href="#" className="text-muted-foreground text-sm hover:text-foreground">Features</a>
                            <a href="#" className="text-muted-foreground text-sm hover:text-foreground">Pricing</a>
                            <a href="#" className="text-muted-foreground text-sm hover:text-foreground">Security</a>
                        </div>
                        <div className="flex flex-col gap-3">
                            <span className="font-bold text-sm">Company</span>
                            <a href="#" className="text-muted-foreground text-sm hover:text-foreground">About</a>
                            <a href="#" className="text-muted-foreground text-sm hover:text-foreground">Blog</a>
                            <a href="#" className="text-muted-foreground text-sm hover:text-foreground">Contact</a>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 items-center md:items-end">
                        <span className="font-bold text-sm">Join the Community</span>
                        <div className="flex gap-4">
                            <a href="#" className="p-2 glass rounded-full hover:text-primary transition-colors"><Twitter className="w-5 h-5" /></a>
                            <a href="#" className="p-2 glass rounded-full hover:text-primary transition-colors"><Instagram className="w-5 h-5" /></a>
                            <a href="#" className="p-2 glass rounded-full hover:text-primary transition-colors"><Linkedin className="w-5 h-5" /></a>
                            <a href="#" className="p-2 glass rounded-full hover:text-primary transition-colors"><Github className="w-5 h-5" /></a>
                        </div>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-muted-foreground text-xs text-center md:text-left">
                    <p>© 2026 GymOwner Portal. All rights reserved.</p>
                    <div className="flex gap-6">
                        <a href="#" className="hover:text-foreground">Privacy Policy</a>
                        <a href="#" className="hover:text-foreground">Terms of Service</a>
                        <a href="#" className="hover:text-foreground">Cookie Policy</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}

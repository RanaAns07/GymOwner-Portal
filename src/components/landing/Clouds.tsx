"use client";

import { useEffect, useRef } from "react";

interface Cloud {
    id: number;
    x: number;
    y: number;
    scale: number;
    opacity: number;
    speed: number;
}

export default function Clouds() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const cloudsRef = useRef<Cloud[]>([]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener("resize", resize);

        // Initialize clouds - more visible and bluish
        for (let i = 0; i < 6; i++) {
            cloudsRef.current.push({
                id: i,
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height * 0.7,
                scale: 0.8 + Math.random() * 1.2,
                opacity: 0.3 + Math.random() * 0.4, // Increased opacity
                speed: 0.3 + Math.random() * 0.4,
            });
        }

        const drawCloud = (cloud: Cloud) => {
            ctx.save();
            ctx.globalAlpha = cloud.opacity;
            ctx.translate(cloud.x, cloud.y);
            ctx.scale(cloud.scale, cloud.scale);

            // Bluish tint for clouds
            const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 60);
            gradient.addColorStop(0, "rgba(200, 220, 255, 0.9)"); // Light blue center
            gradient.addColorStop(0.5, "rgba(150, 180, 255, 0.6)"); // Mid blue
            gradient.addColorStop(1, "rgba(100, 150, 255, 0)"); // Fade to transparent

            ctx.fillStyle = gradient;

            // Draw multiple circles to form a cloud
            const circles = [
                { x: 0, y: 0, r: 35 },
                { x: 30, y: -15, r: 40 },
                { x: 60, y: 0, r: 35 },
                { x: 30, y: 15, r: 30 },
                { x: -20, y: 10, r: 30 },
                { x: 45, y: -5, r: 25 },
            ];

            circles.forEach((circle) => {
                ctx.beginPath();
                ctx.arc(circle.x, circle.y, circle.r, 0, Math.PI * 2);
                ctx.fill();
            });

            ctx.restore();
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            cloudsRef.current.forEach((cloud) => {
                cloud.x += cloud.speed;

                if (cloud.x > canvas.width + 150) {
                    cloud.x = -150;
                    cloud.y = Math.random() * canvas.height * 0.7;
                }

                drawCloud(cloud);
            });

            requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener("resize", resize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 z-[1] pointer-events-none"
            style={{ filter: "blur(0.5px)" }}
        />
    );
}
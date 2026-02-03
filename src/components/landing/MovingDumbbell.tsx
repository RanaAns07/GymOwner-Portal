"use client";

import { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface DumbbellProps {
    startX: number;
    startY: number;
    velocityX: number;
    velocityY: number;
    rotationSpeed: number;
}

function BouncingDumbbell({ startX, startY, velocityX, velocityY, rotationSpeed }: DumbbellProps) {
    const groupRef = useRef<THREE.Group>(null);
    const velocity = useRef({ x: velocityX, y: velocityY, z: velocityX * 0.5 });
    const position = useRef({ x: startX, y: startY, z: 0 });
    const rotation = useRef({ x: rotationSpeed, y: rotationSpeed * 1.5, z: rotationSpeed * 0.8 });

    const [isDark, setIsDark] = useState(true);

    // Black and hot pink (#fa60f5) toggle
    const ironColor = isDark ? "#111827" : "#fa60f5";
    const weightColor = isDark ? "#030712" : "#fa60f5";
    const emissive = isDark ? "#000000" : "#fa60f5";
    const emissiveIntensity = isDark ? 0 : 0.4;

    const bounds = { x: 8, y: 5, z: 3 };

    const handleBounce = () => {
        setIsDark(prev => !prev);
    };

    useFrame(() => {
        if (!groupRef.current) return;

        position.current.x += velocity.current.x;
        position.current.y += velocity.current.y;
        position.current.z += velocity.current.z;

        let bounced = false;

        if (position.current.x > bounds.x || position.current.x < -bounds.x) {
            velocity.current.x *= -1;
            bounced = true;
        }
        if (position.current.y > bounds.y || position.current.y < -bounds.y) {
            velocity.current.y *= -1;
            bounced = true;
        }
        if (position.current.z > bounds.z || position.current.z < -bounds.z) {
            velocity.current.z *= -1;
            bounced = true;
        }

        if (bounced) {
            handleBounce();
        }

        groupRef.current.position.set(
            position.current.x,
            position.current.y,
            position.current.z
        );

        groupRef.current.rotation.x += rotation.current.x;
        groupRef.current.rotation.y += rotation.current.y;
        groupRef.current.rotation.z += rotation.current.z;
    });

    return (
        <group ref={groupRef} scale={0.5}>
            {/* Handle */}
            <mesh rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.12, 0.12, 4.5, 24]} />
                <meshStandardMaterial
                    color={ironColor}
                    roughness={0.2}
                    metalness={0.8}
                    emissive={emissive}
                    emissiveIntensity={emissiveIntensity}
                />
            </mesh>

            {/* Left Weights */}
            <group position={[-1.8, 0, 0]}>
                <mesh rotation={[0, 0, Math.PI / 2]}>
                    <cylinderGeometry args={[1, 1, 0.6, 24]} />
                    <meshStandardMaterial
                        color={weightColor}
                        roughness={0.3}
                        metalness={0.7}
                        emissive={emissive}
                        emissiveIntensity={emissiveIntensity}
                    />
                </mesh>
                <mesh position={[-0.6, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                    <cylinderGeometry args={[0.8, 0.8, 0.5, 24]} />
                    <meshStandardMaterial
                        color={weightColor}
                        roughness={0.3}
                        metalness={0.7}
                        emissive={emissive}
                        emissiveIntensity={emissiveIntensity}
                    />
                </mesh>
            </group>

            {/* Right Weights */}
            <group position={[1.8, 0, 0]}>
                <mesh rotation={[0, 0, Math.PI / 2]}>
                    <cylinderGeometry args={[1, 1, 0.6, 24]} />
                    <meshStandardMaterial
                        color={weightColor}
                        roughness={0.3}
                        metalness={0.7}
                        emissive={emissive}
                        emissiveIntensity={emissiveIntensity}
                    />
                </mesh>
                <mesh position={[0.6, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                    <cylinderGeometry args={[0.8, 0.8, 0.5, 24]} />
                    <meshStandardMaterial
                        color={weightColor}
                        roughness={0.3}
                        metalness={0.7}
                        emissive={emissive}
                        emissiveIntensity={emissiveIntensity}
                    />
                </mesh>
            </group>
        </group>
    );
}

export default function MovingDumbbell() {
    return (
        <div className="absolute inset-0 z-0">
            <Canvas
                camera={{ position: [0, 0, 12], fov: 50 }}
                dpr={[1, 2]}
                gl={{ antialias: true, alpha: true }}
            >
                <ambientLight intensity={0.8} />
                <directionalLight position={[5, 10, 5]} intensity={1.2} color="#ffffff" />
                <pointLight position={[10, 10, 10]} intensity={1} color="#ffffff" />
                <pointLight position={[-10, -10, -5]} intensity={0.8} color="#fa60f5" />

                <BouncingDumbbell
                    startX={-4}
                    startY={2}
                    velocityX={0.025}
                    velocityY={0.018}
                    rotationSpeed={0.015}
                />

                <BouncingDumbbell
                    startX={4}
                    startY={-2}
                    velocityX={-0.022}
                    velocityY={-0.025}
                    rotationSpeed={0.018}
                />
            </Canvas>
        </div>
    );
}
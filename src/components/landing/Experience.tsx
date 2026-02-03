import { useFrame, useThree } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import { useRef, useMemo } from "react";
import * as THREE from "three";

function AnimatedDumbbell() {
    const groupRef = useRef<THREE.Group>(null);
    const { viewport } = useThree();

    // Velocity and position state
    const velocity = useMemo(() => new THREE.Vector3(0.02, 0.015, 0), []);

    useFrame((state) => {
        if (groupRef.current) {
            // Update position
            groupRef.current.position.x += velocity.x;
            groupRef.current.position.y += velocity.y;

            // Simple bounce logic based on viewport constraints
            const margin = 2; // Keep it within view
            const boundX = viewport.width / 2 - margin;
            const boundY = viewport.height / 2 - margin;

            if (Math.abs(groupRef.current.position.x) > boundX) {
                velocity.x *= -1;
                groupRef.current.position.x = Math.sign(groupRef.current.position.x) * boundX;
            }
            if (Math.abs(groupRef.current.position.y) > boundY) {
                velocity.y *= -1;
                groupRef.current.position.y = Math.sign(groupRef.current.position.y) * boundY;
            }

            // Sync rotation with movement for organic feel
            groupRef.current.rotation.z += 0.01;
        }
    });

    const ironColor = "#9ca3af";
    const weightColor = "#111827";

    return (
        <group ref={groupRef}>
            <Float
                speed={4}
                rotationIntensity={1.2}
                floatIntensity={1.5}
            >
                <group scale={0.8}>
                    {/* Handle */}
                    <mesh rotation={[0, 0, Math.PI / 2]}>
                        <cylinderGeometry args={[0.12, 0.12, 4.5, 24]} />
                        <meshStandardMaterial color={ironColor} roughness={0.3} metalness={0.7} />
                    </mesh>

                    {/* Left Weights */}
                    <group position={[-1.8, 0, 0]}>
                        <mesh rotation={[0, 0, Math.PI / 2]}>
                            <cylinderGeometry args={[1, 1, 0.6, 24]} />
                            <meshStandardMaterial color={weightColor} roughness={0.4} metalness={0.5} />
                        </mesh>
                        <mesh position={[-0.6, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                            <cylinderGeometry args={[0.8, 0.8, 0.5, 24]} />
                            <meshStandardMaterial color={weightColor} roughness={0.4} metalness={0.5} />
                        </mesh>
                    </group>

                    {/* Right Weights */}
                    <group position={[1.8, 0, 0]}>
                        <mesh rotation={[0, 0, Math.PI / 2]}>
                            <cylinderGeometry args={[1, 1, 0.6, 24]} />
                            <meshStandardMaterial color={weightColor} roughness={0.4} metalness={0.5} />
                        </mesh>
                        <mesh position={[0.6, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                            <cylinderGeometry args={[0.8, 0.8, 0.5, 24]} />
                            <meshStandardMaterial color={weightColor} roughness={0.4} metalness={0.5} />
                        </mesh>
                    </group>
                </group>
            </Float>
        </group>
    );
}

export default function Experience() {
    return (
        <>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1.5} />
            <pointLight position={[-10, -10, -5]} intensity={1} color="#3b82f6" />
            <AnimatedDumbbell />
        </>
    );
}

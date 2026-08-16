"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";
import { Scene3D } from "./Scene3D";

/* ─── Parallax depth planes with wireframe grid ─── */
function DepthPlane({
  position,
  scale = 1,
  opacity = 0.06,
  speed = 0.3,
}: {
  position: [number, number, number];
  scale?: number;
  opacity?: number;
  speed?: number;
}) {
  const ref = useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ref.current) {
      ref.current.rotation.z = Math.sin(t * speed) * 0.02;
      ref.current.position.y =
        position[1] + Math.sin(t * speed * 0.7) * 0.08;
    }
  });

  return (
    <mesh ref={ref} position={position} scale={scale}>
      <planeGeometry args={[4, 2.5, 8, 5]} />
      <meshBasicMaterial
        color="#9f86e0"
        wireframe
        transparent
        opacity={opacity}
      />
    </mesh>
  );
}

/* ─── Floating accent geometries ─── */
function AccentGem({
  position,
  color,
  scale = 0.2,
  speed = 1,
}: {
  position: [number, number, number];
  color: string;
  scale?: number;
  speed?: number;
}) {
  const ref = useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ref.current) {
      ref.current.rotation.x = t * 0.3 * speed;
      ref.current.rotation.y = t * 0.2 * speed;
      ref.current.position.y =
        position[1] + Math.sin(t * speed) * 0.1;
    }
  });

  return (
    <Float speed={speed} rotationIntensity={0.5} floatIntensity={0.4}>
      <mesh ref={ref} position={position} scale={scale}>
        <octahedronGeometry args={[1, 0]} />
        <MeshDistortMaterial
          color={color}
          roughness={0.1}
          metalness={0.85}
          distort={0.2}
          speed={1}
          emissive={color}
          emissiveIntensity={0.15}
          toneMapped={false}
        />
      </mesh>
    </Float>
  );
}

/* ─── Dust particles ─── */
function DustMotes({ count = 100 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null!);

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 14;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 2] = -1 - Math.random() * 5;
    }
    return pos;
  }, [count]);

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.getElapsedTime() * 0.008;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.012}
        color="#c9b8e8"
        transparent
        opacity={0.25}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/* ─── Composed work scene ─── */
function WorkSceneContent() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[6, 6, 6]} intensity={0.8} color="#ffffff" />
      <pointLight position={[-4, -3, 4]} intensity={0.4} color="#9f86e0" />

      <DepthPlane position={[0, 0, -4]} scale={1.2} opacity={0.04} speed={0.2} />
      <DepthPlane
        position={[0, 0, -6]}
        scale={1.6}
        opacity={0.025}
        speed={0.15}
      />

      <AccentGem position={[-4, 2, -2]} color="#9f86e0" scale={0.18} speed={0.8} />
      <AccentGem position={[4.5, -1.5, -3]} color="#7b62c9" scale={0.14} speed={1.2} />
      <AccentGem position={[-3, -2.5, -2.5]} color="#c9b8e8" scale={0.12} speed={0.6} />

      <DustMotes count={80} />
    </>
  );
}

export function WorkScene() {
  return (
    <Scene3D
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
      }}
    >
      <WorkSceneContent />
    </Scene3D>
  );
}

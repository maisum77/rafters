"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";
import { Scene3D } from "./Scene3D";

/* ─── Floating diamond shapes ─── */
function Diamond({
  position,
  color,
  scale = 0.3,
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
      ref.current.rotation.y = t * 0.3 * speed;
      ref.current.rotation.z = Math.sin(t * speed * 0.5) * 0.15;
      ref.current.position.y =
        position[1] + Math.sin(t * speed * 0.6) * 0.1;
    }
  });

  return (
    <Float speed={speed} rotationIntensity={0.5} floatIntensity={0.4}>
      <mesh ref={ref} position={position} scale={scale}>
        <octahedronGeometry args={[1, 0]} />
        <MeshDistortMaterial
          color={color}
          roughness={0.08}
          metalness={0.88}
          distort={0.12}
          speed={speed * 0.6}
          envMapIntensity={1.5}
        />
      </mesh>
    </Float>
  );
}

/* ─── Gentle floating particles ─── */
function GentleParticles({ count = 80 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null!);

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 8;
      pos[i * 3 + 2] = -1 - Math.random() * 3;
    }
    return pos;
  }, [count]);

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.getElapsedTime() * 0.01;
      ref.current.position.y = Math.sin(clock.getElapsedTime() * 0.15) * 0.2;
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
        opacity={0.3}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/* ─── Composed process scene ─── */
function ProcessSceneContent() {
  return (
    <>
      <ambientLight intensity={0.35} />
      <pointLight position={[6, 5, 6]} intensity={0.8} color="#ffffff" />
      <pointLight position={[-4, -3, 4]} intensity={0.4} color="#9f86e0" />

      <Diamond
        position={[-3.5, 1, -2]}
        color="#9f86e0"
        scale={0.28}
        speed={0.8}
      />
      <Diamond
        position={[3, -0.5, -2.5]}
        color="#7b62c9"
        scale={0.22}
        speed={1.2}
      />
      <Diamond
        position={[-1.5, -2, -3]}
        color="#c9b8e8"
        scale={0.18}
        speed={0.7}
      />
      <Diamond
        position={[4, 2, -3.5]}
        color="#5b4a8c"
        scale={0.15}
        speed={1}
      />

      <GentleParticles count={60} />
    </>
  );
}

export function ProcessScene() {
  return (
    <Scene3D
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
      }}
    >
      <ProcessSceneContent />
    </Scene3D>
  );
}

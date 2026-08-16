"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";
import { Scene3D } from "./Scene3D";

/* ─── Smooth breathing sphere ─── */
function BreathingSphere() {
  const ref = useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ref.current) {
      const breathe = 1 + Math.sin(t * 0.6) * 0.15;
      ref.current.scale.setScalar(breathe);
      ref.current.rotation.y = t * 0.08;
      ref.current.rotation.x = Math.sin(t * 0.3) * 0.1;
    }
  });

  return (
    <Float speed={0.6} rotationIntensity={0.2} floatIntensity={0.3}>
      <mesh ref={ref} position={[2.5, 0, -1]}>
        <icosahedronGeometry args={[1.2, 3]} />
        <MeshDistortMaterial
          color="#9f86e0"
          roughness={0.08}
          metalness={0.88}
          distort={0.35}
          speed={0.8}
          transparent
          opacity={0.6}
          envMapIntensity={1.5}
        />
      </mesh>
    </Float>
  );
}

/* ─── Orbiting ring ─── */
function OrbitRing() {
  const ref = useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ref.current) {
      ref.current.rotation.x = Math.PI * 0.35 + Math.sin(t * 0.2) * 0.1;
      ref.current.rotation.y = t * 0.15;
      ref.current.rotation.z = Math.cos(t * 0.15) * 0.1;
    }
  });

  return (
    <mesh ref={ref} position={[2.5, 0, -1]}>
      <torusGeometry args={[1.8, 0.015, 16, 48]} />
      <meshStandardMaterial
        color="#c9b8e8"
        roughness={0.2}
        metalness={0.9}
        transparent
        opacity={0.35}
        emissive="#7b62c9"
        emissiveIntensity={0.2}
      />
    </mesh>
  );
}

/* ─── Small accent particles ─── */
function AccentParticles({ count = 60 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null!);

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 1.5 + Math.random() * 2;
      pos[i * 3] = 2.5 + Math.cos(angle) * radius;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 4;
      pos[i * 3 + 2] = -1 + Math.sin(angle) * radius * 0.5;
    }
    return pos;
  }, [count]);

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.getElapsedTime() * 0.02;
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
        size={0.018}
        color="#c9b8e8"
        transparent
        opacity={0.4}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/* ─── Composed booking scene ─── */
function BookingSceneContent() {
  return (
    <>
      <ambientLight intensity={0.35} />
      <pointLight position={[6, 4, 6]} intensity={0.9} color="#ffffff" />
      <pointLight position={[-3, -2, 3]} intensity={0.4} color="#c9b8e8" />

      <BreathingSphere />
      <OrbitRing />
      <AccentParticles count={50} />
    </>
  );
}

export function BookingScene() {
  return (
    <Scene3D
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
      }}
    >
      <BookingSceneContent />
    </Scene3D>
  );
}

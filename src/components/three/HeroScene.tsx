"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { MeshDistortMaterial, Float } from "@react-three/drei";
import * as THREE from "three";
import { Scene3D } from "./Scene3D";

/* ─── Central morphing sculpture ─── */
function Sculpture() {
  const mesh = useRef<THREE.Mesh>(null!);
  const wire = useRef<THREE.Mesh>(null!);
  const scrollY = useRef(0);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (mesh.current) {
      mesh.current.rotation.x = t * 0.08 + scrollY.current * Math.PI * 0.5;
      mesh.current.rotation.y = t * 0.12;
      mesh.current.rotation.z = Math.sin(t * 0.3) * 0.15;
      mesh.current.scale.setScalar(1 - scrollY.current * 0.35);
    }
    if (wire.current) {
      wire.current.rotation.copy(mesh.current.rotation);
      wire.current.scale.copy(mesh.current.scale).multiplyScalar(1.015);
    }
  });

  useEffect(() => {
    const onScroll = () => {
      const max =
        document.documentElement.scrollHeight - window.innerHeight;
      scrollY.current = max > 0 ? window.scrollY / max : 0;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <group>
      <mesh ref={mesh}>
        <torusKnotGeometry args={[1.1, 0.35, 128, 24, 2, 3]} />
        <MeshDistortMaterial
          color="#9f86e0"
          roughness={0.08}
          metalness={0.92}
          distort={0.28}
          speed={1.6}
          envMapIntensity={1.8}
        />
      </mesh>
      <mesh ref={wire}>
        <torusKnotGeometry args={[1.1, 0.35, 64, 16, 2, 3]} />
        <meshBasicMaterial
          color="#c9b8e8"
          wireframe
          transparent
          opacity={0.12}
        />
      </mesh>
    </group>
  );
}

/* ─── Orbiting particle field ─── */
function ParticleField({ count = 600 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null!);

  const [positions, sizes] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const sz = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 2.2 + Math.random() * 3.5;
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
      sz[i] = Math.random() * 0.018 + 0.004;
    }
    return [pos, sz];
  }, [count]);

  useFrame(({ clock }) => {
    if (ref.current) {
      const t = clock.getElapsedTime();
      ref.current.rotation.y = t * 0.025;
      ref.current.rotation.x = Math.sin(t * 0.04) * 0.08;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-size"
          args={[sizes, 1]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.022}
        color="#c9b8e8"
        transparent
        opacity={0.5}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/* ─── Floating orbital rings ─── */
function OrbitalRing({
  radius,
  tubeRadius,
  position,
  rotationSpeed,
  opacity,
}: {
  radius: number;
  tubeRadius: number;
  position: [number, number, number];
  rotationSpeed: number;
  opacity: number;
}) {
  const ref = useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ref.current) {
      ref.current.rotation.x = t * rotationSpeed;
      ref.current.rotation.z = t * rotationSpeed * 0.6;
    }
  });

  return (
    <mesh ref={ref} position={position}>
      <torusGeometry args={[radius, tubeRadius, 12, 48]} />
      <meshStandardMaterial
        color="#9f86e0"
        roughness={0.3}
        metalness={0.85}
        transparent
        opacity={opacity}
        emissive="#7b62c9"
        emissiveIntensity={0.15}
      />
    </mesh>
  );
}

/* ─── Inner glow sphere ─── */
function InnerGlow() {
  const ref = useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ref.current) {
      ref.current.scale.setScalar(0.6 + Math.sin(t * 0.8) * 0.08);
      (ref.current.material as THREE.MeshBasicMaterial).opacity =
        0.06 + Math.sin(t * 1.2) * 0.03;
    }
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[1.8, 24, 24]} />
      <meshBasicMaterial color="#9f86e0" transparent opacity={0.08} />
    </mesh>
  );
}

/* ─── Composed hero scene ─── */
function HeroSceneContent() {
  return (
    <>
      <ambientLight intensity={0.25} />
      <pointLight position={[10, 10, 10]} intensity={1.2} color="#ffffff" />
      <pointLight position={[-8, -5, 6]} intensity={0.6} color="#c9b8e8" />
      <pointLight position={[5, -8, -4]} intensity={0.4} color="#7b62c9" />

      <Float speed={1.2} rotationIntensity={0.3} floatIntensity={0.5}>
        <Sculpture />
      </Float>

      <InnerGlow />
      <ParticleField count={500} />

      <OrbitalRing
        radius={2.2}
        tubeRadius={0.008}
        position={[0, 0, -1.5]}
        rotationSpeed={0.15}
        opacity={0.2}
      />
      <OrbitalRing
        radius={3.0}
        tubeRadius={0.006}
        position={[0.5, -0.5, -2]}
        rotationSpeed={0.1}
        opacity={0.12}
      />
      <OrbitalRing
        radius={1.6}
        tubeRadius={0.005}
        position={[-0.3, 0.8, -0.8]}
        rotationSpeed={0.2}
        opacity={0.15}
      />
    </>
  );
}

export function HeroScene() {
  return (
    <Scene3D
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
      }}
    >
      <HeroSceneContent />
    </Scene3D>
  );
}

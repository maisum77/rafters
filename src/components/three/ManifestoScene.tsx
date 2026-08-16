"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";
import { Scene3D } from "./Scene3D";

/* ─── Individual floating glass shape ─── */
function GlassShape({
  geometry,
  position,
  color,
  scale = 1,
  rotationSpeed = [0.1, 0.15, 0.05],
  floatSpeed = 1,
  floatIntensity = 0.5,
}: {
  geometry: "icosahedron" | "octahedron" | "dodecahedron" | "torus" | "sphere";
  position: [number, number, number];
  color: string;
  scale?: number;
  rotationSpeed?: [number, number, number];
  floatSpeed?: number;
  floatIntensity?: number;
}) {
  const ref = useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ref.current) {
      ref.current.rotation.x += rotationSpeed[0] * 0.01;
      ref.current.rotation.y += rotationSpeed[1] * 0.01;
      ref.current.rotation.z += rotationSpeed[2] * 0.01;
      ref.current.position.y =
        position[1] + Math.sin(t * floatSpeed * 0.5) * 0.15;
    }
  });

  const geo = useMemo(() => {
    switch (geometry) {
      case "icosahedron":
        return <icosahedronGeometry args={[1, 0]} />;
      case "octahedron":
        return <octahedronGeometry args={[1, 0]} />;
      case "dodecahedron":
        return <dodecahedronGeometry args={[1, 0]} />;
      case "torus":
        return <torusGeometry args={[1, 0.35, 12, 32]} />;
      case "sphere":
        return <sphereGeometry args={[1, 24, 24]} />;
    }
  }, [geometry]);

  return (
    <Float
      speed={floatSpeed}
      rotationIntensity={0.4}
      floatIntensity={floatIntensity}
    >
      <mesh ref={ref} position={position} scale={scale}>
        {geo}
        <MeshDistortMaterial
          color={color}
          roughness={0.05}
          metalness={0.9}
          distort={0.15}
          speed={1.2}
          transparent
          opacity={0.7}
          envMapIntensity={2}
        />
      </mesh>
    </Float>
  );
}

/* ─── Drifting particles ─── */
function DriftParticles({ count = 200 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null!);

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 8;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 6 - 2;
    }
    return pos;
  }, [count]);

  useFrame(({ clock }) => {
    if (ref.current) {
      const t = clock.getElapsedTime();
      ref.current.rotation.y = t * 0.01;
      ref.current.position.y = Math.sin(t * 0.2) * 0.3;
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
        size={0.015}
        color="#9f86e0"
        transparent
        opacity={0.35}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/* ─── Composed manifesto scene ─── */
function ManifestoSceneContent() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[8, 8, 8]} intensity={1} color="#ffffff" />
      <pointLight position={[-6, -4, 4]} intensity={0.5} color="#c9b8e8" />

      {/* Scattered glass shapes */}
      <GlassShape
        geometry="icosahedron"
        position={[-3.5, 1.8, -2]}
        color="#9f86e0"
        scale={0.55}
        rotationSpeed={[0.12, 0.08, 0.04]}
      />
      <GlassShape
        geometry="octahedron"
        position={[3.2, -0.5, -1.5]}
        color="#7b62c9"
        scale={0.45}
        rotationSpeed={[0.06, 0.14, 0.08]}
        floatSpeed={1.4}
      />
      <GlassShape
        geometry="dodecahedron"
        position={[-2.5, -1.8, -3]}
        color="#c9b8e8"
        scale={0.6}
        rotationSpeed={[0.1, 0.06, 0.12]}
        floatIntensity={0.8}
      />
      <GlassShape
        geometry="torus"
        position={[4, 1.5, -2.5]}
        color="#5b4a8c"
        scale={0.35}
        rotationSpeed={[0.08, 0.12, 0.06]}
      />
      <GlassShape
        geometry="sphere"
        position={[1.5, 2.5, -4]}
        color="#9f86e0"
        scale={0.3}
        floatSpeed={0.8}
        floatIntensity={0.6}
      />
      <GlassShape
        geometry="icosahedron"
        position={[-4.5, -0.5, -3.5]}
        color="#7b62c9"
        scale={0.25}
        rotationSpeed={[0.15, 0.1, 0.08]}
      />

      <DriftParticles count={180} />
    </>
  );
}

export function ManifestoScene() {
  return (
    <Scene3D
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
      }}
    >
      <ManifestoSceneContent />
    </Scene3D>
  );
}

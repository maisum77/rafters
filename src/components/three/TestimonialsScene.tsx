"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Scene3D } from "./Scene3D";

/* ─── Floating glass card planes ─── */
function GlassCard({
  position,
  rotation,
  scale = 1,
  color,
  speed = 1,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  scale?: number;
  color: string;
  speed?: number;
}) {
  const ref = useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ref.current) {
      ref.current.rotation.y =
        rotation[1] + Math.sin(t * speed * 0.4) * 0.08;
      ref.current.rotation.x =
        rotation[0] + Math.cos(t * speed * 0.3) * 0.05;
      ref.current.position.y =
        position[1] + Math.sin(t * speed * 0.5) * 0.12;
    }
  });

  return (
    <mesh ref={ref} position={position} rotation={rotation} scale={scale}>
      <planeGeometry args={[1.6, 1, 1, 1]} />
      <meshPhysicalMaterial
        color={color}
        roughness={0.05}
        metalness={0.1}
        transparent
        opacity={0.08}
        side={THREE.DoubleSide}
        clearcoat={1}
        clearcoatRoughness={0.1}
      />
    </mesh>
  );
}

/* ─── Constellation of small glowing orbs ─── */
function GlowOrbs({ count = 12 }: { count?: number }) {
  const ref = useRef<THREE.InstancedMesh>(null!);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const orbData = useMemo(() => {
    return Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * 10,
      y: (Math.random() - 0.5) * 6,
      z: -1 - Math.random() * 4,
      speed: 0.3 + Math.random() * 0.8,
      phase: Math.random() * Math.PI * 2,
      scale: 0.02 + Math.random() * 0.04,
    }));
  }, [count]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (!ref.current) return;

    orbData.forEach((orb, i) => {
      dummy.position.set(
        orb.x + Math.sin(t * orb.speed + orb.phase) * 0.3,
        orb.y + Math.cos(t * orb.speed * 0.7 + orb.phase) * 0.2,
        orb.z
      );
      dummy.scale.setScalar(orb.scale * (1 + Math.sin(t * 2 + orb.phase) * 0.3));
      dummy.updateMatrix();
      ref.current.setMatrixAt(i, dummy.matrix);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 12, 12]} />
      <meshBasicMaterial
        color="#c9b8e8"
        transparent
        opacity={0.5}
        blending={THREE.AdditiveBlending}
      />
    </instancedMesh>
  );
}

/* ─── Subtle grid lines in the background ─── */
function BackgroundGrid() {
  const ref = useRef<THREE.LineSegments>(null!);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions: number[] = [];
    const spacing = 1.5;
    const extent = 8;

    for (let i = -extent; i <= extent; i += spacing) {
      // Horizontal lines
      positions.push(-extent, i, -5, extent, i, -5);
      // Vertical lines
      positions.push(i, -extent, -5, i, extent, -5);
    }

    geo.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3)
    );
    return geo;
  }, []);

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.z = clock.getElapsedTime() * 0.005;
    }
  });

  return (
    <lineSegments ref={ref} geometry={geometry}>
      <lineBasicMaterial color="#9f86e0" transparent opacity={0.04} />
    </lineSegments>
  );
}

/* ─── Composed testimonials scene ─── */
function TestimonialsSceneContent() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[5, 5, 5]} intensity={0.6} color="#c9b8e8" />

      <GlassCard
        position={[-3, 0.8, -2]}
        rotation={[0.1, 0.2, 0.05]}
        color="#9f86e0"
        speed={0.8}
      />
      <GlassCard
        position={[3.5, -0.5, -3]}
        rotation={[-0.05, -0.15, 0.02]}
        color="#7b62c9"
        scale={0.8}
        speed={1.1}
      />
      <GlassCard
        position={[-1.5, -1.2, -2.5]}
        rotation={[0.08, 0.12, -0.03]}
        color="#c9b8e8"
        scale={0.6}
        speed={0.6}
      />

      <GlowOrbs count={15} />
      <BackgroundGrid />
    </>
  );
}

export function TestimonialsScene() {
  return (
    <Scene3D
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
      }}
    >
      <TestimonialsSceneContent />
    </Scene3D>
  );
}

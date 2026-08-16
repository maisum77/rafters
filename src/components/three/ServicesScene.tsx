"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";
import { Scene3D } from "./Scene3D";

/* ─── Morphing icosahedron for service cards ─── */
function ServiceGem({
  position,
  color,
  scale = 0.5,
  speed = 1,
  distort = 0.25,
}: {
  position: [number, number, number];
  color: string;
  scale?: number;
  speed?: number;
  distort?: number;
}) {
  const ref = useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ref.current) {
      ref.current.rotation.x = t * 0.12 * speed;
      ref.current.rotation.y = t * 0.18 * speed;
      ref.current.position.y =
        position[1] + Math.sin(t * speed * 0.4) * 0.12;
    }
  });

  return (
    <Float speed={speed * 0.8} rotationIntensity={0.4} floatIntensity={0.5}>
      <mesh ref={ref} position={position} scale={scale}>
        <icosahedronGeometry args={[1, 1]} />
        <MeshDistortMaterial
          color={color}
          roughness={0.06}
          metalness={0.92}
          distort={distort}
          speed={speed * 0.8}
          envMapIntensity={1.8}
        />
      </mesh>
    </Float>
  );
}

/* ─── Vertical particle streams ─── */
function VerticalStreams({ count = 150 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null!);

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 14;
      pos[i * 3 + 2] = -2 - Math.random() * 4;
    }
    return pos;
  }, [count]);

  useFrame(({ clock }) => {
    if (ref.current) {
      const posAttr = ref.current.geometry.attributes
        .position as THREE.BufferAttribute;
      const arr = posAttr.array as Float32Array;
      const t = clock.getElapsedTime();

      for (let i = 0; i < count; i++) {
        arr[i * 3 + 1] += 0.003;
        if (arr[i * 3 + 1] > 7) arr[i * 3 + 1] = -7;
        arr[i * 3] += Math.sin(t + i * 0.1) * 0.001;
      }
      posAttr.needsUpdate = true;
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
        opacity={0.3}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/* ─── Composed services scene ─── */
function ServicesSceneContent() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[8, 6, 8]} intensity={1} color="#ffffff" />
      <pointLight position={[-5, -4, 5]} intensity={0.5} color="#c9b8e8" />
      <pointLight position={[3, -6, 3]} intensity={0.3} color="#7b62c9" />

      <ServiceGem
        position={[-3, 2, -2]}
        color="#9f86e0"
        scale={0.45}
        speed={0.7}
      />
      <ServiceGem
        position={[3.5, -1, -3]}
        color="#7b62c9"
        scale={0.35}
        speed={1.1}
        distort={0.3}
      />
      <ServiceGem
        position={[-2, -2.5, -2.5]}
        color="#c9b8e8"
        scale={0.28}
        speed={0.9}
      />
      <ServiceGem
        position={[2, 3, -4]}
        color="#5b4a8c"
        scale={0.3}
        speed={0.6}
        distort={0.2}
      />

      <VerticalStreams count={120} />
    </>
  );
}

export function ServicesScene() {
  return (
    <Scene3D
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
      }}
    >
      <ServicesSceneContent />
    </Scene3D>
  );
}

"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";
import { Scene3D } from "./Scene3D";

/* ─── Abstract portrait placeholder — geometric bust ─── */
function PortraitGem({
  position,
  color,
  scale = 0.5,
  speed = 0.7,
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
      ref.current.rotation.y = t * 0.15 * speed;
      ref.current.rotation.x = Math.sin(t * speed * 0.3) * 0.08;
      ref.current.position.y =
        position[1] + Math.sin(t * speed * 0.4) * 0.1;
    }
  });

  return (
    <Float speed={speed} rotationIntensity={0.3} floatIntensity={0.4}>
      <mesh ref={ref} position={position} scale={scale}>
        <dodecahedronGeometry args={[1, 0]} />
        <MeshDistortMaterial
          color={color}
          roughness={0.06}
          metalness={0.9}
          distort={0.18}
          speed={speed * 0.6}
          envMapIntensity={1.6}
        />
      </mesh>
    </Float>
  );
}

/* ─── Floating name-plate planes ─── */
function Nameplate({
  position,
  rotation = [0, 0, 0],
  speed = 0.5,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  speed?: number;
}) {
  const ref = useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ref.current) {
      ref.current.rotation.y = rotation[1] + Math.sin(t * speed * 0.3) * 0.04;
      ref.current.position.y =
        position[1] + Math.sin(t * speed * 0.5) * 0.06;
    }
  });

  return (
    <mesh ref={ref} position={position} rotation={rotation}>
      <planeGeometry args={[2, 0.5]} />
      <meshStandardMaterial
        color="#9f86e0"
        roughness={0.1}
        metalness={0.5}
        transparent
        opacity={0.06}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

/* ─── Ambient dust ─── */
function AmbientDust({ count = 100 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null!);

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 2] = -1 - Math.random() * 4;
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
        size={0.014}
        color="#c9b8e8"
        transparent
        opacity={0.28}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/* ─── Composed craft scene ─── */
function CraftSceneContent() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[6, 5, 6]} intensity={0.9} color="#ffffff" />
      <pointLight position={[-4, -3, 4]} intensity={0.5} color="#c9b8e8" />
      <pointLight position={[3, -5, 3]} intensity={0.3} color="#7b62c9" />

      <PortraitGem position={[-3, 1.5, -2]} color="#9f86e0" scale={0.4} speed={0.6} />
      <PortraitGem position={[3.5, 0, -2.5]} color="#7b62c9" scale={0.35} speed={0.8} />
      <PortraitGem position={[-2, -2, -3]} color="#c9b8e8" scale={0.3} speed={0.7} />
      <PortraitGem position={[2.5, 2.5, -3.5]} color="#5b4a8c" scale={0.28} speed={0.9} />

      <Nameplate position={[-1, 0.5, -1.5]} rotation={[0, 0.15, 0]} speed={0.4} />
      <Nameplate position={[1.5, -1, -2]} rotation={[0, -0.1, 0]} speed={0.6} />

      <AmbientDust count={80} />
    </>
  );
}

export function CraftScene() {
  return (
    <Scene3D
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
      }}
    >
      <CraftSceneContent />
    </Scene3D>
  );
}

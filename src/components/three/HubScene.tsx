"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";
import { Scene3D } from "./Scene3D";

/* ─── Floating 3D card icon shapes ─── */
function CardIcon({
  position,
  geometry,
  color,
  speed = 1,
}: {
  position: [number, number, number];
  geometry: "box" | "sphere" | "torus" | "cone";
  color: string;
  speed?: number;
}) {
  const ref = useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ref.current) {
      ref.current.rotation.x = t * 0.2 * speed;
      ref.current.rotation.y = t * 0.3 * speed;
      ref.current.position.y =
        position[1] + Math.sin(t * speed * 0.6) * 0.08;
    }
  });

  const geo = useMemo(() => {
    switch (geometry) {
      case "box":
        return <boxGeometry args={[0.6, 0.6, 0.6]} />;
      case "sphere":
        return <sphereGeometry args={[0.35, 16, 16]} />;
      case "torus":
        return <torusGeometry args={[0.3, 0.12, 8, 24]} />;
      case "cone":
        return <coneGeometry args={[0.3, 0.6, 6]} />;
    }
  }, [geometry]);

  return (
    <Float speed={speed} rotationIntensity={0.6} floatIntensity={0.5}>
      <mesh ref={ref} position={position} scale={0.7}>
        {geo}
        <meshPhysicalMaterial
          color={color}
          roughness={0.1}
          metalness={0.8}
          clearcoat={0.8}
          clearcoatRoughness={0.1}
          transparent
          opacity={0.55}
          emissive={color}
          emissiveIntensity={0.08}
          toneMapped={false}
        />
      </mesh>
    </Float>
  );
}

/* ─── Connecting lines between card positions ─── */
function ConnectionWeb() {
  const ref = useRef<THREE.LineSegments>(null!);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    // Four corners of a grid-like pattern
    const points = [
      [-1.5, 1, -3],
      [1.5, 1, -3],
      [-1.5, -1, -3],
      [1.5, -1, -3],
    ];
    const positions: number[] = [];
    // Connect each pair
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        positions.push(
          points[i][0], points[i][1], points[i][2],
          points[j][0], points[j][1], points[j][2]
        );
      }
    }
    geo.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3)
    );
    return geo;
  }, []);

  useFrame(({ clock }) => {
    if (ref.current) {
      const mat = ref.current.material as THREE.LineBasicMaterial;
      mat.opacity = 0.04 + Math.sin(clock.getElapsedTime() * 0.5) * 0.02;
    }
  });

  return (
    <lineSegments ref={ref} geometry={geometry}>
      <lineBasicMaterial color="#7b62c9" transparent opacity={0.05} />
    </lineSegments>
  );
}

/* ─── Composed hub grid scene ─── */
function HubSceneContent() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[5, 5, 5]} intensity={0.7} color="#ffffff" />
      <pointLight position={[-3, -2, 4]} intensity={0.4} color="#c9b8e8" />

      <CardIcon
        position={[-2.5, 1.5, -1]}
        geometry="box"
        color="#9f86e0"
        speed={0.8}
      />
      <CardIcon
        position={[2.5, 1.5, -1.5]}
        geometry="sphere"
        color="#7b62c9"
        speed={1.1}
      />
      <CardIcon
        position={[-2.5, -1.5, -2]}
        geometry="torus"
        color="#c9b8e8"
        speed={0.9}
      />
      <CardIcon
        position={[2.5, -1.5, -1.2]}
        geometry="cone"
        color="#5b4a8c"
        speed={1.3}
      />

      <ConnectionWeb />
    </>
  );
}

export function HubScene() {
  return (
    <Scene3D
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
      }}
    >
      <HubSceneContent />
    </Scene3D>
  );
}

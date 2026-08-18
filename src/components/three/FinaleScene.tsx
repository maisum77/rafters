"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import { Scene3D } from "./Scene3D";

/* ─── Spiraling particle vortex ─── */
function ParticleVortex({ count = 1200 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null!);

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const brandColors = [
      new THREE.Color("#9f86e0"),
      new THREE.Color("#7b62c9"),
      new THREE.Color("#c9b8e8"),
      new THREE.Color("#5b4a8c"),
    ];

    for (let i = 0; i < count; i++) {
      const t = i / count;
      const angle = t * Math.PI * 16;
      const radius = t * 5;
      const y = (t - 0.5) * 6;

      pos[i * 3] = Math.cos(angle) * radius * (0.5 + Math.random() * 0.5);
      pos[i * 3 + 1] = y + (Math.random() - 0.5) * 0.5;
      pos[i * 3 + 2] = Math.sin(angle) * radius * (0.5 + Math.random() * 0.5);

      const c = brandColors[Math.floor(Math.random() * brandColors.length)];
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
    return [pos, col];
  }, [count]);

  useFrame(({ clock }) => {
    if (ref.current) {
      const t = clock.getElapsedTime();
      ref.current.rotation.y = t * 0.06;
      ref.current.rotation.x = Math.sin(t * 0.1) * 0.05;
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
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        vertexColors
        transparent
        opacity={0.6}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/* ─── Central glowing torus ─── */
function CentralTorus() {
  const ref = useRef<THREE.Mesh>(null!);
  const glowRef = useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ref.current) {
      ref.current.rotation.x = Math.PI * 0.5 + Math.sin(t * 0.15) * 0.2;
      ref.current.rotation.z = t * 0.1;
      const pulse = 1 + Math.sin(t * 0.8) * 0.05;
      ref.current.scale.setScalar(pulse);
    }
    if (glowRef.current) {
      const glowPulse = 0.15 + Math.sin(t * 0.6) * 0.08;
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity = glowPulse;
      glowRef.current.rotation.copy(ref.current.rotation);
      glowRef.current.scale.setScalar(1.3 + Math.sin(t * 0.5) * 0.1);
    }
  });

  return (
    <group>
      <mesh ref={ref}>
        <torusGeometry args={[1.5, 0.06, 16, 64]} />
        <meshStandardMaterial
          color="#9f86e0"
          roughness={0.1}
          metalness={0.95}
          emissive="#7b62c9"
          emissiveIntensity={0.5}
        />
      </mesh>
      <mesh ref={glowRef}>
        <torusGeometry args={[1.5, 0.15, 16, 64]} />
        <meshBasicMaterial
          color="#9f86e0"
          transparent
          opacity={0.15}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

/* ─── Floating embers ─── */
function Embers({ count = 40 }: { count?: number }) {
  const ref = useRef<THREE.InstancedMesh>(null!);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const data = useMemo(() => {
    return Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * 10,
      y: (Math.random() - 0.5) * 8,
      z: -1 - Math.random() * 4,
      speed: 0.2 + Math.random() * 0.6,
      phase: Math.random() * Math.PI * 2,
      scale: 0.015 + Math.random() * 0.035,
    }));
  }, [count]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (!ref.current) return;

    data.forEach((ember, i) => {
      dummy.position.set(
        ember.x + Math.sin(t * ember.speed + ember.phase) * 0.5,
        ember.y + Math.cos(t * ember.speed * 0.7 + ember.phase) * 0.4,
        ember.z
      );
      dummy.scale.setScalar(
        ember.scale * (1 + Math.sin(t * 3 + ember.phase) * 0.4)
      );
      dummy.updateMatrix();
      ref.current.setMatrixAt(i, dummy.matrix);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial
        color="#c9b8e8"
        transparent
        opacity={0.6}
        blending={THREE.AdditiveBlending}
      />
    </instancedMesh>
  );
}

/* ─── Composed finale scene ─── */
function FinaleSceneContent() {
  return (
    <>
      <ambientLight intensity={0.2} />
      <pointLight position={[0, 5, 5]} intensity={1} color="#ffffff" />
      <pointLight position={[-5, -3, 3]} intensity={0.5} color="#9f86e0" />
      <pointLight position={[5, -3, 3]} intensity={0.5} color="#7b62c9" />

      <CentralTorus />
      <ParticleVortex count={900} />
      <Embers count={35} />

      <EffectComposer multisampling={0} frameBufferType={THREE.HalfFloatType}>
        <Bloom
          luminanceThreshold={0.15}
          luminanceSmoothing={0.9}
          intensity={0.6}
          mipmapBlur
        />
      </EffectComposer>
    </>
  );
}

export function FinaleScene() {
  return (
    <Scene3D
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
      }}
      camera={{ position: [0, 0, 8], fov: 55 }}
    >
      <FinaleSceneContent />
    </Scene3D>
  );
}

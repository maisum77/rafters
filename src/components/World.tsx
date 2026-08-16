
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Float,
  MeshDistortMaterial,
  Environment,
  Sparkles,
  RoundedBox,
  Text,
} from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { useRouter } from "next/navigation";
import * as THREE from "three";
import { useReducedMotion } from "@/lib/use-reduced-motion";

/* ═══════════════════════════════════════════════
   SCROLL PROGRESS STORE
   ═══════════════════════════════════════════════ */

const sp = { value: 0 };
const listeners = new Set<() => void>();
function setProgress(v: number) {
  sp.value = v;
  listeners.forEach((fn) => fn());
}

/* ═══════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════ */

const ZONE_DEPTH = 30;
const ZONES = 7;
const TOTAL_DEPTH = ZONE_DEPTH * (ZONES - 1);

const FONT_SANS = "/fonts/space-grotesk.ttf";
const FONT_SANS_MED = "/fonts/space-grotesk-500.woff";
const FONT_SERIF = "/fonts/fraunces-italic.ttf";
const FONT_SERIF_BOLD = "/fonts/fraunces-700-italic.woff";

const C_INK = "#231f2c";
const C_MUTED = "#857892";
const C_EMBER = "#9f86e0";
const C_EMBER_DEEP = "#7b62c9";
const C_CREAM = "#fdfcf8";
const C_LINE = "#d6cadf";

/* Camera keyframes: [scrollProgress, x, y, z] */
const CAM_KEYS: [number, number, number, number][] = [
  [0.0, 0.5, 0.35, 7.2],
  [1 / 6, 0.2, 0.3, -ZONE_DEPTH + 6],
  [2 / 6, -0.1, 0.25, -ZONE_DEPTH * 2 + 6],
  [3 / 6, 0.15, 0.3, -ZONE_DEPTH * 3 + 6],
  [4 / 6, -0.05, 0.3, -ZONE_DEPTH * 4 + 6],
  [5 / 6, 0.1, 0.34, -ZONE_DEPTH * 5 + 6],
  // Booking zone — weave left then right instead of a straight push
  [0.71, -0.7, 0.42, -ZONE_DEPTH * 5 + 1],
  [0.79, 0.7, 0.46, -ZONE_DEPTH * 5 + 4],
  [0.91, 0, 0.5, -ZONE_DEPTH * 6 + 7],
  [1.0, 0, 0.5, -ZONE_DEPTH * 6 + 7],
];

function lerpCam(p: number) {
  let i = 0;
  while (i < CAM_KEYS.length - 2 && CAM_KEYS[i + 1][0] <= p) i++;
  const [p0, x0, y0, z0] = CAM_KEYS[i];
  const [p1, x1, y1, z1] = CAM_KEYS[i + 1];
  const range = p1 - p0 || 1;
  const t = Math.max(0, Math.min(1, (p - p0) / range));
  const s = t * t * (3 - 2 * t);
  return {
    pos: [x0 + (x1 - x0) * s, y0 + (y1 - y0) * s, z0 + (z1 - z0) * s] as [number, number, number],
  };
}

/* ═══════════════════════════════════════════════
   CAMERA RIG — scroll flight + mouse parallax
   ═══════════════════════════════════════════════ */

function CameraRig() {
  const { camera } = useThree();
  const reduce = useReducedMotion();
  const mouse = useRef({ x: 0, y: 0 });
  const target = useMemo(() => new THREE.Vector3(), []);
  const look = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max > 0) setProgress(window.scrollY / max);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useFrame((_, dt) => {
    // Track raw scroll continuously so the camera flows smoothly through
    // every zone without clutching/sticking (no dwell remapping).
    const dp = sp.value;
    const { pos } = lerpCam(dp);
    const px = reduce ? 0 : mouse.current.x * 0.45;
    const py = reduce ? 0 : mouse.current.y * 0.25;
    target.set(pos[0] + px, pos[1] + py, pos[2]);
    camera.position.lerp(target, 1 - Math.pow(0.0005, dt));
    look.set(px * -0.6, 0.15 + py * -0.35, camera.position.z - 12);
    camera.lookAt(look);
    camera.rotateZ(Math.sin(dp * Math.PI) * 0.025);
  });
  return null;
}

/* ═══════════════════════════════════════════════
   SHARED 3D UI — type, pills, cursor
   ═══════════════════════════════════════════════ */

function setCursor(c: string) {
  document.body.style.cursor = c;
}

/** Horizontal multi-color line of 3D text, measured via troika sync. */
function Inline({
  segments,
  font,
  fontSize,
  position = [0, 0, 0],
  anchorX = "left",
  gap = 0.06,
  letterSpacing = 0,
  halo = false,
}: {
  segments: { text: string; color: string }[];
  font: string;
  fontSize: number;
  position?: [number, number, number];
  anchorX?: "left" | "center" | "right";
  gap?: number;
  letterSpacing?: number;
  halo?: boolean;
}) {
  const widths = useRef<number[]>([]);
  const [, setTick] = useState(0);

  const total =
    widths.current.reduce((a, b) => a + b, 0) + gap * (segments.length - 1);
  let acc = anchorX === "center" ? -total / 2 : anchorX === "right" ? -total : 0;

  const render = (y: number, z: number) =>
    segments.map((s, i) => {
      const x = acc;
      acc += (widths.current[i] ?? 0) + gap;
      return (
        <Text
          key={i}
          font={font}
          fontSize={fontSize}
          color={s.color}
          letterSpacing={letterSpacing}
          anchorX="left"
          anchorY="middle"
          position={[x, y, z]}
          onSync={(self) => {
            const mesh = self as unknown as THREE.Mesh;
            const bb = mesh.geometry?.boundingBox;
            const w = bb ? bb.max.x - bb.min.x : 0;
            if (w > 0 && Math.abs((widths.current[i] ?? -1) - w) > 0.002) {
              widths.current[i] = w;
              setTick((t) => t + 1);
            }
          }}
        >
          {s.text}
        </Text>
      );
    });

  return (
    <group position={position}>
      {halo && (
        <group position={[0.025, -0.03, -0.05]}>
          {segments.map((s, i) => {
            const x = (() => {
              let a = anchorX === "center" ? -total / 2 : anchorX === "right" ? -total : 0;
              let sum = a;
              for (let k = 0; k < i; k++) sum += (widths.current[k] ?? 0) + gap;
              return sum;
            })();
            return (
              <Text
                key={i}
                font={font}
                fontSize={fontSize}
                color={s.color}
                material-transparent
                material-opacity={0.25}
                letterSpacing={letterSpacing}
                anchorX="left"
                anchorY="middle"
                position={[x, 0, 0]}
              >
                {s.text}
              </Text>
            );
          })}
        </group>
      )}
      {render(0, 0)}
    </group>
  );
}

function Pill({
  label,
  onClick,
  filled = true,
  width = 4.4,
  height = 0.9,
  fontSize = 0.28,
  position = [0, 0, 0],
}: {
  label: string;
  onClick: () => void;
  filled?: boolean;
  width?: number;
  height?: number;
  fontSize?: number;
  position?: [number, number, number];
}) {
  const [hover, setHover] = useState(false);
  const group = useRef<THREE.Group>(null!);
  const reduce = useReducedMotion();
  const radius = height / 2;

  useFrame((_, dt) => {
    if (reduce || !group.current) return;
    const s = THREE.MathUtils.damp(group.current.scale.x, hover ? 1.06 : 1, 8, dt);
    group.current.scale.setScalar(s);
    group.current.position.y = THREE.MathUtils.damp(
      group.current.position.y,
      position[1] + (hover ? 0.08 : 0),
      8,
      dt
    );
  });

  return (
    <group
      ref={group}
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHover(true);
        setCursor("pointer");
      }}
      onPointerOut={() => {
        setHover(false);
        setCursor("auto");
      }}
    >
      {!filled && (
        <RoundedBox args={[width + 0.05, height + 0.05, 0.24]} radius={radius + 0.03} smoothness={6}>
          <meshBasicMaterial color={C_INK} transparent opacity={0.45} />
        </RoundedBox>
      )}
      <RoundedBox args={[width, height, 0.2]} radius={radius} smoothness={6}>
        <meshStandardMaterial
          color={filled ? C_EMBER_DEEP : C_CREAM}
          roughness={filled ? 0.35 : 0.45}
          metalness={0.15}
          emissive={filled ? C_EMBER_DEEP : "#000000"}
          emissiveIntensity={filled ? 0.55 : 0}
        />
      </RoundedBox>
      <Text
        font={FONT_SANS_MED}
        fontSize={fontSize}
        color={filled ? C_CREAM : C_INK}
        anchorX="center"
        anchorY="middle"
        position={[0, 0, 0.12]}
      >
        {label}
      </Text>
    </group>
  );
}

/* ═══════════════════════════════════════════════
   ZONE 0 — HERO
   ═══════════════════════════════════════════════ */

function HeroSculpture() {
  const mesh = useRef<THREE.Mesh>(null!);
  const wire = useRef<THREE.Mesh>(null!);
  const reduce = useReducedMotion();

  useFrame(({ clock }) => {
    if (reduce) return;
    const t = clock.getElapsedTime();
    if (mesh.current) {
      mesh.current.rotation.x = t * 0.07;
      mesh.current.rotation.y = t * 0.11;
      mesh.current.rotation.z = Math.sin(t * 0.25) * 0.12;
    }
    if (wire.current) {
      wire.current.rotation.copy(mesh.current.rotation);
      wire.current.scale.copy(mesh.current.scale).multiplyScalar(1.03);
    }
  });

  return (
    <group>
      <Float speed={1.1} rotationIntensity={0.2} floatIntensity={0.4}>
        <mesh ref={mesh}>
          <torusKnotGeometry args={[0.95, 0.26, 200, 32, 2, 3]} />
          <MeshDistortMaterial
            color={C_EMBER}
            roughness={0.18}
            metalness={0.55}
            distort={0.18}
            speed={1.4}
            envMapIntensity={0.9}
          />
        </mesh>
        <mesh ref={wire}>
          <torusKnotGeometry args={[0.95, 0.26, 100, 20, 2, 3]} />
          <meshBasicMaterial color={C_EMBER_DEEP} wireframe transparent opacity={0.1} />
        </mesh>
      </Float>
      <OrbitalRing radius={1.5} tube={0.008} speed={0.14} opacity={0.28} />
      <OrbitalRing radius={2.0} tube={0.006} speed={0.09} opacity={0.18} tilt={0.4} />
      <OrbitalRing radius={1.05} tube={0.005} speed={0.18} opacity={0.22} tilt={-0.3} />
    </group>
  );
}

function OrbitalRing({
  radius, tube, speed, opacity, tilt = 0,
}: {
  radius: number; tube: number; speed: number; opacity: number; tilt?: number;
}) {
  const ref = useRef<THREE.Mesh>(null!);
  const reduce = useReducedMotion();
  useFrame(({ clock }) => {
    if (reduce) return;
    const t = clock.getElapsedTime();
    if (ref.current) {
      ref.current.rotation.x = t * speed + tilt;
      ref.current.rotation.z = t * speed * 0.55;
    }
  });
  return (
    <mesh ref={ref}>
      <torusGeometry args={[radius, tube, 16, 64]} />
      <meshStandardMaterial
        color={C_EMBER} roughness={0.25} metalness={0.85}
        transparent opacity={opacity} emissive={C_EMBER_DEEP} emissiveIntensity={0.45}
      />
    </mesh>
  );
}

function ScrollCue() {
  const dot = useRef<THREE.Mesh>(null!);
  const reduce = useReducedMotion();
  useFrame(({ clock }) => {
    if (reduce || !dot.current) return;
    const t = clock.getElapsedTime();
    dot.current.position.y = -((t * 1.1) % 1.4) + 0.7;
    (dot.current.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 1 - ((t * 1.1) % 1.4));
  });
  return (
    <group position={[0, -2.6, 0]}>
      <Text
        font={FONT_SANS_MED}
        fontSize={0.16}
        color={C_MUTED}
        letterSpacing={0.34}
        anchorX="center"
        anchorY="middle"
        position={[0, -0.85, 0]}
      >
        SCROLL
      </Text>
      <mesh position={[0, 0.15, 0]}>
        <boxGeometry args={[0.014, 1.1, 0.014]} />
        <meshBasicMaterial color={C_LINE} />
      </mesh>
      <mesh ref={dot} position={[0, 0.7, 0.01]}>
        <boxGeometry args={[0.03, 0.3, 0.02]} />
        <meshBasicMaterial color={C_EMBER_DEEP} />
      </mesh>
    </group>
  );
}

function HeroZone({ compact }: { compact: boolean }) {
  const router = useRouter();
  const contentY = 0.15;

  const goBook = () => {
    const el = document.getElementById("book");
    if (el) el.scrollIntoView({ behavior: "smooth" });
    else router.push("/#book");
  };

  return (
    <group position={[0, contentY, 0]}>
      <group
        position={compact ? [0, 0.2, -3.5] : [5.6, -0.1, -3.5]}
        scale={compact ? 0.8 : 0.75}
      >
        <HeroSculpture />
      </group>

      <Text
        font={FONT_SANS_MED}
        fontSize={0.2}
        color={C_EMBER_DEEP}
        letterSpacing={0.18}
        anchorX="center"
        anchorY="middle"
        position={[0, compact ? 2.75 : 2.7, 0]}
      >
        A FOUR-PERSON DIGITAL AGENCY
      </Text>

      <Text
        font={FONT_SERIF_BOLD}
        fontSize={compact ? 1.0 : 1.15}
        color={C_INK}
        anchorX="center"
        anchorY="middle"
        lineHeight={1.02}
        maxWidth={compact ? 4.6 : 10}
        position={[0, compact ? 1.85 : 1.65, 0]}
      >
        We make brands
      </Text>

      <group position={[0, compact ? -0.45 : 0.35, 0]}>
        <Inline
          segments={[{ text: "move.", color: C_EMBER }]}
          font={FONT_SERIF_BOLD}
          fontSize={compact ? 1.0 : 1.15}
          anchorX="center"
          halo
        />
      </group>

      <Text
        font={FONT_SANS}
        fontSize={compact ? 0.24 : 0.26}
        color={C_MUTED}
        anchorX="center"
        anchorY="middle"
        lineHeight={1.4}
        maxWidth={compact ? 4.6 : 9.5}
        position={[0, compact ? -1.45 : -0.9, 0]}
      >
        Four people. Every discipline your brand needs — web, SEO, ads, content, social.
      </Text>

      {compact ? (
        <Pill label="Start a project" filled onClick={goBook} width={3.7} position={[0, -2.7, 0]} />
      ) : (
        <>
          <Pill label="Start a project" filled onClick={goBook} position={[-3.0, -1.95, 0]} />
          <Pill label="See the craft" filled={false} onClick={() => router.push("/craft")} position={[3.0, -1.95, 0]} />
        </>
      )}
      {compact ? (
        <Pill label="See the craft" filled={false} onClick={() => router.push("/craft")} width={3.7} position={[0, -3.25, 0]} />
      ) : (
        <ScrollCue />
      )}
    </group>
  );
}

/* ═══════════════════════════════════════════════
   ZONE 1 — MANIFESTO
   ═══════════════════════════════════════════════ */

function GlassShape({
  geo, pos, color, scale = 0.5, speed = 1, opacity = 0.7,
}: {
  geo: "icosahedron" | "octahedron" | "dodecahedron" | "torus" | "sphere";
  pos: [number, number, number];
  color: string;
  scale?: number;
  speed?: number;
  opacity?: number;
}) {
  const ref = useRef<THREE.Mesh>(null!);
  const reduce = useReducedMotion();
  useFrame(({ clock }) => {
    if (reduce || !ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.rotation.x = t * 0.1 * speed;
    ref.current.rotation.y = t * 0.14 * speed;
    ref.current.position.y = pos[1] + Math.sin(t * speed * 0.4) * 0.2;
  });

  const geometry = useMemo(() => {
    switch (geo) {
      case "icosahedron": return <icosahedronGeometry args={[1, 0]} />;
      case "octahedron": return <octahedronGeometry args={[1, 0]} />;
      case "dodecahedron": return <dodecahedronGeometry args={[1, 0]} />;
      case "torus": return <torusGeometry args={[1, 0.35, 12, 32]} />;
      case "sphere": return <sphereGeometry args={[1, 20, 20]} />;
    }
  }, [geo]);

  return (
    <Float speed={speed} rotationIntensity={0.4} floatIntensity={0.5}>
      <mesh ref={ref} position={pos} scale={scale}>
        {geometry}
        <MeshDistortMaterial
          color={color} roughness={0.04} metalness={0.92}
          distort={0.18} speed={speed * 0.7}
          transparent opacity={opacity} envMapIntensity={2.2}
        />
      </mesh>
    </Float>
  );
}

function ManifestoZone({ compact }: { compact: boolean }) {
  return (
    <group>
      <Text
        font={FONT_SERIF_BOLD}
        fontSize={compact ? 4.4 : 6.5}
        color={C_INK}
        material-transparent
        material-opacity={0.05}
        anchorX="center"
        anchorY="middle"
        position={[compact ? 2.4 : 4.2, compact ? 0.8 : 1.4, -1.5]}
      >
        01
      </Text>

      <group position={[0, compact ? 1.9 : 1.35, 0]}>
        <Inline
          segments={[
            { text: "Craft, not ", color: C_INK },
            { text: "compromise.", color: C_EMBER },
          ]}
          font={FONT_SERIF_BOLD}
          fontSize={compact ? 1.0 : 1.45}
          anchorX="center"
          gap={0.07}
        />
      </group>

      <Text
        font={FONT_SANS}
        fontSize={compact ? 0.24 : 0.3}
        color={C_MUTED}
        anchorX="center"
        anchorY="middle"
        lineHeight={1.5}
        maxWidth={compact ? 5.4 : 12}
        position={[0, compact ? -1.1 : -0.35, 0]}
      >
        We are four makers who treat your brand like craft — strategy, code, story and growth, argued in one room until it works.
      </Text>

      <group scale={compact ? 0.75 : 1}>
        <GlassShape geo="icosahedron" pos={[-4.2, 2, 0.5]} color={C_EMBER} scale={0.65} speed={0.8} />
        <GlassShape geo="octahedron" pos={[3.4, -0.9, -1.5]} color={C_EMBER_DEEP} scale={0.5} speed={1.1} />
        <GlassShape geo="dodecahedron" pos={[-2.6, -2.2, -2.5]} color={C_EMBER} scale={0.7} speed={0.7} opacity={0.5} />
        <GlassShape geo="torus" pos={[4.2, 1.6, -3]} color={C_EMBER_DEEP} scale={0.4} speed={0.9} />
        <GlassShape geo="sphere" pos={[1.2, 2.8, -4]} color={C_EMBER} scale={0.36} speed={0.6} />
        <GlassShape geo="octahedron" pos={[-4.6, -1.2, -4]} color={C_EMBER_DEEP} scale={0.32} speed={1.3} />
      </group>
    </group>
  );
}

/* ═══════════════════════════════════════════════
   ZONE 2 — PROOF (3D quote cards)
   ═══════════════════════════════════════════════ */

const PROOF = [
  { figure: "2 projects", text: "Shipped live — an e-commerce storefront and a booking-first dental practice." },
  { figure: "1 roof", text: "Web, SEO, ads, content and social — argued in one room until it works." },
  { figure: "0 hand-offs", text: "No account managers. The person you brief is the person who builds it." },
  { figure: "4 people", text: "Every discipline your brand needs, in one honest team." },
];

function ProofCard({
  figure, text, position, tilt, scale = 1,
}: {
  figure: string; text: string;
  position: [number, number, number];
  tilt: number;
  scale?: number;
}) {
  const [hover, setHover] = useState(false);
  const group = useRef<THREE.Group>(null!);
  const reduce = useReducedMotion();
  const baseY = position[1];

  useFrame(({ clock }, dt) => {
    if (!group.current) return;
    const t = clock.getElapsedTime();
    const floatY = reduce ? 0 : Math.sin(t * 0.6 + position[0]) * 0.12;
    group.current.position.y = THREE.MathUtils.damp(
      group.current.position.y,
      baseY + floatY + (hover ? 0.15 : 0),
      6,
      dt
    );
    const s = THREE.MathUtils.damp(group.current.scale.x, scale * (hover ? 1.05 : 1), 8, dt);
    group.current.scale.setScalar(s);
  });

  return (
    <group
      ref={group}
      position={position}
      rotation={[0, 0, tilt]}
      scale={scale}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHover(true);
      }}
      onPointerOut={() => {
        setHover(false);
      }}
    >
      <RoundedBox args={[3.18, 1.7, 0.08]} radius={0.1} smoothness={4} position={[0, 0, -0.03]}>
        <meshStandardMaterial color={C_EMBER_DEEP} roughness={0.5} metalness={0.1} />
      </RoundedBox>
      <RoundedBox args={[3.1, 1.62, 0.1]} radius={0.1} smoothness={4}>
        <meshStandardMaterial
          color="#ffffff"
          roughness={0.3}
          metalness={0.05}
          emissive="#ffffff"
          emissiveIntensity={0.55}
        />
      </RoundedBox>

      <Text
        font={FONT_SERIF}
        fontSize={0.44}
        color={C_INK}
        anchorX="left"
        anchorY="middle"
        position={[-1.36, 0.48, 0.04]}
      >
        {figure}
      </Text>

      <mesh position={[0, 0.06, 0.04]}>
        <boxGeometry args={[2.72, 0.012, 0.01]} />
        <meshBasicMaterial color={C_LINE} />
      </mesh>

      <Text
        font={FONT_SANS}
        fontSize={0.135}
        color={C_MUTED}
        anchorX="left"
        anchorY="middle"
        lineHeight={1.35}
        maxWidth={2.72}
        position={[-1.36, -0.42, 0.04]}
      >
        {text}
      </Text>
    </group>
  );
}

function ProofZone({ compact }: { compact: boolean }) {
  const positions: [number, number, number][] = compact
    ? [
        [0, 1.55, 0],
        [0, 0.5, 0],
        [0, -0.55, 0],
        [0, -1.6, 0],
      ]
    : [
        [-1.85, 0.9, 0],
        [1.85, 0.9, 0],
        [-1.85, -1.45, 0],
        [1.85, -1.45, 0],
      ];
  const tilts = compact ? [0, 0, 0, 0] : [0.018, -0.018, -0.014, 0.014];

  return (
    <group>
      <Text
        font={FONT_SANS_MED}
        fontSize={0.2}
        color={C_EMBER_DEEP}
        letterSpacing={0.18}
        anchorX="center"
        anchorY="middle"
        position={[0, compact ? 2.05 : 2.75, 0]}
      >
        THE PROOF
      </Text>

      <group position={[0, compact ? 1.5 : 2.15, 0]}>
        <Inline
          segments={[
            { text: "Proof, not ", color: C_INK },
            { text: "promises.", color: C_EMBER },
          ]}
          font={FONT_SERIF_BOLD}
          fontSize={compact ? 0.8 : 1.05}
          anchorX="center"
        />
      </group>

      {PROOF.map((t, i) => (
        <ProofCard
          key={i}
          figure={t.figure}
          text={t.text}
          position={positions[i]}
          tilt={tilts[i]}
          scale={compact ? 0.62 : 1}
        />
      ))}
    </group>
  );
}

/* ═══════════════════════════════════════════════
   ZONE 3 — WORK (floating image frames)
   ═══════════════════════════════════════════════ */

function WorkFrame({
  position, rotation, img, title, tag,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  img: string;
  title: string;
  tag: string;
}) {
  const ref = useRef<THREE.Group>(null!);
  const [hover, setHover] = useState(false);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.load(`/images/work/${img}`, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      setTexture(tex);
    });
  }, [img]);

  useFrame(({ clock }, dt) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    const floatY = reduce ? 0 : Math.sin(t * 0.4) * 0.1;
    ref.current.position.y = THREE.MathUtils.damp(
      ref.current.position.y,
      position[1] + floatY + (hover ? 0.12 : 0),
      6,
      dt
    );
    const s = THREE.MathUtils.damp(ref.current.scale.x, hover ? 1.05 : 1, 8, dt);
    ref.current.scale.setScalar(s);
  });

  return (
    <group
      ref={ref}
      position={position}
      rotation={rotation}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHover(true);
        setCursor("pointer");
      }}
      onPointerOut={() => {
        setHover(false);
        setCursor("auto");
      }}
    >
      <RoundedBox args={[4.1, 2.6, 0.14]} radius={0.06} smoothness={3}>
        <meshStandardMaterial color={C_INK} roughness={0.75} metalness={0.15} />
      </RoundedBox>
      {texture && (
        <mesh position={[0, 0, 0.08]}>
          <planeGeometry args={[3.8, 2.3]} />
          <meshBasicMaterial map={texture} />
        </mesh>
      )}
      <mesh position={[0, 0, 0.1]}>
        <planeGeometry args={[3.8, 2.3]} />
        <meshPhysicalMaterial
          color={C_EMBER} transparent opacity={0.05}
          roughness={0.05} metalness={0.1} side={THREE.DoubleSide}
        />
      </mesh>
      <Text
        font={FONT_SANS_MED}
        fontSize={0.24}
        color={C_INK}
        anchorX="center"
        anchorY="middle"
        position={[0, -1.45, 0]}
      >
        {title}
      </Text>
      <Text
        font={FONT_SANS}
        fontSize={0.15}
        color={C_MUTED}
        anchorX="center"
        anchorY="middle"
        position={[0, -1.85, 0]}
      >
        {tag}
      </Text>
    </group>
  );
}

function WorkZone({ compact }: { compact: boolean }) {
  const router = useRouter();
  return (
    <group>
      <Text
        font={FONT_SANS_MED}
        fontSize={0.2}
        color={C_EMBER_DEEP}
        letterSpacing={0.18}
        anchorX="center"
        anchorY="middle"
        position={[0, compact ? 2.4 : 3.05, 0]}
      >
        SELECTED WORK
      </Text>

      <group position={[0, compact ? 2.0 : 2.45, 0]}>
        <Inline
          segments={[
            { text: "Real projects, ", color: C_INK },
            { text: "shipped.", color: C_EMBER },
          ]}
          font={FONT_SERIF_BOLD}
          fontSize={compact ? 0.9 : 1.05}
          anchorX="center"
        />
      </group>

      {compact ? (
        <>
          <group position={[0, 1.15, 0]} scale={0.62}>
            <WorkFrame position={[0, 0, 0]} rotation={[0, 0.04, 0]} img="la-tani-cover.jpg" title="La-Tani" tag="E-commerce · 2024" />
          </group>
          <group position={[0, -0.65, 0]} scale={0.62}>
            <WorkFrame position={[0, 0, 0]} rotation={[0, -0.04, 0]} img="ghani-cover.jpg" title="Dr. Ghani" tag="Dental · 2024" />
          </group>
        </>
      ) : (
        <>
          <WorkFrame position={[-3.3, 0.05, 0]} rotation={[0, 0.12, 0]} img="la-tani-cover.jpg" title="La-Tani" tag="E-commerce · 2024" />
          <WorkFrame position={[3.3, -0.75, -2]} rotation={[0, -0.1, 0]} img="ghani-cover.jpg" title="Dr. Ghani" tag="Dental · 2024" />
        </>
      )}

      {!compact && (
        <Pill
          label="View all work"
          filled={false}
          width={4.4}
          onClick={() => router.push("/work")}
          position={[0, -2.6, 0]}
        />
      )}
    </group>
  );
}

/* ═══════════════════════════════════════════════
   ZONE 4 — SERVICES (orb constellation)
   ═══════════════════════════════════════════════ */

const SERVICES = [
  { id: "web", name: "Web", desc: "Next.js & modern stacks", kind: "globe" },
  { id: "seo", name: "SEO", desc: "Technical & content strategy", kind: "magnifier" },
  { id: "ads", name: "Ads", desc: "Meta & Google, full-funnel", kind: "megaphone" },
  { id: "content", name: "Content", desc: "Copy, art direction, video", kind: "document" },
  { id: "social", name: "Social", desc: "Community & growth", kind: "social" },
];

function ServiceIcon({ kind, hover }: { kind: string; hover: boolean }) {
  const E = hover ? 2.2 : 1.3;
  const metal = () => (
    <meshStandardMaterial
      color={C_EMBER}
      roughness={0.1}
      metalness={0.9}
      emissive={C_EMBER}
      emissiveIntensity={E}
      envMapIntensity={1.8}
    />
  );
  const metalDeep = () => (
    <meshStandardMaterial
      color={C_EMBER_DEEP}
      roughness={0.12}
      metalness={0.85}
      emissive={C_EMBER_DEEP}
      emissiveIntensity={E}
      envMapIntensity={1.6}
    />
  );

  switch (kind) {
    case "globe":
      return (
        <group>
          <mesh>
            <sphereGeometry args={[0.82, 32, 32]} />
            <meshStandardMaterial
              color={C_EMBER}
              roughness={0.16}
              metalness={0.7}
              emissive={C_EMBER}
              emissiveIntensity={E * 0.7}
              envMapIntensity={1.6}
            />
          </mesh>
          <mesh>
            <sphereGeometry args={[0.84, 14, 10]} />
            <meshBasicMaterial color={C_EMBER_DEEP} wireframe transparent opacity={0.55} />
          </mesh>
          <mesh rotation={[Math.PI / 2.2, 0, 0]}>
            <torusGeometry args={[1.06, 0.03, 12, 64]} />
            {metalDeep()}
          </mesh>
          <mesh rotation={[Math.PI / 1.7, 0.4, 0.3]}>
            <torusGeometry args={[1.06, 0.03, 12, 64]} />
            {metalDeep()}
          </mesh>
        </group>
      );

    case "magnifier":
      return (
        <group rotation={[0.2, 0, -0.5]}>
          <mesh>
            <torusGeometry args={[0.52, 0.11, 16, 40]} />
            {metal()}
          </mesh>
          <mesh position={[0, 0, -0.02]}>
            <circleGeometry args={[0.46, 32]} />
            <meshPhysicalMaterial
              color="#ffffff"
              transparent
              opacity={0.16}
              roughness={0.04}
              metalness={0}
              transmission={0.6}
            />
          </mesh>
          <mesh position={[0.46, -0.46, 0]} rotation={[0, 0, -0.65]}>
            <cylinderGeometry args={[0.08, 0.08, 0.72, 16]} />
            {metalDeep()}
          </mesh>
        </group>
      );

    case "megaphone":
      return (
        <group rotation={[0, 0, 0.25]}>
          <mesh position={[0.15, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <coneGeometry args={[0.62, 1.05, 28, 1, true]} />
            {metal()}
          </mesh>
          <mesh position={[-0.55, 0, 0]}>
            <cylinderGeometry args={[0.16, 0.16, 0.42, 16]} />
            {metalDeep()}
          </mesh>
          <mesh position={[0.7, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.18, 0.18, 0.16, 16]} />
            {metal()}
          </mesh>
        </group>
      );

    case "document":
      return (
        <group>
          <mesh>
            <boxGeometry args={[0.92, 1.2, 0.07]} />
            {metal()}
          </mesh>
          {[-0.32, -0.12, 0.08, 0.28].map((y) => (
            <mesh key={y} position={[0, y, 0.05]}>
              <boxGeometry args={[0.62, 0.05, 0.02]} />
              <meshStandardMaterial color={C_CREAM} roughness={0.4} metalness={0.1} />
            </mesh>
          ))}
          <mesh position={[0.52, 0.5, 0.12]} rotation={[0, 0, -0.8]}>
            <cylinderGeometry args={[0.05, 0.05, 0.95, 12]} />
            {metalDeep()}
          </mesh>
          <mesh position={[0.78, 0.71, 0.12]} rotation={[0, 0, -0.8]}>
            <coneGeometry args={[0.07, 0.16, 12]} />
            <meshStandardMaterial color={C_CREAM} roughness={0.4} metalness={0.1} />
          </mesh>
        </group>
      );

    case "social":
      return (
        <group>
          <mesh position={[-0.26, 0.22, 0]}>
            <RoundedBox args={[0.82, 0.6, 0.4]} radius={0.12} smoothness={4}>
              {metal()}
            </RoundedBox>
          </mesh>
          <mesh position={[-0.46, -0.12, 0]} rotation={[0, 0, Math.PI / 4]}>
            <coneGeometry args={[0.2, 0.34, 4]} />
            {metal()}
          </mesh>
          <mesh position={[0.34, -0.26, 0]}>
            <RoundedBox args={[0.72, 0.5, 0.4]} radius={0.1} smoothness={4}>
              {metalDeep()}
            </RoundedBox>
          </mesh>
          <mesh position={[0.5, -0.5, 0]} rotation={[0, 0, -Math.PI / 4]}>
            <coneGeometry args={[0.18, 0.3, 4]} />
            {metalDeep()}
          </mesh>
        </group>
      );

    default:
      return (
        <mesh>
          <icosahedronGeometry args={[1, 1]} />
          {metal()}
        </mesh>
      );
  }
}

function ServiceOrb({
  position, index, compact,
}: {
  position: [number, number, number];
  index: number;
  compact: boolean;
}) {
  const ref = useRef<THREE.Group>(null!);
  const [hover, setHover] = useState(false);
  const reduce = useReducedMotion();
  const router = useRouter();
  const service = SERVICES[index];

  useFrame(({ clock }, dt) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    if (!reduce) {
      ref.current.rotation.x = t * 0.15 + index;
      ref.current.rotation.y = t * 0.2 + index * 0.5;
      ref.current.position.y = THREE.MathUtils.damp(
        ref.current.position.y,
        position[1] + Math.sin(t * 0.6 + index * 1.2) * 0.15,
        5,
        dt
      );
    }
    const s = THREE.MathUtils.damp(ref.current.scale.x, hover ? 1.2 : 0.5, 7, dt);
    ref.current.scale.setScalar(s);
  });

  const labelSize = compact ? 0.2 : 0.26;
  const descY = position[1] - (compact ? 0.62 : 1.05);

  return (
    <group
      onPointerOver={(e) => {
        e.stopPropagation();
        setHover(true);
        setCursor("pointer");
      }}
      onPointerOut={() => {
        setHover(false);
        setCursor("auto");
      }}
      onClick={(e) => {
        e.stopPropagation();
        router.push(`/services#${service.id}`);
      }}
    >
      <Float speed={0.7 + index * 0.1} rotationIntensity={0.25} floatIntensity={0.35}>
        <group ref={ref} position={position}>
          <ServiceIcon kind={service.kind} hover={hover} />
        </group>
      </Float>
      <Text
        font={FONT_SANS_MED}
        fontSize={labelSize}
        color={C_INK}
        anchorX="center"
        anchorY="middle"
        position={[position[0], position[1] - 0.75, 0]}
      >
        {SERVICES[index].name}
      </Text>
      {!compact && (
        <Text
          font={FONT_SANS}
          fontSize={0.13}
          color={C_MUTED}
          anchorX="center"
          anchorY="middle"
          position={[position[0], descY, 0]}
        >
          {SERVICES[index].desc}
        </Text>
      )}
    </group>
  );
}

function ServicesZone({ compact }: { compact: boolean }) {
  const spread = compact ? 0.62 : 1;
  const xs = [-4.2, -2.1, 0, 2.1, 4.2].map((x) => x * spread);
  const orbY = compact ? -0.6 : 0.4;

  return (
    <group>
      <Text
        font={FONT_SANS_MED}
        fontSize={0.2}
        color={C_EMBER_DEEP}
        letterSpacing={0.18}
        anchorX="center"
        anchorY="middle"
        position={[0, compact ? 3.4 : 2.75, 0]}
      >
        FIVE CRAFTS, ONE ROOF
      </Text>

      <group position={[0, compact ? 2.6 : 2.0, 0]}>
        <Inline
          segments={[
            { text: "Everything ", color: C_INK },
            { text: "you need.", color: C_EMBER },
          ]}
          font={FONT_SERIF_BOLD}
          fontSize={compact ? 0.95 : 1.3}
          anchorX="center"
          gap={0.07}
        />
      </group>

      {SERVICES.map((_, i) => (
        <ServiceOrb
          key={i}
          index={i}
          compact={compact}
          position={[xs[i], orbY, -Math.abs(xs[i]) * 0.4]}
        />
      ))}
    </group>
  );
}

/* ═══════════════════════════════════════════════
   ZONE 5 — BOOKING (lead-in to the panel below)
   ═══════════════════════════════════════════════ */

function BookingZone({ compact }: { compact: boolean }) {
  const scrollToBooking = () => {
    const el = document.getElementById("book");
    if (el) el.scrollIntoView({ behavior: "smooth" });
    else if (typeof window !== "undefined") window.location.href = "/#book";
  };

  return (
    <group>
      <Text
        font={FONT_SANS_MED}
        fontSize={0.2}
        color={C_EMBER_DEEP}
        letterSpacing={0.18}
        anchorX="center"
        anchorY="middle"
        position={[0, compact ? 3.5 : 2.65, 0]}
      >
        READY WHEN YOU ARE
      </Text>

      <group position={[0, compact ? 2.7 : 1.85, 0]}>
        <Inline
          segments={[
            { text: "Book a ", color: C_INK },
            { text: "call.", color: C_EMBER },
          ]}
          font={FONT_SERIF_BOLD}
          fontSize={compact ? 0.95 : 1.3}
          anchorX="center"
          gap={0.07}
        />
      </group>

      <Text
        font={FONT_SANS}
        fontSize={compact ? 0.24 : 0.3}
        color={C_MUTED}
        anchorX="center"
        anchorY="middle"
        lineHeight={1.5}
        maxWidth={compact ? 5.4 : 12}
        position={[0, compact ? -1.0 : -0.4, 0]}
      >
        Thirty minutes, real availability, no sales script. Pick a slot — we'll tell you exactly how we'd fix what's stuck.
      </Text>

      <Pill
        label="Open booking"
        filled
        width={4.4}
        fontSize={0.26}
        onClick={scrollToBooking}
        position={[0, compact ? -2.45 : -2.45, 0]}
      />
    </group>
  );
}

/* ═══════════════════════════════════════════════
   ZONE 6 — FINALE (vortex + invitation)
   ═══════════════════════════════════════════════ */

function FinaleVortex() {
  const vortexRef = useRef<THREE.Points>(null!);
  const torusRef = useRef<THREE.Mesh>(null!);
  const glowRef = useRef<THREE.Mesh>(null!);
  const reduce = useReducedMotion();

  const [positions, colors] = useMemo(() => {
    const count = 1100;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const brand = [
      new THREE.Color(C_EMBER),
      new THREE.Color(C_EMBER_DEEP),
      new THREE.Color("#c9b8e8"),
    ];
    for (let i = 0; i < count; i++) {
      const t = i / count;
      const angle = t * Math.PI * 18;
      const radius = t * 6;
      pos[i * 3] = Math.cos(angle) * radius * (0.4 + Math.random() * 0.6);
      pos[i * 3 + 1] = (t - 0.5) * 8 + (Math.random() - 0.5) * 0.6;
      pos[i * 3 + 2] = Math.sin(angle) * radius * (0.4 + Math.random() * 0.6);
      const c = brand[Math.floor(Math.random() * brand.length)];
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
    return [pos, col];
  }, []);

  useFrame(({ clock }) => {
    if (reduce) return;
    const t = clock.getElapsedTime();
    if (vortexRef.current) {
      vortexRef.current.rotation.y = t * 0.05;
      vortexRef.current.rotation.x = Math.sin(t * 0.08) * 0.04;
    }
    if (torusRef.current) {
      torusRef.current.rotation.x = Math.PI * 0.5 + Math.sin(t * 0.12) * 0.15;
      torusRef.current.rotation.z = t * 0.08;
      torusRef.current.scale.setScalar(1 + Math.sin(t * 0.7) * 0.04);
    }
    if (glowRef.current) {
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity =
        0.1 + Math.sin(t * 0.5) * 0.05;
      glowRef.current.rotation.copy(torusRef.current.rotation);
      glowRef.current.scale.setScalar(1.4 + Math.sin(t * 0.4) * 0.1);
    }
  });

  return (
    <group position={[0, 0.2, -5]}>
      <points ref={vortexRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.05} vertexColors transparent opacity={0.7}
          sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending}
        />
      </points>
      <mesh ref={torusRef}>
        <torusGeometry args={[2.6, 0.09, 24, 100]} />
        <meshStandardMaterial
          color={C_EMBER} roughness={0.08} metalness={0.95}
          emissive={C_EMBER} emissiveIntensity={2.2}
        />
      </mesh>
      <mesh ref={glowRef}>
        <torusGeometry args={[2.6, 0.22, 24, 100]} />
        <meshBasicMaterial
          color={C_EMBER} transparent opacity={0.14}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

function FinaleZone({ compact }: { compact: boolean }) {
  const [emailHover, setEmailHover] = useState(false);

  return (
    <group>
      <FinaleVortex />

      <group position={[0, compact ? 1.55 : 1.65, 0]}>
        <Inline
          segments={[
            { text: "Let's tell your ", color: C_INK },
            { text: "story.", color: C_EMBER },
          ]}
          font={FONT_SERIF_BOLD}
          fontSize={compact ? 1.05 : 1.6}
          anchorX="center"
          gap={0.08}
        />
      </group>

      <Text
        font={FONT_SANS}
        fontSize={compact ? 0.24 : 0.3}
        color={C_MUTED}
        anchorX="center"
        anchorY="middle"
        lineHeight={1.45}
        maxWidth={compact ? 5.4 : 11}
        position={[0, compact ? -0.5 : -0.3, 0]}
      >
        Tell us where your brand is stuck. We reply within one working day.
      </Text>

      <group
        position={[0, compact ? -1.75 : -1.55, 0]}
        scale={emailHover ? 1.05 : 1}
        onClick={(e) => {
          e.stopPropagation();
          window.location.href = "mailto:therafters.official@gmail.com";
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setEmailHover(true);
          setCursor("pointer");
        }}
        onPointerOut={() => {
          setEmailHover(false);
          setCursor("auto");
        }}
      >
        <Text
          font={FONT_SANS_MED}
          fontSize={compact ? 0.34 : 0.42}
          color={emailHover ? C_EMBER : C_INK}
          anchorX="center"
          anchorY="middle"
          position={[0, 0, 0.05]}
        >
          therafters.official@gmail.com
        </Text>
        <mesh position={[0, -0.34, 0.05]}>
          <boxGeometry args={[6.2, 0.02, 0.01]} />
          <meshBasicMaterial color={emailHover ? C_EMBER : C_LINE} />
        </mesh>
      </group>

      <Text
        font={FONT_SANS}
        fontSize={0.16}
        color={C_MUTED}
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.14}
        position={[0, compact ? -3.1 : -3.05, 0]}
      >
        © 2026 RAFTERS — WEB · SEO · ADS · CONTENT · SOCIAL
      </Text>
    </group>
  );
}

/* ═══════════════════════════════════════════════
   WORLD DECOR — ambient shapes between zones
   ═══════════════════════════════════════════════ */

function WaypointShapes({ compact = false }: { compact?: boolean }) {
  const pts: { pos: [number, number, number]; scale: number }[] = [
    { pos: [-5, 1.5, -15], scale: 0.3 },
    { pos: [4.5, -1.2, -22], scale: 0.4 },
    { pos: [-3.5, 2, -45], scale: 0.35 },
    { pos: [5, -1.5, -52], scale: 0.3 },
    { pos: [-4.5, 1.4, -75], scale: 0.4 },
    { pos: [4.5, -1, -82], scale: 0.3 },
    { pos: [-5, 1.8, -105], scale: 0.35 },
    { pos: [3.5, -1.5, -112], scale: 0.4 },
    { pos: [-4.5, 1.2, -135], scale: 0.3 },
    { pos: [5, -1.8, -142], scale: 0.35 },
  ];
  const shown = compact ? pts.slice(0, 4) : pts;
  return (
    <>
      {shown.map((p, i) => (
        <GlassShape
          key={i}
          geo={i % 2 === 0 ? "icosahedron" : "octahedron"}
          pos={p.pos}
          color={i % 2 === 0 ? C_EMBER : C_EMBER_DEEP}
          scale={p.scale}
          speed={0.6 + (i % 3) * 0.3}
          opacity={0.45}
        />
      ))}
    </>
  );
}

function WorldParticles() {
  return (
    <>
      <Sparkles
        count={150} scale={[16, 9, TOTAL_DEPTH + 20]}
        position={[0, 0, -TOTAL_DEPTH / 2]}
        size={2} speed={0.25} opacity={0.4} color={C_EMBER_DEEP}
      />
      <Sparkles
        count={90} scale={[22, 12, TOTAL_DEPTH + 30]}
        position={[0, 0, -TOTAL_DEPTH / 2]}
        size={1} speed={0.15} opacity={0.3} color={C_EMBER}
      />
    </>
  );
}

/* ═══════════════════════════════════════════════
   LIGHTING
   ═══════════════════════════════════════════════ */

function WorldLighting() {
  return (
    <>
      <ambientLight intensity={0.55} />
      <hemisphereLight args={["#ffffff", "#e6dcf4", 0.55]} />
      <directionalLight position={[6, 9, 5]} intensity={0.9} color="#ffffff" />
      <pointLight position={[4, 3, 4]} intensity={0.6} color={C_EMBER} />
      <pointLight position={[-3, 2, -ZONE_DEPTH + 2]} intensity={0.5} color={C_EMBER_DEEP} />
      <pointLight position={[0, 4, -ZONE_DEPTH * 2 + 3]} intensity={0.45} color={C_EMBER} />
      <pointLight position={[0, 3, -ZONE_DEPTH * 3 + 3]} intensity={0.5} color={C_EMBER_DEEP} />
      <pointLight position={[0, 3, -ZONE_DEPTH * 4 + 3]} intensity={0.5} color={C_EMBER} />
      <pointLight position={[0, 4, -ZONE_DEPTH * 5 + 4]} intensity={0.7} color={C_EMBER} />
      <pointLight position={[0, -3, -ZONE_DEPTH * 5 + 2]} intensity={0.5} color={C_EMBER_DEEP} />
    </>
  );
}

/* ═══════════════════════════════════════════════
   FULL SCENE
   ═══════════════════════════════════════════════ */

function Zone({
  index, compact, children,
}: {
  index: number;
  compact: boolean;
  children: React.ReactNode;
}) {
  return (
    <group
      position={[0, 0, -ZONE_DEPTH * index]}
      scale={compact ? 0.85 : 1}
    >
      {children}
    </group>
  );
}

function useCompact() {
  const { size } = useThree();
  return size.width / size.height < 1.15;
}

function FullScene({ low }: { low: boolean }) {
  const compact = useCompact();

  return (
    <>
      <fog attach="fog" args={["#f4f1ea", 10, 23]} />
      <CameraRig />
      <WorldLighting />
      {!low && <Environment preset="city" environmentIntensity={0.15} />}

      <Zone index={0} compact={compact}>
        <HeroZone compact={compact} />
      </Zone>
      <Zone index={1} compact={compact}>
        <ManifestoZone compact={compact} />
      </Zone>
      <Zone index={2} compact={compact}>
        <ProofZone compact={compact} />
      </Zone>
      <Zone index={3} compact={compact}>
        <WorkZone compact={compact} />
      </Zone>
      <Zone index={4} compact={compact}>
        <ServicesZone compact={compact} />
      </Zone>
      <Zone index={5} compact={compact}>
        <BookingZone compact={compact} />
      </Zone>
      <Zone index={6} compact={compact}>
        <FinaleZone compact={compact} />
      </Zone>

      {low ? <WaypointShapes compact /> : <WaypointShapes />}
      {!low && <WorldParticles />}

      {!low && (
        <EffectComposer>
          <Bloom
            luminanceThreshold={1}
            luminanceSmoothing={0.3}
            intensity={0.3}
            mipmapBlur
          />
        </EffectComposer>
      )}
    </>
  );
}

/* ═══════════════════════════════════════════════
   WORLD — master component
   ═══════════════════════════════════════════════ */

export function World() {
  const reduce = useReducedMotion();
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const check = () => setMobile(mq.matches);
    check();
    mq.addEventListener("change", check);
    return () => mq.removeEventListener("change", check);
  }, []);

  // Low tier: small screens and reduced-motion users get a lighter scene —
  // capped pixel ratio, no environment HDR, no bloom, no particle systems.
  const low = reduce || mobile;

  return (
    <div className="world-root" style={{ height: `${ZONES * 100}vh` }}>
      <div className="world-sticky">
        <div className="world-vignette" />
        <Canvas
          className="world-canvas"
          dpr={low ? [1, 1] : [1, 1.5]}
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
          camera={{ position: [0.5, 0.35, 7.2], fov: 50, near: 0.1, far: 200 }}
        >
          <FullScene low={low} />
        </Canvas>
      </div>
    </div>
  );
}

"use client";

import { Canvas } from "@react-three/fiber";
import type { CanvasProps } from "@react-three/fiber";
import { Suspense } from "react";

export function Scene3D({
  children,
  className = "",
  ...props
}: CanvasProps & { children: React.ReactNode; className?: string }) {
  return (
    <Canvas
      className={className}
      dpr={[1, 1.5]}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      }}
      camera={{ position: [0, 0, 6], fov: 50 }}
      {...props}
    >
      <Suspense fallback={null}>{children}</Suspense>
    </Canvas>
  );
}

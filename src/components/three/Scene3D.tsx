"use client";

import { Canvas } from "@react-three/fiber";
import type { CanvasProps } from "@react-three/fiber";
import { Suspense } from "react";
import { isLowTier } from "@/lib/device-tier";
import { ErrorBoundary } from "@/components/error-boundary";

export function Scene3D({
  children,
  className = "",
  ...props
}: CanvasProps & { children: React.ReactNode; className?: string }) {
  const low = isLowTier();

  return (
    <ErrorBoundary
      fallback={
        <div className="flex items-center justify-center py-24">
          <span className="font-serif text-xl italic text-ink">
            Rafters®
          </span>
        </div>
      }
    >
      <Canvas
        className={className}
        dpr={low ? [1, 1] : [1, 1.5]}
        gl={{
          antialias: !low,
          alpha: true,
          powerPreference: "high-performance",
        }}
        camera={{ position: [0, 0, 6], fov: 50 }}
        {...props}
      >
        <Suspense fallback={null}>{children}</Suspense>
      </Canvas>
    </ErrorBoundary>
  );
}
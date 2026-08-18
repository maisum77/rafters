"use client";

import { Canvas, useThree } from "@react-three/fiber";
import type { CanvasProps } from "@react-three/fiber";
import { Suspense, useEffect } from "react";
import { isLowTier } from "@/lib/device-tier";
import { ErrorBoundary } from "@/components/error-boundary";

/**
 * On weak machines the canvas renders only when the page scrolls
 * (frameloop="demand") instead of repainting forever at 60fps — the
 * animations still advance while the user scrolls, but the GPU is idle
 * the rest of the time.
 */
function InvalidateOnScroll() {
  const invalidate = useThree((s) => s.invalidate);

  useEffect(() => {
    const onScroll = () => invalidate();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [invalidate]);

  return null;
}

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
        frameloop={low ? "demand" : "always"}
        gl={{
          antialias: !low,
          alpha: true,
          powerPreference: "high-performance",
        }}
        camera={{ position: [0, 0, 6], fov: 50 }}
        {...props}
      >
        <Suspense fallback={null}>
          {low && <InvalidateOnScroll />}
          {children}
        </Suspense>
      </Canvas>
    </ErrorBoundary>
  );
}
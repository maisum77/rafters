"use client";

let cached: boolean | null = null;

/**
 * Heuristic for "this machine can't hold 60fps with a heavy WebGL scene".
 * Weak laptops (Intel iGPUs, 8GB RAM, few cores) are exactly the machines
 * that report the flicker, so they get the lighter scene — and if the
 * heuristic misses, the in-canvas FPS watchdog demotes them at runtime.
 */
export function isLowTier(): boolean {
  if (cached !== null) return cached;
  if (typeof navigator === "undefined") return false;

  const nav = navigator as Navigator & {
    deviceMemory?: number;
    hardwareConcurrency?: number;
  };

  let low = false;
  if (typeof nav.deviceMemory === "number" && nav.deviceMemory > 0) {
    low ||= nav.deviceMemory <= 8;
  }
  if (typeof nav.hardwareConcurrency === "number" && nav.hardwareConcurrency > 0) {
    low ||= nav.hardwareConcurrency <= 6;
  }

  cached = low;
  return low;
}
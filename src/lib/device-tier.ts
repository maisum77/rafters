"use client";

let cached: boolean | null = null;

/**
 * Cheap heuristic for "this machine can't hold 60fps with a heavy WebGL
 * scene". Weak laptops (Intel iGPUs, low RAM, few cores) are exactly the
 * machines that report the flicker, so we drop bloom, environment HDR,
 * particle systems and pixel ratio for them.
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
    low ||= nav.deviceMemory <= 4;
  }
  if (typeof nav.hardwareConcurrency === "number" && nav.hardwareConcurrency > 0) {
    low ||= nav.hardwareConcurrency <= 4;
  }

  cached = low;
  return low;
}
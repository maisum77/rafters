"use client";

import { useState, useEffect, type ComponentType } from "react";

/**
 * Wraps a component so it only renders after the client mounts,
 * avoiding WebGL SSR issues without needing next/dynamic.
 */
function clientOnly<P extends object>(Component: ComponentType<P>) {
  return function ClientOnlyWrapper(props: P) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    if (!mounted) return null;
    return <Component {...props} />;
  };
}

/* ─── Lazy-loaded 3D scenes via client-only wrapper ─── */
import { HeroScene as _HeroScene } from "./HeroScene";
import { ManifestoScene as _ManifestoScene } from "./ManifestoScene";
import { TestimonialsScene as _TestimonialsScene } from "./TestimonialsScene";
import { WorkScene as _WorkScene } from "./WorkScene";
import { HubScene as _HubScene } from "./HubScene";
import { BookingScene as _BookingScene } from "./BookingScene";
import { FinaleScene as _FinaleScene } from "./FinaleScene";
import { ServicesScene as _ServicesScene } from "./ServicesScene";
import { ProcessScene as _ProcessScene } from "./ProcessScene";
import { CraftScene as _CraftScene } from "./CraftScene";

export const HeroScene = clientOnly(_HeroScene);
export const ManifestoScene = clientOnly(_ManifestoScene);
export const TestimonialsScene = clientOnly(_TestimonialsScene);
export const WorkScene = clientOnly(_WorkScene);
export const HubScene = clientOnly(_HubScene);
export const BookingScene = clientOnly(_BookingScene);
export const FinaleScene = clientOnly(_FinaleScene);
export const ServicesScene = clientOnly(_ServicesScene);
export const ProcessScene = clientOnly(_ProcessScene);
export const CraftScene = clientOnly(_CraftScene);

"use client";

import { Component, type ReactNode } from "react";

/**
 * Catches WebGL/Canvas mount failures (blocklisted GPUs, hardware
 * acceleration off, context exhaustion). Without this, a thrown error
 * during Canvas init unmounts the whole app — the "blank page until
 * refresh" bug on some laptops.
 */
export class ErrorBoundary extends Component<
  { fallback?: ReactNode; children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    if (error instanceof Error && /webgl|context/i.test(error.message)) {
      console.warn("[rafters] WebGL unavailable — showing static fallback", error);
    }
  }

  render() {
    if (this.state.hasError) return this.props.fallback ?? null;
    return this.props.children;
  }
}
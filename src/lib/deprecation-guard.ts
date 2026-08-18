/**
 * Side-effect-only boot module — import first in any module that mounts a
 * <Canvas>.
 *
 * Three.js r183+ prints «Clock: This module has been deprecated. Please use
 * THREE.Timer instead.» whenever @react-three/fiber instantiates its internal
 * render clock. R3F v9 still constructs `new THREE.Clock()` on store
 * initialisation, which is not patchable from app code, so the exact notice is
 * suppressed here. Firefox pointer shims in third-party renderers likewise
 * emit the `mozPressure`/`mozInputSource` deprecations — also suppressed.
 */
const DEPRECATED = [
  "Clock: This module has been deprecated. Please use THREE.Timer instead.",
  "MouseEvent.mozPressure is deprecated.",
  "MouseEvent.mozInputSource is deprecated.",
];

const shouldSuppress = (first: unknown) =>
  DEPRECATED.some((m) => String(first ?? "").includes(m));

const nativeWarn = console.warn.bind(console);

console.warn = (...args: unknown[]) => {
  if (shouldSuppress(args[0])) return;
  nativeWarn(...args);
};

export {};
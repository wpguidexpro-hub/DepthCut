import * as THREE from 'three';

// Shared lightweight Three.js defaults for editor responsiveness.
export function configureRenderer(gl) {
  gl.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25));
  gl.outputColorSpace = THREE.SRGBColorSpace;
  gl.toneMapping = THREE.ACESFilmicToneMapping;
  gl.toneMappingExposure = 1;
}

export const viewportCamera = { position: [4, 3, 6], fov: 45, near: 0.1, far: 1000 };

import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export function setupCameraControls(camera, renderer) {
  const controls = new OrbitControls(camera, renderer.domElement);

  controls.enableRotate = true;
  controls.enablePan = true;
  controls.enableZoom = true;

  controls.mouseButtons = {
    LEFT: THREE.MOUSE.NONE,
    MIDDLE: THREE.MOUSE.DOLLY,
    RIGHT: THREE.MOUSE.ROTATE, // default
  };

  // On right-click start, check if shift is held
  renderer.domElement.addEventListener('pointerdown', (e) => {
    if (e.button === 2) { // right-click
      controls.mouseButtons.RIGHT = e.shiftKey
        ? THREE.MOUSE.PAN
        : THREE.MOUSE.ROTATE;
    }
  });

  // On shift release, reset to rotate
  window.addEventListener('keyup', (e) => {
    if (e.key === 'Shift') {
      controls.mouseButtons.RIGHT = THREE.MOUSE.ROTATE;
    }
  });

  return controls;
}
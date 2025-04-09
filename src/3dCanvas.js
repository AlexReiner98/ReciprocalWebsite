import * as THREE from "three";
import { setupCameraControls  } from "./cameraControls.js";
import { setupControlPanel } from './controlPanel.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as rg from './rhinoGeometries.js';

//control panel setup
let currentMode = 'draw';
setupControlPanel((newMode) => {
  currentMode = newMode;
  console.log(`Switched to mode: ${currentMode}`);
});

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
const initialDistance = 50;
camera.position.set(initialDistance, initialDistance, initialDistance);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = setupCameraControls(camera, renderer);

// Grid and snap plane
const snapPlane = rg.createGridAndPlane(scene);

//snapped point display
const snapPoint = rg.createSnapPoint(0.2, 0xffffff);
var snapLocation;
window.addEventListener('mousemove', (e) => {
  snapLocation = rg.getSnappedLocation(e, snapPlane, camera, renderer);
  rg.updateSnapPoint(snapPoint, snapLocation, scene);
});

const points = [];
window.addEventListener('click', (e) => {
    if (e.target.closest('#control-panel')) return;
    if(currentMode == 'draw'){
        const savePoint = rg.createSavedPoint(snapLocation,0.5, 0xff2d00);
        points.push(savePoint);
        scene.add(savePoint);
    }
})

// Animate
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();
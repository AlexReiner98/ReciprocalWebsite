// src/grid.js
import * as THREE from "three";
import { isMirrorXActive } from "./controlPanel";

let sceneRef = null;
const mirroredPoints = [];
const mirrorColour = 0x808080;
const texture = generateCircleTexture(); // or load a texture file

export function createGridAndPlane(scene) {
  sceneRef = scene;
  // Grid helper
  const gridSize = 2000;
  const axisOffset = 0.03;
  const grid = new THREE.GridHelper(gridSize, gridSize);
  grid.raycast = () => {}; // makes it unselectable
  scene.add(grid);

  // Highlight X axis in red
  const xAxisMat = new THREE.LineBasicMaterial({ color: 0xff0000 });
  const xAxisGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, axisOffset, 0),
    new THREE.Vector3(gridSize / 2, axisOffset, 0),
  ]);
  const xAxis = new THREE.Line(xAxisGeo, xAxisMat);
  xAxis.raycast = () => {}; // makes it unselectable
  scene.add(xAxis);

// Highlight Z axis in green
  const zAxisMat = new THREE.LineBasicMaterial({ color: 0x00ff00 });
  const zAxisGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, axisOffset, 0),
    new THREE.Vector3(0, axisOffset, gridSize / 2),
  ]);
  const zAxis = new THREE.Line(zAxisGeo, zAxisMat);
  zAxis.raycast = () => {}; // makes it unselectable
  scene.add(zAxis);

  // Snap plane (horizontal on Y=0)
  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  plane.raycast = () => {}; // makes it unselectable
  return plane;
}

export function getSnappedLocation(event, plane, camera, renderer) {
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  // Normalize mouse coords
  mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
  mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  const intersection = new THREE.Vector3();
  raycaster.ray.intersectPlane(plane, intersection);

  // Snap to nearest mm
  intersection.x = Math.round(intersection.x);
  intersection.y = 0;
  intersection.z = Math.round(intersection.z);

  return intersection;
}

export function createSnapPoint(radius, colour, id = null){
  const geometry = new THREE.BufferGeometry();
  const vertices = new Float32Array([0, 0, 0]);
  geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));

  const material = new THREE.PointsMaterial({
    color: colour,
    size: radius,
    map: texture,
    sizeAttenuation: true
  });

  const points = new THREE.Points(geometry, material);

  points.userData = {
    type: 'point',
    id: id || crypto.randomUUID(),
    locked: false,
    mirrored: false
  };

  return points;
}

function generateCircleTexture() {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext('2d');
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
  ctx.fillStyle = 'white';
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

export function updateSnapPoint(point, vector) {
  point.position.copy(vector);
}

export function createSavedPoint(location, radius, color, data = {}) {
  const id = data.id || crypto.randomUUID();
  const point = createSnapPoint(radius, color, id);
  updateSnapPoint(point, location);

  // Add extra data without overwriting the base userData
  point.userData.original = data;
  point.userData.locked = false;
  point.userData.mirrored = false;

  return point;
}

export function createNewMirroPoint(point) {
  if (!sceneRef) return;
  if (isMirrorXActive() && point) {
    const worldPos = new THREE.Vector3();
    point.getWorldPosition(worldPos);

    const newPosition = new THREE.Vector3(worldPos.x, worldPos.y, -worldPos.z);
    const mirroredPoint = createSnapPoint(2, mirrorColour); // NEW ID
    updateSnapPoint(mirroredPoint, newPosition);

    mirroredPoint.userData.locked = true;
    mirroredPoint.userData.mirrored = true;
    mirroredPoint.userData.source = point;

    sceneRef.add(mirroredPoint);
    mirroredPoints.push(mirroredPoint);
  }
}

export function mirrorVisiblePointsAcrossX() {
  if(!sceneRef)return;
  
  const allPoints = [];
  sceneRef.traverse(obj => {
    if (
      obj.userData?.type === 'point' &&
      !obj.userData.locked &&
      !obj.userData.mirrored &&
      !obj.userData.mouse

    ) {
      allPoints.push(obj);
    }
  });

  for (const point of allPoints) {
    const worldPos = new THREE.Vector3();
    point.getWorldPosition(worldPos);

    const newPosition = new THREE.Vector3(worldPos.x,worldPos.y,-worldPos.z);
    const mirroredPoint = createSavedPoint(newPosition, 2, mirrorColour);
    mirroredPoint.userData = { ...point.userData, locked: true, mirrored: true , source: point};
    sceneRef.add(mirroredPoint);
    mirroredPoints.push(mirroredPoint);
  }
}

export function removeMirroredPoints() {
  mirroredPoints.forEach(p => sceneRef.remove(p));
  mirroredPoints.length = 0;
}

export function updateMirroredPoints() {
  for (const mirrored of mirroredPoints) {
    const source = mirrored.userData.source;
    if (!source) continue;

    const worldPos = new THREE.Vector3();
    source.getWorldPosition(worldPos);

    // Apply mirror across X
    worldPos.z *= -1;

    // If mirrored point has a parent, convert to local space
    if (mirrored.parent) {
      const localPos = mirrored.parent.worldToLocal(worldPos.clone());
      mirrored.position.copy(localPos);
    } else {
      mirrored.position.copy(worldPos);
    }
  }
}
// src/grid.js
import * as THREE from "three";
import { isMirrorXActive } from "./controlPanel";

let sceneRef = null;
const mirroredPoints = [];
const mirrorColour = 0x808080;

export function createGridAndPlane(scene) {
  sceneRef = scene;
  // Grid helper
  const gridSize = 2000;
  const axisOffset = 0.03;
  const grid = new THREE.GridHelper(gridSize, gridSize);
  scene.add(grid);

  // Highlight X axis in red
  const xAxisMat = new THREE.LineBasicMaterial({ color: 0xff0000 });
  const xAxisGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, axisOffset, 0),
    new THREE.Vector3(gridSize / 2, axisOffset, 0),
  ]);
  const xAxis = new THREE.Line(xAxisGeo, xAxisMat);
  scene.add(xAxis);

// Highlight Z axis in green
  const zAxisMat = new THREE.LineBasicMaterial({ color: 0x00ff00 });
  const zAxisGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, axisOffset, 0),
    new THREE.Vector3(0, axisOffset, gridSize / 2),
  ]);
  const zAxis = new THREE.Line(zAxisGeo, zAxisMat);
  scene.add(zAxis);

  // Snap plane (horizontal on Y=0)
  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
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

export function createSnapPoint(radius, colour){
  const snapPoint = new THREE.Mesh(
    new THREE.SphereGeometry(radius, 12, 12),
    new THREE.MeshBasicMaterial({ color: colour })
  );
  return snapPoint;
}

export function updateSnapPoint(point, vector, scene,mode) {
  if(mode === 'draw'){
    point.position.copy(vector);
    scene.add(point);
  }
  else scene.remove(point);
}

export function createSavedPoint(location, radius, color, data = {}) {
  const point = createSnapPoint(radius, color);
  point.position.copy(location);

  // Attach original data
  point.userData = {
    type: 'point',
    original: data, // your source data
    id: data.id || crypto.randomUUID(), // optional unique ID
    locked: false,
    mirrored: false
  };

  return point;
}

export function createNewMirroPoint(point)
{
  if(!sceneRef) return;
  if (isMirrorXActive() && point) {
    const worldPos = new THREE.Vector3();
    point.getWorldPosition(worldPos);

    const mirrored = point.clone();
    mirrored.position.copy(worldPos);
    mirrored.position.z *= -1; // mirror across X
    mirrored.userData = { ...point.userData, locked: true, mirrored: true , source: point};
    const mat = new THREE.MeshBasicMaterial({color: mirrorColour});
    mirrored.material = mat; // avoid shared material mutation

    sceneRef.add(mirrored);
    mirroredPoints.push(mirrored);
  }
}

export function mirrorVisiblePointsAcrossX() {
  if(!sceneRef)return;
  
  const allPoints = [];
  sceneRef.traverse(obj => {
    if (
      obj.userData?.type === 'point' &&
      !obj.userData.locked &&
      !obj.userData.mirrored
    ) {
      allPoints.push(obj);
    }
  });

  for (const point of allPoints) {
    const worldPos = new THREE.Vector3();
    point.getWorldPosition(worldPos);

    const mirrored = point.clone();
    mirrored.position.copy(worldPos);
    mirrored.position.z *= -1; // mirror across X
    mirrored.userData = { ...point.userData, locked: true, mirrored: true , source: point};
    const mat = new THREE.MeshBasicMaterial({color: mirrorColour});
    mirrored.material = mat; // avoid shared material mutation

    sceneRef.add(mirrored);
    mirroredPoints.push(mirrored);
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
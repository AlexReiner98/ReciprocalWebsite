// src/grid.js
import * as THREE from "three";

export function createGridAndPlane(scene) {
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
  };

  return point;
}
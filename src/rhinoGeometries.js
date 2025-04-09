// src/grid.js
import * as THREE from 'three';

export function createGridAndPlane(scene) {
  // Grid helper
  const grid = new THREE.GridHelper(2000, 2000);
  scene.add(grid);

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

export function updateSnapPoint(point, vector, scene) {
  point.position.copy(vector);
  scene.add(point);
}

export function createSavedPoint(location, radius, colour){
  const point = createSnapPoint(radius, colour);
  point.position.copy(location);
  return point;
}
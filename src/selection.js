
import * as THREE from 'three';

let selectedObjects = new Set();
let selectionColor = new THREE.Color(0xffff00); // yellow

export function clearSelection() {
  selectedObjects.forEach(obj => {
    if (obj.userData.originalMaterial) {
      obj.material.color.copy(obj.userData.originalMaterial.color);
    }
  });
  selectedObjects.clear();
}

export function selectObject(obj) {
  if (!obj || selectedObjects.has(obj)) return;

  // Save original material color
  obj.userData.originalMaterial = {
    color: obj.material.color.clone()
  };

  obj.material.color.copy(selectionColor);
  selectedObjects.add(obj);
}

export function selectObjects(objects) {
  objects.forEach(selectObject);
}

export function handleClickSelection(event, camera, renderer, scene, append = false) {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
  
    mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
    mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;
  
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);
  
    const pointHit = intersects.find(i => i.object.userData?.type === 'point');
    if (pointHit) {
      if (!append) clearSelection();
      selectObject(pointHit.object);
    } else if (!append) {
      clearSelection(); // Deselect if clicked on empty space
    }
}

export function handleBoxSelection(start, end, camera, scene, append = false) {
    if (!append) clearSelection();
  
    const rect = new THREE.Box2(start.clone(), end.clone());
  
    const frustum = new THREE.Frustum();
    const tempCam = camera.clone();
    tempCam.updateMatrixWorld();
    tempCam.updateProjectionMatrix();
  
    const projScreenMatrix = new THREE.Matrix4().multiplyMatrices(
      tempCam.projectionMatrix,
      tempCam.matrixWorldInverse
    );
    frustum.setFromProjectionMatrix(projScreenMatrix);
  
    const toScreenSpace = (pos) => {
      const projected = pos.clone().project(camera);
      return new THREE.Vector2(
        (projected.x + 1) / 2,
        (1 - projected.y) / 2
      );
    };
  
    const points = scene.children.filter(obj => obj.userData?.type === 'point');
  
    for (const point of points) {
      const screenPos = toScreenSpace(point.position);
      if (rect.containsPoint(screenPos)) {
        selectObject(point);
      }
    }
}
import * as THREE from "three";

let selectedObjects = new Set();
export const selectionGroup = new THREE.Group();
selectionGroup.name = 'SelectionGroup';

let sceneRef = null;

let selectionColor = new THREE.Color(0xffff00);
let undoStack = [];
let redoStack = [];

export function setupSelection(scene)
{
  if (!scene) return;
  if (!sceneRef) {
    sceneRef = scene;
    sceneRef.add(selectionGroup);
  }
}

function syncSelectionGroup() {
  // Detach previous members
  [...selectionGroup.children].forEach(obj => {
    sceneRef.attach(obj);
  });

  // Attach selected objects to the group
  selectedObjects.forEach(obj => {
    selectionGroup.attach(obj);
  });
}

export function clearSelection() {
  selectedObjects.forEach(obj => {
    if (obj.userData.originalMaterial) {
      obj.material.color.copy(obj.userData.originalMaterial.color);
    }
  });
  selectedObjects.clear();
  syncSelectionGroup();
}

export function selectObject(obj) {
  if (!obj || typeof obj !== 'object' || !obj.isObject3D || selectedObjects.has(obj)) return;

  obj.userData.originalMaterial = {
    color: obj.material.color.clone()
  };

  obj.material.color.copy(selectionColor);
  selectedObjects.add(obj);
  syncSelectionGroup();
}

export function selectObjects(objects) {
  objects.forEach(selectObject);
}

export function getSelection() {
  return [...selectedObjects];
}

export function getSelectionGroup(){
  return selectionGroup;
}

// Action wrapper
function recordAction(type, objects) {
  undoStack.push({ type, objects });
  redoStack.length = 0; // Clear redo stack on new action
}

export function deleteSelected(scene) {
  const toDelete = getSelection();
  if (toDelete.length === 0) return;

  toDelete.forEach(obj => scene.remove(obj));
  recordAction('delete', toDelete);
  clearSelection();
}


export function registerAddedObjects(objects) {
  undoStack.push({ type: 'add', objects });
  redoStack.length = 0; // Clear redo on new action
}


export function undo(scene) {
  const action = undoStack.pop();
  if (!action) return;

  switch (action.type) {
    case 'delete':
      action.objects.forEach(obj => scene.add(obj));
      break;

    case 'add':
      action.objects.forEach(obj => {
        scene.remove(obj);
        selectedObjects.delete(obj);
      });
      break;
  }

  redoStack.push(action);
}

export function redo(scene) {
  const action = redoStack.pop();
  if (!action) return;

  switch (action.type) {
    case 'delete':
      action.objects.forEach(obj => scene.remove(obj));
      break;

    case 'add':
      action.objects.forEach(obj => scene.add(obj));
      break;
  }

  undoStack.push(action);
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
    clearSelection();
  }
}

export function handleBoxSelection(start, end, camera, scene, append = false, isGumballDragging) {
  console.log("Gumball dragging: " + isGumballDragging); 
  if(isGumballDragging) return;
  if (!append) clearSelection();

  const rect = new THREE.Box2(start.clone(), end.clone());

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

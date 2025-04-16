import * as THREE from "three";
import {updateGumballTarget,
  detachObjects
 } from "./gumball.js";
import { addMirroredPoint, removeMirroredPoint, updateMirroredPoints } from "./rhinoGeometries.js";

let selectedObjects = new Set();
const selectionGroup = new THREE.Group();
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
  
  detachObjects(selectionGroup);

  // Detach previous members
  [...selectionGroup.children].forEach(obj => {
    sceneRef.attach(obj);
  });

  const unlocked = []
  selectedObjects.forEach(obj => {
    if (!obj.userData.locked) {
      unlocked.push(obj);
    }
  });
  const centroid = computeObjectsCentroid(unlocked);
  if(centroid)
  {
    selectionGroup.position.copy(centroid);
  }


  // Attach selected objects to the group
  unlocked.forEach(obj => {
    selectionGroup.attach(obj);
  });

  updateGumballTarget(selectionGroup);
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

export function removeFromSelection(obj) {
  console.log("enter");
  if (!selectedObjects.has(obj)) return;
  console.log("has");
  // Restore material color
  if (obj.userData.originalMaterial) {
    console.log("material");
    obj.material.color.copy(obj.userData.originalMaterial.color);
  }

  // Remove from selection
  selectedObjects.delete(obj);
}

export function removeFromSelectionMany(objs) {
  objs.forEach(obj => removeFromSelection(obj));
}

export function selectObject(obj) {
  console.log('Selecting', obj.uuid, obj.userData?.id);
  if (!obj || selectedObjects.has(obj)) {
    console.log('Already selected or invalid');
    return;
  }
  if (!obj || typeof obj !== 'object' || !obj.isObject3D || selectedObjects.has(obj)) return;

  obj.userData.originalMaterial = {
    color: obj.material.color.clone()
  };

  obj.material.color.set(selectionColor);

  selectedObjects.add(obj);
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

export function isSelection()
{
  return selectedObjects.size > 0;
}

function computeObjectsCentroid(objects)
{
  if (objects.length === 0) return;

  const centroid = new THREE.Vector3();

  objects.forEach(obj => {
    const worldPos = new THREE.Vector3();
    obj.getWorldPosition(worldPos);
    centroid.add(worldPos);
  });

  centroid.divideScalar(objects.length);

  return centroid;
}

// Action wrapper
function recordAction(type, objects) {
  undoStack.push({ type, objects });
  redoStack.length = 0; // Clear redo stack on new action
}

export function deleteSelected(scene) {
  const selected = getSelection();
  if(selected.length ===0) return;
  clearSelection();

  //remove mirrored points so they can't be deleted directly
  const toDelete = [];
  for(const original of selected)
  {
    if(!original.userData?.mirrored) {
      toDelete.push(original);
      console.log("adding to delete");
    }
  }

  const allToDelete = [...toDelete];
  // Look for mirrored points linked to selected objects
  for (const original of toDelete) {
    scene.traverse(obj => {
      if (
        obj.userData?.mirrored &&
        obj.userData.source?.userData?.id === original.userData.id
      ) {
        allToDelete.push(obj);
      }
    });
  }

  allToDelete.forEach(obj => scene.remove(obj));
  recordAction('delete', allToDelete);
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
        if(obj.userData?.mirroredPoint)removeMirroredPoint(obj.userData.mirroredPoint);
        selectedObjects.delete(obj);
      });
      break;

    case 'transform':
      action.objects.forEach((obj, i) => {
        obj.position.copy(action.before[i].position);
        obj.quaternion.copy(action.before[i].quaternion);
        obj.scale.copy(action.before[i].scale);
      });
      break;
  }

  redoStack.push(action);
  updateMirroredPoints();
}

export function redo(scene) {
  const action = redoStack.pop();
  if (!action) return;

  switch (action.type) {
    case 'delete':
      action.objects.forEach(obj => scene.remove(obj));
      break;

    case 'add':
      action.objects.forEach(obj => {scene.add(obj)
      if(obj.userData?.mirroredPoint) addMirroredPoint(obj.userData.mirroredPoint);
      });
      break;
    
    case 'transform':
      action.objects.forEach((obj, i) => {
        obj.position.copy(action.after[i].position);
        obj.quaternion.copy(action.after[i].quaternion);
        obj.scale.copy(action.after[i].scale);
      });
      break;
  }
  updateMirroredPoints();
  undoStack.push(action);
}

export function registerAddedObjects(objects) {
  const all = [...objects];

  for (const obj of objects) {
    // Look for any mirrored counterparts in the scene
    sceneRef.traverse(child => {
      if (
        child.userData?.mirrored &&
        child.userData.source?.userData?.id === obj.userData?.id
      ) {
        all.push(child);
      }
    });
  }

  undoStack.push({ type: 'add', objects: all });
  redoStack.length = 0;
}
export function registerTransformedObjects(objects, before, after) {
  undoStack.push({
    type: 'transform',
    objects,
    before,
    after
  });
  redoStack.length = 0;
}

export function handleClickSelection(event, camera, renderer, scene, append = [false,false]) {
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
  mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const points =  scene.children.filter(i => i.userData?.type === "point" && i.visible);

  const intersects = raycaster.intersectObjects(points, true);

  const pointHit = intersects.find(i => i.object.userData?.type === 'point');
  if (pointHit) {
    if(append[1])//control was held
    {
      removeFromSelection(pointHit.object);
    }
    else{
      if (!append[0]) clearSelection();
      console.log(pointHit.object);
      selectObject(pointHit.object);
    } 
  } else if (!append[0]) {
    clearSelection();
  }
  syncSelectionGroup();
}

export function handleBoxSelection(start, end, camera, scene, append = [false,false], isGumballDragging) {
  if(isGumballDragging) return;
  if (!(append[0] || append[1])) clearSelection();

  const rect = new THREE.Box2(start.clone(), end.clone());

  const toScreenSpace = (pos) => {
    const projected = pos.clone().project(camera);
    return new THREE.Vector2(
      (projected.x + 1) / 2,
      (1 - projected.y) / 2
    );
  };

  const points = scene.children.filter(obj => obj.userData?.type === 'point');
  for(const point of selectedObjects){
    if(point.userData?.type === 'point') points.push(point);
  }
  
  const pointsToRemove = [];
  for (const point of points) {
    const worldPos = new THREE.Vector3();
    point.getWorldPosition(worldPos);
    const screenPos = toScreenSpace(worldPos);
    if(rect.containsPoint(screenPos)){
      if(append[1]) pointsToRemove.push(point);
      else {
        selectObject(point);
        console.log(point);
      }
    }
  }
  if(pointsToRemove)removeFromSelectionMany(pointsToRemove);
  syncSelectionGroup();
}

import * as THREE from "three";
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js'
import { getSelectionGroup,
  registerTransformedObjects,
  syncSelectionGroup,
 } from './selection.js';
import { updateMirroredPoints } from "./rhinoGeometries.js";

let transformControls = null;
let gumballActive = false;
let isDraggingWithGumball = false;
let beforeStates = [];

export function setupGumball(scene, camera, domElement, orbitControls)
{
    transformControls = new TransformControls(camera, domElement);
    scene.add(transformControls.getHelper()); 
    transformControls.visible = false;
    transformControls.translationSnap = 1.0;
    transformControls.setMode('translate');

    transformControls.addEventListener('dragging-changed', (event) => {
      orbitControls.enabled = !event.value;

      const selected = [...getSelectionGroup().children];

      if (event.value) {
        beforeStates = captureWorldTransforms(selected);
      } else {
        flattenGroupTransform(getSelectionGroup());
        const afterStates = captureWorldTransforms(selected);
        registerTransformedObjects(selected, beforeStates, afterStates);
        syncSelectionGroup();
      }
    });

    transformControls.addEventListener('change',() => {
      updateMirroredPoints();
    });
}

function flattenGroupTransform(group) {
  const matrix = group.matrix.clone();
  group.updateMatrixWorld(true);

  group.children.forEach(child => {
    child.applyMatrix4(matrix);
  });

  group.position.set(0, 0, 0);
  group.rotation.set(0, 0, 0);
  group.scale.set(1, 1, 1);
}

export function setGumballMode(mode){
  if(!transformControls) return;
  transformControls.setMode(mode);
}



function captureWorldTransforms(objects) {
  return objects.map(obj => {
    const matrix = obj.matrixWorld.clone();
    const pos = new THREE.Vector3();
    const quat = new THREE.Quaternion();
    const scale = new THREE.Vector3();
    matrix.decompose(pos, quat, scale);
    return { position: pos, quaternion: quat, scale };
  });
}

export function setGumballEnabled(enabled) {
    gumballActive = enabled;
    if (!enabled && transformControls) {
      transformControls.detach();
      transformControls.visible = false;
    }
    else if(gumballActive && transformControls)
    {
      const selectionGroup = getSelectionGroup();
      if(selectionGroup.children.length > 0)
      {
        updateGumballTarget(selectionGroup);
      }
    }
}

export function updateGumballTarget(selectionGroup) {
  if (!gumballActive || !transformControls) return;
  const movable = selectionGroup.children;
  if (movable.length === 0) {
    transformControls.detach();
    transformControls.visible = false;
  } else {
    transformControls.attach(selectionGroup);
    transformControls.visible = true;
  }
}

export function detachObjects(selectionGroup){
  const wasAttached = transformControls?.object === selectionGroup;

  if (wasAttached) {
    transformControls.detach(); 
  }
  transformControls.setSpace('world');
  const obj = transformControls.object;
  transformControls.detach();
  transformControls.attach(obj);
}

export function isGumballDragging() {
  return isDraggingWithGumball;
}

export function getGumballObject() {
  if (!transformControls) return null;
  const helper = transformControls.getHelper?.();
  if (!helper) return [];

  const meshes = [];
  helper.traverse(obj => {
    if (obj.isMesh) meshes.push(obj);
  });

  return meshes;
}

export function isGumballVisible()
{
  return transformControls.getHelper().visible;
}


export function isMouseOverGumball()
{
  if(!isGumballVisible()) return false;
  return !!transformControls.axis;
}

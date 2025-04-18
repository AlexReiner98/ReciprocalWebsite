import * as THREE from "three";
import { TransformControls } from '../node_modules/three/examples/jsm/controls/TransformControls.js'
import { getSelectionGroup,
  registerTransformedObjects,
 } from './selection.js';

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

    transformControls.addEventListener('dragging-changed', (event) => {
      orbitControls.enabled = !event.value;

      const selected = [...getSelectionGroup().children];

      if (event.value) {
        beforeStates = captureWorldTransforms(selected);
      } else {
        const afterStates = captureWorldTransforms(selected);
        registerTransformedObjects(selected, beforeStates, afterStates);
      }
    });
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
  if (selectionGroup.children.length === 0) {
    transformControls.detach();
    transformControls.visible = false;
    return;
  }

  transformControls.attach(selectionGroup);
  transformControls.visible = true;
}

export function detachObjects(selectionGroup){
  const wasAttached = transformControls?.object === selectionGroup;

  if (wasAttached) {
    transformControls.detach(); 
  }
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

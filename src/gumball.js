import { TransformControls } from '../node_modules/three/examples/jsm/controls/TransformControls.js'

let transformControls = null;
let gumballActive = false;
let isDraggingWithGumball = false;

export function setupGumball(scene, camera, domElement, orbitControls)
{
    transformControls = new TransformControls(camera, domElement);
    scene.add(transformControls.getHelper()); 
    transformControls.visible = false;

    transformControls.addEventListener('dragging-changed', (event) => {
    orbitControls.enabled = !event.value;

    if (!event.value) {
      // Automatically clear the flag on the next animation frame
      requestAnimationFrame(() => {
        isDraggingWithGumball = false;
      });
    }
    });
}

export function setGumballEnabled(enabled) {
    gumballActive = enabled;
    if (!enabled && transformControls) {
      transformControls.detach();
      transformControls.visible = false;
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

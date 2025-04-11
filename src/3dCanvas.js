////////////////////////////////////////////////////////
///////////////          Imports         ///////////////
////////////////////////////////////////////////////////

import * as THREE from "three";
import { setupCameraControls  } from "./cameraControls.js";
import { setupControlPanel } from './controlPanel.js';
import * as rg from './rhinoGeometries.js';

import {
    handleClickSelection,
    handleBoxSelection,
    deleteSelected,
    registerAddedObjects,
    undo,
    redo,
    setupSelection,
    clearSelection,
  } from './selection.js';

  import {
    setupGumball,
    setGumballEnabled,
    isGumballDragging,
    isMouseOverGumball
  } from './gumball.js';


////////////////////////////////////////////////////////
///////////////        Declarations       //////////////
////////////////////////////////////////////////////////

let isDragging = false;
let dragStart = new THREE.Vector2();
let dragEnd = new THREE.Vector2();
const points = [];
let isDraggingGumball = false;

//snapped point preview when drawing
const snapPoint = rg.createSnapPoint(0.2, 0xffffff);
var snapLocation;

//selection plane
const selectionRect = document.getElementById('selection-rect');

////////////////////////////////////////////////////////
///////////////          Setup           ///////////////
////////////////////////////////////////////////////////

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
const initialDistance = 50;
camera.position.set(-initialDistance, initialDistance, -initialDistance);

setupSelection(scene);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

//camera controls setup
const controls = setupCameraControls(camera, renderer);



//control panel setup
let currentMode = 'draw';
setupControlPanel(
    (newMode) => {
      currentMode = newMode;
    },
    (gumballEnabled) => {
      setGumballEnabled(gumballEnabled);
    }
  );

setupGumball(scene,camera,renderer.domElement,controls);

// Grid and work plane setup
const snapPlane = rg.createGridAndPlane(scene);

////////////////////////////////////////////////////////
///////////         Event-Listeners          ///////////
////////////////////////////////////////////////////////

renderer.domElement.addEventListener('mousemove', (e) => {
    snapLocation = rg.getSnappedLocation(e, snapPlane, camera, renderer);
    rg.updateSnapPoint(snapPoint, snapLocation, scene, currentMode);
});

window.addEventListener('pointerdown', (e) => {

  if (currentMode !== 'select' || e.button !== 0) return;

  Object.assign(selectionRect.style, {
    left: '0px',
    top: '0px',
    width: '0px',
    height: '0px',
  });
  
  const mouse = new THREE.Vector2(
    (e.clientX / renderer.domElement.clientWidth) * 2 - 1,
    -(e.clientY / renderer.domElement.clientHeight) * 2 + 1
  );
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);

  isDraggingGumball = isMouseOverGumball();
  if(isDraggingGumball) return;

  isDragging = true;
  dragStart.set(e.clientX, e.clientY);
  selectionRect.style.display = 'block';
});

window.addEventListener('pointermove', (e) => {
    if (!isDragging ) return;
    dragEnd.set(e.clientX, e.clientY);

    const x = Math.min(dragStart.x, dragEnd.x);
    const y = Math.min(dragStart.y, dragEnd.y);
    const width = Math.abs(dragStart.x - dragEnd.x);
    const height = Math.abs(dragStart.y - dragEnd.y);

    Object.assign(selectionRect.style, {
        left: `${x}px`,
        top: `${y}px`,
        width: `${width}px`,
        height: `${height}px`,
    });
});

window.addEventListener('pointerup', (e) => {
// Hide and reset the selection box
  if(isDraggingGumball || e.button != 0) return;

  Object.assign(selectionRect.style, {
      left: '0px',
      top: '0px',
      width: '0px',
      height: '0px',
      display: 'none',
  });

  var dragDistance = 0;
  var ndcStart;
  var ndcEnd;
  if(isDragging)
  {
      // Convert screen space to normalized device coords
      const w = renderer.domElement.clientWidth;
      const h = renderer.domElement.clientHeight;

      const deltaX = Math.abs(dragStart.x - e.clientX);
      const deltaY = Math.abs(dragStart.y - e.clientY);
      dragDistance = Math.max(deltaX, deltaY);

      // Only do box selection if the mouse was actually dragged
      
      ndcStart = new THREE.Vector2(
      Math.min(dragStart.x, e.clientX) / w,
      Math.min(dragStart.y, e.clientY) / h
      );
      ndcEnd = new THREE.Vector2(
      Math.max(dragStart.x, e.clientX) / w,
      Math.max(dragStart.y, e.clientY) / h
      );
  }
  isDragging = false;

  const append = [];
  append.push(e.shiftKey);
  append.push(e.ctrlKey);

  if (dragDistance > 3) {
  handleBoxSelection(ndcStart, ndcEnd, camera, scene, append, isGumballDragging());
  } else {
    if (e.target.closest('#control-panel')) return;
    if(currentMode == 'draw'){
        const savePoint = rg.createSavedPoint(snapLocation,0.5, 0xff2d00);
        points.push(savePoint);
        scene.add(savePoint);
        registerAddedObjects([savePoint]);
        clearSelection();
    }
    if (currentMode === 'select') {

        handleClickSelection(e, camera, renderer, scene, append);
    }
  }
    
});

window.addEventListener('keydown', (e) => {
    if (e.key === 'Delete') {
      deleteSelected(scene);
    }
  
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
      clearSelection();
      undo(scene);
    }
  
    if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
      redo(scene);
    }
  });


////////////////////////////////////////////////////////
///////////         Animation          ///////////
////////////////////////////////////////////////////////

// Animate
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();
// src/controlPanel.js
import { setGumballMode } from "./gumball.js";
import {mirrorVisiblePointsAcrossX,
  removeMirroredPoints
 } from "./rhinoGeometries.js";
 
 import { setDrawMode } from "./3dCanvas.js";
 
 let mirrorXActive = false;

export function setupControlPanel(onModeChange, onGumballToggle) {
  let currentMode = 'draw';
  let gumballActive = false;
  let drawModeActive = false;

  function setMode(mode) {
    currentMode = mode;
    drawModeActive = (mode === 'draw');

    const drawModes = document.getElementById('draw-modes');
    drawModes.style.display = drawModeActive ? 'flex' : 'none';


    document.querySelectorAll('#control-panel button[data-mode]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === mode);
    });

    if (drawModeActive) {
      
      const defaultButton = drawModes.querySelector('button[draw-mode="points"]');
      if (defaultButton) defaultButton.click(); // triggers mode selection
    }

    if (typeof onModeChange === 'function') {
      onModeChange(mode);
    }
  }

  function toggleGumball() {
    gumballActive = !gumballActive;
  
    const gumballButton = document.querySelector('#control-panel button[data-toggle="gumball"]');
    const gumballModes = document.getElementById('gumball-modes');
  
    gumballButton.classList.toggle('active', gumballActive);
    gumballModes.style.display = gumballActive ? 'flex' : 'none';
  
    if (gumballActive) {
      // Activate default mode: translate
      const defaultButton = gumballModes.querySelector('button[gumball-mode="translate"]');
      if (defaultButton) defaultButton.click(); // triggers mode selection
    }
  
    if (typeof onGumballToggle === 'function') {
      onGumballToggle(gumballActive);
    }
  }

  function onGumballModeChange(mode) {
    setGumballMode(mode);
  }

  function onDrawModeChange(mode){
    setDrawMode(mode);
  }
  

  function toggleMirrorX() {
    mirrorXActive = !mirrorXActive;
  
    const mirrorButton = document.querySelector('#control-panel button[data-toggle="mirrorx"]');
    mirrorButton.classList.toggle('active', mirrorXActive);
  
    if (mirrorXActive) {
      mirrorVisiblePointsAcrossX();
    } else {
      removeMirroredPoints();
    }
  }

  // Setup mode buttons
  document.querySelectorAll('#control-panel button[data-mode]').forEach(button => {
    button.addEventListener('click', () => setMode(button.dataset.mode));
  });

  // Setup gumball toggle
  const gumballButton = document.querySelector('#control-panel button[data-toggle="gumball"]');
  if (gumballButton) {
    
    gumballButton.addEventListener('click', toggleGumball);
  }

  // Setup mirror toggle
  const mirrorButton = document.querySelector('#control-panel button[data-toggle="mirrorx"]');
  if (mirrorButton) {
    mirrorButton.addEventListener('click', toggleMirrorX);
  }

  document.querySelectorAll('#gumball-modes button[gumball-mode]').forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove 'active' from all mode buttons
      document.querySelectorAll('#gumball-modes button[gumball-mode]').forEach(b => b.classList.remove('active'));
  
      // Add 'active' to clicked button
      btn.classList.add('active');
  
      const mode = btn.getAttribute('gumball-mode');
      if (typeof onGumballModeChange === 'function') {
        onGumballModeChange(mode);
      }
    });
  });

  document.querySelectorAll('#draw-modes button[draw-mode]').forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove 'active' from all mode buttons
      document.querySelectorAll('#draw-modes button[draw-mode]').forEach(b => b.classList.remove('active'));
  
      // Add 'active' to clicked button
      btn.classList.add('active');
  
      const mode = btn.getAttribute('draw-mode');
      if (typeof onDrawModeChange === 'function') {
        onDrawModeChange(mode);
      }
    });
  });

  // Initial state
  setMode(currentMode);
  gumballButton.click();
  mirrorButton.click();
}

export function isMirrorXActive(){
  return mirrorXActive;
}
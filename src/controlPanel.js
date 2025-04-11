// src/controlPanel.js
export function setupControlPanel(onModeChange, onGumballToggle) {
  let currentMode = 'draw';
  let gumballActive = false;

  function setMode(mode) {
    currentMode = mode;

    document.querySelectorAll('#control-panel button[data-mode]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === mode);
    });

    if (typeof onModeChange === 'function') {
      onModeChange(mode);
    }
  }

  function toggleGumball() {
    gumballActive = !gumballActive;

    const gumballButton = document.querySelector('#control-panel button[data-toggle="gumball"]');
    gumballButton.classList.toggle('active', gumballActive);

    if (typeof onGumballToggle === 'function') {
      onGumballToggle(gumballActive);
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

  // Initial state
  setMode(currentMode);
  gumballButton.click();
}
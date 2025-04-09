// src/controlPanel.js
export function setupControlPanel(onModeChange) {
  let currentMode = 'draw';

  function setMode(mode) {
    currentMode = mode;

    document.querySelectorAll('#control-panel button').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === mode);
    });

    if (typeof onModeChange === 'function') {
      onModeChange(mode);
    }
  }

  document.querySelectorAll('#control-panel button').forEach(button => {
    button.addEventListener('click', () => setMode(button.dataset.mode));
  });

  // Initial state
  setMode(currentMode);
}
// main.js
// Entry point: instantiate the UI once the DOM is ready.

import { UI } from './ui.js';

window.addEventListener('DOMContentLoaded', () => {
  // Exposed on window for easy debugging in the browser console.
  window.battleship = new UI();
});

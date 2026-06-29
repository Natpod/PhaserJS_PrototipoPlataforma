import { startGame } from './game/main.js';

// Arranca el juego cuando el DOM esté listo
window.addEventListener('DOMContentLoaded', () => {
  startGame('game-container');
});

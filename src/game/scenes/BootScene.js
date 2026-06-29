import Phaser from 'phaser';

/**
 * BootScene
 * Primera escena en ejecutarse. Solo inicializa el registro global
 * (puntuación, vidas, nivel) y pasa al preload.
 *
 * Es el lugar ideal para detectar capacidades del dispositivo,
 * configurar el puntero táctil, o leer un save de localStorage.
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  create() {
    // Inicializar datos globales en el registro de Phaser
    // (accesibles desde cualquier escena con this.registry.get/set)
    this.registry.set('score', 0);
    this.registry.set('lives', 3);
    this.registry.set('level', 1);
    this.registry.set('highScore', this._loadHighScore());

    // Habilitar hasta 2 punteros táctiles simultáneos
    this.input.addPointer(1);

    this.scene.start('PreloadScene');
  }

  _loadHighScore() {
    try {
      return parseInt(localStorage.getItem('surfRushHighScore') || '0', 10);
    } catch {
      return 0;
    }
  }
}

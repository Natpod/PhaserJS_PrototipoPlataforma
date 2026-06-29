import Phaser from 'phaser';

/**
 * UIScene
 * Escena de interfaz que corre en paralelo sobre GameScene.
 * Muestra puntuación, vidas y nivel en tiempo real.
 *
 * Se comunica con GameScene solo a través del Registry de Phaser
 * (sin referencias directas entre escenas).
 */
// src/game/scenes/UIScene.js
export class UIScene extends Phaser.Scene {
  constructor() {
    super({ key: 'UIScene' });
  }

  create() {
    const { width } = this.scale;
    const pad = 20;

    this._scoreLabel = this.add.text(pad, pad, 'Puntos: 0', {
      fontSize: '18px',
      fontFamily: 'sans-serif',
      fontStyle: 'bold',
      color: '#ffffff',
      stroke: '#010e1a',
      strokeThickness: 3,
    });

    this._levelLabel = this.add.text(width / 2, pad, 'Nivel 1', {
      fontSize: '18px',
      fontFamily: 'sans-serif',
      fontStyle: 'bold',
      color: '#ffe066',
      stroke: '#010e1a',
      strokeThickness: 3,
    }).setOrigin(0.5, 0);

    this._livesLabel = this.add.text(width - pad, pad, '❤️❤️❤️', {
      fontSize: '18px',
      fontFamily: 'sans-serif',
    }).setOrigin(1, 0);

    // Quitar listener anterior antes de añadir uno nuevo
    // (evita duplicados si la escena se reinicia)
    this.registry.events.off('changedata', this._onRegistryChange, this);
    this.registry.events.on('changedata', this._onRegistryChange, this);

    // Sincronizar con los valores actuales del registry al arrancar
    this._scoreLabel.setText(`Puntos: ${this.registry.get('score')}`);
    this._levelLabel.setText(`Nivel ${this.registry.get('level')}`);
    this._livesLabel.setText('❤️'.repeat(Math.max(0, this.registry.get('lives'))));
  }

  _onRegistryChange(parent, key, value) {
    // Comprobar que los objetos de texto siguen activos antes de tocarlos
    if (key === 'score' && this._scoreLabel?.active) {
      this._scoreLabel.setText(`Puntos: ${value}`);
    } else if (key === 'lives' && this._livesLabel?.active) {
      this._livesLabel.setText('❤️'.repeat(Math.max(0, value)));
    } else if (key === 'level' && this._levelLabel?.active) {
      this._levelLabel.setText(`Nivel ${value}`);
    }
  }

  shutdown() {
    this.registry.events.off('changedata', this._onRegistryChange, this);
  }
}
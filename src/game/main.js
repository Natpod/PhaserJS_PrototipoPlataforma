import Phaser from 'phaser';
import { BootScene }    from './scenes/BootScene.js';
import { PreloadScene } from './scenes/PreloadScene.js';
import { MenuScene }    from './scenes/MenuScene.js';
import { GameScene }    from './scenes/GameScene.js';
import { UIScene }      from './scenes/UIScene.js';
import { GameOverScene } from './scenes/GameOverScene.js';

/**
 * Crea e inicia el juego Phaser dentro del contenedor indicado.
 * @param {string} parentId - id del elemento HTML donde montar el canvas
 */
export function startGame(parentId) {
  const config = {
    type: Phaser.AUTO,          // WebGL si está disponible, Canvas si no

    // Resolución interna del juego (se escala con Scale Manager)
    width: 480,
    height: 854,

    parent: parentId,

    backgroundColor: '#010e1a',

    scale: {
      mode: Phaser.Scale.FIT,               // ajusta al contenedor sin distorsión
      autoCenter: Phaser.Scale.CENTER_BOTH, // centra horizontal y vertical
    },

    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 800 },
        debug: false,           // cambia a true para ver hitboxes
      },
    },

    // Las escenas se cargan en orden; solo la primera arranca automáticamente
    scene: [
      BootScene,
      PreloadScene,
      MenuScene,
      GameScene,
      UIScene,
      GameOverScene,
    ],
  };

  return new Phaser.Game(config);
}

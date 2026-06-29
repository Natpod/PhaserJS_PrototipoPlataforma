import Phaser from 'phaser';

/**
 * PreloadScene
 * Carga todos los assets del juego y muestra una barra de progreso.
 * Cuando termina, lanza MenuScene.
 *
 * Para añadir assets:
 *   this.load.image('clave', 'assets/imagen.png')
 *   this.load.spritesheet('clave', 'assets/sprite.png', { frameWidth, frameHeight })
 *   this.load.audio('clave', 'assets/audio.mp3')
 */
export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload() {
    const { width, height } = this.scale;

    // ── Barra de progreso ──────────────────────────────────────────
    const barBg = this.add.rectangle(width / 2, height / 2, 300, 16, 0x1a3a4a);
    const bar   = this.add.rectangle(width / 2 - 148, height / 2, 4, 12, 0x3dd6f5);
    bar.setOrigin(0, 0.5);

    const label = this.add.text(width / 2, height / 2 - 30, 'Cargando...', {
      fontSize: '16px',
      color: '#b8e4f0',
      fontFamily: 'sans-serif',
    }).setOrigin(0.5);

    this.load.on('progress', (value) => {
      bar.width = 296 * value;
    });

    this.load.on('complete', () => {
      barBg.destroy(); bar.destroy(); label.destroy();
    });

    // ── Assets ────────────────────────────────────────────────────
    // Todos los archivos van en public/assets/
    // Por ahora usamos texturas generadas por código (GraphicsScene),
    // pero aquí es donde descomentes cuando tengas sprites reales:

    this.load.image('bg-sky',      'assets/bg-sky.png');
    this.load.image('bg-ocean',    'assets/bg-ocean.png');
    this.load.spritesheet('surfer', 'assets/surfer.png', {
      frameWidth: 100,   // ancho de cada frame
      frameHeight: 110,  // alto de cada frame
    });
    this.load.spritesheet('obstacle-shark', 'assets/shark.png',  { frameWidth: 128, frameHeight: 86 });
    this.load.audio('bgm',         ['assets/audio/bgm.mp3','assets/audio/bgm.ogg']);
    this.load.audio('jump',        'assets/audio/jump.mp3');
    this.load.audio('hit',         'assets/audio/hit.mp3');
  }

  create() {
    // Generar texturas procedurales para el prototipo
    // (reemplaza cada bloque cuando añadas sprites reales)
    this._createObstacleTextures();
    this._createParticleTexture();

    this.scene.start('MenuScene');
  }

  // ── Generadores de texturas procedurales ──────────────────────────

  _createObstacleTextures() {
    // Tiburón
    let g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0x607d8b);
    g.fillTriangle(15, 0, 0, 40, 30, 40);
    g.fillStyle(0x455a64);
    g.fillTriangle(20, 4, 14, 22, 30, 20);
    g.fillStyle(0xffffff); g.fillCircle(10, 28, 4);
    g.fillStyle(0x000000); g.fillCircle(10, 28, 2);
    g.generateTexture('obstacle-shark', 30, 42);
    g.destroy();

    // Roca
    g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0x78909c);
    g.fillPoints([
      { x: 6, y: 42 }, { x: 0, y: 22 }, { x: 10, y: 6 },
      { x: 26, y: 0 }, { x: 38, y: 8 }, { x: 42, y: 24 }, { x: 38, y: 42 },
    ], true);
    g.fillStyle(0x90a4ae);
    g.fillPoints([{ x: 10, y: 6 }, { x: 26, y: 0 }, { x: 22, y: 18 }], true);
    g.generateTexture('obstacle-rock', 42, 44);
    g.destroy();

    // Boya
    g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0xf44336); g.fillEllipse(14, 20, 28, 36);
    g.fillStyle(0xffffff); g.fillEllipse(14, 20, 28, 7);
    g.fillStyle(0xffd700); g.fillCircle(14, 4, 6);
    g.generateTexture('obstacle-buoy', 28, 40);
    g.destroy();

    // Medusa
    g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0xce93d8, 0.85); g.fillEllipse(16, 10, 32, 22);
    g.fillStyle(0xeec6f8, 0.65); g.fillEllipse(16, 8, 22, 15);
    g.lineStyle(2, 0xce93d8, 0.7);
    for (let i = -2; i <= 2; i++) {
      g.beginPath(); g.moveTo(16 + i * 5, 20);
      g.lineTo(16 + i * 6, 38); g.strokePath();
    }
    g.generateTexture('obstacle-jellyfish', 32, 40);
    g.destroy();
  }

  _createParticleTexture() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0xffffff);
    g.fillCircle(4, 4, 4);
    g.generateTexture('particle', 8, 8);
    g.destroy();
  }
}

import Phaser from 'phaser';

/**
 * MenuScene
 * Pantalla de inicio con animación de olas y opción de empezar.
 */
export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    const { width, height } = this.scale;

    // ── Fondo ──────────────────────────────────────────────────────
    this._drawBackground(width, height);

    // ── Surfer decorativo (no interactivo) ─────────────────────────
    const surfer = this.add.image(width / 2, height * 0.52, 'surfer')
      .setScale(2.5)
      .setAlpha(0.9);

    this.tweens.add({
      targets: surfer,
      y: height * 0.52 - 12,
      duration: 1400,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });

    // ── Título ─────────────────────────────────────────────────────
    this.add.text(width / 2, height * 0.22, '🏄', {
      fontSize: '64px',
    }).setOrigin(0.5);

    this.add.text(width / 2, height * 0.31, 'FABIANS SURF RUSH', {
      fontSize: '42px',
      fontFamily: 'sans-serif',
      fontStyle: 'bold',
      color: '#ffffff',
      stroke: '#0288b8',
      strokeThickness: 6,
    }).setOrigin(0.5);

    this.add.text(width / 2, height * 0.40, 'Esquiva tiburones, rocas y medusas en PR', {
      fontSize: '16px',
      fontFamily: 'sans-serif',
      color: '#b8e4f0',
    }).setOrigin(0.5);

    // ── High score ─────────────────────────────────────────────────
    const hs = this.registry.get('highScore');
    if (hs > 0) {
      this.add.text(width / 2, height * 0.46, `Récord: ${hs}`, {
        fontSize: '14px',
        fontFamily: 'sans-serif',
        color: '#ffe066',
      }).setOrigin(0.5);
    }

    // ── Botón de inicio ───────────────────────────────────────────
    const btn = this.add.text(width / 2, height * 0.72, 'EMPEZAR', {
      fontSize: '24px',
      fontFamily: 'sans-serif',
      fontStyle: 'bold',
      color: '#010e1a',
      backgroundColor: '#3dd6f5',
      padding: { x: 32, y: 14 },
    })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    this.tweens.add({
      targets: btn,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 700,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });

    btn.on('pointerdown', () => this._startGame());
    btn.on('pointerover', () => btn.setStyle({ color: '#ffffff', backgroundColor: '#0288b8' }));
    btn.on('pointerout',  () => btn.setStyle({ color: '#010e1a', backgroundColor: '#3dd6f5' }));

    // ── Controles ─────────────────────────────────────────────────
    this.add.text(width / 2, height * 0.84, '← → moverse  ·  Espacio / toca para saltar  ·  ↓ agacharse', {
      fontSize: '12px',
      fontFamily: 'sans-serif',
      color: '#607d8b',
    }).setOrigin(0.5);

    // También iniciar con teclado
    this.input.keyboard.once('keydown-SPACE', () => this._startGame());
    this.input.keyboard.once('keydown-ENTER', () => this._startGame());
  }

  _startGame() {
    // Reinicia los datos de partida en el registro
    this.registry.set('score', 0);
    this.registry.set('lives', 3);
    this.registry.set('level', 1);

    const bgm = this.sound.get('bgm') || this.sound.add('bgm', { loop: true, volume: 0.35 });
    if (!bgm.isPlaying) {
      bgm.play();
    }

    this.scene.start('GameScene');
    this.scene.start('UIScene');
    this.scene.bringToTop('UIScene');
  }

  _drawBackground(width, height) {
    const skyHeight = height * 0.66;
    const oceanHeight = height - skyHeight;

    this.add.image(0, 0, 'bg-sky')
      .setOrigin(0, 0)
      .setDisplaySize(width, skyHeight);

    this.add.image(0, skyHeight, 'bg-ocean')
      .setOrigin(0, 0)
      .setDisplaySize(width, oceanHeight);
  }
}

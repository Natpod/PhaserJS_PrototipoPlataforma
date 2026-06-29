import Phaser from 'phaser';

/**
 * GameOverScene
 * Pantalla de fin de partida. Muestra puntuación final,
 * récord y opciones de reiniciar o volver al menú.
 */
export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  create() {
    const { width, height } = this.scale;
    const score   = this.registry.get('score');
    const highScore = this.registry.get('highScore');
    const isNewRecord = score >= highScore;

    // ── Fondo semitransparente ────────────────────────────────────
    this.add.rectangle(0, 0, width, height, 0x010e1a, 0.82).setOrigin(0, 0);

    // ── Ola de wipeout ────────────────────────────────────────────
    this.add.text(width / 2, height * 0.22, '🌺', { fontSize: '72px' }).setOrigin(0.5);

    // ── Título ────────────────────────────────────────────────────
    this.add.text(width / 2, height * 0.35, 'Perdiste!', {
      fontSize: '38px',
      fontFamily: 'sans-serif',
      fontStyle: 'bold',
      color: '#ff6b6b',
      stroke: '#010e1a',
      strokeThickness: 5,
    }).setOrigin(0.5);

    // ── Puntuación ────────────────────────────────────────────────
    this.add.text(width / 2, height * 0.46, `Puntos: ${score}`, {
      fontSize: '28px',
      fontFamily: 'sans-serif',
      color: '#ffffff',
    }).setOrigin(0.5);

    // ── Récord ────────────────────────────────────────────────────
    const recordText = isNewRecord
      ? `🏆 ¡Nuevo récord: ${highScore}!`
      : `Récord: ${highScore}`;
    const recordColor = isNewRecord ? '#ffe066' : '#607d8b';

    this.add.text(width / 2, height * 0.53, recordText, {
      fontSize: '18px',
      fontFamily: 'sans-serif',
      color: recordColor,
    }).setOrigin(0.5);

    // ── Botón Reiniciar ───────────────────────────────────────────
    this._addButton(width / 2, height * 0.66, 'REINICIAR', '#3dd6f5', '#010e1a', () => {
      this.registry.set('score', 0);
      this.registry.set('lives', 3);
      this.registry.set('level', 1);
      this.scene.start('GameScene');
      this.scene.start('UIScene');
      this.scene.bringToTop('UIScene');
    });

    // ── Botón Menú ────────────────────────────────────────────────
    this._addButton(width / 2, height * 0.76, 'MENÚ', '#37474f', '#b8e4f0', () => {
      this.scene.start('MenuScene');
    });

    // Teclado
    this.input.keyboard.once('keydown-SPACE', () => {
      this.registry.set('score', 0);
      this.registry.set('lives', 3);
      this.registry.set('level', 1);
      this.scene.start('GameScene');
      this.scene.start('UIScene');
      this.scene.bringToTop('UIScene');
    });
    this.input.keyboard.once('keydown-ESC', () => {
      this.scene.start('MenuScene');
    });
  }

  _addButton(x, y, label, bgColor, textColor, callback) {
    const btn = this.add.text(x, y, label, {
      fontSize: '22px',
      fontFamily: 'sans-serif',
      fontStyle: 'bold',
      color: textColor,
      backgroundColor: bgColor,
      padding: { x: 36, y: 14 },
    })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    btn.on('pointerdown', callback);
    btn.on('pointerover', () => btn.setAlpha(0.82));
    btn.on('pointerout',  () => btn.setAlpha(1.0));

    return btn;
  }
}

import Phaser from 'phaser';

// ── Constantes de juego ───────────────────────────────────────────────────────
const GROUND_Y_RATIO = 0.82;  // posición Y del suelo como fracción de la altura
const OBSTACLE_TYPES = ['obstacle-shark', 'obstacle-rock', 'obstacle-buoy', 'obstacle-jellyfish'];
const SPEED_BASE      = 280;   // velocidad inicial de obstáculos (px/s)
const SPEED_INCREMENT = 25;    // incremento de velocidad por nivel
const LEVEL_UP_SCORE  = 500;   // puntos necesarios para subir nivel
const INVINCIBLE_MS   = 1500;  // duración de invencibilidad tras golpe (ms)

/**
 * GameScene
 * Escena principal de juego. Gestiona:
 *  - Surfer (jugador) con física arcade
 *  - Obstáculos generados proceduralmente
 *  - Parallax de fondo
 *  - Colisiones y sistema de vidas
 *  - Comunicación con UIScene a través del registro de Phaser
 */
export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  // ─── Lifecycle ─────────────────────────────────────────────────────────────

  create() {
    const { width, height } = this.scale;
    this.groundY = height * GROUND_Y_RATIO;

    // Estado interno de la escena
    this._speed       = SPEED_BASE;
    this._spawnDelay  = 1500;   // ms entre obstáculos
    this._invincible  = false;
    this._isAlive     = true;

    // ── Fondo parallax ─────────────────────────────────────────────
    this._buildBackground(width, height);

    // ── Suelo (plataforma estática invisible) ─────────────────────
    const ground = this.physics.add.staticImage(width / 2, this.groundY + 10, null)
      .setDisplaySize(width, 20)
      .setVisible(false);
    ground.refreshBody();
    this._ground = ground;

    // ── Surfer ────────────────────────────────────────────────────
    this._buildSurfer(width, height);

    // ── Grupo de obstáculos ───────────────────────────────────────
    this._obstacles = this.physics.add.group();

    // ── Colisiones ───────────────────────────────────────────────
    this.physics.add.collider(this._surfer, this._ground);
    this.physics.add.overlap(
      this._surfer,
      this._obstacles,
      this._onHitObstacle,
      null,
      this
    );

    // ── Partículas ───────────────────────────────────────────────
    this._particles = this.add.particles(0, 0, 'particle', {
      speed: { min: 40, max: 120 },
      scale: { start: 0.6, end: 0 },
      lifespan: 500,
      gravityY: 200,
      emitting: false,
    });

    // ── Input ─────────────────────────────────────────────────────
    this._buildInput(width, height);

    // ── Timer de spawn de obstáculos ─────────────────────────────
    this._spawnTimer = this.time.addEvent({
      delay: this._spawnDelay,
      callback: this._spawnObstacle,
      callbackScope: this,
      loop: true,
    });

    // ── Eventos de UIScene ────────────────────────────────────────
    // UIScene puede emitir 'pause-game' para pausar
    this.events.on('resume', this._onResume, this);




    // animaciones de sprite surfer

    // Correr (frames 0-3)
    this.anims.create({
      key: 'surf-run',
      frames: this.anims.generateFrameNumbers('surfer', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1,
    });

    // Saltar (frame 4, estático o pequeña animación)
    this.anims.create({
      key: 'surf-jump',
      frames: this.anims.generateFrameNumbers('surfer', { start: 4, end: 4 }),
      frameRate: 1,
      repeat: 0,
    });

    // Agacharse (frame 5)
    this.anims.create({
      key: 'surf-duck',
      frames: this.anims.generateFrameNumbers('surfer', { start: 5, end: 5 }),
      frameRate: 1,
      repeat: 0,
    });
  }

  update(time, delta) {
    if (!this._isAlive) return;

    // ── Movimiento del surfer ─────────────────────────────────────
    this._handleMovement();

    // ── Parallax ──────────────────────────────────────────────────
    this._scrollBackground(delta);

    // ── Destruir obstáculos fuera de pantalla ─────────────────────
    this._obstacles.getChildren().forEach((ob) => {
      if (ob.x < -100) ob.destroy();
    });

    // ── Puntuación y nivel ────────────────────────────────────────
    this._updateScore(delta);
  }

  // ─── Construcción ──────────────────────────────────────────────────────────

  _buildBackground(width, height) {
    const skyHeight = height * 0.66;
    const oceanHeight = height - skyHeight;

    this.add.image(0, 0, 'bg-sky')
      .setOrigin(0, 0)
      .setDisplaySize(width, skyHeight);

    this.add.image(0, skyHeight, 'bg-ocean')
      .setOrigin(0, 0)
      .setDisplaySize(width, oceanHeight);

    // Nubes (se animarán con tweens)
    this._clouds = [];
    const positions = [[80, 60], [230, 40], [370, 70], [470, 45]];
    positions.forEach(([cx, cy]) => {
      const cloud = this.add.graphics();
      cloud.fillStyle(0xffffff, 0.78);
      cloud.fillEllipse(0, 0, 70, 22);
      cloud.fillEllipse(-24, 6, 42, 16);
      cloud.fillEllipse(26, 5, 38, 14);
      cloud.setPosition(cx, cy);
      this._clouds.push(cloud);

      this.tweens.add({
        targets: cloud,
        x: cloud.x - 600,
        duration: Phaser.Math.Between(14000, 22000),
        repeat: -1,
        onRepeat: (tween, target) => { target.x = width + 60; },
      });
    });

    // Olas (líneas decorativas)
    this._wavesGraphics = this.add.graphics();
    this._waveOffset = 0;
  }


_buildSurfer(width, height) {
  this._surfer = this.physics.add.sprite(
    width * 0.18, this.groundY - 40, 'surfer'
  ).setScale(1.4).setCollideWorldBounds(true)
  .setGravityY(0);

  this._surfer.body.setSize(28, 54).setOffset(8, 6);

  this._bobTime = 0;
  this._ducking = false;

  // Animaciones del surfer — solo si el spritesheet tiene más de 1 frame
  const surferFrames = this.textures.get('surfer').frameTotal - 1;
  if (surferFrames > 1) {
    this.anims.create({
      key: 'surf-run',
      frames: this.anims.generateFrameNumbers('surfer', { start: 0, end: 2 }),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: 'surf-jump',
      frames: this.anims.generateFrameNumbers('surfer', { start: 3, end: 3 }),
      frameRate: 1,
      repeat: 0,
    });
    this.anims.create({
      key: 'surf-duck',
      frames: this.anims.generateFrameNumbers('surfer', { start: 4, end: 4 }),
      frameRate: 0,
      repeat: 0,
    });
  }

  // Animación del tiburón — solo si el spritesheet tiene más de 1 frame
  const sharkFrames = this.textures.get('obstacle-shark').frameTotal - 1;
  if (sharkFrames > 1) {
    this.anims.create({
      key: 'shark-swim',
      frames: this.anims.generateFrameNumbers('obstacle-shark', { start: 0, end: 4 }),
      frameRate: 8,
      repeat: -1,
    });
  }
}

  _buildInput(width, height) {
    // Teclado
    this._cursors = this.input.keyboard.createCursorKeys();
    this._wasd    = this.input.keyboard.addKeys('W,A,S,D');
    this._spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // Táctil: zonas izquierda / centro / derecha
    this._touchLeft  = false;
    this._touchRight = false;
    this._touchDuck  = false;

    this.input.on('pointerdown', (pointer) => {
      const px = pointer.x / this.scale.width;
      const py = pointer.y / this.scale.height;
      if (py > 0.82 && px > 0.35 && px < 0.65) {
        this._touchDuck = true;
      } else if (px < 0.35) {
        this._touchLeft = true;
      } else if (px > 0.65) {
        this._touchRight = true;
      } else {
        this._jump();
      }
    });

    this.input.on('pointerup', () => {
      this._touchLeft  = false;
      this._touchRight = false;
      this._touchDuck  = false;
    });

  }

  // ─── Update helpers ────────────────────────────────────────────────────────

  _handleMovement() {
    const onGround = this._surfer.body.blocked.down;
    const left  = this._cursors.left.isDown  || this._wasd.A.isDown || this._touchLeft;
    const right = this._cursors.right.isDown || this._wasd.D.isDown || this._touchRight;
    const down  = this._cursors.down.isDown  || this._wasd.S.isDown || this._touchDuck;
    const jumpPressed =
      Phaser.Input.Keyboard.JustDown(this._cursors.up)   ||
      Phaser.Input.Keyboard.JustDown(this._wasd.W)       ||
      Phaser.Input.Keyboard.JustDown(this._spaceKey);

    if (left)       this._surfer.setVelocityX(-220);
    else if (right) this._surfer.setVelocityX(220);
    else            this._surfer.setVelocityX(0);

    if (jumpPressed && onGround) this._jump();

    this._ducking = down && onGround;
    if (this._ducking) {
      this._surfer.body.setSize(28, 30).setOffset(8, 30);
      this._surfer.setScale(1.4, 1.0);
    } else {
      this._surfer.body.setSize(28, 54).setOffset(8, 6);
      this._surfer.setScale(1.4, 1.0);
    }

    if (onGround) {
      this._bobTime += 0.08;
      this._surfer.y += Math.sin(this._bobTime) * 0.4;
    }

    if (this._invincible) {
      this._surfer.setAlpha(Math.floor(this.time.now / 80) % 2 === 0 ? 1 : 0.3);
    } else {
      this._surfer.setAlpha(1);
    }

    // Solo animar si existen las animaciones (requiere spritesheet real)
    if (this.anims.exists('surf-run')) {
      if (this._ducking) {
        this._surfer.play('surf-duck', true);
      } else if (!onGround) {
        this._surfer.play('surf-jump', true);
      } else {
        this._surfer.play('surf-run', true);
      }
    }
  }

  _jump() {
    if (!this._surfer.body.blocked.down) return;
    this._surfer.setVelocityY(-650);
    this._particles.emitParticleAt(
      this._surfer.x, this._surfer.y + 30, 8
    );
    this.sound.play('jump', { volume: 0.45 });
  }

  _scrollBackground(delta) {
    this._waveOffset += (delta / 1000) * this._speed * 0.5;

    // Redibujar olas
    this._wavesGraphics.clear();
    this._wavesGraphics.lineStyle(2.5, 0xffffff, 0.35);
    for (let i = 0; i < 6; i++) {
      const wx = ((this._waveOffset * (0.7 + i * 0.12)) + i * 80) % (this.scale.width + 60) - 30;
      this._wavesGraphics.beginPath();
      this._wavesGraphics.moveTo(wx, this.groundY - 8);
      this._wavesGraphics.lineTo(wx + 20, this.groundY - 18);
      this._wavesGraphics.lineTo(wx + 40, this.groundY - 8);
      this._wavesGraphics.strokePath();
    }
  }

  _updateScore(delta) {
    const points = Math.floor(delta / 16);  // ~1 punto por frame a 60fps
    const current = this.registry.get('score') + points;
    this.registry.set('score', current);

    // Subir nivel
    const newLevel = Math.floor(current / LEVEL_UP_SCORE) + 1;
    if (newLevel > this.registry.get('level')) {
      this.registry.set('level', newLevel);
      this._speed      = SPEED_BASE + (newLevel - 1) * SPEED_INCREMENT;
      this._spawnDelay = Math.max(700, 1500 - (newLevel - 1) * 100);
      this._spawnTimer.reset({
        delay: this._spawnDelay,
        callback: this._spawnObstacle,
        callbackScope: this,
        loop: true,
      });
      // Efecto visual de subida de nivel
      this._showLevelUp(newLevel);
    }
  }

  // ─── Obstáculos ────────────────────────────────────────────────────────────

  _spawnObstacle() {
    if (!this._isAlive) return;

    const { width } = this.scale;
    const type = Phaser.Utils.Array.GetRandom(OBSTACLE_TYPES);
    const isJellyfish = type === 'obstacle-jellyfish';
    const yOffset = isJellyfish ? -85 : -10;

    // Para el tiburón usamos add.sprite en vez de group.create
    // para poder llamar a .play()
    let ob;
    if (type === 'obstacle-shark') {
      ob = this.physics.add.sprite(
        width + 60,
        this.groundY + yOffset,
        'obstacle-shark'
      ).setScale(0.85);

      ob.play('shark-swim');
      ob.body.setSize(24, 34).setOffset(3, 4);

      // Añadirlo al grupo manualmente para que siga participando
      // en las colisiones y en el loop de destrucción
      this._obstacles.add(ob);
    } else {
      // El resto siguen siendo imágenes estáticas (o sprites si añades más)
      ob = this._obstacles.create(
        width + 60,
        this.groundY + yOffset,
        type
      ).setScale(1.2);
    }

    ob.body.setAllowGravity(false);
    ob.body.setVelocityX(-this._speed);

    this.tweens.add({
      targets: ob,
      y: ob.y + (isJellyfish ? 18 : 8),
      duration: Phaser.Math.Between(800, 1400),
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });
  }

  // ─── Colisión ──────────────────────────────────────────────────────────────

  _onHitObstacle(surfer, obstacle) {
    if (this._invincible) return;

    obstacle.destroy();
    this.sound.play('hit', { volume: 0.55 });

    // Partículas de impacto
    this._particles.emitParticleAt(surfer.x, surfer.y, 12);

    const lives = this.registry.get('lives') - 1;
    this.registry.set('lives', lives);

    if (lives <= 0) {
      this._gameOver();
    } else {
      // Periodo de invencibilidad
      this._invincible = true;
      this.time.delayedCall(INVINCIBLE_MS, () => { this._invincible = false; });
      // Shake de cámara
      this.cameras.main.shake(300, 0.012);
    }
  }

  // ─── Game over ─────────────────────────────────────────────────────────────

  _gameOver() {
    this._isAlive = false;
    this._spawnTimer.remove();
    this._surfer.setVelocity(0, 0);
    this.cameras.main.shake(500, 0.02);

    // Guardar high score
    const score = this.registry.get('score');
    const hs    = this.registry.get('highScore');
    if (score > hs) {
      this.registry.set('highScore', score);
      try { localStorage.setItem('surfRushHighScore', String(score)); } catch {}
    }

    this.time.delayedCall(700, () => {
      this.scene.stop('UIScene');
      this.scene.start('GameOverScene');
    });
  }

  // ─── Efectos visuales ──────────────────────────────────────────────────────

  _showLevelUp(level) {
    const { width, height } = this.scale;
    const text = this.add.text(width / 2, height * 0.35, `¡Nivel ${level}!`, {
      fontSize: '28px',
      fontFamily: 'sans-serif',
      fontStyle: 'bold',
      color: '#ffe066',
      stroke: '#010e1a',
      strokeThickness: 4,
    }).setOrigin(0.5);

    this.tweens.add({
      targets: text,
      y: height * 0.28,
      alpha: 0,
      duration: 1200,
      ease: 'Power2',
      onComplete: () => text.destroy(),
    });
  }

  _onResume() {
    this._isAlive = true;
  }
}

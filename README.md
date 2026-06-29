# 🏄 Surf Rush — Phaser 3 + Webpack

Juego de plataformas de surf en 2D. Esquiva tiburones, rocas, boyas y medusas.

## Estructura del proyecto

```
surf-rush/
├── public/
│   ├── index.html          HTML principal del juego
│   ├── style.css           Estilos globales (fondo, centrado del canvas)
│   └── assets/             Sprites, audio, etc. (servidos tal cual en runtime)
│       ├── images/
│       └── audio/
├── src/
│   ├── main.js             Bootstrap: espera DOMContentLoaded y arranca el juego
│   └── game/
│       ├── main.js         Configura Phaser.Game y lista las escenas
│       └── scenes/
│           ├── BootScene.js       Inicializa el registry y detecta capacidades
│           ├── PreloadScene.js    Carga assets y genera texturas procedurales
│           ├── MenuScene.js       Pantalla de título
│           ├── GameScene.js       Lógica principal de juego
│           ├── UIScene.js         HUD (puntos, vidas, nivel) — corre en paralelo
│           └── GameOverScene.js   Pantalla de fin de partida
├── webpack.config.js       Bundling, dev server y copia de assets
├── .babelrc                Transpilación para navegadores modernos
└── package.json
```

## Instalación y desarrollo

```bash
# 1. Instalar dependencias
npm install

# 2. Servidor de desarrollo con hot reload en http://localhost:8080
npm start

# 3. Build de producción (genera dist/)
npm run build
```

## Publicar en internet

### GitHub Pages (gratis)
```bash
npm run build
# Sube la carpeta dist/ a una rama gh-pages
# o configura GitHub Actions para hacer el build automáticamente
```

### Netlify (gratis, drag & drop)
```bash
npm run build
# Arrastra la carpeta dist/ a app.netlify.com/drop
```

### itch.io (para juegos)
```bash
npm run build
# Comprime dist/ en un .zip y súbelo a itch.io como HTML game
```

## Controles

| Acción     | Teclado            | Táctil                    |
|------------|--------------------|---------------------------|
| Mover izq. | ← / A              | Toca el lado izquierdo    |
| Mover der. | → / D              | Toca el lado derecho      |
| Saltar     | Espacio / ↑ / W    | Toca el centro            |
| Agacharse  | ↓ / S              | —                         |

## Añadir sprites reales

1. Coloca tus imágenes en `public/assets/images/`
2. En `PreloadScene.js`, descomenta (o añade) las líneas de `this.load.image()` o `this.load.spritesheet()`
3. En `GameScene.js`, sustituye las texturas procedurales por las claves cargadas

## Añadir audio

1. Coloca los archivos en `public/assets/audio/`
2. En `PreloadScene.js`: `this.load.audio('bgm', 'assets/audio/bgm.mp3')`
3. En `GameScene.js`, `create()`: 
   ```js
   this._bgm = this.sound.add('bgm', { loop: true, volume: 0.5 });
   this._bgm.play();
   ```

## Añadir una nueva escena

1. Crea `src/game/scenes/MiEscena.js` extendiendo `Phaser.Scene`
2. Impórtala en `src/game/main.js`
3. Añádela al array `scene: [...]` de la config

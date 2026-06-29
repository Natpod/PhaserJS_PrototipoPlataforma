const path               = require('path');
const HtmlWebpackPlugin  = require('html-webpack-plugin');
const CopyWebpackPlugin  = require('copy-webpack-plugin');

module.exports = (env, argv) => {
  const isDev = argv.mode !== 'production';

  return {
    // ── Entrada ──────────────────────────────────────────────────
    entry: './src/main.js',

    // ── Salida ───────────────────────────────────────────────────
    output: {
      filename: 'bundle.js',
      path: path.resolve(__dirname, 'dist'),
      clean: true,  // limpia dist/ en cada build
    },

    // ── Source maps ───────────────────────────────────────────────
    devtool: isDev ? 'eval-source-map' : false,

    // ── Dev server ────────────────────────────────────────────────
    devServer: {
      static: {
        directory: path.join(__dirname, 'dist'),
      },
      port: 8080,
      hot: true,
      open: true,
    },

    // ── Módulos ───────────────────────────────────────────────────
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', {
                targets: { browsers: ['> 1%', 'last 2 versions'] },
              }],
            ],
          },
        },
        },
      ],
    },

    // ── Plugins ───────────────────────────────────────────────────
    plugins: [
      // Genera dist/index.html inyectando bundle.js automáticamente
      new HtmlWebpackPlugin({
        template: './public/index.html',
        filename: 'index.html',
        // No inyectar — el template ya tiene <script src="bundle.js">
        // Si prefieres inyección automática, quita inject: false
        // y elimina el <script> manual del HTML.
        inject: false,
      }),

      // Copia public/assets y public/style.css tal cual a dist/
      new CopyWebpackPlugin({
        patterns: [
          { from: 'public/assets', to: 'assets', noErrorOnMissing: true },
          { from: 'public/style.css', to: 'style.css' },
        ],
      }),
    ],

    // ── Optimización ──────────────────────────────────────────────
    optimization: {
      // En producción Webpack minifica automáticamente
    },

    // ── Resolución ────────────────────────────────────────────────
    resolve: {
      extensions: ['.js'],
    },
  };
};

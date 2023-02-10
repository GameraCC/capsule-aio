const path = require('path')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const nodeExternals = require('webpack-node-externals')
const buildPath = path.resolve(__dirname, './build')
const Obf = require('webpack-obfuscator')
const after = require('./webpack.after')

const isWin = /^win/.test(process.platform)

const config = {
  entry: {
    main: './main.js',
    'main.api': './main.api.js',
    'main.processRunner': './main.processRunner.js',
    'main.worker': './main.worker.js',
    qqR: isWin ? './dist/qq-request/qqR.dll' : './dist/qq-request/qqR.dylib',
  },
  mode: 'production',
  resolve: {
    extensions: ['.js', '.json'],
  },
  devServer: {
    writeToDisk: true,
    after,
  },
  output: { libraryTarget: 'commonjs2', filename: '[name].js', path: buildPath },
  stats: 'minimal',
  target: 'node',
  externals: [nodeExternals()],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          presets: [
            [
              '@babel/preset-env',
              {
                modules: 'auto',
                targets: {
                  node: 'current',
                },
              },
            ],
          ],
          plugins: ['transform-class-properties', '@babel/plugin-proposal-optional-chaining'],
        },
      },
      {
        test: isWin ? /\.dll$/ : /\.dylib$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]',
        },
      },
    ],
  },
  node: {
    global: false,
    __dirname: false,
    __filename: false,
  },
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        test: /\.js($|\?)/i,
        sourceMap: false,
        parallel: true,
        uglifyOptions: {
          compress: {
            drop_console: true,
          },
        },
      }),
    ],
  },
  plugins: [
    new Obf({
      compact: true,
      controlFlowFlattening: true,
      deadCodeInjection: false,
      debugProtection: false,
      debugProtectionInterval: false,
      disableConsoleOutput: false,
      identifierNamesGenerator: 'hexadecimal',
      log: false,
      numbersToExpressions: false,
      renameGlobals: false,
      rotateStringArray: false,
      selfDefending: false,
      shuffleStringArray: false,
      simplify: false,
      splitStrings: false,
      splitStringsChunkLength: 10,
      stringArray: false,
      stringArrayEncoding: [],
      stringArrayWrappersCount: 1,
      stringArrayWrappersChainedCalls: true,
      stringArrayWrappersType: 'variable',
      stringArrayThreshold: 0.75,
      transformObjectKeys: false,
      unicodeEscapeSequence: false,
    }),
  ],
}

module.exports = (env, argv) => {
  if (argv.mode === 'development') {
    config.optimization.minimizer = undefined
    config.plugins = undefined
    config.devtool = 'eval-source-map'
  }

  return config
}

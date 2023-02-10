const { override, addWebpackModuleRule, addWebpackPlugin, adjustStyleLoaders } = require('customize-cra')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

const multipleEntry = require('react-app-rewire-multiple-entry')([
  {
    entry: 'src/solverWindow.js',
    template: 'public/solver.html',
    outPath: '/solver.html',
  },
  {
    entry: 'src/loginWindow.js',
    template: 'public/login.html',
    outPath: '/login.html',
  },
  {
    entry: 'src/window.js',
    template: 'public/window.html',
    outPath: '/window.html',
  },
])

module.exports = override(
  process.env.NODE_ENV !== 'development' &&
    addWebpackPlugin(
      new UglifyJsPlugin({
        test: /\.js($|\?)/i,
        sourceMap: false,
        uglifyOptions: {
          compress: {
            drop_console: true,
          },
        },
      }),
    ),
  adjustStyleLoaders(({ use: [, css, postcss, resolve, processor] }) => {
    const isDev = process.env.NODE_ENV === 'development'
    css.options.sourceMap = isDev // css-loader
    postcss.options.sourceMap = isDev // postcss-loader
    // when enable pre-processor,
    // resolve-url-loader will be enabled too
    if (resolve) {
      resolve.options.sourceMap = isDev // resolve-url-loader
    }
    // pre-processor
    if (processor && processor.loader.includes('sass-loader')) {
      processor.options.sourceMap = isDev // sass-loader
    }
  }),
  multipleEntry.addMultiEntry,
  addWebpackModuleRule({
    test: /\.(png|jpg|svg)$/,
    loader: 'url-loader',
  }),
)

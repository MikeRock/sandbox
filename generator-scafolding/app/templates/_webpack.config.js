// @ts-check
import webpack from 'webpack' /* eslint-disable-line */
import UglifyJsPlugin from 'uglifyjs-webpack-plugin'
import GitRevisionPlugin from 'git-revision-webpack-plugin'
import noop from 'noop-webpack-plugin'
import path from 'path'
import InlineManifestPlugin from 'inline-manifest-webpack-plugin'
import MiniCSSExtractPlugin from 'mini-css-extract-plugin'
import CleanWebpackPlugin from 'clean-webpack-plugin'
import WebpackManifestPlugin from 'webpack-manifest-plugin'
// import PurifyCSSPlugin from 'purifycss-webpack'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import CrittersPlugin from 'critters-webpack-plugin'
import WebpackPWAManifest from 'webpack-pwa-manifest'
import autoprefixer from 'autoprefixer'
import postcssClean from 'postcss-clean'
import rucksack from 'rucksack-css'
import sass from 'node-sass'
import sassUtils from 'node-sass-utils'
import incstr from 'incstr'

const createUniqueIdGenerator = () => {
  const index = {}

  const generateNextId = incstr.idGenerator({
    // Removed "d" letter to avoid accidental "ad" construct.
    // @see https://medium.com/@mbrevda/just-make-sure-ad-isnt-being-used-as-a-class-name-prefix-or-you-might-suffer-the-wrath-of-the-558d65502793
    alphabet: 'abcefghijklmnopqrstuvwxyz0123456789'
  })

  return name => {
    if (index[name]) {
      return index[name]
    }

    let nextId

    do {
      // Class name cannot start with a number.
      nextId = generateNextId()
    } while (/^[0-9]/.test(nextId))

    index[name] = generateNextId()

    return index[name]
  }
}
const uniqueIdGenerator = createUniqueIdGenerator()
const _sass = sassUtils(sass)
const generateScopedName = (localName, resourcePath) => {
  const [componentName, fileName] = resourcePath.split('/').slice(-2) // Component name if ComponentName/style.scss
  console.log(componentName)
  if (/global/.test(fileName)) return localName
  return uniqueIdGenerator(componentName) + '_' + uniqueIdGenerator(localName)
}
const theme = {
  primary: 'pink',
  secondary: 'blue'
}
const { dependencies } = require('./package.json')
const GitRev = new GitRevisionPlugin()

/**
 * @type {(env:any, argv: any) => webpack.Configuration}
 */
const config = () => ({
  entry: './test.js',
  resolveLoader: {
    alias: {
      'custom-loader': path.resolve(__dirname, 'custom-loader.js')
    }
  },
  output: {
    filename: '[name].[chunkhash].js',
    publicPath: '/',
    path: path.resolve(__dirname, 'public'),
    chunkFilename: '[name].[chunkhash].js'
  },
  optimization: {
    runtimeChunk: {
      name: 'manifest'
    },
    minimizer: [
      new UglifyJsPlugin({
        cache: true,
        parallel: true,
        sourceMap: true, // set to true if you want JS source maps
        uglifyOptions: {
          ecma: 5,
          warnings: true,
          mangle: false,
          keep_fnames: true,
          output: {
            beautify: true,
            comments: false
          }
        }
      })
    ]
  },
  target: 'web',
  mode: process.env.NODE_ENV ? 'production' : 'development',
  resolve: {
    alias: { global: path.resolve(__dirname, 'test.global.scss') },
    extensions: ['.js', '.ts', '.tsx', '.scss', '.css']
  },
  module: {
    rules: [
      {
        test: /(?<!global)\.s?css/,
        exclude: [/node_modules/, /global/],
        include: '/',
        use: [
          MiniCSSExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              importLoaders: 2,
              // exportOnlyLocals: true,
              sourceMap: true,
              modules: true,

              getLocalIdent: (context, localIdentName, localName) => {
                return generateScopedName(localName, context.resourcePath)
              },

              localIdentName: '[name]__[local]__[hash:base64:5]'
            }
          },
          {
            loader: 'postcss-loader',
            options: {
              ident: 'postcss',
              plugins: () => [autoprefixer(), rucksack() /* postcssClean({ level: 2 }) */]
            }
          },
          {
            loader: 'sass-loader',
            options: {
              functions: {
                'theme($name)': name => {
                  _sass.infect()
                  let color = theme[name.sassString()]
                  _sass.disinfect()
                  return _sass.castToSass(color)
                },
                'dimension()': () => {
                  return _sass.castToSass('2px 3px')
                }
              }
            }
          }
        ]
      },
      {
        test: /global\.s?css$/,
        exclude: /node_modules/,
        include: [/global/],
        //  include: '/', // path to globals
        use: [
          MiniCSSExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              importLoaders: 2,
              sourceMap: true,
              modules: false
            }
          },
          {
            loader: 'postcss-loader',
            options: {
              ident: 'postcss',
              plugins: () => [autoprefixer(), rucksack() /* postcssClean({ level: 2 }) */]
            }
          },
          {
            loader: 'sass-loader',
            options: {
              functions: {
                'theme($name)': name => {
                  _sass.infect()
                  let color = theme[name.sassString()]
                  _sass.disinfect()
                  return _sass.castToSass(color)
                },
                'dimension()': () => {
                  return _sass.castToSass('2px 3px')
                }
              }
            }
          }
        ]
      },
      {
        test: /\.(png|jpe?g|gif)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 1000
            }
          },
          {
            loader: 'image-webpack-loader',
            options: {
              webp: {
                quality: 75
              }
            }
          }
        ]
      },
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              babelrc: false,
              extends: path.resolve(__dirname, '.babelrc'),
              plugins: [
                [
                  'babel-plugin-react-css-modules',
                  {
                    generateScopedName,
                    filetypes: {
                      '.scss': {
                        syntax: 'postcss-scss'
                      }
                    }
                  }
                ]
              ]
            }
          }
        ]
      },
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [
          'awesome-typescript-loader',
          {
            loader: 'custom-loader',
            options: {
              customOption: 'test'
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(['public']),
    GitRev.gitWorkTree ? new webpack.BannerPlugin({ banner: `COMMIT ${GitRev.commithash()}` }) : noop(),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV)
      }
    }),
    new WebpackPWAManifest({
      filename: 'manifest.pwa.json',
      name: 'My Progressive Web App',
      short_name: 'MyPWA',
      description: 'My awesome Progressive Web App!',
      background_color: '#ffffff',
      crossorigin: 'use-credentials' // can be null, use-credentials or anonymous
      /*
      icons: [
        {
          src: path.resolve('src/assets/icon.png'),
          sizes: [96, 128, 192, 256, 384, 512] // multiple sizes
        },
        {
          src: path.resolve('src/assets/large-icon.png'),
          size: '1024x1024' // you can also use the specifications pattern
        }
      ]
  */
    }),
    new WebpackManifestPlugin({
      publicPath: './', // replaces publicPath
      fileName: 'manifest.json',
      writeToFileEmit: true
    }),
    new HtmlWebpackPlugin({
      template: '!!prerender-loader?string!template.html',
      filename: 'index.html',
      title: 'Custom Title',
      compile: false,
      inject: true,
      minify: {
        collapseWhitespace: false,
        preserveLineBreaks: false
      }
    }),
    new MiniCSSExtractPlugin({
      filename: '[name].s.[hash:8].css'
    })
  ]
})

export default config

// @ts-check
import webpack from 'webpack' /* eslint-disable-line */
import UglifyJsPlugin from 'uglifyjs-webpack-plugin'
import GitRevisionPlugin from 'git-revision-webpack-plugin'
import noop from 'noop-webpack-plugin'
import path from 'path'
import workbox from 'workbox-webpack-plugin'
import WebpackMonitor from 'webpack-monitor'
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer'
import WorkerPlugin from 'worker-plugin'
// import SWPrecachePlugin from 'sw-precache-webpack-plugin'
import PreloadPlugin from 'preload-webpack-plugin'
// import InlineManifestPlugin from 'inline-manifest-webpack-plugin'
import MiniCSSExtractPlugin from 'mini-css-extract-plugin'
import CleanWebpackPlugin from 'clean-webpack-plugin'
import WebpackManifestPlugin from 'webpack-manifest-plugin'
// import PurifyCSSPlugin from 'purifycss-webpack'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import CrittersPlugin from 'critters-webpack-plugin'
import CompressionPlugin from 'compression-webpack-plugin'
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
  console.log(fileName)
  if (/global/.test(fileName)) return localName
  return uniqueIdGenerator(componentName) + '_' + uniqueIdGenerator(localName)
}
const theme = {
  primary: { color: 'pink' },
  secondary: { color: 'blue' }
}
const { dependencies } = require('./package.json')
const vendors = Object.keys(dependencies)
const GitRev = new GitRevisionPlugin()

/**
 * @type {(env:any, argv: any) => webpack.Configuration}
 */
const config = () => ({
  entry: './test.js',
  resolveLoader: {
    alias: {
      'custom-loader': path.resolve(__dirname, 'custom-loader.js'),
      'dominant-loader': path.resolve(__dirname, 'dominant-loader.js')
    }
  },
  output: {
    filename: '[name].[chunkhash:5].js',
    publicPath: '/',
    path: path.resolve(__dirname, 'public'),
    chunkFilename: '[name].[chunkhash:5].js'
  },
  optimization: {
    runtimeChunk: {
      name: 'manifest'
    },
    splitChunks: {
      chunks: 'async',
      minSize: 10000,
      maxInitialRequests: Infinity,
      cacheGroups: {
        vendors: {
          chunks: 'all',
          test: /[\\/]node_modules[\\/]/,
          name(module) {
            // get the name. E.g. node_modules/packageName/not/this/part.js
            // or node_modules/packageName
            const [_, packageName] = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)

            // npm package names are URL-safe, but some servers don't like @ symbols
            return `vendor.${packageName.replace('@', '')}`
          }
        },
        utilities: {
          priority: 0,
          minChunks: 2
        },
        default: false
      }
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
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  resolve: {
    alias: { global: path.resolve(__dirname, 'test.global.scss') },
    extensions: ['.js', '.ts', '.tsx', '.scss', '.css', '.md']
  },
  module: {
    rules: [
      { test: /\.md$/, exclude: /node_modules/, use: ['html-loader', 'markdown-loader'] },
      {
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'url-loader',
            options: {
              fallback: {
                loader: 'file-loader',
                options: {
                  name: '[name].[ext]'
                  // outputPath: '/fonts'
                  //  publicPath: url => `../fonts/${url}`
                }
              },
              limit: 1000000,
              name: '[sha256:hash:base64:8].[ext]'
              // publicPath: '/'
            }
          }
        ]
      },
      {
        test: /(?<!global)\.s?css(\?[\w]+)?$/,
        exclude: [/node_modules/, /global/],
        include: '/',
        use: [
          MiniCSSExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              importLoaders: 3,
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
              plugins: () => [autoprefixer(), rucksack(), process.env.NODE_ENV === 'production' && postcssClean({ level: 2 })].filter(Boolean)
            }
          },
          {
            loader: 'resolve-url-loader',
            options: {
              keepQuery: true
            }
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true,
              sourceMapContents: false,
              data: `$themes:(${Object.keys(theme).toString()});$env: ${process.env.NODE_ENV};`,
              functions: {
                'theme($what, $name)': (what, name) => {
                  _sass.infect()
                  let prop = theme[name.sassString()][what.sassString()]
                  _sass.disinfect()
                  return _sass.castToSass(prop)
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
        test: /global\.s?css(\?[\w]+)?$/,
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
              plugins: () => [autoprefixer(), rucksack(), process.env.NODE_ENV === 'production' && postcssClean({ level: 2 })].filter(Boolean)
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
          'dominant-loader',
          {
            loader: 'url-loader',
            options: {
              fallback: {
                loader: 'responsive-loader',
                options: {
                  placeholder: false
                  // outputPath: '/static'
                }
              },
              limit: 1000000,
              name: '[sha256:hash:base64:8].[ext]'
              // publicPath: '/'
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
      // NODE_ENV defined already with mode set
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
          src: path.resolve('assets/icon.png'),
          sizes: [96, 128, 192, 256, 384, 512] // multiple sizes
        },
        {
          src: path.resolve('assets/large-icon.png'),
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
    new PreloadPlugin({
      rel: 'preload',
      include: 'allAssets',
      as(entry) {
        if (/\.css(\?[\w]+)?$/.test(entry)) return 'style'
        if (/\.(ttf|otf|woff(2)?)$/.test(entry)) return 'font'
        if (/\.(png|jpe?g|gif)$/.test(entry)) return 'image'
        return 'script'
      }
    }),
    new MiniCSSExtractPlugin({
      filename: '[name].style.[hash:8].css'
    }),
    process.env.NODE_ENV === 'production'
      ? new CompressionPlugin({
          test: /\.js(\?[\w]+)?$/i,
          filename: '[path].gz[query]',
          compressionOptions: { level: 5 }
        })
      : noop(),
    process.env.NODE_ENV === 'development'
      ? new WebpackMonitor({
          capture: true, // -> default 'true'
          target: '../monitor/monitorStats.json', // default -> '../monitor/stats.json'
          launch: false, // -> default 'false'
          port: 3030, // default -> 8081
          excludeSourceMaps: true // default 'true'
        })
      : noop(),
    new CrittersPlugin(),
    /*
    new SWPrecachePlugin({
      cacheId: 'v1',
      // dontCacheBustUrlsMatching: /\.\w{8}\./,
      filename: 'service-worker.js',
      minify: false,
      navigateFallback: 'index.html',
      staticFileGlobsIgnorePatterns: [/\.map$/, /asset-manifest\.json$/]
    })
    */

    /** @type {any} **/ (() =>
      new workbox.GenerateSW({
        swDest: 'sw.js',
        clientsClaim: true,
        skipWaiting: true,
        exclude: [/\.(?:png|jpg|jpeg|svg)$/],
        runtimeCaching: [
          {
            // Match any request ends with .png, .jpg, .jpeg or .svg.
            urlPattern: /\.(?:png|jpg|jpeg|svg)$/,

            // Apply a cache-first strategy.
            handler: 'cacheFirst',

            options: {
              // Use a custom cache name.
              cacheName: 'images',

              // Only cache 10 images.
              expiration: {
                maxEntries: 10
              }
            }
          }
        ]
      }))(),
    new WorkerPlugin(),
    new BundleAnalyzerPlugin({
      analyzerPort: 8080
    })
  ]
})

export default config

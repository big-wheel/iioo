/**
 * @file: getWebpackConfig
 * @author: Cuttle Cong
 * @date: 2018/1/17
 * @description:
 */
import webpack from 'webpack'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import ExtractTextPlugin from 'extract-text-webpack-plugin'
import ProgressBarPlugin from 'progress-bar-webpack-plugin'
import FriendlyErrorsWebpackPlugin from 'friendly-errors-webpack-plugin'
import { resolve, join } from 'path'

import babelConfig from './babelConfig'

export default function getWebpackConfig(options = {}) {
  const {
    hash = false,
    dev = true,
    template,
    entry,
    publicPath,
    cwd = process.cwd(),
    path = resolve(cwd, 'public')
  } = options

  const filename = hash ? '[name].[hash:6].js' : '[name].js'
  const chunkFilename = hash ? '[name].[chunkhash:6].js' : '[name].js'
  const cssFilename = hash ? '[name].[contenthash:6].css' : '[name].css'
  const commonFilename = hash ? '[name].[hash:6].js' : '[name].js'

  const postcssLoader = {
    loader: 'postcss-loader',
    options: {
      ident: 'postcss',
      plugins(/*loader*/) {
        return [
          require('autoprefixer')(),
          require('cssnano')({ zindex: false })
        ]
      }
    }
  }
  const config = {
    // context: cwd,
    cache: true,
    devtool: dev && 'source-map',
    entry,
    output: {
      filename,
      chunkFilename,
      publicPath,
      path: resolve(path)
    },
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          use: {
            loader: 'babel-loader',
            options: babelConfig
          }
        },
        {
          test: /\.less$/,
          use: ExtractTextPlugin.extract({
            use: [
              { loader: 'css-loader', options: { minimize: !dev } },
              postcssLoader,
              { loader: 'less-loader' }
            ],
            fallback: 'style-loader'
          })
        },
        {
          test: /\.css/,
          use: ExtractTextPlugin.extract({
            use: [
              { loader: 'css-loader', options: { minimize: !dev } },
              postcssLoader
            ],
            fallback: 'style-loader'
          })
        },
        {
          test: /\.html?$/,
          exclude: [
            template
          ],
          use: {
            loader: 'html-loader',
            options: {
              minimize: !dev,
              name: '[path][name].[ext]'
            }
          }
        },
        {
          test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
          use: {
            loader: 'url-loader',
            options: {
              limit: 10000,
              minetype: 'application/font-woff',
              name: '[path][name].[ext]'
            }
          }
        },
        {
          test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
          use: {
            loader: 'url-loader',
            options: {
              limit: 10000,
              minetype: 'application/font-woff',
              name: '[path][name].[ext]'
            }
          }
        },
        {
          test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
          use: {
            loader: 'url-loader',
            options: {
              limit: 10000,
              minetype: 'application/octet-stream',
              name: '[path][name].[ext]'
            }
          }
        },
        {
          test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
          use: {
            loader: 'url-loader',
            options: {
              limit: 10000,
              minetype: 'application/vnd.ms-fontobject',
              name: '[path][name].[ext]'
            }
          }
        },
        {
          test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
          use: {
            loader: 'url-loader',
            options: {
              limit: 10000,
              minetype: 'image/svg+xml',
              name: '[path][name].[ext]'
            }
          }
        },
        {
          test: /\.(png|jpg|jpeg|gif)(\?v=\d+\.\d+\.\d+)?$/i,
          use: {
            loader: 'url-loader',
            options: {
              limit: 10000,
              name: '[path][name].[ext]'
            }
          }
        },
        {
          test: /\.json$/,
          use: {
            loader: 'json-loader',
            options: {
              name: '[path][name].[ext]'
            }
          }
        }
      ]
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(dev ? 'development' : 'production')
      }),
      new ExtractTextPlugin({
        filename: cssFilename,
        disable: dev
      }),
      new webpack.optimize.CommonsChunkPlugin({
        filename: commonFilename,
        name: 'common'
      }),
      dev && new webpack.HotModuleReplacementPlugin(),
      !dev && new webpack.optimize.UglifyJsPlugin({
        parallel: true,
        uglifyOptions: { ie8: true }
      }),
      new HtmlWebpackPlugin({
        hash: false,
        template
      }),
      new ProgressBarPlugin(),
      new FriendlyErrorsWebpackPlugin()
    ].filter(Boolean)
  }
  return config
}

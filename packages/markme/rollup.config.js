/**
 * @file rollup.config.js
 * @author Cuttle Cong
 * @date 2018/5/6
 * @description
 */
/**
 * @file rollup.config
 * @author Cuttle Cong
 * @date 2018/2/23
 * @description
 */

import babel from 'rollup-plugin-babel'
import uglify from 'rollup-plugin-uglify'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import filesize from 'rollup-plugin-filesize'

const config = {
  input: 'index.js',
  output: {
    name: 'Markme',
    globals: null,
    sourcemap: true
  },
  external: [],
  plugins: [
    babel({
      babelrc: false,
      runtimeHelpers: true,
      presets: [['env', { loose: true, modules: false }]],
      plugins: [
        'external-helpers',
        'transform-object-rest-spread',
        'transform-class-properties',
        [
          'transform-runtime',
          {
            polyfill: false,
            regenerator: true
          }
        ]
      ],
      exclude: 'node_modules/**'
    }),
    resolve(),
    commonjs({
      include: '**'
    }),
    filesize()
  ]
}

export default [
  Object.assign({}, config, {
    output: {
      ...config.output,
      file: 'lib/index.js',
      format: 'cjs'
    },
    external: id =>
      id.indexOf('babel-runtime') === 0 ||
      ['md5', 'rgb-hex', 'lodash.debounce', 'await-event-emitter'].includes(id)
  }),
  Object.assign({}, config, {
    output: {
      ...config.output,
      file: 'lib/index.es.js',
      format: 'es'
    },
    external: id =>
      id.indexOf('babel-runtime') === 0 ||
      ['md5', 'rgb-hex', 'lodash.debounce', 'await-event-emitter'].includes(id)
  }),
  Object.assign({}, config, {
    output: {
      ...config.output,
      file: 'lib/index.umd.js',
      format: 'umd'
    },
    external: null
  }),
  Object.assign({}, config, {
    output: {
      ...config.output,
      file: 'lib/index.umd.min.js',
      format: 'umd'
    },
    plugins: config.plugins.concat(uglify()),
    external: null
  })
]

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
    name: 'MarkmeLeancloud',
    sourcemap: true,
    globals: {
      'leancloud-storage/live-query': 'AV',
      markme: 'Markme'
    }
  },
  external: ['leancloud-storage/live-query', 'markme'],
  plugins: [
    babel({
      babelrc: false,
      runtimeHelpers: true,
      presets: [['env', { loose: false, modules: false }]],
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
      include: /node_modules/
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
      id.startsWith('babel-runtime/') ||
      id.startsWith('leancloud-storage/') ||
      ['markme'].includes(id)
  }),
  Object.assign({}, config, {
    output: {
      ...config.output,
      file: 'lib/index.es.js',
      format: 'es'
    },
    external: id =>
      id.startsWith('babel-runtime/') ||
      id.startsWith('leancloud-storage/') ||
      ['markme'].includes(id)
  }),
  Object.assign({}, config, {
    output: {
      ...config.output,
      file: 'lib/index.umd.js',
      format: 'umd',
      name: 'MarkmeLeancloud'
    }
  }),
  Object.assign({}, config, {
    output: {
      ...config.output,
      file: 'lib/index.umd.min.js',
      format: 'umd',
      name: 'MarkmeLeancloud'
    },
    plugins: config.plugins.concat(uglify())
  })
]

/**
 * @file: getBabelConfig
 * @author: Cuttle Cong
 * @date: 2018/1/17
 * @description:
 */


export default {
  presets: [
    [
      require.resolve('babel-preset-env'),
      {
        'targets': {
          'node': '6',
          'browsers': ['last 2 versions']
        },
        'loose': false,
        'modules': 'commonjs',
        'useBuiltIns': true
      }
    ]
  ],
  plugins: [
    require.resolve('babel-plugin-add-module-exports'),
    require.resolve('babel-plugin-transform-decorators-legacy'),
    require.resolve('babel-plugin-transform-class-properties'),
    require.resolve('babel-plugin-transform-object-rest-spread'),
    [
      require.resolve('babel-plugin-transform-runtime'),
      {
        polyfill: false,
        regenerator: true
      }
    ]
  ]
}

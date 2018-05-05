/**
 * @file index
 * @author Cuttle Cong
 * @date 2018/5/2
 * @description
 */

module.exports = function react() {
  const iioo = this
  iioo.on('each-webpackConfig', (config, webpack) => {
    const rule = config.module.rules.find(rule => rule.use && rule.use.loader === 'babel-loader')
    rule.use.options.presets.push(
      require.resolve('babel-preset-react')
    )
  })
}

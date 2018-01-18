/**
 * @file: hawkeyee.config
 * @author: Cuttle Cong
 * @date: 2018/1/18
 * @description:
 */

module.exports = {
  port: 8888,
  // template: '',
  template: './template.html',
  output: {
    // path: './public'
    // publicPath: '/as/'
  },

  commanders: [
    'xxss',
    // eslint-disable-next-line no-unused-vars
    function (commander, config) {
      // console.info('config', config)
    }
  ]
}

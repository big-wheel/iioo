/**
 * @file: entry of client
 * @author: Cuttle Cong
 * @date: 2018/1/17
 * @description:
 */
import client from 'webpack-hot-middleware/client'

client.subscribe(function (obj) {
  if (obj.action === 'reload') {
    window.location.reload()
  }
})

console.log(
  ' 🌈 Thanks using iioo v<%= version %>\n' +
  '      More information about iioo: https://github.com/big-wheel/iioo'
)
console.log('')

function start() {
  require('<%= entry %>')
}

if (module.hot) {
  module.hot.accept('<%= entry %>', start)
}

start()

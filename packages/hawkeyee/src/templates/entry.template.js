/**
 * @file: entry of client
 * @author: Cuttle Cong
 * @date: 2018/1/17
 * @description:
 */

console.log(
  ' 🌈 Thanks using hawkeyee v<%= version %>\n' +
  '      More information about hawkeyee: https://github.com/big-wheel/hawkeyee'
)
console.log('')

function start() {
  require('<%= entry %>')
}

if (module.hot) {
  module.hot.accept('<%= entry %>', start)
}

start()

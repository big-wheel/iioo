/**
 * @file: entry of client
 * @author: Cuttle Cong
 * @date: 2018/1/17
 * @description:
 */
console.log(
  ' 🌈 Thanks using iioo v<%= version %>\n' +
  '      More information about iioo: https://github.com/big-wheel/iioo'
)
console.log('')

function start() {
  <% entryList.forEach(function (entry) { %>
    require(<%= JSON.stringify(entry) %>)
  <% }) %>
}

if (module.hot) {
  module.hot.accept(<%= JSON.stringify(entryList) %>, start)
}

start()

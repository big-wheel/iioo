/**
 * @file: plugin
 * @author: Cuttle Cong
 * @date: 2018/1/19
 * @description:
 */

module.exports = function (/*options*/) {
  var iioo = this
  iioo
    .on('iioo-plugin-fs-watcher-emit-watcher', function (watcher) {
      watcher.on('all', function (a, b) {
        console.log(a, b)
      })
    })
}

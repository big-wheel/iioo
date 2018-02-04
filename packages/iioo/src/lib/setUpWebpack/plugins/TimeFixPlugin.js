/**
 * @file: TimeFixPlugin
 * @author: Cuttle Cong
 * @date: 2018/2/4
 * @description:
 */

// Files created right before watching starts make watching go into a loop
// https://github.com/webpack/watchpack/issues/25
module.exports = class TimeFixPlugin {
  constructor(timefix = 11000) {
    this.timefix = timefix
  }

  apply(compiler) {
    compiler.plugin('watch-run', (watching, callback) => {
      this.hasWatcher = true
      watching.startTime += this.timefix
      callback()
    })

    compiler.plugin('done', stats => {
      if (this.hasWatcher) {
        stats.startTime -= this.timefix
      }
    })
  }
}

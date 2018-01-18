/**
 * @file: Watcher.test.js
 * @author: Cuttle Cong
 * @date: 2018/1/16
 * @description:
 */
import Watcher from '../../../iioo-plugin-fs-watcher/src/Watcher/index'

describe('Watcher', () => {
  test('~Watcher.on', () => {
    expect(() => {
      new Watcher()
        .on('abc', () => {
          throw new Error('abc Error')
        })
        .emit('abc')
    }).toThrow(/^abc Error$/)

  })
})

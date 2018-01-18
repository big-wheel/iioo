/**
 * @file: Watcher.test.js
 * @author: Cuttle Cong
 * @date: 2018/1/16
 * @description:
 */
import * as path from '../utils/path'
import { platform } from 'os'
const IS_WIN = platform() === 'win32'

describe('path', () => {
  let absolute = '/Users/far'
  let relative = './../bar'
  let module = 'abc'

  if (IS_WIN) {
    absolute = 'C://ssdw'
  }

  test('path.isAbsolute', () => {
    expect(path.isAbsolute(absolute)).toBeTruthy()
    expect(path.isAbsolute(relative)).toBeFalsy()
  })

  test('path.isRelative', () => {
    expect(path.isRelative(relative)).toBeTruthy()
  })

  test('path.isModule', () => {
    expect(path.isModule(module)).toBeTruthy()
  })
})

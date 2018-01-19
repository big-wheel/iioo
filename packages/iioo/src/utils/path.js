/**
 * @file: resolvePlugin
 * @author: Cuttle Cong
 * @date: 2018/1/17
 * @description:
 */
import { platform } from 'os'
import { isString } from 'util'

const isWin = platform() === 'win32'
const ABSOLUTE_WIN_RGX = /^\s*[a-z]:[/\\]/i
const ABSOLUTE_POSIX_RGX = /^\s*\//
const RELATIVE_RGX = /^\s*\./

function assertPath(path) {
  if (!isString(path)) {
    throw new TypeError('path is required to be string, not ' + typeof path)
  }
}

// require('D:\ss') => require('D:ss')
//  D:\ss -> D:\\ss => D:\ss
export function escapeWinPath(path) {
  return path.replace(/\\/g, '\\\\')
}

export function isAbsolute(path) {
  assertPath(path)

  if (isWin) {
    path = escapeWinPath(path)
    return ABSOLUTE_WIN_RGX.test(path) || ABSOLUTE_POSIX_RGX.test(path)
  }
  return ABSOLUTE_POSIX_RGX.test(path)
}

export function isRelative(path) {
  assertPath(path)
  return RELATIVE_RGX.test(path)
}

export function isModule(path) {
  return !isAbsolute(path) && !isRelative(path)
}

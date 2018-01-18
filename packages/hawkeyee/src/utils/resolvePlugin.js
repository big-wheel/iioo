/**
 * @file: resolvePlugin
 * @author: Cuttle Cong
 * @date: 2018/1/17
 * @description:
 */
import { sync as resolveSync } from 'resolve'
import { resolve } from 'path'
import * as cusPath from './path'
import { isArray, isNullOrUndefined } from 'util'


export function preappend(prefix = '', source = '') {
  source = source.trim()
  if (source.startsWith(prefix)) {
    return source
  }

  return prefix + source
}

/**
 * input absolute/relative/module path, output the exact path
 * @param pluginString String
 * @param options {{ cwd, prefix }}
 * @return String
 */
export function resolvePluginString(pluginString, options = {}) {
  const { cwd = process.cwd(), prefix = '' } = options
  if (typeof pluginString !== 'string') {
    throw new TypeError('pluginString is required to be string. not ' + typeof pluginString)
  }

  if (cusPath.isRelative(pluginString)) {
    return require.resolve(resolve(cwd, pluginString))
  }
  else if (cusPath.isAbsolute(pluginString)) {
    return require.resolve(pluginString)
  }

  // module
  pluginString = preappend(prefix, pluginString)
  let resolvedPath
  if (cwd) {
    try {
      resolvedPath = resolveSync(pluginString, { basedir: cwd })
    } catch (err) {
      resolvedPath = require.resolve(pluginString)
    }
  } else {
    resolvedPath = require.resolve(pluginString)
  }
  return resolvedPath
}

/**
 * @param request String | pluginObject
 *    if request's type is string, we will get plugin by `require(request)`
 *    else the plugin is request itself.
 * @param options Object { cwd: String, prefix: String }
 * @return pluginObject
 */
export function resolveRequest(request, options = {}) {
  if (isNullOrUndefined(request)) {
    throw new TypeError('`resolveRequest` method can\'t receive the request of ' + typeof request + '.')
  }
  return typeof request === 'string' ? require(resolvePluginString(request, options)) : request
}

/**
 * @param plugin String | pluginObject | Array [pluginObject, options]
 * @param options Object { cwd: String, prefix: String }
 * @return resolvedPlugin []
 */
export default function resolvePlugin(plugin, options = {}) {
  const resolvedPlugin = []
  if (isArray(plugin)) {
    resolvedPlugin[0] = resolveRequest(plugin[0], options)
    resolvedPlugin[1] = plugin[1] || {}
  }
  else {
    resolvedPlugin[0] = resolveRequest(plugin, options)
    resolvedPlugin[1] = {}
  }

  return resolvedPlugin
}


/**
 * @file index
 * @author Cuttle Cong
 * @date 2018/5/3
 * @description
 */

import { format, parse } from 'url'
import { message } from 'antd';

import fetch from 'isomorphic-fetch'

function appendDataFromUrl(url = '', extra = {}) {
  const res = parse(url, true)
  const { protocol, query = {} } = res
  if (protocol) {
    return url
  }

  res.query = { ...extra, ...query }
  res.search = null
  return format(res)
}

let suffix = ''
export function setSuffix(sx) {
  suffix = sx
}

export function concat(url) {
  return suffix + url
}

export function getSuffix() {
  return suffix
}

export default async (url, options = {}, type = 'json') => {
  if (typeof options === 'string') {
    type = options
    options = {}
  }
  const { toastError = true, toastSucc = false, ...restOptions } = options
  restOptions.method = restOptions.method || 'get'
  restOptions.method = restOptions.method.toLowerCase()

  if (!/^(\/\/)|(https?:\/\/)/.test(url)) {
    url = concat(url)
  }

  restOptions.credentials = restOptions.credentials || 'include'
  if (restOptions.method === 'post') {
    restOptions.body = { ...restOptions.body, ...restOptions.data }
    if (restOptions.body instanceof Object) {
      restOptions.body = JSON.stringify(restOptions.body)
    }
  }
  else {
    const data = { ...restOptions.body, ...restOptions.data }
    delete restOptions.body
    delete restOptions.data
    url = appendDataFromUrl(url, data)
  }

  if (type === 'json') {
    restOptions.headers = new Headers({
      'Cache-Control': 'no-cache,no-store,must-revalidate,max-age=-1',
      ...restOptions.headers,
      'Content-Type': 'application/json;charset=UTF-8'
    })
  }

  // console.log('url', url, fetch)

  try {
    let res = await fetch(url, restOptions)
    let json = await res[type]()
    if (type === 'json') {

      if (json.status === 'ok' && toastSucc) {
        typeof json.data === 'string' && message.success(json.data)
      }

      if (json.status === 'fail' && toastError) {
        json.message && message.error(json.message)
      }
    }
    return json
  } catch (err) {
    console.error(err)
    if (toastError) {
      message.error(err.toString())
      // TODO toast-style
      // alert('Error ' + err.message)
    }
  }
}


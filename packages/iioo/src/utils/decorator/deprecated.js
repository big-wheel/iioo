/**
 * @file: deprecated
 * @author: Cuttle Cong
 * @date: 2018/1/16
 * @description:
 */
import { getInvokeByClass, isInvokeClass, isInvokeMemberMethod } from './helper'

function invokeByMethod(target, key, descriptor) {
  let fn = descriptor.value

  if (typeof fn !== 'function') {
    throw new Error(`decorator#deprecated can only be applied to methods. Not: ${typeof fn}`)
  }

  return {
    ...descriptor,
    value: function () {
      console.warn(`[WARN] the method \`${key}\` is deprecated.`)
      return fn.apply(this, arguments)
    }
  }
}

const invokeByClass = getInvokeByClass(() => true, invokeByMethod)

export default function (target, key, descriptor) {
  if (isInvokeClass.apply(null, arguments)) {
    return invokeByClass(target)
  }
  if (isInvokeMemberMethod.apply(null, arguments)) {
    return invokeByMethod(target, key, descriptor)
  }

  throw new Error('decorator#deprecated, please check your usage of deprecated. 1. use it in class definition 2. use it in member method')
}

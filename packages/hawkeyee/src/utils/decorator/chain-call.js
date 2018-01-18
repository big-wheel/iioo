/**
 * @file: chain-call
 * @author: Cuttle Cong
 * @date: 2018/1/16
 * @description:
 */
import { getInvokeByClass, isInvokeClass, isInvokeMemberMethod } from './helper'

function invokeByMethod(target, key, descriptor) {
  let fn = descriptor.value

  if (typeof fn !== 'function') {
    throw new Error(`decorator#chain-call can only be applied to methods. Not: ${typeof fn}`)
  }

  return {
    ...descriptor,
    value: function () {
      const rlt = fn.apply(this, arguments)
      return typeof rlt !== 'undefined' ? rlt : this
    }
  }
}

const invokeByClass = getInvokeByClass(name => name !== 'constructor', invokeByMethod)

export default function (target, key, descriptor) {
  if (isInvokeClass.apply(null, arguments)) {
    return invokeByClass(target)
  }
  if (isInvokeMemberMethod.apply(null, arguments)) {
    return invokeByMethod(target, key, descriptor)
  }

  throw new Error('decorator#chain-call, please check your usage of chain-call. 1. use it in class definition 2. use it in member method')
}

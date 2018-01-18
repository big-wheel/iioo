/**
 * @file: abstract
 * @author: Cuttle Cong
 * @date: 2018/1/16
 * @description: to describe the the Class or the member method of class which you want it to be abstract (should be overwritted)
 */
import { isInvokeClass, isInvokeMemberMethod, getInvokeByClass } from './helper'

function invokeByMethod(target, key, descriptor) {
  let fn = descriptor.value

  if (typeof fn !== 'function') {
    throw new Error(`decorator#abstract can only be applied to methods. Not: ${typeof fn}`)
  }

  return {
    ...descriptor,
    value: function () {
      throw new Error(`the method \`${key}\` is abstract, please overwrite it!`)
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

  throw new Error('decorator#abstract, please check your usage of abstract. 1. use it in class definition 2. use it in member method')
}

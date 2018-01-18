/**
 * @file: Hawkeyee.test.js
 * @author: Cuttle Cong
 * @date: 2018/1/16
 * @description:
 */
import Hawkeyee from '../index'

describe('Hawkeyee', () => {
  test('~Hawkeyee.start', () => {
    expect(() => {
      new Hawkeyee()
        .start()
    }).not.toThrow()
  })
  test('~Hawkeyee.build', () => {
    expect(() => {
      new Hawkeyee()
        .build()
    }).not.toThrow()
  })
})

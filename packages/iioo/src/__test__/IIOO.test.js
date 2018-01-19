/**
 * @file: IIOO.test.js
 * @author: Cuttle Cong
 * @date: 2018/1/16
 * @description:
 */
import IIOO from '../index'

describe('iioo', () => {
  test('~iioo.construct', () => {
    expect(
      (new IIOO() instanceof IIOO)
    ).toBeTruthy()
    expect(
      IIOO() instanceof IIOO
    ).toBeTruthy()
  })

  test('~iioo.start', () => {
    expect(() => {
      new IIOO()
        .start()
    }).not.toThrow()
  })
  test('~iioo.build', () => {
    expect(() => {
      new IIOO()
        .build()
    }).not.toThrow()
  })
})

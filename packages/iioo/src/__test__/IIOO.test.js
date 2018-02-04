/**
 * @file: IIOO.test.js
 * @author: Cuttle Cong
 * @date: 2018/1/16
 * @description:
 */
import IIOO from '../index'

const iioo = new IIOO()
describe.skip('iioo', () => {
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
      iioo.start()
    }).not.toThrow()
  })
  test('~iioo.build', () => {
    expect(() => {
      iioo.build()
    }).not.toThrow()
  })
})

afterAll(function () {
  iioo.close()
})

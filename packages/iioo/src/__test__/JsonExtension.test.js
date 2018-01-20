/**
 * @file: calculateEntry.test
 * @author: Cuttle Cong
 * @date: 2018/1/20
 * @description:
 */
import { unflatten, flatten } from '../lib/JsonExtension'

describe('JsonExt', () => {
  it('JsonExt#flatten  ', function () {
    expect(flatten({ a: '[]', b: null, c: [1, 3, { a: 'io' }], d: { k: 123 } })).toMatchSnapShot()
  })

  it('JsonExt#unflatten  error', function () {
    expect(() => unflatten({ 'a': 123, 'a.bc': 123 })).toThrow()
  })

  it('JsonExt#unflatten  ', function () {
    expect(unflatten({ 'a.x.0': 123, 'a.x.1': 321, 'a.bc': 123 })).toEqual({ a: { x: [123, 321], bc: 123 } })
  })

})

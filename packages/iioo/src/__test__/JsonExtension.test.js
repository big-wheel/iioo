/**
 * @file: calculateEntry.test
 * @author: Cuttle Cong
 * @date: 2018/1/20
 * @description:
 */
import { flatten } from '../lib/JsonExtension'
import { isObject, isArray } from 'util'

describe('JsonExt', () => {
  it('JsonExt#flatten  ', function () {
    expect(
      flatten({ a: '[]', b: null, c: [1, 3, { a: 'io' }], d: { k: 123 } })
    ).toMatchSnapshot()
  })

  it('JsonExt#flatten isAtomValue ', function () {
    expect(
      flatten({ a: '[]', b: null, c: [1, 3, { a: 'io' }], d: { k: 123 } }, value => !isObject(value) || isArray(value))
    ).toMatchSnapshot()
  })

})

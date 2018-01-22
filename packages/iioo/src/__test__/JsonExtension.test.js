/**
 * @file: calculateEntry.test
 * @author: Cuttle Cong
 * @date: 2018/1/20
 * @description:
 */
import { flatten, summon } from '../lib/JsonExtension'
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

  it('JsonExt#summon ', function () {
    expect(
      summon({ 'a.b': 1, 'a.c': 2 })
    ).toEqual({ a: { b: 1, c: 2 } })
  })

  it('JsonExt#summon ', function () {
    expect(
      summon({ 'a.b.1': {}, 'a.b.2': {}, 'a.c': 2 })
    ).toEqual({ a: { b: { '1': {}, '2': {} }, c: 2 } })
  })

  it('JsonExt#summon ', function () {
    expect(
      summon({ 'a.b.1': {}, 'a.b.2': {}, 'a.b.0': [1, 2], 'a.c': 2 })
    ).toEqual({ a: { b: [[1, 2], {}, {}] , c: 2 } })
  })

  it('JsonExt#summon ', function () {
    expect(
      summon({ 'a.b.0': {}, 'a.b.1': {}, 'a.c': 2 })
    ).toEqual({ a: { b: [{}, {}], c: 2 } })
  })
})

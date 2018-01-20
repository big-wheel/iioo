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

  it('calculateEntry#getEntryList  array', function () {
    expect(
      getEntryList(['ssd', 'www'])
    ).toEqual({
      '0': 'ssd',
      '1': 'www'
    })

    expect(
      getEntryList(['ssd', 'www'], 'pre-')
    ).toEqual({
      'pre-0': 'ssd',
      'pre-1': 'www'
    })
  })

  it('calculateEntry#getEntryList  string', function () {
    expect(
      getEntryList('ssd')
    ).toEqual({
      '0': 'ssd'
    })

    expect(
      getEntryList('ssd', 'pre-')
    ).toEqual(
      { 'pre-0': 'ssd' }
    )
  })

  it('calculateEntry#getMultiEntryList  string', function () {
    expect(
      getMultiEntryList('ssd')
    ).toEqual([
      { '0': 'ssd' }
    ])

    expect(
      getMultiEntryList('ssd', 'pre-')
    ).toEqual([
      { 'pre-0': 'ssd' }
    ])
  })

  it('calculateEntry#getMultiEntryList  array', function () {
    expect(
      getMultiEntryList(['ssd', 'abc'], 'pre-')
    ).toEqual([
      {
        'pre-0': 'ssd',
        'pre-1': 'abc'
      }
    ])
  })

  it('calculateEntry#getMultiEntryList  {}', function () {
    expect(
      getMultiEntryList({ a: 'abc', b: ['def', 'hij'] }, 'pre')
    ).toEqual([
      { 'pre.a.0': 'abc' },
      {
        'pre.b.0': 'def',
        'pre.b.1': 'hij'
      }
    ])
  })
})

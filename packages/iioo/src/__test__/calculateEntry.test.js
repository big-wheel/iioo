/**
 * @file: calculateEntry.test
 * @author: Cuttle Cong
 * @date: 2018/1/20
 * @description:
 */
import { getEntryList, getMultiEntryList } from '../lib/calculateEntry'

describe('calculateEntry', () => {
  it('calculateEntry#getEntryList  error argument', function () {
    expect(() => getEntryList({})).toThrow()
    expect(() => getEntryList(['ssd', 'www', {}])).toThrow()
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

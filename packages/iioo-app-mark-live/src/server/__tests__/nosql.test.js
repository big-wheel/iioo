/* eslint-disable quotes */
/**
 * @file nosql
 * @author Cuttle Cong
 * @date 2018/5/2
 * @description
 */
const nosql = require('../util/nosql')
const User = require('../model/User')

describe('nosql', function() {
  const ns = nosql('user')

  it('should nosql', () => {
    expect(ns.find({ name: 'yc' })).toBe(
      "select * from `user` where name='yc';"
    )
    expect(ns.find({ name: 'yc', age: 123 })).toBe(
      "select * from `user` where name='yc' and age=123;"
    )

    expect(
      ns.find({ name: 'yc', $or: [{ title: 'abc', y: 'www' }, { x: 'sw' }] })
    ).toBe(
      "select * from `user` where name='yc' and ((title='abc' and y='www') or x='sw');"
    )

    expect(ns.insert({ name: 'yc', xx: 'yyy' })).toBe(
      "insert into `user` (`name`, `xx`) values ('yc', 'yyy');"
    )
  })

  it('should User', async function() {
    console.error(new User({ name: 'abc' }))
    console.error(await User.find({ name: '余聪' }))
    console.error(await User.findOne({ name: '余聪' }))
    console.error(
      await User.insert({
        name: '余聪xxx',
        datetime: new Date()
      })
    )
    console.error(
      await User.count({
        name: '余聪xxx',
        datetime: new Date()
      })
    )
    console.error(await User.count())
  })
})

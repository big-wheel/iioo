/**
 * @file: Watcher.test.js
 * @author: Cuttle Cong
 * @date: 2018/1/16
 * @description:
 */
import { join } from 'path'
import resolvePlugin, { preappend, resolvePluginString } from '../utils/resolvePlugin'

describe('resolvePlugin', () => {
  test('resolvePlugin#preappend', () => {
    expect(preappend('iioo-plugin-', 'test')).toEqual('iioo-plugin-test')
    expect(preappend('iioo-plugin-', 'iioo-plugin-test')).toEqual('iioo-plugin-test')
  })

  describe('resolvePlugin#resolvePluginString', () => {
    test('absolute path', () => {
      // absolute
      expect(resolvePluginString(join(__dirname, 'fixture/a.plugin'))).toEqual(join(__dirname, 'fixture/a.plugin.js'))
    })
    test('relative path', () => {
      expect(resolvePluginString('./a.plugin', { cwd: join(__dirname, 'fixture') })).toEqual(join(__dirname, 'fixture/a.plugin.js'))
    })
    test('module path', () => {
      expect(resolvePluginString('b.plugin', { cwd: join(__dirname, 'fixture') })).toEqual(join(__dirname, 'fixture/node_modules/b.plugin.js'))
      expect(resolvePluginString('plugin', { prefix: 'b.', cwd: join(__dirname, 'fixture') })).toEqual(join(__dirname, 'fixture/node_modules/b.plugin.js'))
      expect(() => resolvePluginString('b.plugin')).toThrow(/Cannot find module/i)
    })
  })

  describe('resolvePlugin#resolvePlugin', () => {
    test('resolvePlugin input: array [object, object]', () => {
      expect(
        resolvePlugin([
          require(join(__dirname, 'fixture/a.plugin')),
          { force: true }
        ])
      ).toEqual([
        require(join(__dirname, 'fixture/a.plugin')),
        { force: true }
      ])
    })

    test('resolvePlugin input array [string, object]', () => {
      expect(
        resolvePlugin([
          join(__dirname, 'fixture/a.plugin'),
          { force: true }
        ])
      ).toEqual([
        require(join(__dirname, 'fixture/a.plugin')),
        { force: true }
      ])

      expect(
        resolvePlugin(
          'plugin', {
            prefix: 'b.',
            cwd: join(__dirname, 'fixture')
          }
        )
      ).toEqual([
        require(join(__dirname, 'fixture/node_modules/b.plugin')),
        {}
      ])
    })
  })
})

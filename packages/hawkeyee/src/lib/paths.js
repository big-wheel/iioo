/**
 * @file: paths
 * @author: Cuttle Cong
 * @date: 2018/1/17
 * @description:
 */
import { resolve } from 'path'

export default {
  lib: resolve(__dirname),
  src: resolve(__dirname, '..'),
  root: resolve(__dirname, '../..'),
  utils: resolve(__dirname, '../utils'),
  templates: resolve(__dirname, '../templates'),
  client: resolve(__dirname, '../../client')
}

/**
 * @file: FSWatcher
 * @author: Cuttle Cong
 * @date: 2018/1/16
 * @description:
 */
import { FSWatcher as ChokidarFSWatcher } from 'chokidar'
import { inherits } from 'util'
import Watcher from './Watcher'

inherits(ChokidarFSWatcher, Watcher)
export default ChokidarFSWatcher

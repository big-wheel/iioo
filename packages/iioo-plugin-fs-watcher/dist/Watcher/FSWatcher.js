'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _chokidar = require('chokidar');

var _util = require('util');

var _Watcher = require('./Watcher');

var _Watcher2 = _interopRequireDefault(_Watcher);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _util.inherits)(_chokidar.FSWatcher, _Watcher2.default); /**
                                                              * @file: FSWatcher
                                                              * @author: Cuttle Cong
                                                              * @date: 2018/1/16
                                                              * @description:
                                                              */
exports.default = _chokidar.FSWatcher;
module.exports = exports['default'];
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (_ref) {
  var _this = this;

  var paths = _ref.paths;

  if (!paths) {
    this.console.error('fs-watcher: paths is required, but `' + paths + '`');
  }

  this.on('this-server', function (server) {
    _this.watcher = new _FSWatcher2.default().add(paths);

    server.use();
  }).on('after-close', function () {
    _this.watcher && _this.watcher.close();
    delete _this.watcher;
  });
};

var _FSWatcher = require('./Watcher/FSWatcher');

var _FSWatcher2 = _interopRequireDefault(_FSWatcher);

var _express = require('iioo/express');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = exports['default']; /**
                                      * @file: index
                                      * @author: Cuttle Cong
                                      * @date: 2018/1/18
                                      * @description:
                                      */
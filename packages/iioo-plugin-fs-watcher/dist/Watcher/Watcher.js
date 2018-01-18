'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _desc, _value, _class; /**
                            * @file: Watcher
                            * @author: Cuttle Cong
                            * @date: 2018/1/16
                            * @description:
                            */


var _events = require('events');

var _events2 = _interopRequireDefault(_events);

var _abstract = require('../../../iioo/src/utils/decorator/abstract');

var _abstract2 = _interopRequireDefault(_abstract);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
  var desc = {};
  Object['ke' + 'ys'](descriptor).forEach(function (key) {
    desc[key] = descriptor[key];
  });
  desc.enumerable = !!desc.enumerable;
  desc.configurable = !!desc.configurable;

  if ('value' in desc || desc.initializer) {
    desc.writable = true;
  }

  desc = decorators.slice().reverse().reduce(function (desc, decorator) {
    return decorator(target, property, desc) || desc;
  }, desc);

  if (context && desc.initializer !== void 0) {
    desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
    desc.initializer = undefined;
  }

  if (desc.initializer === void 0) {
    Object['define' + 'Property'](target, property, desc);
    desc = null;
  }

  return desc;
}

var Watcher = (_class = function (_EventEmitter) {
  (0, _inherits3.default)(Watcher, _EventEmitter);

  function Watcher() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    (0, _classCallCheck3.default)(this, Watcher);

    var _this = (0, _possibleConstructorReturn3.default)(this, (Watcher.__proto__ || Object.getPrototypeOf(Watcher)).call(this));

    _this._options = {};

    Object.assign(_this._options, options);
    return _this;
  }

  (0, _createClass3.default)(Watcher, [{
    key: 'add',
    value: function add() {}
  }, {
    key: 'unwatch',
    value: function unwatch() {}
  }, {
    key: 'close',
    value: function close() {}
  }]);
  return Watcher;
}(_events2.default), (_applyDecoratedDescriptor(_class.prototype, 'add', [_abstract2.default], Object.getOwnPropertyDescriptor(_class.prototype, 'add'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'unwatch', [_abstract2.default], Object.getOwnPropertyDescriptor(_class.prototype, 'unwatch'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'close', [_abstract2.default], Object.getOwnPropertyDescriptor(_class.prototype, 'close'), _class.prototype)), _class);
exports.default = Watcher;
module.exports = exports['default'];
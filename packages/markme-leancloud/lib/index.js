'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var _regeneratorRuntime = _interopDefault(require('babel-runtime/regenerator'));
var _asyncToGenerator = _interopDefault(require('babel-runtime/helpers/asyncToGenerator'));
var _objectWithoutProperties = _interopDefault(require('babel-runtime/helpers/objectWithoutProperties'));
var _extends = _interopDefault(require('babel-runtime/helpers/extends'));
var AV = _interopDefault(require('leancloud-storage'));
var mark = _interopDefault(require('markme'));

function markInLocalStorage(element) {
  var _this = this;

  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  options = _extends({
    enableInitialFill: true,
    AVOptions: {}
  }, options);

  // AV.
  AV.applicationId = null;
  AV.init(options.AVOptions);

  var Markme = AV.Object.extend('Markme');

  var emitter = mark(element, options);

  function toJSON(x) {
    var _x$toJSON = x.toJSON(),
        data = _x$toJSON.data,
        json = _objectWithoutProperties(_x$toJSON, ['data']);

    return _extends({}, json, data);
  }

  var storage = {
    set: function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee(type, id, data) {
        var old, mm;
        return _regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return this.get(type, id);

              case 2:
                old = _context.sent;
                mm = void 0;

                if (old && old.objectId) {
                  mm = AV.Object.createWithoutData('Markme', old.objectId);
                } else {
                  mm = new Markme();
                }

                mm.set('id', id);
                mm.set('type', type);
                mm.set('data', data);
                return _context.abrupt('return', mm.save());

              case 9:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function set(_x2, _x3, _x4) {
        return _ref.apply(this, arguments);
      }

      return set;
    }(),
    get: function () {
      var _ref2 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee2(type, id) {
        var query;
        return _regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                query = new AV.Query('Markme');

                query.equalTo('type', type);
                query.equalTo('id', id);
                _context2.next = 5;
                return query.find();

              case 5:
                _context2.t0 = toJSON;
                return _context2.abrupt('return', _context2.sent.map(_context2.t0)[0]);

              case 7:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function get(_x5, _x6) {
        return _ref2.apply(this, arguments);
      }

      return get;
    }(),
    remove: function () {
      var _ref3 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee3(type, id) {
        var data;
        return _regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.next = 2;
                return this.get(type, id);

              case 2:
                data = _context3.sent;

                if (!data.objectId) {
                  _context3.next = 5;
                  break;
                }

                return _context3.abrupt('return', AV.Query.doCloudQuery('delete from Markme where objectId=' + JSON.stringify(data.objectId)));

              case 5:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function remove(_x7, _x8) {
        return _ref3.apply(this, arguments);
      }

      return remove;
    }(),
    getAll: function () {
      var _ref4 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee4(type) {
        var query;
        return _regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                query = new AV.Query('Markme');

                query.equalTo('type', type);
                _context4.next = 4;
                return query.find();

              case 4:
                _context4.t0 = toJSON;
                return _context4.abrupt('return', _context4.sent.map(_context4.t0));

              case 6:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function getAll(_x9) {
        return _ref4.apply(this, arguments);
      }

      return getAll;
    }()
  };

  if (options.enableInitialFill) {
    storage.getAll('highlight').then(function (list) {
      if (!list || !list.length) {
        storage.set('null', 'null', null);
      }
      emitter.highlight.fill(list);
    });
  }

  return emitter.on('highlight-add', function () {
    var _ref6 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee5(_ref5) {
      var id = _ref5.id,
          data = _objectWithoutProperties(_ref5, ['id']);

      return _regeneratorRuntime.wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              _context5.next = 2;
              return storage.set('highlight', id, data);

            case 2:
            case 'end':
              return _context5.stop();
          }
        }
      }, _callee5, _this);
    }));

    return function (_x10) {
      return _ref6.apply(this, arguments);
    };
  }()).on('highlight-remove', function () {
    var _ref7 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee6(id) {
      return _regeneratorRuntime.wrap(function _callee6$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              _context6.next = 2;
              return storage.remove('highlight', id);

            case 2:
            case 'end':
              return _context6.stop();
          }
        }
      }, _callee6, _this);
    }));

    return function (_x11) {
      return _ref7.apply(this, arguments);
    };
  }()).on('highlight-change:words', function () {
    var _ref8 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee7(data) {
      var old;
      return _regeneratorRuntime.wrap(function _callee7$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              _context7.next = 2;
              return storage.get('highlight', data.id);

            case 2:
              old = _context7.sent;

              if (!old) {
                _context7.next = 7;
                break;
              }

              old.words = data.words;
              _context7.next = 7;
              return storage.set('highlight', data.id, old);

            case 7:
            case 'end':
              return _context7.stop();
          }
        }
      }, _callee7, _this);
    }));

    return function (_x12) {
      return _ref8.apply(this, arguments);
    };
  }()).on('highlight-change:color', function () {
    var _ref9 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee8(data) {
      var old;
      return _regeneratorRuntime.wrap(function _callee8$(_context8) {
        while (1) {
          switch (_context8.prev = _context8.next) {
            case 0:
              _context8.next = 2;
              return storage.get('highlight', data.id);

            case 2:
              old = _context8.sent;

              if (!old) {
                _context8.next = 7;
                break;
              }

              old.color = data.color;
              _context8.next = 7;
              return storage.set('highlight', data.id, old);

            case 7:
            case 'end':
              return _context8.stop();
          }
        }
      }, _callee8, _this);
    }));

    return function (_x13) {
      return _ref9.apply(this, arguments);
    };
  }());
}

module.exports = markInLocalStorage;

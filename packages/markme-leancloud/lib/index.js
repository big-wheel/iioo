'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var _regeneratorRuntime = _interopDefault(require('babel-runtime/regenerator'));
var _objectWithoutProperties = _interopDefault(require('babel-runtime/helpers/objectWithoutProperties'));
var _extends = _interopDefault(require('babel-runtime/helpers/extends'));
var _asyncToGenerator = _interopDefault(require('babel-runtime/helpers/asyncToGenerator'));
var AV = _interopDefault(require('leancloud-storage/live-query'));
var mark = _interopDefault(require('markme'));

var index = (function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee11(element) {
    var _this = this;

    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var Markme, emitter, toJSON, runtime, storage, query, liveQuery, list;
    return _regeneratorRuntime.wrap(function _callee11$(_context11) {
      while (1) {
        switch (_context11.prev = _context11.next) {
          case 0:
            toJSON = function toJSON(x) {
              var _x$toJSON = x.toJSON(),
                  data = _x$toJSON.data,
                  json = _objectWithoutProperties(_x$toJSON, ['data']);

              return _extends({}, json, data);
            };

            options = _extends({
              enableInitialFill: true,
              key: location.origin + location.pathname,
              AVOptions: {},
              enableLiveQuery: true
            }, options);
            // AV.
            AV.applicationId = null;
            AV.init(options.AVOptions);

            Markme = AV.Object.extend('Markme');
            emitter = mark(element, options);
            runtime = {};
            storage = {
              set: function () {
                var _ref2 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee(type, id, data) {
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
                          mm.set('ukey', options.key);
                          mm.set('type', type);
                          mm.set('data', data);
                          runtime.set = true;
                          return _context.abrupt('return', mm.save());

                        case 11:
                        case 'end':
                          return _context.stop();
                      }
                    }
                  }, _callee, this);
                }));

                function set(_x3, _x4, _x5) {
                  return _ref2.apply(this, arguments);
                }

                return set;
              }(),
              get: function () {
                var _ref3 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee2(type, id) {
                  var query;
                  return _regeneratorRuntime.wrap(function _callee2$(_context2) {
                    while (1) {
                      switch (_context2.prev = _context2.next) {
                        case 0:
                          query = new AV.Query('Markme');

                          query.equalTo('type', type);
                          query.equalTo('id', id);
                          query.equalTo('ukey', options.key);
                          _context2.next = 6;
                          return query.find();

                        case 6:
                          _context2.t0 = toJSON;
                          return _context2.abrupt('return', _context2.sent.map(_context2.t0)[0]);

                        case 8:
                        case 'end':
                          return _context2.stop();
                      }
                    }
                  }, _callee2, this);
                }));

                function get(_x6, _x7) {
                  return _ref3.apply(this, arguments);
                }

                return get;
              }(),
              remove: function () {
                var _ref4 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee3(type, id) {
                  var data, rlt;
                  return _regeneratorRuntime.wrap(function _callee3$(_context3) {
                    while (1) {
                      switch (_context3.prev = _context3.next) {
                        case 0:
                          _context3.next = 2;
                          return this.get(type, id);

                        case 2:
                          data = _context3.sent;

                          if (!data.objectId) {
                            _context3.next = 7;
                            break;
                          }

                          // console.error('remove', id)
                          // console.trace()
                          rlt = AV.Query.doCloudQuery('delete from Markme where objectId=' + JSON.stringify(data.objectId));

                          runtime.rm = true;
                          return _context3.abrupt('return', rlt);

                        case 7:
                        case 'end':
                          return _context3.stop();
                      }
                    }
                  }, _callee3, this);
                }));

                function remove(_x8, _x9) {
                  return _ref4.apply(this, arguments);
                }

                return remove;
              }(),
              getLiveQuery: function getLiveQuery(type) {
                var query = new AV.Query('Markme');
                query.equalTo('type', type);
                query.equalTo('ukey', options.key);
                return query;
              },

              getAll: function () {
                var _ref5 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee4(type) {
                  var query;
                  return _regeneratorRuntime.wrap(function _callee4$(_context4) {
                    while (1) {
                      switch (_context4.prev = _context4.next) {
                        case 0:
                          query = this.getLiveQuery(type);
                          _context4.next = 3;
                          return query.find();

                        case 3:
                          _context4.t0 = toJSON;
                          return _context4.abrupt('return', _context4.sent.map(_context4.t0));

                        case 5:
                        case 'end':
                          return _context4.stop();
                      }
                    }
                  }, _callee4, this);
                }));

                function getAll(_x10) {
                  return _ref5.apply(this, arguments);
                }

                return getAll;
              }(),
              getTotal: function () {
                var _ref6 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee5(type) {
                  var query;
                  return _regeneratorRuntime.wrap(function _callee5$(_context5) {
                    while (1) {
                      switch (_context5.prev = _context5.next) {
                        case 0:
                          query = new AV.Query('Markme');

                          query.equalTo('type', type);
                          _context5.next = 4;
                          return query.find();

                        case 4:
                          _context5.t0 = toJSON;
                          return _context5.abrupt('return', _context5.sent.map(_context5.t0));

                        case 6:
                        case 'end':
                          return _context5.stop();
                      }
                    }
                  }, _callee5, this);
                }));

                function getTotal(_x11) {
                  return _ref6.apply(this, arguments);
                }

                return getTotal;
              }()

              // LiveQuery
            };

            if (!options.enableLiveQuery) {
              _context11.next = 14;
              break;
            }

            query = storage.getLiveQuery('highlight');
            _context11.next = 12;
            return query.subscribe();

          case 12:
            liveQuery = _context11.sent;

            liveQuery.on('create', function (created) {
              created = created.toJSON();
              // console.log('create', runtime, created.id, created.data)
              if (runtime.set) {
                delete runtime.set;
                return;
              }
              created.id && created.data && emitter.highlight.fill(_extends({ id: created.id }, created.data));
            }).on('update', function (updated) {
              updated = updated.toJSON();
              // console.log('update', runtime, updated.id)
              // 自己修改也会触发
              if (runtime.set) {
                delete runtime.set;
                return;
              }
              // console.log('updated', updated)

              var _ref7 = updated.data || {},
                  words = _ref7.words,
                  color = _ref7.color;

              updated.id && emitter.highlight.change(updated.id, { color: color, words: words });
            }).on('delete', function (deleted) {
              deleted = deleted.toJSON();
              // console.log('delete', runtime, deleted.id, deleted.data)
              if (runtime.rm) {
                delete runtime.rm;
                return;
              }
              // console.log('deleted', deleted)
              emitter.highlight.remove(deleted.id);
            });

          case 14:

            emitter.on('highlight-add', function () {
              var _ref9 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee6(_ref8) {
                var id = _ref8.id,
                    data = _objectWithoutProperties(_ref8, ['id']);

                return _regeneratorRuntime.wrap(function _callee6$(_context6) {
                  while (1) {
                    switch (_context6.prev = _context6.next) {
                      case 0:
                        console.warn('highlight-add');
                        _context6.next = 3;
                        return storage.set('highlight', id, data);

                      case 3:
                      case 'end':
                        return _context6.stop();
                    }
                  }
                }, _callee6, _this);
              }));

              return function (_x12) {
                return _ref9.apply(this, arguments);
              };
            }()).on('highlight-remove', function () {
              var _ref10 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee7(id) {
                return _regeneratorRuntime.wrap(function _callee7$(_context7) {
                  while (1) {
                    switch (_context7.prev = _context7.next) {
                      case 0:
                        console.warn('highlight-remove');
                        storage.remove('highlight', id);

                      case 2:
                      case 'end':
                        return _context7.stop();
                    }
                  }
                }, _callee7, _this);
              }));

              return function (_x13) {
                return _ref10.apply(this, arguments);
              };
            }()).on('highlight-change:words', function () {
              var _ref11 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee8(data) {
                var old;
                return _regeneratorRuntime.wrap(function _callee8$(_context8) {
                  while (1) {
                    switch (_context8.prev = _context8.next) {
                      case 0:
                        console.warn('highlight-change:words');
                        _context8.next = 3;
                        return storage.get('highlight', data.id);

                      case 3:
                        old = _context8.sent;

                        if (!old) {
                          _context8.next = 8;
                          break;
                        }

                        old.words = data.words;
                        _context8.next = 8;
                        return storage.set('highlight', data.id, old);

                      case 8:
                      case 'end':
                        return _context8.stop();
                    }
                  }
                }, _callee8, _this);
              }));

              return function (_x14) {
                return _ref11.apply(this, arguments);
              };
            }()).on('highlight-change:color', function () {
              var _ref12 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee9(data) {
                var old;
                return _regeneratorRuntime.wrap(function _callee9$(_context9) {
                  while (1) {
                    switch (_context9.prev = _context9.next) {
                      case 0:
                        console.warn('highlight-change:color');
                        _context9.next = 3;
                        return storage.get('highlight', data.id);

                      case 3:
                        old = _context9.sent;

                        if (!old) {
                          _context9.next = 8;
                          break;
                        }

                        old.color = data.color;
                        _context9.next = 8;
                        return storage.set('highlight', data.id, old);

                      case 8:
                      case 'end':
                        return _context9.stop();
                    }
                  }
                }, _callee9, _this);
              }));

              return function (_x15) {
                return _ref12.apply(this, arguments);
              };
            }()).on('highlight-match-fail', function () {
              var _ref13 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee10(id) {
                return _regeneratorRuntime.wrap(function _callee10$(_context10) {
                  while (1) {
                    switch (_context10.prev = _context10.next) {
                      case 0:
                      case 'end':
                        return _context10.stop();
                    }
                  }
                }, _callee10, _this);
              }));

              return function (_x16) {
                return _ref13.apply(this, arguments);
              };
            }()
            // console.warn('highlight-match-fail')
            // await storage.remove('highlight', id)
            );

            if (!options.enableInitialFill) {
              _context11.next = 20;
              break;
            }

            _context11.next = 18;
            return storage.getAll('highlight');

          case 18:
            list = _context11.sent;

            // if (!list || !list.length) {
            //   storage.set('null', 'null', null)
            // }
            emitter.highlight.fill(list);

          case 20:
            return _context11.abrupt('return', emitter);

          case 21:
          case 'end':
            return _context11.stop();
        }
      }
    }, _callee11, this);
  }));

  function markLeancloud(_x2) {
    return _ref.apply(this, arguments);
  }

  return markLeancloud;
})();

module.exports = index;
//# sourceMappingURL=index.js.map

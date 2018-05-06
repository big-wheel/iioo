import _objectWithoutProperties from 'babel-runtime/helpers/objectWithoutProperties';
import _extends from 'babel-runtime/helpers/extends';
import _regeneratorRuntime from 'babel-runtime/regenerator';
import _asyncToGenerator from 'babel-runtime/helpers/asyncToGenerator';
import _classCallCheck from 'babel-runtime/helpers/classCallCheck';
import _createClass from 'babel-runtime/helpers/createClass';
import AwaitEventEmitter from 'await-event-emitter';

var mouseUpCore = function () {
  var _ref9 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee3(opt, ele, popover, _ref8) {
    var target = _ref8.target;

    var selection, markedList, _selectionUtil$getLas, reset, pos;

    return _regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            // console.log('mouseUpCore')
            selection = opt.window.getSelection();

            if (selection.isCollapsed) {
              _context3.next = 8;
              break;
            }

            markedList = selectionUtil.getSelectionContainsList(function (node) {
              return isItemNode(node) || isItemNode(node.parentNode);
            })(opt.window.getSelection());
            // Selected contains marked item

            if (!markedList.length) {
              _context3.next = 5;
              break;
            }

            return _context3.abrupt('return');

          case 5:
            _selectionUtil$getLas = selectionUtil.getLastRangePos(opt.window), reset = _selectionUtil$getLas.reset, pos = _selectionUtil$getLas.pos;

            if (reset) {
              resetQueue.add('TEMP', reset);
            }

            if (pos) {
              popover.show(pos, opt.highlightColors);
            } else {
              popover.hide();
            }

          case 8:
          case 'end':
            return _context3.stop();
        }
      }
    }, _callee3, this);
  }));

  return function mouseUpCore(_x7, _x8, _x9, _x10) {
    return _ref9.apply(this, arguments);
  };
}();

var click = function () {
  var _ref11 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee4(opt, ele, popover, evt) {
    var target, id, color, words, colorList;
    return _regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            target = evt.target;

            if (target.classList.contains('mark-highlight-item') && target.hasAttribute('data-mark-id')) {
              id = target.getAttribute('data-mark-id');
              color = target.style.backgroundColor;
              words = target.getAttribute('data-mark-words');
              colorList = opt.highlightColors.slice().map(function (x) {
                return rgbHex(x);
              });

              if (!colorList.includes(rgbHex(color))) {
                colorList.push(rgbHex(color));
              }
              popover.show(domUtil.getPageOffset(target), colorList);
              popover.selectColor(color, id);
              words && popover.setText(words);
            }
            if (opt.highlight.disableDefaultClick) {
              // evt.stopPropagation()
              evt.preventDefault();
            }

          case 3:
          case 'end':
            return _context4.stop();
        }
      }
    }, _callee4, this);
  }));

  return function click(_x11, _x12, _x13, _x14) {
    return _ref11.apply(this, arguments);
  };
}();

/**
 * @file highlight
 * @author Cuttle Cong
 * @date 2018/4/30
 * @description
 */
var debounce = require('lodash.debounce');
var domUtil = require('../../helper/dom');
var _rgbHex = require('rgb-hex');
var md5 = require('md5');
var selectionUtil = require('../../helper/selection');

function rgbHex(str) {
  try {
    return '#' + _rgbHex(str);
  } catch (e) {
    return str;
  }
}

function replaceToMark(textNode) {
  var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      color = _ref.color,
      words = _ref.words,
      uid = _ref.uid;

  var opt = arguments[2];

  // eslint-disable-next-line no-use-before-define
  if (isItemNode(textNode)) {
    return;
  }
  var mark = opt.window.document.createElement('mark');
  mark.className = 'mark-highlight-item';
  mark.style.backgroundColor = color;
  mark.setAttribute('data-mark-id', uid);
  words && mark.setAttribute('data-mark-words', words);
  textNode.parentNode && textNode.parentNode.replaceChild(mark, textNode);
  mark.appendChild(textNode);
}

var MapQueue = function () {
  function MapQueue() {
    _classCallCheck(this, MapQueue);

    this.mapQueue = {};
  }

  MapQueue.prototype.get = function get(id) {
    return this.mapQueue[id];
  };

  MapQueue.prototype.add = function add(id, val) {
    var list = this.get(id);
    if (list) {
      list.push(val);
    } else {
      this.mapQueue[id] = [val];
    }
  };

  MapQueue.prototype.clear = function clear(id) {
    this.reset(id, false);
  };

  MapQueue.prototype.reset = function reset(id) {
    var _this = this;

    var exec = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

    if (typeof id === 'undefined') {
      this.keys.map(function (key) {
        return _this.reset(key, exec);
      });
    } else {
      var list = this.get(id);
      if (list) {
        exec && list.forEach(function (reset) {
          return reset();
        });
        list.splice(0, list.length);
      }
    }
  };

  _createClass(MapQueue, [{
    key: 'keys',
    get: function get() {
      return Object.keys(this.mapQueue);
    }
  }]);

  return MapQueue;
}();

var resetQueue = new MapQueue();

function prependTextNodeChunks(textNode) {
  if (!domUtil.isText(textNode)) {
    return;
  }
  var prev = textNode.previousSibling;
  while (domUtil.isText(prev)) {
    textNode.textContent = prev.textContent + textNode.textContent;
    var tmpPrev = prev.previousSibling;
    prev.remove();
    prev = tmpPrev;
  }
}

function appendTextNodeChunks(textNode) {
  if (!domUtil.isText(textNode)) {
    return;
  }
  var next = textNode.nextSibling;
  while (domUtil.isText(next)) {
    textNode.textContent = textNode.textContent + next.textContent;
    var tmpNext = next.nextSibling;
    next.remove();
    next = tmpNext;
  }
}

function getMarkItems(id, ele) {
  var doms = [];
  if (typeof id === 'undefined') {
    doms = ele.querySelectorAll('mark[data-mark-id]');
  } else {
    doms = ele.querySelectorAll('mark[data-mark-id=' + JSON.stringify(id) + ']');
  }
  return doms;
}

function batchSetMarkAttribute(id, _ref2, ele) {
  var words = _ref2.words,
      color = _ref2.color;

  var doms = getMarkItems(id, ele);
  for (var i = 0; i < doms.length; i++) {
    var dom = doms[i];
    words && dom.setAttribute('data-mark-words', words);
    color && (dom.style.backgroundColor = rgbHex(color));
  }
}

function _remove(removeId, ele) {
  var doms = getMarkItems(removeId, ele);

  /* eslint-disable no-use-before-define */
  for (var i = 0; i < doms.length; i++) {
    var dom = doms[i];
    if (dom.parentNode) {
      var textNode = dom.firstChild;
      dom.parentNode.replaceChild(textNode, dom);
      prependTextNodeChunks(textNode);
      appendTextNodeChunks(textNode);
    }
  }
}

function getPopover(ele, opt) {
  var _this3 = this;

  var self = this;
  var popover = domUtil.getSingleDOM('div', void 0, document);
  popover.style.position = 'absolute';
  popover.style.display = 'none';
  popover.className = 'mark-highlight-popover';
  Object.assign(popover, {
    hide: function hide() {
      this.style.display = 'none';
    },
    show: function show(pos, colors) {
      if (pos) {
        this.style.top = pos.top + pos.height + 'px';
        this.style.left = pos.left + pos.width + 'px';
      }
      if (colors) {
        this.innerHTML = colors.map(function (c) {
          var className = 'mark-highlight-color';
          return '<span class="' + className + '" style="background-color: ' + c + '"></span>';
        }).join('');
      }
      this.innerHTML += '<textarea placeholder="input your idea" style="display: none"></textarea>';
      this.style.display = '';
    },
    selectColor: function selectColor(color, id) {
      this._resetActive();
      var colors = this.querySelectorAll('.mark-highlight-color');
      for (var i = 0; i < colors.length; i++) {
        if (rgbHex(colors[i].style.backgroundColor) === rgbHex(color)) {
          id && colors[i].setAttribute('data-mark-id', id);
          colors[i].classList.add('mark-highlight-active-color');
          this.setText('');
          return;
        }
      }
    },
    setText: function setText(text) {
      var _this2 = this;

      var textarea = this.querySelector('textarea');
      textarea.style.display = '';
      textarea.value = text;
      textarea.onblur = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee() {
        var activeItem, words;
        return _regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                activeItem = popover.getActive();

                if (activeItem) {
                  _context.next = 3;
                  break;
                }

                return _context.abrupt('return');

              case 3:
                words = textarea.value;
                _context.next = 6;
                return self.emit('highlight-change:words', { id: activeItem.id, words: words });

              case 6:
                batchSetMarkAttribute(activeItem.id, { words: words }, ele);

              case 7:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, _this2);
      }));
    },
    _resetActive: function _resetActive() {
      var active = this.querySelector('.mark-highlight-active-color');
      if (active) {
        active.removeAttribute('data-mark-id');
        active.classList.remove('mark-highlight-active-color');
      }
    },
    getActive: function getActive() {
      var active = this.querySelector('.mark-highlight-active-color');
      return active && {
        color: active.style.backgroundColor,
        id: active.getAttribute('data-mark-id')
      };
    }
  });
  opt.window.document.body.appendChild(popover);
  popover.addEventListener('click', function () {
    var _ref4 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee2(evt) {
      var target, color, removeId, active, list, containsMarked, uid, nodeList, chunks;
      return _regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              target = evt.target;

              if (!target.classList.contains('mark-highlight-color')) {
                _context2.next = 36;
                break;
              }

              color = target.style.backgroundColor;

              if (!(target.classList.contains('mark-highlight-active-color') && target.hasAttribute('data-mark-id'))) {
                _context2.next = 12;
                break;
              }

              removeId = target.getAttribute('data-mark-id');
              // Remove

              _context2.next = 7;
              return _this3.emit('highlight-remove', removeId);

            case 7:
              _remove(removeId, ele);
              popover.hide();
              target.classList.remove('mark-highlight-active-color');
              _context2.next = 36;
              break;

            case 12:
              active = popover.getActive();

              if (!active) {
                _context2.next = 19;
                break;
              }

              _context2.next = 16;
              return _this3.emit('highlight-change:color', { id: active.id, color: color });

            case 16:

              popover.selectColor(color, active.id);

              batchSetMarkAttribute(active.id, { color: color }, ele);
              return _context2.abrupt('return');

            case 19:
              list = selectionUtil.getSelectionTextList(opt.window.getSelection());
              containsMarked = list.find(function (textNode) {
                return isItemNode(textNode.parentNode);
              });

              if (!containsMarked) {
                _context2.next = 23;
                break;
              }

              return _context2.abrupt('return');

            case 23:

              // slice side effect
              selectionUtil.getLastRangePos(opt.window);

              list = selectionUtil.getSelectionTextSeqList(opt.window.getSelection());

              uid = opt.generateUid();

              target.setAttribute('data-mark-id', uid);
              nodeList = list.filter(function (textNode) {
                return ele.contains(textNode);
              });
              chunks = nodeList.map(function (node) {
                var parentNode = node.parentNode;
                var offset = 0;
                for (var i = 0; i < parentNode.childNodes.length; i++) {
                  var childNode = parentNode.childNodes[i];
                  if (childNode === node) {
                    break;
                  }
                  if (childNode && 'textContent' in childNode) {
                    offset += childNode.textContent.length;
                  }
                }

                return {
                  offset: offset,
                  length: node.textContent.length,
                  parentSelector: domUtil.getSelector(parentNode, ele)
                };
              });

              if (!(chunks && chunks.length)) {
                _context2.next = 32;
                break;
              }

              _context2.next = 32;
              return _this3.emit('highlight-add', { chunks: chunks, id: uid, color: color });

            case 32:

              nodeList.forEach(function (textNode) {
                replaceToMark(textNode, { uid: uid, color: color }, opt);
              });
              selectionUtil.removeRanges(window);
              /* eslint-disable no-use-before-define */
              resetQueue.clear();
              popover.selectColor(color, uid);

            case 36:
            case 'end':
              return _context2.stop();
          }
        }
      }, _callee2, _this3);
    }));

    return function (_x3) {
      return _ref4.apply(this, arguments);
    };
  }());
  return popover;
}

function isItemNode(node) {
  return node && node.classList && node.classList.contains('mark-highlight-item') && node.tagName && node.tagName.toLowerCase() === 'mark';
}

function _fill() {
  var _ref5 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      color = _ref5.color,
      words = _ref5.words,
      id = _ref5.id,
      offset = _ref5.offset,
      length = _ref5.length;

  var dom = arguments[1];
  var opt = arguments[2];

  var _selectionUtil$sliceN = selectionUtil.sliceNode(dom, { offset: offset, length: length }, opt.window),
      reset = _selectionUtil$sliceN.reset,
      nodes = _selectionUtil$sliceN.nodes;
  // if (reset) {
  //   resetQueue.add(id, reset)
  // }


  if (nodes && nodes[1]) {
    replaceToMark(nodes[1], { uid: id, color: color, words: words }, opt);
  }
}

function _fill2() {
  var _ref6 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      color = _ref6.color,
      id = _ref6.id,
      words = _ref6.words,
      _ref6$chunks = _ref6.chunks,
      chunks = _ref6$chunks === undefined ? [] : _ref6$chunks;

  var ele = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : document;
  var opt = arguments[2];

  if (!Array.isArray(chunks)) {
    return;
  }
  var domList = chunks.map(function (_ref7) {
    var parentSelector = _ref7.parentSelector;
    return ele.querySelector(parentSelector);
  });
  chunks.forEach(function (chunk, i) {
    domList[i] && _fill(_extends({ color: color, id: id, words: words }, chunk), domList[i], opt);
  });
}

function mouseDown(opt, ele, popover, _ref10) {
  var target = _ref10.target;

  if (target.classList.contains('mark-highlight-item') && target.hasAttribute('data-mark-id')) {
    return;
  }
  resetQueue.reset('TEMP');
  popover.hide();
}

function mouseEnter(opt, ele, popover, _ref12) {
  var target = _ref12.target;

  if (target.classList.contains('mark-highlight-item') && target.hasAttribute('data-mark-id')) {
    // let color = target.style.backgroundColor
    var domList = ele.querySelectorAll('.mark-highlight-item[data-mark-id=' + JSON.stringify(target.getAttribute('data-mark-id')) + ']');
    Array.from(domList).forEach(function (dom) {
      dom.style.filter = 'brightness(85%)';
      dom.style.webkitFilter = 'brightness(85%)';
      dom.style.msFilter = 'brightness(85%)';
      dom.style.mozFilter = 'brightness(85%)';
    });
  }
}

function mouseLeave(opt, ele, popover, _ref13) {
  var target = _ref13.target;

  if (target.classList.contains('mark-highlight-item') && target.hasAttribute('data-mark-id')) {
    var domList = ele.querySelectorAll('[data-mark-id=' + JSON.stringify(target.getAttribute('data-mark-id')) + ']');

    Array.from(domList).forEach(function (dom) {
      dom.style.filter = '';
      dom.style.webkitFilter = '';
      dom.style.msFilter = '';
      dom.style.mozFilter = '';
    });
  }
}

function highlight(element, options) {
  if (!window.getSelection) {
    throw new Error('window.getSelection is not existed');
  }

  options = _extends({
    generateUid: function generateUid() {
      return md5(new Date().getTime() + Math.random() + '');
    },

    window: window,
    highlightColors: ['#fff682', 'pink', '#b2f0ff', '#c57dff']
  }, options);

  var document = options.window.document;
  var style = document.createElement('style');
  style.innerHTML = require('./style');
  document.head.appendChild(style);

  function removeStyle() {
    document.head.removeChild(style);
  }

  var popover = getPopover.call(this, element, options);
  var debouncedMouseUp = debounce(mouseUpCore, 100).bind(this, options, element, popover);
  var debouncedMouseDown = debounce(mouseDown, 100).bind(this, options, element, popover);
  var onClick = click.bind(this, options, element, popover);
  var onMouseEnter = mouseEnter.bind(this, options, element, popover);
  var onMouseLeave = mouseLeave.bind(this, options, element, popover);

  element.__reset && element.__reset();
  element.__reset = function () {
    popover.parentNode && popover.parentNode.removeChild(popover);
    element.removeEventListener('click', onClick);
    element.removeEventListener('mouseover', onMouseEnter);
    element.removeEventListener('mouseout', onMouseLeave);
    element.removeEventListener('mouseup', debouncedMouseUp);
    element.removeEventListener('mousedown', debouncedMouseDown);
    removeStyle();
  };

  element.addEventListener('click', onClick);
  element.addEventListener('mouseover', onMouseEnter);
  element.addEventListener('mouseout', onMouseLeave);
  element.addEventListener('mouseup', debouncedMouseUp);
  element.addEventListener('mousedown', debouncedMouseDown);

  this.highlight = {
    fill: function fill(data) {
      var ele = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : element;

      if (Array.isArray(data)) {
        return data.forEach(function (item) {
          return _fill2(item, ele, options);
        });
      }
      _fill2(data, ele, options);
    },
    remove: function remove(id) {
      var ele = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : element;

      var active = popover.getActive();
      if (active && active.id === id) {
        popover.hide();
      }
      return _remove(id, ele);
    },
    exit: function exit() {
      element.__reset && element.__reset();
    }
  };
}

/**
 * @file index
 * @author Cuttle Cong
 * @date 2018/5/1
 * @description
 */

function badge (element) {
  
}

/**
 * @file index
 * @author Cuttle Cong
 * @date 2018/4/30
 * @description
 */
var isBrowser = typeof document !== 'undefined';

var plugins = {
  highlight: highlight,
  badge: badge
};

function run(func, message) {
  try {
    for (var _len = arguments.length, args = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
      args[_key - 2] = arguments[_key];
    }

    func.apply(this, args);
  } catch (e) {
    console.error(message, e.toString());
  }
}

function registerCommonMethod(ctx, methodName) {
  var plugins = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];

  ctx[methodName] = function () {
    var _arguments = arguments;

    plugins.forEach(function (pluginName) {
      if (ctx[pluginName] && ctx[pluginName][methodName]) {
        ctx[pluginName][methodName].apply(ctx[pluginName], _arguments);
      }
    });
  };
}

module.exports = function (element) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  if (!isBrowser) {
    throw new Error('mark should be used in browser environment.');
  }
  options = _extends({
    enablePlugins: ['highlight', 'badge']
  }, options, {
    highlight: _extends({
      disableDefaultClick: true
    }, options.highlight)
  });

  var _options = options,
      enablePlugins = _options.enablePlugins,
      restOptions = _objectWithoutProperties(_options, ['enablePlugins']);

  var ctx = new AwaitEventEmitter();
  ctx.opt = options;
  ctx.addButton = function () {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        title = _ref.title,
        icon = _ref.icon,
        action = _ref.action;
  };

  enablePlugins.forEach(function (plugin) {
    if (plugins[plugin]) {
      run.call(ctx, highlight, plugin, element, restOptions);
    }
  });

  registerCommonMethod(ctx, 'exit', enablePlugins);
  registerCommonMethod(ctx, 'remove', enablePlugins);
  // registerCommonMethod(ctx, 'fill', enablePlugins)

  return ctx;
};

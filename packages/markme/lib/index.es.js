import _objectWithoutProperties from 'babel-runtime/helpers/objectWithoutProperties';
import _extends from 'babel-runtime/helpers/extends';
import _regeneratorRuntime from 'babel-runtime/regenerator';
import _asyncToGenerator from 'babel-runtime/helpers/asyncToGenerator';
import _classCallCheck from 'babel-runtime/helpers/classCallCheck';
import _createClass from 'babel-runtime/helpers/createClass';
import debounce from 'lodash.debounce';
import _rgbHex from 'rgb-hex';
import md5 from 'md5';
import AwaitEventEmitter from 'await-event-emitter';

/**
 * @file selection
 * @author Cuttle Cong
 * @date 2018/4/30
 * @description
 */

function isText(node) {
  return node && node.nodeType === document.TEXT_NODE;
}

function createElem(tagName) {
  var document = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : document;

  return document.createElement(tagName);
}
var doms = new Map();
function getSingleDOM() {
  var tagName = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'div';
  var id = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : Math.random();
  var document = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : document;

  if (doms.has(id)) {
    return doms.get(id);
  }
  var ele = createElem(tagName, document);
  doms.set(id, ele);
  return ele;
}

function getPageOffset(el) {
  el = el.getBoundingClientRect();
  return {
    width: el.width,
    height: el.height,
    left: el.left + window.scrollX,
    top: el.top + window.scrollY
  };
}

function getTextNodeSize(node) {
  var window = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : window;

  if (!(node instanceof window.Range)) {
    var range = window.document.createRange();
    range.selectNodeContents(node);
    node = range;
  }
  return getPageOffset(node);
}





function walkDOM(node, func) {
  var rlt = func(node); // this will invoke the functionToInvoke from arg
  // skip
  if (rlt === false) {
    return;
  }
  node = node.firstChild;
  while (node) {
    walkDOM(node, func);
    node = node.nextSibling;
  }
}

var walk = walkDOM;

function getSelector(el) {
  var root = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : document;

  if (!el || el.nodeType !== Node.ELEMENT_NODE) {
    throw new Error('getSelector requires element.');
  }
  if (root === el) {
    return null;
  }
  if (el.hasAttribute('id')) {
    return '#' + el.getAttribute('id');
  }

  var children = Array.from(el.parentNode ? el.parentNode.children : []);
  var index = -1,
      hasBrother = false;
  children.forEach(function (x, i) {
    if (x === el) {
      index = i + 1;
    } else if (el.tagName === x.tagName) {
      hasBrother = true;
    }
  });

  var selector = el.localName;
  if (index > 0 && hasBrother) {
    selector = el.localName + ':nth-child(' + index + ')';
  }
  var ps = getSelector(el.parentNode, root);
  return ps !== null ? ps + ' > ' + selector : selector;
}

/**
 * @file selection
 * @author Cuttle Cong
 * @date 2018/4/30
 * @description
 */
function makeReset(fn) {
  var wrap = function wrap() {
    if (wrap.__called) {
      return;
    }
    wrap.__called = true;

    // range.setStart(cloneRange.startContainer, cloneRange.startOffset)
    // range.setEnd(cloneRange.endContainer, cloneRange.endOffset)
    fn();
  };
  return wrap;
}

function sliceNode(node) {
  var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      offset = _ref.offset,
      length = _ref.length;

  var window = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : window;

  var document = window.document;

  if (node && node.nodeType === Node.ELEMENT_NODE) {
    var sumOffset = 0,
        relativeOffset = offset;
    for (var i = 0; i < node.childNodes.length; i++) {
      var child = node.childNodes[i];
      if (child && 'textContent' in child) {
        sumOffset += child.textContent.length;
        relativeOffset = relativeOffset - child.textContent.length;
      }

      if (sumOffset > offset) {
        return sliceNode(child, {
          offset: relativeOffset + child.textContent.length,
          length: length
        }, window);
      }
    }
  }

  if (node && 'textContent' in node) {
    var text = node.textContent;
    var pNode = node.parentNode;
    if (!pNode) {
      return {};
    }

    if (text.length < offset && node.nextSibling) {
      return sliceNode(node.nextSibling, { offset: offset - text.length, length: length }, window);
    }
    var nodes = [text.slice(offset + length), text.slice(offset, offset + length), text.slice(0, offset)].map(function (text) {
      return document.createTextNode(text);
    });
    // .filter(text => text.trim() !== '')

    var head = nodes[0];
    pNode.replaceChild(nodes[0], node);
    var resetNodes = nodes.slice(1);

    var reset = makeReset(function () {
      pNode.replaceChild(node, nodes[0]);
      resetNodes.forEach(function (node) {
        node.remove();
      });
    });

    resetNodes.forEach(function (node) {
      pNode.insertBefore(node, head);
      head = node;
    });

    return { reset: reset, nodes: nodes };
  }
  return {};
}

function getLastRangePos(window) {
  var selection = window.getSelection();
  var document = window.document;

  var range = selection.getRangeAt(selection.rangeCount - 1);
  var reset = void 0;
  var pos = void 0;

  if (range) {
    // eslint-disable-next-line no-inner-declarations

    var startContainer = range.startContainer;
    var endContainer = range.endContainer;
    var startParentContainer = startContainer.parentElement;
    var endParentContainer = endContainer.parentElement;
    var commonAncestorContainer = range.commonAncestorContainer;
    // pure text nodes

    var startWholeText = range.startContainer.textContent;
    var startOffset = range.startOffset;
    var endWholeText = range.endContainer.textContent;
    var endOffset = range.endOffset;

    //  " hello world "
    //      _____
    if (startContainer === endContainer) {
      var data = sliceNode(startContainer, {
        offset: startOffset,
        length: endOffset - startOffset
      }, window);
      var nodes = data.nodes;
      range.selectNodeContents(nodes[1]);
      pos = getTextNodeSize(range, window);
      reset = data.reset;
    } else {
      //  " hello<code>x</code>world "
      //      ^^^^^^^^^^^^^^^^^^^
      if (isText(startContainer)) {
        var _nodes = [startWholeText.slice(startOffset), startWholeText.slice(0, startOffset)].map(function (x) {
          return document.createTextNode(x);
        });
        var head = _nodes[0];
        startParentContainer.replaceChild(_nodes[0], startContainer);
        var resetNodes = _nodes.slice(1);

        reset = makeReset(function () {
          startParentContainer.replaceChild(startContainer, _nodes[0]);
          resetNodes.forEach(function (node) {
            node.remove();
          });
        });

        resetNodes.forEach(function (node) {
          startParentContainer.insertBefore(node, head);
          head = node;
        });
        range.setStart(_nodes[0], 0);
      }

      if (isText(endContainer)) {
        var _nodes2 = [endWholeText.slice(endOffset), endWholeText.slice(0, endOffset)].map(function (x) {
          return document.createTextNode(x);
        });
        var _head = _nodes2[0];
        endParentContainer.replaceChild(_nodes2[0], endContainer);
        var _resetNodes = _nodes2.slice(1);

        reset = function (reset) {
          return makeReset(function () {
            reset && reset();
            endParentContainer.replaceChild(endContainer, _nodes2[0]);
            _resetNodes.forEach(function (node) {
              node.remove();
            });
          });
        }(reset);

        _resetNodes.forEach(function (node) {
          endParentContainer.insertBefore(node, _head);
          _head = node;
        });
        range.setEnd(_nodes2[1], _nodes2[1].textContent.length);
      }

      pos = getTextNodeSize(range, window);
    }

    return {
      reset: reset,
      pos: pos
    };
  }

  return {};
}

function removeRanges() {
  var window = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : window;

  var selection = window.getSelection();
  selection.removeAllRanges();
}

function getSelectionContainsList(cond) {
  return function () {
    var selection = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : window.getSelection();

    if (selection.isCollapsed) {
      return [];
    }
    var list = [];
    var range = selection.getRangeAt(selection.rangeCount - 1);

    function getTexts(root, range) {
      var list = [];
      walk(root, function (node) {
        if (cond(node)) {
          if (range.isPointInRange(node, 0)) {
            list.push(node);
          }
        }
      });
      return list;
    }
    if (cond(range.commonAncestorContainer)) {
      return [range.commonAncestorContainer];
    }
    if (range) {
      list = getTexts(range.commonAncestorContainer, range);
    }
    return list;
  };
}

var getTextList = getSelectionContainsList(function (node) {
  if (isText(node)) {
    if (node.parentNode) {
      if (node.parentNode.tagName && ['style', 'script', 'noscript', 'title'].includes(node.parentNode.tagName.toLowerCase())) {
        return false;
      }
    }
    return true;
  }
  return false;
});
var getSelectionTextList = getTextList;

function isEmpty(node) {
  return node.textContent.trim() === '';
}

function getSelectionTextSeqList(selection) {
  var textList = getTextList(selection);
  if (!textList || !textList.length) {
    return textList;
  }
  // debugger
  var newList = [textList.shift()];
  while (textList.length) {
    var head = newList[newList.length - 1];
    var node = textList.shift();
    if (node.previousSibling === head) {
      head.textContent = head.textContent + node.textContent;
      node.remove();
    } else {
      newList.push(node);
    }
  }

  return newList.filter(function (x) {
    return !isEmpty(x);
  });
}

var styleText = "\n.mark-highlight-popover {\n  position: absolute;\n  z-index: 9999;\n  background-color: #fff;\n  box-shadow: 0 0 10px 3px #ccc;\n  transform: translate(-54%, 20%);\n  min-width: 40px;\n  max-width: 90vw;\n  padding: 4px 7px;\n  box-sizing: content-box;\n  text-align: center;\n  user-select: none;\n  -moz-user-select: none;\n  -webkit-user-select: none;\n  -ms-user-select: none;\n}\n.mark-highlight-popover > textarea {\n  display: block;\n  resize: none;\n}\n.mark-highlight-popover::before {\n  content: \"\";\n  border-left: 5px solid transparent;\n  border-right: 5px solid transparent;\n  border-top: 5px solid transparent;\n  border-bottom: 5px solid #fff;\n  display: block;\n  position: absolute;\n  top: -10px;\n  left: 50%;\n}\n.mark-highlight-color {\n  display: inline-block;\n  width: 14px;\n  height: 14px;\n  margin: auto 2px;\n  border-radius: 50%;\n  cursor: pointer;\n}\n\n.mark-highlight-active-color {\n  background-size: contain;\n  background-image: url(\"data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/PjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+PHN2ZyB0PSIxNTI1MTM3NDcxNDM5IiBjbGFzcz0iaWNvbiIgc3R5bGU9IiIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHAtaWQ9IjIwNDYiIGRhdGEtc3BtLWFuY2hvci1pZD0iYTMxM3guNzc4MTA2OS4wLmkwIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiPjxkZWZzPjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI+PC9zdHlsZT48L2RlZnM+PHBhdGggZD0iTTE3Ni42NjE2MDEgODE3LjE3Mjg4MUMxNjguNDcyNzk4IDgyNS42NDQwNTUgMTY4LjcwMTcwNiA4MzkuMTQ5NjM2IDE3Ny4xNzI4ODEgODQ3LjMzODQzOCAxODUuNjQ0MDU2IDg1NS41MjcyNDEgMTk5LjE0OTYzNiA4NTUuMjk4MzMyIDIwNy4zMzg0MzggODQ2LjgyNzE1N0w4MjYuMDA1MTA1IDIwNi44MjcxNTdDODM0LjE5MzkwNyAxOTguMzU1OTgzIDgzMy45NjQ5OTggMTg0Ljg1MDQwMyA4MjUuNDkzODI0IDE3Ni42NjE2MDEgODE3LjAyMjY1IDE2OC40NzI3OTggODAzLjUxNzA2OSAxNjguNzAxNzA2IDc5NS4zMjgyNjcgMTc3LjE3Mjg4MUwxNzYuNjYxNjAxIDgxNy4xNzI4ODFaIiBwLWlkPSIyMDQ3Ij48L3BhdGg+PHBhdGggZD0iTTc5NS4zMjgyNjcgODQ2LjgyNzE1N0M4MDMuNTE3MDY5IDg1NS4yOTgzMzIgODE3LjAyMjY1IDg1NS41MjcyNDEgODI1LjQ5MzgyNCA4NDcuMzM4NDM4IDgzMy45NjQ5OTggODM5LjE0OTYzNiA4MzQuMTkzOTA3IDgyNS42NDQwNTUgODI2LjAwNTEwNSA4MTcuMTcyODgxTDIwNy4zMzg0MzggMTc3LjE3Mjg4MUMxOTkuMTQ5NjM2IDE2OC43MDE3MDYgMTg1LjY0NDA1NiAxNjguNDcyNzk4IDE3Ny4xNzI4ODEgMTc2LjY2MTYwMSAxNjguNzAxNzA2IDE4NC44NTA0MDMgMTY4LjQ3Mjc5OCAxOTguMzU1OTgzIDE3Ni42NjE2MDEgMjA2LjgyNzE1N0w3OTUuMzI4MjY3IDg0Ni44MjcxNTdaIiBwLWlkPSIyMDQ4Ij48L3BhdGg+PC9zdmc+\");\n}\n.mark-highlight-color:hover {\n  opacity: .68;\n}\n.mark-highlight-color.disabled {\n  cursor: not-allowed;\n  opacity: .5;\n}\n.mark-highlight-item {\n  cursor: pointer;\n}\n";

var mouseUpCore = function () {
  var _ref8 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee3(opt, ele, popover, _ref7) {
    var target = _ref7.target;

    var selection, markedList, _selectionUtil$getLas, reset, pos;

    return _regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            if (!this.highlight.lock) {
              _context3.next = 2;
              break;
            }

            return _context3.abrupt('return');

          case 2:
            // console.log('mouseUpCore')
            selection = opt.window.getSelection();

            if (selection.isCollapsed) {
              _context3.next = 10;
              break;
            }

            markedList = getSelectionContainsList(function (node) {
              return isItemNode(node) || isItemNode(node.parentNode);
            })(opt.window.getSelection());
            // Selected contains marked item

            if (!markedList.length) {
              _context3.next = 7;
              break;
            }

            return _context3.abrupt('return');

          case 7:
            _selectionUtil$getLas = getLastRangePos(opt.window), reset = _selectionUtil$getLas.reset, pos = _selectionUtil$getLas.pos;

            if (reset) {
              resetQueue.add('TEMP', reset);
            }

            if (pos) {
              popover.show(pos, opt.highlightColors);
            } else {
              popover.hide();
            }

          case 10:
          case 'end':
            return _context3.stop();
        }
      }
    }, _callee3, this);
  }));

  return function mouseUpCore(_x7, _x8, _x9, _x10) {
    return _ref8.apply(this, arguments);
  };
}();

var click = function () {
  var _ref10 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee4(opt, ele, popover, evt) {
    var target, id, color, words, colorList;
    return _regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            if (!this.highlight.lock) {
              _context4.next = 2;
              break;
            }

            return _context4.abrupt('return');

          case 2:
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
              popover.show(getPageOffset(target), colorList);
              popover.selectColor(color, id);
              words && popover.setText(words);
            }
            if (opt.highlight.disableDefaultClick) {
              // evt.stopPropagation()
              evt.preventDefault();
            }

          case 5:
          case 'end':
            return _context4.stop();
        }
      }
    }, _callee4, this);
  }));

  return function click(_x11, _x12, _x13, _x14) {
    return _ref10.apply(this, arguments);
  };
}();

/**
 * @file highlight
 * @author Cuttle Cong
 * @date 2018/4/30
 * @description
 */
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
  if (!isText(textNode)) {
    return;
  }
  var prev = textNode.previousSibling;
  while (isText(prev)) {
    textNode.textContent = prev.textContent + textNode.textContent;
    var tmpPrev = prev.previousSibling;
    prev.remove();
    prev = tmpPrev;
  }
}

function appendTextNodeChunks(textNode) {
  if (!isText(textNode)) {
    return;
  }
  var next = textNode.nextSibling;
  while (isText(next)) {
    textNode.textContent = textNode.textContent + next.textContent;
    var tmpNext = next.nextSibling;
    next.remove();
    next = tmpNext;
  }
}

function getMarkItems(id, ele) {
  var doms = [];
  if (typeof id === 'undefined') {
    doms = ele.querySelectorAll('mark.mark-highlight-item[data-mark-id]');
  } else {
    doms = ele.querySelectorAll('mark.mark-highlight-item[data-mark-id=' + JSON.stringify(id) + ']');
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
    // debugger
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
  var popover = getSingleDOM('div', void 0, document);
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
      var oldVal = text;
      textarea.focus();
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

                if (!(oldVal === words)) {
                  _context.next = 6;
                  break;
                }

                return _context.abrupt('return');

              case 6:
                _context.next = 8;
                return self.emit('highlight-change:words', { id: activeItem.id, words: words });

              case 8:
                batchSetMarkAttribute(activeItem.id, { words: words }, ele);

              case 9:
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
      var textarea = this.querySelector('textarea');
      return active && {
        words: textarea.value,
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
                _context2.next = 47;
                break;
              }

              color = target.style.backgroundColor;

              if (!(target.classList.contains('mark-highlight-active-color') && target.hasAttribute('data-mark-id'))) {
                _context2.next = 13;
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
              evt.preventDefault();
              _context2.next = 47;
              break;

            case 13:
              active = popover.getActive();

              if (!active) {
                _context2.next = 21;
                break;
              }

              _context2.next = 17;
              return _this3.emit('highlight-change:color', { id: active.id, color: color });

            case 17:

              popover.selectColor(color, active.id);
              popover.setText(active.words);

              batchSetMarkAttribute(active.id, { color: color, words: active.words }, ele);
              return _context2.abrupt('return');

            case 21:
              list = getSelectionTextList(opt.window.getSelection());
              containsMarked = list.find(function (textNode) {
                return isItemNode(textNode.parentNode);
              });

              if (!containsMarked) {
                _context2.next = 25;
                break;
              }

              return _context2.abrupt('return');

            case 25:

              // slice side effect
              getLastRangePos(opt.window);

              list = getSelectionTextSeqList(opt.window.getSelection());

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
                  content: node.textContent,
                  // length: node.textContent.length,
                  parentSelector: getSelector(parentNode, ele)
                };
              });

              if (!(chunks && chunks.length)) {
                _context2.next = 43;
                break;
              }

              // Network async for lock other operation
              _this3.highlight.lock = true;
              _context2.prev = 33;
              _context2.next = 36;
              return _this3.emit('highlight-add', { chunks: chunks, id: uid, color: color });

            case 36:
              _this3.highlight.lock = false;
              _context2.next = 43;
              break;

            case 39:
              _context2.prev = 39;
              _context2.t0 = _context2['catch'](33);

              _this3.highlight.lock = false;
              throw _context2.t0;

            case 43:

              nodeList.forEach(function (textNode) {
                replaceToMark(textNode, { uid: uid, color: color }, opt);
              });
              removeRanges(window);
              /* eslint-disable no-use-before-define */
              resetQueue.clear();
              popover.selectColor(color, uid);

            case 47:
            case 'end':
              return _context2.stop();
          }
        }
      }, _callee2, _this3, [[33, 39]]);
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
      length = _ref5.length,
      content = _ref5.content;

  var dom = arguments[1];
  var opt = arguments[2];

  if (isNaN(length) && typeof content !== 'undefined') {
    length = content.length;
  }

  var _selectionUtil$sliceN = sliceNode(dom, { offset: offset, length: length }, opt.window),
      reset = _selectionUtil$sliceN.reset,
      nodes = _selectionUtil$sliceN.nodes;
  // if (reset) {
  //   resetQueue.add(id, reset)
  // }


  if (nodes && nodes[1]) {
    if (typeof content !== 'undefined' && nodes[1].textContent !== content) {
      console.warn('expected:', JSON.stringify(nodes[1].textContent), 'actual:', JSON.stringify(content));
      throw 'highlight-match-fail';
    }
    replaceToMark(nodes[1], { uid: id, color: color, words: words }, opt);
  }
}

function _fill2() {
  var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  var _this4 = this;

  var ele = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : document;
  var opt = arguments[2];

  var color = data.color,
      id = data.id,
      words = data.words,
      _data$chunks = data.chunks,
      chunks = _data$chunks === undefined ? [] : _data$chunks,
      rest = _objectWithoutProperties(data, ['color', 'id', 'words', 'chunks']);

  if (!Array.isArray(chunks)) {
    return;
  }
  var domList = chunks.map(function (_ref6) {
    var parentSelector = _ref6.parentSelector;
    return ele.querySelector(parentSelector);
  });
  chunks.forEach(function (chunk, i) {
    var detail = _extends({}, rest, { color: color, id: id, words: words }, chunk);
    try {
      domList[i] && _fill.call(_this4, detail, domList[i], opt);
    } catch (e) {
      if (e === 'highlight-match-fail') {
        _this4.emitSync('highlight-match-fail', id);
      }
    }
  });
}

function mouseDown(opt, ele, popover, _ref9) {
  var target = _ref9.target;

  if (this.highlight.lock) {
    return;
  }

  if (target.classList.contains('mark-highlight-item') && target.hasAttribute('data-mark-id')) {
    return;
  }
  if (!popover.contains(target)) {
    popover.hide();
    resetQueue.reset('TEMP');
    // console.log(target)
  }
}

function mouseEnter(opt, ele, popover, _ref11) {
  var _this5 = this;

  var target = _ref11.target;

  if (target.classList.contains('mark-highlight-item') && target.hasAttribute('data-mark-id')) {
    if (this.highlight.__$tmp_time) {
      clearTimeout(this.highlight.__$tmp_time);
    }
    this.highlight.__$tmp_time = setTimeout(function () {
      var old = _this5.opt.highlight.disableDefaultClick;
      _this5.opt.highlight.disableDefaultClick = true;
      target.click();
      _this5.opt.highlight.disableDefaultClick = old;
      delete _this5.highlight.__$tmp_time;
    }, 2000);

    var domList = getMarkItems(target.getAttribute('data-mark-id'), ele);
    Array.from(domList).forEach(function (dom) {
      dom.style.filter = 'brightness(85%)';
      dom.style.webkitFilter = 'brightness(85%)';
      dom.style.msFilter = 'brightness(85%)';
      dom.style.mozFilter = 'brightness(85%)';
    });
  }
}

function mouseLeave(opt, ele, popover, _ref12) {
  var target = _ref12.target;

  if (target.classList.contains('mark-highlight-item') && target.hasAttribute('data-mark-id')) {
    if (this.highlight.__$tmp_time) {
      clearTimeout(this.highlight.__$tmp_time);
    }

    var domList = getMarkItems(target.getAttribute('data-mark-id'), ele);
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

    highlightColors: ['#fff682', 'pink', '#b2f0ff', '#c57dff']
  }, options);

  this.addStyle(styleText);

  var popover = getPopover.call(this, element, options);
  var debouncedMouseUp = debounce(mouseUpCore, 100).bind(this, options, element, popover);
  var debouncedMouseDown = debounce(mouseDown, 100).bind(this, options, element, popover);
  var onClick = click.bind(this, options, element, popover);
  var onMouseEnter = mouseEnter.bind(this, options, element, popover);
  var onMouseLeave = mouseLeave.bind(this, options, element, popover);

  this.addReset(function () {
    popover.parentNode && popover.parentNode.removeChild(popover);
    element.removeEventListener('click', onClick);
    element.removeEventListener('mouseover', onMouseEnter);
    element.removeEventListener('mouseout', onMouseLeave);
    element.removeEventListener('mouseup', debouncedMouseUp);
    element.removeEventListener('mousedown', debouncedMouseDown);
  });

  element.addEventListener('click', onClick);
  element.addEventListener('mouseover', onMouseEnter);
  element.addEventListener('mouseout', onMouseLeave);
  element.addEventListener('mouseup', debouncedMouseUp);
  element.addEventListener('mousedown', debouncedMouseDown);

  var self = this;
  this.highlight = {
    popover: popover,
    fill: function fill(data) {
      var ele = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : element;

      if (Array.isArray(data)) {
        return data.forEach(function (item) {
          return _fill2.call(self, item, ele, options);
        });
      }
      _fill2.call(self, data, ele, options);
    },
    remove: function remove(id) {
      var ele = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : element;

      var active = popover.getActive();
      if (active && active.id === id) {
        popover.hide();
      }
      return _remove(id, ele);
    },
    change: function change(id, data) {
      batchSetMarkAttribute(id, data, element);
    }
  };
}

/**
 * @file index
 * @author Cuttle Cong
 * @date 2018/5/1
 * @description
 */

function badge(element) {
  this.opt.badge = Object.assign({}, this.opt.badge);

  
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
    console.error(message, e);
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

function mark(element) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  if (!isBrowser) {
    throw new Error('mark should be used in browser environment.');
  }
  options = _extends({
    window: window,
    enablePlugins: ['highlight', 'badge']
  }, options, {
    highlight: _extends({
      disableDefaultClick: false
    }, options.highlight)
  });

  var _options = options,
      enablePlugins = _options.enablePlugins,
      restOptions = _objectWithoutProperties(_options, ['enablePlugins']);

  var ctx = new AwaitEventEmitter();

  Object.assign(ctx, {
    opt: options,
    __resets: [],
    addReset: function addReset(reset) {
      reset && this.__resets.push(reset);
    },
    exit: function exit() {
      if (element.__reset) {
        element.__reset();
      }
    },
    addStyle: function addStyle(text) {
      var document = this.opt.window.document;
      var style = document.createElement('style');
      style.textContent = text;
      document.head.appendChild(style);
      this.addReset(function () {
        document.head.removeChild(style);
      });
      return style;
    }
    // addButton = function({ title, icon, action } = {}) {}

  });

  ctx.exit();
  element.__reset = function () {
    ctx.__resets.forEach(function (reset) {
      return reset();
    });
  };

  enablePlugins.forEach(function (plugin) {
    if (plugins[plugin]) {
      run.call(ctx, plugins[plugin], plugin, element, restOptions);
    }
  });

  registerCommonMethod(ctx, 'exit', enablePlugins);
  registerCommonMethod(ctx, 'remove', enablePlugins);
  // registerCommonMethod(ctx, 'fill', enablePlugins)

  return ctx;
}

export default mark;
//# sourceMappingURL=index.es.js.map

/* eslint-disable indent */
/**
 * @file index.js
 * @author Cuttle Cong
 * @date 2018/4/30
 * @description
 */

import mark from '../'
import markLocalStorage from '../localStorage'

let m
function run(which) {
  m && m.remove()
  switch (which) {
    case 'basic':
      m = mark(window.root, {})
      break
    case 'ls':
      m = markLocalStorage(window.root, {})
      break
  }
}

let dom = {
  basic: document.querySelector('#switch-basic'),
  ls: document.querySelector('#switch-ls'),
  // rs: document.querySelector('#switch-rs')
}

function activateDOM(key, oldKey) {
  dom[oldKey] && dom[oldKey].classList.remove('active')
  dom[key] && dom[key].classList.add('active')
}

Object.keys(dom).forEach(key => {
  dom[key].addEventListener('click', () => {
    run(key)
    activateDOM(key, localStorage['defaultView'])
    localStorage['defaultView'] = key
  })
})


let defaultView = localStorage['defaultView']
run(defaultView)
activateDOM(defaultView)

/* eslint-disable indent */
/**
 * @file index.js
 * @author Cuttle Cong
 * @date 2018/4/30
 * @description
 */

import mark from '../index'
import markLocalStorage from '../localStorage'
// import markmeLeancloud from 'markme-leancloud'

let m
function run(which) {
  m && m.remove()
  switch (which) {
    case 'basic':
      m = mark(document.body, {})
      break
    case 'ls':
      m = markLocalStorage(document.body, {})
      break
  }
}

let dom = {
  basic: document.querySelector('#switch-basic'),
  ls: document.querySelector('#switch-ls'),
  // lc: document.querySelector('#switch-lc')
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

/**
 * @file app
 * @author Cuttle Cong
 * @date 2018/5/2
 * @description
 */
import Layout from '../vm/Layout'
import { setSuffix } from '../lib/fetch'

setSuffix('/api')

class App extends Layout {
  home = () => new Promise(resolve => {
    require.ensure([], () => {
      resolve(require('./home').default)
    }, 'home')
  })

  login = () => new Promise(resolve => {
    require.ensure([], () => {
      resolve(require('./login').default)
    }, 'login')
  })

  signup = () => new Promise(resolve => {
    require.ensure([], () => {
      resolve(require('./signup').default)
    }, 'signup')
  })

  playground = () => new Promise(resolve => {
    require.ensure([], () => {
      resolve(require('./playground').default)
    }, 'playground')
  })
}

export default App.create()

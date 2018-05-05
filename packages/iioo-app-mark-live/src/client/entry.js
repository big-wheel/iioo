/**
 * @file entry
 * @author Cuttle Cong
 * @date 2018/5/2
 * @description
 */
import { h, providerFactory, registerUrlSync } from 'react-mobx-vm'
import RouterV3 from 'react-mobx-vm/packages/RouterV3'
import * as React from 'react'
import history from './history'
import * as ReactDOM from 'react-dom'
import { useStrict } from 'mobx'

import app from './pages/app'
import routes from './routes'
import './styles/index.less'

registerUrlSync(history)

useStrict(true)
const Provider = providerFactory(app)

ReactDOM.render(
  h(Provider, {}, h(RouterV3, { routes, history })),
  window.root
)

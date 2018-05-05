/**
 * @file routes
 * @author Cuttle Cong
 * @date 2018/5/2
 * @description
 */
import app from './pages/app'


export default {
  path: '/',
  component: app,
  indexRoute: {
    getComponent: app.home
  },
  childRoutes: [
    {
      path: '/login',
      getComponent: app.login
    },
    {
      path: '/signup',
      getComponent: app.signup
    },
    {
      path: '/playground/:id',
      getComponent: app.playground
    }
  ]
}

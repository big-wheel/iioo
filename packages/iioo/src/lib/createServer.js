/**
 * @file: createServer
 * @author: Cuttle Cong
 * @date: 2018/1/17
 * @description:
 */


export default async function createServer(port) {
  return new Promise(resolve => {
    const app = require('express')()
    app.__server = app.listen(port, () => {
      resolve(app)
    })
  })
}

/**
 * @file wrapHandle
 * @author Cuttle Cong
 * @date 2018/5/3
 * @description
 */

export default function wrapHandle(handle) {
  return async function(req, res, next) {
    try {
      return await handle.apply(this, arguments)
    } catch (e) {
      if (e) {
        console.error('URL:', req.originalUrl)
        console.error(e)
        res.json({ status: 'fail', message: e.stack || e.toString() })
      }
    }
  }
}

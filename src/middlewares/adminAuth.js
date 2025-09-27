import { isAuth } from './auth.js'

export const isAdmin = async (req, res, next) => {
  await isAuth(req, res, async () => {
    if (req.user && req.user.role === 'admin') {
      next()
    } else {
      return res.status(403).json({ message: 'Forbidden: Admins only' })
    }
  })
}

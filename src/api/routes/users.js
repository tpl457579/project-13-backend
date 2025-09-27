import { Router } from 'express'
import { isAuth } from '../../middlewares/auth.js'
import {
  getUsers,
  getUserById,
  register,
  login,
  updateUser,
  deleteUser,
  toggleFavourite,
  getFavourites
} from '../controllers/users.js'

const usersRouter = Router()

// Public routes
usersRouter.post('/register', register)
usersRouter.post('/login', login)

usersRouter.get('/', isAuth, getUsers)
usersRouter.get('/:id/favourites', isAuth, getFavourites)
usersRouter.get('/:id', isAuth, getUserById)
usersRouter.put('/:id', isAuth, updateUser)
usersRouter.put('/favourites/:productId', isAuth, toggleFavourite)
usersRouter.delete('/:id', isAuth, deleteUser)

export default usersRouter

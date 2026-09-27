import { Router } from 'express'
import { getAllUsers, getUserById, deleteUser } from '../controllers/users.controller.js'
import { protectAdmin } from '../middleware/authMiddleware.js'

const router = Router()

router.use(protectAdmin)

router.get('/', getAllUsers)
router.get('/:id', getUserById)
router.delete('/:id', deleteUser)

export default router

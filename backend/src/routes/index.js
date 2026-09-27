import { Router } from 'express'
import { health } from '../controllers/health.controller.js'
import { requireAdmin, requireAuth } from '../middleware/auth.js'
import { notFound } from '../middleware/notFound.js'
import adminRoutes from './admin.routes.js'
import authRoutes from './auth.routes.js'
import boardRoutes from './board.routes.js'

const router = Router()

router.get('/health', health)
router.use('/auth', authRoutes)
router.use('/admin', requireAuth, requireAdmin, adminRoutes)
router.use(requireAuth, boardRoutes)
router.use(notFound)

export default router

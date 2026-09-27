import { Router } from 'express'
import * as auth from '../controllers/auth.controller.js'
import { requireSession } from '../middleware/auth.js'
import { loginLimiter } from '../middleware/rateLimiter.js'
import { validate } from '../middleware/validate.js'
import { changePasswordBody, loginBody } from '../validation/auth.schemas.js'

const router = Router()

router.post('/login', loginLimiter, validate({ body: loginBody }), auth.login)
router.post('/logout', auth.logout)
router.get('/me', requireSession, auth.me)
router.post('/change-password', requireSession, validate({ body: changePasswordBody }), auth.changePassword)

export default router

import { Router } from 'express'
import * as members from '../controllers/admin/members.controller.js'
import * as points from '../controllers/admin/points.controller.js'
import * as rules from '../controllers/admin/rules.controller.js'
import { validate } from '../middleware/validate.js'
import {
  applyPointsBody,
  createMemberBody,
  createRuleBody,
  listEventsQuery,
  listMembersQuery,
  listRulesQuery,
  memberStatusBody,
  resetPasswordBody,
  updateMemberBody,
  updateRuleBody,
} from '../validation/admin.schemas.js'
import { idParams } from '../validation/common.js'

/** Admin-only (mounted behind requireAuth + requireAdmin in routes/index.js). */
const router = Router()

router.get('/members', validate({ query: listMembersQuery }), members.list)
router.post('/members', validate({ body: createMemberBody }), members.create)
router.patch('/members/:id', validate({ params: idParams, body: updateMemberBody }), members.update)
router.patch('/members/:id/status', validate({ params: idParams, body: memberStatusBody }), members.setStatus)
router.post(
  '/members/:id/reset-password',
  validate({ params: idParams, body: resetPasswordBody }),
  members.resetPassword
)

router.get('/rules', validate({ query: listRulesQuery }), rules.list)
router.post('/rules', validate({ body: createRuleBody }), rules.create)
router.patch('/rules/:id', validate({ params: idParams, body: updateRuleBody }), rules.update)
router.delete('/rules/:id', validate({ params: idParams }), rules.archive)

router.post('/points', validate({ body: applyPointsBody }), points.apply)

router.get('/events', validate({ query: listEventsQuery }), points.listLog)
router.patch('/events/:id/void', validate({ params: idParams }), points.reverse)

export default router

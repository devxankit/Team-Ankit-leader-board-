import { archiveRule, createRule, listRules, updateRule } from '../../services/rule.service.js'
import { sendCreated, sendOk } from '../../utils/respond.js'

export async function list(req, res) {
  sendOk(res, { items: await listRules(req.valid.query) })
}

export async function create(req, res) {
  const rule = await createRule(req.body)
  sendCreated(res, { rule }, `Rule "${rule.label}" created.`)
}

export async function update(req, res) {
  const rule = await updateRule(req.valid.params.id, req.body)
  sendOk(res, { rule }, `Rule "${rule.label}" updated.`)
}

export async function archive(req, res) {
  const rule = await archiveRule(req.valid.params.id)
  sendOk(res, { rule }, `Rule "${rule.label}" archived.`)
}

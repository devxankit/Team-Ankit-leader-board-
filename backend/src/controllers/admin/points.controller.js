import { applyPoints, listEvents, voidEvent } from '../../services/points.service.js'
import { sendCreated, sendOk } from '../../utils/respond.js'

const signed = (points) => (points > 0 ? `+${points}` : `${points}`)
const people = (count) => `${count} ${count === 1 ? 'person' : 'people'}`

export async function apply(req, res) {
  const result = await applyPoints({ ...req.body, adminId: req.user._id })
  sendCreated(res, result, `${signed(result.points)} applied to ${people(result.count)}.`)
}

export async function listLog(req, res) {
  sendOk(res, await listEvents(req.valid.query))
}

export async function reverse(req, res) {
  const event = await voidEvent(req.valid.params.id, req.user._id)
  sendOk(res, { event }, 'Entry reversed.')
}

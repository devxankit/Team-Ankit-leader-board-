import { createMember, listMembers, setMemberStatus, updateMember } from '../../services/member.service.js'
import { sendCreated, sendOk } from '../../utils/respond.js'

export async function list(req, res) {
  sendOk(res, { items: await listMembers(req.valid.query) })
}

export async function create(req, res) {
  const member = await createMember(req.body)
  sendCreated(res, { member }, `${member.name} was added to the team.`)
}

export async function update(req, res) {
  const member = await updateMember(req.valid.params.id, req.body)
  sendOk(res, { member }, `${member.name} was updated.`)
}

export async function setStatus(req, res) {
  const member = await setMemberStatus(req.valid.params.id, req.body.isActive)
  const verb = member.isActive ? 'reactivated' : 'deactivated'
  sendOk(res, { member }, `${member.name} was ${verb}.`)
}

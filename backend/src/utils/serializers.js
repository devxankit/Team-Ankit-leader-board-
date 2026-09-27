import { pointsType } from './points.js'

/** Shapes database documents into API responses. */

const idOf = (value) => {
  const id = value?._id ?? value
  return id == null ? null : String(id)
}

const isPopulated = (ref) => ref != null && typeof ref === 'object' && 'name' in ref

const personRef = (ref) => (isPopulated(ref) ? { id: idOf(ref), name: ref.name } : null)

export function toPublicMember(user) {
  return {
    id: idOf(user),
    name: user.name,
    designation: user.designation ?? '',
    avatarColor: user.avatarColor,
  }
}

/** The signed-in admin. */
export function toSessionUser(user) {
  return { ...toPublicMember(user), email: user.email, role: user.role }
}

export function toAdminMember(user) {
  return {
    ...toPublicMember(user),
    isActive: user.isActive,
    isDemo: Boolean(user.isDemo),
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }
}

export function toRule(rule) {
  return {
    id: idOf(rule),
    label: rule.label,
    points: rule.points,
    type: pointsType(rule.points),
    category: rule.category,
    icon: rule.icon ?? '',
    isActive: rule.isActive,
    createdAt: rule.createdAt,
    updatedAt: rule.updatedAt,
  }
}

export function toPublicEvent(event) {
  return {
    id: idOf(event),
    member: isPopulated(event.member) ? toPublicMember(event.member) : { id: idOf(event.member) },
    ruleLabel: event.ruleLabel,
    points: event.points,
    type: pointsType(event.points),
    note: event.note ?? '',
    createdAt: event.createdAt,
  }
}

export function toAdminEvent(event) {
  const base = toPublicEvent(event)
  return {
    ...base,
    member: isPopulated(event.member)
      ? { ...base.member, isActive: event.member.isActive ?? true }
      : base.member,
    rule: idOf(event.rule),
    batchId: idOf(event.batchId),
    givenBy: personRef(event.givenBy),
    isVoided: Boolean(event.isVoided),
    voidedBy: personRef(event.voidedBy),
    voidedAt: event.voidedAt ?? null,
  }
}

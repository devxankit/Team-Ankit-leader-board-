/**
 * Reusable seeding steps. The CLI entry points (seed.js, seed-demo.js,
 * dev-memory.js) connect to a database and call these.
 */
import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'
import { DateTime } from 'luxon'
import { AVATAR_COLORS, PASSWORD_MIN_LENGTH, ROLES } from '../config/constants.js'
import { env } from '../config/env.js'
import PointEvent from '../models/PointEvent.js'
import Rule from '../models/Rule.js'
import User from '../models/User.js'

export const STARTER_RULES = [
  { label: 'Task completed', points: 10, category: 'Delivery', icon: '✅' },
  { label: 'Task done before deadline', points: 15, category: 'Delivery', icon: '⚡' },
  { label: 'Project completed', points: 50, category: 'Delivery', icon: '🏆' },
  { label: 'Client appreciation', points: 25, category: 'Client', icon: '🌟' },
  { label: 'Good behaviour', points: 5, category: 'Conduct', icon: '😊' },
  { label: 'Helped a teammate', points: 10, category: 'Teamwork', icon: '🤝' },
  { label: 'Full week on time', points: 10, category: 'Discipline', icon: '📅' },
  { label: 'Missed deadline', points: -15, category: 'Delivery', icon: '⏰' },
  { label: 'Task not completed', points: -10, category: 'Delivery', icon: '❌' },
  { label: 'Late to office/standup', points: -5, category: 'Discipline', icon: '🐢' },
  { label: 'Broke team rules', points: -20, category: 'Discipline', icon: '🚫' },
  { label: 'Wrong behaviour', points: -25, category: 'Conduct', icon: '⚠️' },
]

/**
 * Ensures the admin account from ADMIN_* settings exists. Re-running never
 * changes an existing admin's password unless `resetPassword` is set.
 */
export async function seedAdmin({ name, email, password }, { resetPassword = false, log = console.log } = {}) {
  if (!email || !password) {
    throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD in backend/.env before seeding.')
  }
  if (password.length < PASSWORD_MIN_LENGTH) {
    throw new Error(`ADMIN_PASSWORD must be at least ${PASSWORD_MIN_LENGTH} characters.`)
  }

  const existing = await User.findOne({ email })
  if (existing) {
    const notes = []
    if (existing.role !== ROLES.ADMIN) {
      existing.role = ROLES.ADMIN
      notes.push('promoted to admin')
    }
    if (!existing.isActive) {
      existing.isActive = true
      notes.push('reactivated')
    }
    if (resetPassword) {
      await existing.setPassword(password)
      existing.mustChangePassword = false
      notes.push('password reset from ADMIN_PASSWORD')
    }
    await existing.save()
    log(`✓ Admin ${email} already exists${notes.length ? ` (${notes.join(', ')})` : ' — password unchanged'}`)
    return existing
  }

  const admin = new User({ name, email, role: ROLES.ADMIN, designation: 'Team Lead' })
  await admin.setPassword(password)
  await admin.save()
  log(`✓ Admin created: ${email}`)
  return admin
}

/** Inserts any starter rule whose label doesn't exist yet (case-insensitive). */
export async function seedStarterRules({ log = console.log } = {}) {
  let created = 0
  for (const rule of STARTER_RULES) {
    const exists = await Rule.exists({ label: rule.label }).collation({ locale: 'en', strength: 2 })
    if (!exists) {
      await Rule.create(rule)
      created += 1
    }
  }
  log(`✓ Starter rules: ${created} created, ${STARTER_RULES.length - created} already present`)
}

// ── Demo team ──────────────────────────────────────────────────────────────

export const DEMO_PASSWORD = 'Demo@12345'

/**
 * `skill` is the chance a given entry is a reward. `hotStreak` members get no
 * penalties in the last week (🔥), `surge` members pick up extra rewards in the
 * last week (they climb ▲), and `joinedDaysAgo` makes someone NEW.
 */
const DEMO_MEMBERS = [
  { name: 'Priya Sharma', email: 'priya@example.com', designation: 'MERN Developer', skill: 0.86, hotStreak: true },
  { name: 'Rahul Verma', email: 'rahul@example.com', designation: 'Backend Developer', skill: 0.78 },
  { name: 'Sneha Patel', email: 'sneha@example.com', designation: 'UI/UX Designer', skill: 0.8, hotStreak: true },
  { name: 'Arjun Mehta', email: 'arjun@example.com', designation: 'Frontend Developer', skill: 0.66, surge: true },
  { name: 'Kavya Iyer', email: 'kavya@example.com', designation: 'QA Engineer', skill: 0.7 },
  { name: 'Rohan Gupta', email: 'rohan@example.com', designation: 'DevOps Engineer', skill: 0.6 },
  { name: 'Ananya Singh', email: 'ananya@example.com', designation: 'Project Coordinator', skill: 0.4 },
  { name: 'Vikram Nair', email: 'vikram@example.com', designation: 'MERN Developer (Intern)', skill: 0.75, joinedDaysAgo: 3 },
]

const REWARD_WEIGHTS = {
  'Task completed': 40,
  'Task done before deadline': 22,
  'Helped a teammate': 15,
  'Good behaviour': 12,
  'Client appreciation': 6,
  'Project completed': 3,
}

const PENALTY_WEIGHTS = {
  'Late to office/standup': 40,
  'Task not completed': 25,
  'Missed deadline': 20,
  'Broke team rules': 10,
  'Wrong behaviour': 5,
}

const NOTES = [
  'Shipped the payments module',
  'Fixed the login bug before the demo',
  'Great client call today',
  'Reviewed five PRs',
  'Stayed back to unblock the release',
  'Standup at 10:20',
  'Missed the sprint review',
  'Paired with the intern all afternoon',
  'Dashboard redesign signed off',
  'Hotfix pushed within the hour',
]

/** Small deterministic PRNG so the demo looks the same on every run. */
function mulberry32(seed) {
  let state = seed
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function weightedPick(random, weights) {
  const entries = Object.entries(weights)
  let roll = random() * entries.reduce((sum, [, weight]) => sum + weight, 0)
  for (const [label, weight] of entries) {
    roll -= weight
    if (roll <= 0) return label
  }
  return entries[0][0]
}

/**
 * Creates eight demo members and ~6 weeks of believable history so the podium,
 * trends, levels and 🔥 badges have something to show. Safe to re-run: members
 * are only created once and history is only generated for members without any.
 */
export async function seedDemoTeam({ admin, reset = false, now = new Date(), log = console.log }) {
  const emails = DEMO_MEMBERS.map((member) => member.email)

  if (reset) {
    const existing = await User.find({ email: { $in: emails } }).distinct('_id')
    const { deletedCount } = await PointEvent.deleteMany({ member: { $in: existing } })
    await User.deleteMany({ _id: { $in: existing } })
    log(`✓ Removed ${existing.length} demo members and ${deletedCount} of their entries`)
  }

  const rules = new Map((await Rule.find({ isActive: true }).lean()).map((rule) => [rule.label, rule]))
  const missingRules = [...Object.keys(REWARD_WEIGHTS), ...Object.keys(PENALTY_WEIGHTS)].filter((label) => !rules.has(label))
  if (missingRules.length) throw new Error(`Seed the starter rules first (missing: ${missingRules.join(', ')})`)

  const zone = env.timezone
  const today = DateTime.fromJSDate(now, { zone }).startOf('day')
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, env.bcryptRounds)

  const members = []
  for (const [index, demo] of DEMO_MEMBERS.entries()) {
    let member = await User.findOne({ email: demo.email })
    if (!member) {
      const joined = today.minus({ days: demo.joinedDaysAgo ?? 60 }).set({ hour: 10 }).toJSDate()
      member = await User.create({
        name: demo.name,
        email: demo.email,
        designation: demo.designation,
        role: ROLES.MEMBER,
        avatarColor: AVATAR_COLORS[index % AVATAR_COLORS.length],
        passwordHash,
        passwordChangedAt: joined,
        createdAt: joined,
      })
    }
    members.push({ demo, member })
  }

  const random = mulberry32(20260927)
  const events = []

  for (const { demo, member } of members) {
    if (await PointEvent.exists({ member: member._id })) continue

    const firstDay = DateTime.fromJSDate(member.createdAt, { zone }).startOf('day')
    for (let day = firstDay; day <= today; day = day.plus({ days: 1 })) {
      if (day.weekday === 7) continue // Sundays off
      const lastWeek = today.diff(day, 'days').days < 7

      let entries = random() < 0.55 ? 1 : random() < demo.skill ? 2 : 0
      if (lastWeek && demo.surge) entries += 1

      for (let i = 0; i < entries; i += 1) {
        const noPenalties = lastWeek && (demo.hotStreak || demo.surge)
        const isReward = noPenalties || random() < demo.skill
        const label = weightedPick(random, isReward ? REWARD_WEIGHTS : PENALTY_WEIGHTS)
        const rule = rules.get(label)
        const createdAt = day.set({ hour: 9 + Math.floor(random() * 10), minute: Math.floor(random() * 60) }).toJSDate()
        if (createdAt > now) continue

        events.push({
          member: member._id,
          rule: rule._id,
          ruleLabel: rule.label,
          points: rule.points,
          note: random() < 0.3 ? NOTES[Math.floor(random() * NOTES.length)] : '',
          givenBy: admin._id,
          batchId: new mongoose.Types.ObjectId(),
          createdAt,
        })
      }

      // Everyone who kept their streak gets the Friday bonus.
      if (day.weekday === 5 && random() < demo.skill - 0.2) {
        const rule = rules.get('Full week on time')
        events.push({
          member: member._id,
          rule: rule._id,
          ruleLabel: rule.label,
          points: rule.points,
          note: '',
          givenBy: admin._id,
          batchId: new mongoose.Types.ObjectId(),
          createdAt: day.set({ hour: 18 }).toJSDate(),
        })
      }
    }
  }

  if (events.length) {
    await PointEvent.insertMany(events.filter((event) => event.createdAt <= now))

    // A couple of reversed mistakes so the admin log shows what voiding looks like.
    const toVoid = await PointEvent.find({ member: { $in: members.map(({ member }) => member._id) } })
      .sort({ createdAt: -1 })
      .skip(5)
      .limit(2)
    for (const event of toVoid) {
      event.isVoided = true
      event.voidedBy = admin._id
      event.voidedAt = new Date(event.createdAt.getTime() + 20 * 60 * 1000)
      await event.save()
    }
  }

  log(`✓ Demo team: ${members.length} members (password ${DEMO_PASSWORD}), ${events.length} history entries generated`)
  return members.map(({ member }) => member)
}

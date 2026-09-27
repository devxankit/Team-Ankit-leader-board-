import jwt from 'jsonwebtoken'
import request from 'supertest'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import app from '../src/app.js'
import { changeOwnPassword } from '../src/services/auth.service.js'
import { clearTestDb, connectTestDb, disconnectTestDb } from './helpers/db.js'
import { createAdmin, createUser, TEST_PASSWORD } from './helpers/factories.js'

let admin
let member

const sessionCookie = (res) => res.headers['set-cookie'].find((cookie) => cookie.startsWith('ta_session='))

async function signInAsAdmin() {
  const res = await request(app).post('/api/auth/login').send({ email: 'admin@test.dev', password: TEST_PASSWORD })
  expect(res.status).toBe(200)
  return sessionCookie(res).split(';')[0]
}

const tokenFor = (user, secondsAgo = 0) =>
  jwt.sign({ sub: String(user._id), role: user.role, iat: Math.floor(Date.now() / 1000) - secondsAgo }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  })

beforeAll(connectTestDb)
afterAll(disconnectTestDb)

beforeEach(async () => {
  await clearTestDb()
  admin = await createAdmin({ email: 'admin@test.dev' })
  member = await createUser({ name: 'Asha' })
})

describe('public board', () => {
  it('shows the leaderboard, activity and history without signing in', async () => {
    for (const path of ['/api/leaderboard?period=week', '/api/activity', `/api/members/${member._id}/history`]) {
      const res = await request(app).get(path)
      expect(res.status, path).toBe(200)
      expect(res.body.success).toBe(true)
    }
  })

  it('answers "who am I" with null for visitors instead of an error', async () => {
    const res = await request(app).get('/api/auth/me')
    expect(res.status).toBe(200)
    expect(res.body.data).toEqual({ user: null })
  })

  it('keeps every admin endpoint closed to visitors', async () => {
    const attempts = [
      request(app).get('/api/admin/members'),
      request(app).post('/api/admin/points').send({ memberIds: [String(member._id)], custom: { label: 'Hack', points: 999 } }),
      request(app).post('/api/admin/rules').send({ label: 'Free points', type: 'reward', points: 100 }),
      request(app).patch(`/api/admin/events/${String(member._id)}/void`),
    ]
    for (const res of await Promise.all(attempts)) {
      expect(res.status).toBe(401)
      expect(res.body.code).toBe('UNAUTHENTICATED')
    }
  })
})

describe('admin sign-in', () => {
  it('signs the admin in with an httpOnly cookie and the standard envelope', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'ADMIN@test.dev', password: TEST_PASSWORD })

    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({ success: true, data: { user: { email: 'admin@test.dev', role: 'admin' } } })
    expect(res.body.data.user).not.toHaveProperty('passwordHash')
    expect(sessionCookie(res)).toMatch(/HttpOnly/i)
    expect(sessionCookie(res)).toMatch(/SameSite=Lax/i)
  })

  it('rejects a wrong password without saying which part was wrong', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'admin@test.dev', password: 'nope-nope' })
    expect(res.status).toBe(401)
    expect(res.body).toMatchObject({ success: false, code: 'INVALID_CREDENTIALS' })
  })

  it('lets the admin manage the team, with per-field validation errors', async () => {
    const cookie = await signInAsAdmin()

    const list = await request(app).get('/api/admin/members').set('Cookie', cookie)
    expect(list.status).toBe(200)
    expect(list.body.data.items.map((m) => m.name)).toEqual(['Asha'])

    const created = await request(app).post('/api/admin/members').set('Cookie', cookie).send({ name: 'Bala', designation: 'QA' })
    expect(created.status).toBe(201)
    expect(created.body.data.member).toMatchObject({ name: 'Bala', designation: 'QA', isActive: true })

    const invalid = await request(app).post('/api/admin/points').set('Cookie', cookie).send({})
    expect(invalid.status).toBe(422)
    expect(invalid.body.fieldErrors).toHaveProperty('memberIds')
  })

  it('ends older sessions when the admin changes the password', async () => {
    const olderToken = tokenFor(admin, 60)
    await changeOwnPassword(admin._id, TEST_PASSWORD, 'BrandNewPass123')

    const res = await request(app).get('/api/admin/members').set('Cookie', `ta_session=${olderToken}`)
    expect(res.status).toBe(401)
    expect(res.body.code).toBe('SESSION_REVOKED')
  })

  it('never accepts a session for a teammate', async () => {
    const res = await request(app).get('/api/admin/members').set('Cookie', `ta_session=${tokenFor(member)}`)
    expect(res.status).toBe(401)
    expect(res.body.code).toBe('SESSION_INVALID')
  })

  it('rejects writes coming from another website (CSRF guard)', async () => {
    const cookie = await signInAsAdmin()
    const res = await request(app)
      .post('/api/admin/points')
      .set('Cookie', cookie)
      .set('Origin', 'https://evil.example')
      .send({ memberIds: [String(member._id)], custom: { label: 'Sneaky', points: 5 } })
    expect(res.status).toBe(403)
    expect(res.body.code).toBe('ORIGIN_NOT_ALLOWED')
  })
})

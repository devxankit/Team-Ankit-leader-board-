import jwt from 'jsonwebtoken'
import request from 'supertest'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import app from '../src/app.js'
import { resetMemberPassword, setMemberStatus } from '../src/services/member.service.js'
import { clearTestDb, connectTestDb, disconnectTestDb } from './helpers/db.js'
import { createAdmin, createUser, TEST_PASSWORD } from './helpers/factories.js'

let admin
let member

async function signIn(user) {
  const res = await request(app).post('/api/auth/login').send({ email: user.email, password: TEST_PASSWORD })
  expect(res.status).toBe(200)
  return res.headers['set-cookie'].find((cookie) => cookie.startsWith('ta_session=')).split(';')[0]
}

beforeAll(connectTestDb)
afterAll(disconnectTestDb)

beforeEach(async () => {
  await clearTestDb()
  admin = await createAdmin({ email: 'admin@test.dev' })
  member = await createUser({ name: 'Asha', email: 'asha@test.dev' })
})

describe('auth', () => {
  it('signs in with an httpOnly session cookie and the standard envelope', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'ASHA@test.dev', password: TEST_PASSWORD })

    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({ success: true, data: { user: { email: 'asha@test.dev', role: 'member' } } })
    expect(res.body.data.user).not.toHaveProperty('passwordHash')
    const cookie = res.headers['set-cookie'].find((c) => c.startsWith('ta_session='))
    expect(cookie).toMatch(/HttpOnly/i)
    expect(cookie).toMatch(/SameSite=Lax/i)
  })

  it('rejects a wrong password without saying which part was wrong', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'asha@test.dev', password: 'nope-nope' })
    expect(res.status).toBe(401)
    expect(res.body).toMatchObject({ success: false, code: 'INVALID_CREDENTIALS' })
  })

  it('requires a session for member views', async () => {
    const res = await request(app).get('/api/leaderboard')
    expect(res.status).toBe(401)
    expect(res.body.code).toBe('UNAUTHENTICATED')
  })
})

describe('role guard', () => {
  it('blocks members from every admin endpoint on the server', async () => {
    const cookie = await signIn(member)
    const attempts = [
      request(app).get('/api/admin/members').set('Cookie', cookie),
      request(app).post('/api/admin/points').set('Cookie', cookie).send({ memberIds: [String(member._id)], custom: { label: 'Hack', points: 999 } }),
      request(app).post('/api/admin/rules').set('Cookie', cookie).send({ label: 'Free points', type: 'reward', points: 100 }),
      request(app).patch(`/api/admin/events/${String(member._id)}/void`).set('Cookie', cookie),
    ]
    for (const res of await Promise.all(attempts)) {
      expect(res.status).toBe(403)
      expect(res.body.code).toBe('ADMIN_ONLY')
    }
  })

  it('lets the admin in, and validates input with per-field errors', async () => {
    const cookie = await signIn(admin)
    expect((await request(app).get('/api/admin/members').set('Cookie', cookie)).status).toBe(200)

    const res = await request(app).post('/api/admin/points').set('Cookie', cookie).send({})
    expect(res.status).toBe(422)
    expect(res.body.fieldErrors).toHaveProperty('memberIds')
  })
})

describe('sessions', () => {
  it('makes members on a temporary password set their own before anything else', async () => {
    await resetMemberPassword(String(member._id), TEST_PASSWORD)
    const cookie = await signIn(member)

    const blocked = await request(app).get('/api/leaderboard').set('Cookie', cookie)
    expect(blocked.status).toBe(403)
    expect(blocked.body.code).toBe('PASSWORD_CHANGE_REQUIRED')

    const changed = await request(app)
      .post('/api/auth/change-password')
      .set('Cookie', cookie)
      .send({ currentPassword: TEST_PASSWORD, newPassword: 'MyOwnPass123' })
    expect(changed.status).toBe(200)
    const fresh = changed.headers['set-cookie'].find((c) => c.startsWith('ta_session=')).split(';')[0]
    expect((await request(app).get('/api/leaderboard').set('Cookie', fresh)).status).toBe(200)
  })

  it('ends sessions at once on deactivation and on password reset', async () => {
    const cookie = await signIn(member)
    await setMemberStatus(String(member._id), false)
    const deactivated = await request(app).get('/api/leaderboard').set('Cookie', cookie)
    expect(deactivated.status).toBe(401)
    expect(deactivated.body.code).toBe('ACCOUNT_DEACTIVATED')

    await setMemberStatus(String(member._id), true)
    const olderToken = jwt.sign(
      { sub: String(member._id), role: 'member', iat: Math.floor(Date.now() / 1000) - 60 },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )
    await resetMemberPassword(String(member._id), 'TemporaryPass9')
    const revoked = await request(app).get('/api/auth/me').set('Cookie', `ta_session=${olderToken}`)
    expect(revoked.status).toBe(401)
    expect(revoked.body.code).toBe('SESSION_REVOKED')
  })

  it('rejects writes coming from another website (CSRF guard)', async () => {
    const cookie = await signIn(admin)
    const res = await request(app)
      .post('/api/admin/points')
      .set('Cookie', cookie)
      .set('Origin', 'https://evil.example')
      .send({ memberIds: [String(member._id)], custom: { label: 'Sneaky', points: 5 } })
    expect(res.status).toBe(403)
    expect(res.body.code).toBe('ORIGIN_NOT_ALLOWED')
  })
})

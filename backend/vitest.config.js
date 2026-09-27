import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js'],
    env: {
      NODE_ENV: 'test',
      JWT_SECRET: 'test-only-secret-that-is-at-least-32-characters',
      APP_TIMEZONE: 'Asia/Kolkata',
      BCRYPT_ROUNDS: '4',
      CLIENT_URL: 'http://localhost:5173',
    },
    // The first run downloads a MongoDB binary for the in-memory database.
    hookTimeout: 180_000,
    testTimeout: 30_000,
  },
})

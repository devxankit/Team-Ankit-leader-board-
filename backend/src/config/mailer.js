import nodemailer from 'nodemailer'
import { env } from './env.js'

/**
 * Lazily-created, cached SMTP transport.
 *
 * Only built when MAIL_PROVIDER=smtp, so nothing tries to connect to a mail
 * server in development or in the Resend/console configurations.
 */
let transport = null

export function getSmtpTransport() {
  if (transport) return transport

  const { host, port, secure, user, pass } = env.mail.smtp

  transport = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: user ? { user, pass } : undefined,
  })

  return transport
}

/** Verifies SMTP credentials at startup so misconfiguration surfaces immediately. */
export async function verifyMailTransport() {
  if (env.mail.provider !== 'smtp' || !env.mail.smtp.host) return

  try {
    await getSmtpTransport().verify()
    console.log(`[mail] SMTP transport ready (${env.mail.smtp.host})`)
  } catch (error) {
    console.error('[mail] SMTP verification failed:', error.message)
  }
}

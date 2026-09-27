import { env, isMailConfigured } from '../config/env.js'
import { getSmtpTransport } from '../config/mailer.js'

/**
 * Email dispatch with a pluggable provider (PRD B9).
 *
 * Three providers, selected by MAIL_PROVIDER:
 *   smtp    — Nodemailer against any SMTP server
 *   resend  — the Resend HTTP API (via global fetch; no SDK dependency)
 *   console — logs the message instead of sending it
 *
 * `console` is the default so the forms are fully testable the moment the repo
 * is cloned, with no mail account required. Startup warns whenever it is
 * active, and loudly in production.
 *
 * @typedef {Object} MailMessage
 * @property {string} subject
 * @property {string} html
 * @property {string} text
 * @property {string} [replyTo]
 * @property {Array<{filename: string, content: Buffer, contentType: string}>} [attachments]
 */

/**
 * @param {MailMessage} message
 * @returns {Promise<{provider: string, delivered: boolean}>}
 */
export async function sendMail(message) {
  const provider = isMailConfigured ? env.mail.provider : 'console'

  switch (provider) {
    case 'smtp':
      return sendViaSmtp(message)
    case 'resend':
      return sendViaResend(message)
    default:
      return sendViaConsole(message)
  }
}

async function sendViaSmtp(message) {
  await getSmtpTransport().sendMail({
    from: env.mail.from,
    to: env.mail.to,
    replyTo: message.replyTo,
    subject: message.subject,
    text: message.text,
    html: message.html,
    attachments: message.attachments,
  })

  return { provider: 'smtp', delivered: true }
}

async function sendViaResend(message) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.mail.resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: env.mail.from,
      to: env.mail.to,
      reply_to: message.replyTo,
      subject: message.subject,
      text: message.text,
      html: message.html,
      attachments: message.attachments?.map((attachment) => ({
        filename: attachment.filename,
        content: attachment.content.toString('base64'),
      })),
    }),
    signal: AbortSignal.timeout(15000),
  })

  if (!response.ok) {
    const detail = await response.text().catch(() => '')
    throw new Error(`Resend API responded ${response.status}: ${detail}`)
  }

  return { provider: 'resend', delivered: true }
}

function sendViaConsole(message) {
  const attachmentNote = message.attachments?.length
    ? `\nAttachments: ${message.attachments
        .map((file) => `${file.filename} (${file.content.length} bytes)`)
        .join(', ')}`
    : ''

  console.log(
    [
      '',
      '─'.repeat(72),
      '[mail:console] Email NOT sent — no mail provider configured.',
      `To:      ${env.mail.to.join(', ')}`,
      `From:    ${env.mail.from}`,
      `ReplyTo: ${message.replyTo ?? '—'}`,
      `Subject: ${message.subject}`,
      '─'.repeat(72),
      message.text + attachmentNote,
      '─'.repeat(72),
      '',
    ].join('\n')
  )

  return Promise.resolve({ provider: 'console', delivered: false })
}

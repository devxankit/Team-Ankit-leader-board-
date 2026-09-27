const ESCAPES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

/**
 * Escapes user-supplied text before it is interpolated into an HTML email.
 *
 * Without this, a submitted message containing markup would be rendered as
 * markup in the recipient's mail client.
 *
 * @param {unknown} value
 * @returns {string}
 */
export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (character) => ESCAPES[character])
}

/** Escapes text and converts newlines to <br>, for multi-line fields. */
export function escapeHtmlMultiline(value) {
  return escapeHtml(value).replace(/\r?\n/g, '<br />')
}

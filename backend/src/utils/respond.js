/** Every successful response has the shape { success: true, data, message }. */
export function sendOk(res, data = null, message = '', status = 200) {
  return res.status(status).json({ success: true, data, message })
}

export function sendCreated(res, data = null, message = '') {
  return sendOk(res, data, message, 201)
}

import path from 'node:path'
import multer from 'multer'
import { env } from '../config/env.js'
import { ApiError } from '../utils/ApiError.js'

/**
 * Resume upload for the Career form (PRD A5 / B6.3).
 *
 * Files are held in memory and attached straight to the outgoing email — the
 * server never writes applicant CVs to disk, so there is no upload directory to
 * secure, back up or clean out.
 *
 * Both the MIME type and the file extension are checked: browsers report
 * inconsistent MIME types for .doc/.docx, and extension alone is trivially
 * spoofed, so a file has to satisfy both.
 */
const storage = multer.memoryStorage()

function fileFilter(req, file, cb) {
  const extension = path.extname(file.originalname).toLowerCase()
  const extensionAllowed = env.upload.allowedExtensions.includes(extension)
  const mimeAllowed = env.upload.allowedMimeTypes.includes(file.mimetype)

  if (extensionAllowed && mimeAllowed) {
    cb(null, true)
    return
  }

  cb(
    ApiError.validation('Please correct the highlighted fields.', {
      resume: `Upload a PDF or Word document (${env.upload.allowedExtensions.join(', ')}).`,
    })
  )
}

export const uploadResume = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: env.upload.maxFileSizeBytes,
    files: 1,
    // Cap non-file fields too, so a multipart body can't be used to flood memory.
    fields: 20,
    fieldSize: 100 * 1024,
  },
}).single('resume')

/**
 * Rejects a career application with no attachment.
 *
 * multer treats the file as optional, so this enforces the same "resume
 * required" rule the client applies — otherwise a request bypassing the browser
 * could submit an application with nothing attached.
 */
export function requireResume(req, res, next) {
  if (!req.file) {
    throw ApiError.validation('Please correct the highlighted fields.', {
      resume: 'Please attach your resume',
    })
  }

  next()
}

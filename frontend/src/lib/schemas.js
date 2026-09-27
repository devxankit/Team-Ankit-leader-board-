import { z } from 'zod'

/**
 * Client-side validation for the Contact and Career forms.
 *
 * Mirrors backend/src/validation/formSchemas.js — the two live in separate
 * packages so they cannot share a module. These exist for instant feedback;
 * the server revalidates everything and is the authority. Any rule changed here
 * must be changed there too.
 *
 * Field sets come from PRD A5: Career is Contact plus address, designation and
 * a resume upload.
 */

export const MAX_RESUME_BYTES = 5 * 1024 * 1024

export const ACCEPTED_RESUME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

const name = z
  .string()
  .trim()
  .min(2, 'Please enter your name')
  .max(80, 'Name must be 80 characters or fewer')
  .regex(
    /^[\p{L}\p{M}][\p{L}\p{M}\s'.-]*$/u,
    'Name may only contain letters, spaces, apostrophes, hyphens and full stops'
  )

const email = z
  .string()
  .trim()
  .min(1, 'Please enter your email address')
  .max(254, 'Email address is too long')
  .email('Please enter a valid email address')

const phone = z
  .string()
  .trim()
  .min(1, 'Please enter your phone number')
  .refine(
    (value) => /^(?:\+?91|0)?[6-9]\d{9}$/.test(value.replace(/[\s()-]/g, '')),
    'Please enter a valid 10-digit Indian mobile number'
  )

const message = z
  .string()
  .trim()
  .min(10, 'Please tell us a little more (at least 10 characters)')
  .max(5000, 'Message must be 5000 characters or fewer')

/** Hidden honeypot — registered on the form but never shown to real users. */
const website = z.string().max(200).optional()

export const contactSchema = z.object({
  name,
  email,
  phone,
  message,
  website,
})

export const careerSchema = z.object({
  name,
  email,
  phone,
  address: z
    .string()
    .trim()
    .min(5, 'Please enter your address')
    .max(300, 'Address must be 300 characters or fewer'),
  designation: z
    .string()
    .trim()
    .min(2, 'Please enter the role you are applying for')
    .max(120, 'Designation must be 120 characters or fewer'),
  message,
  website,
  /**
   * A file input hands React Hook Form a FileList, not a File. Validated here
   * for immediate feedback; the server re-checks extension and MIME type,
   * since neither can be trusted from the browser.
   */
  resume: z
    .custom(
      (value) => value instanceof FileList && value.length === 1,
      'Please attach your resume'
    )
    .refine(
      (value) => value[0].size <= MAX_RESUME_BYTES,
      `Your file must be ${Math.round(MAX_RESUME_BYTES / (1024 * 1024))} MB or smaller`
    )
    .refine(
      (value) =>
        ACCEPTED_RESUME_TYPES.includes(value[0].type) ||
        /\.(pdf|docx?)$/i.test(value[0].name),
      'Upload a PDF or Word document (.pdf, .doc, .docx)'
    ),
})

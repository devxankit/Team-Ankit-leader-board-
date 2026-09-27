import { submitContactFormAPI, submitCareerFormAPI } from './api'

export async function submitContact(values, meta) {
  const payload = {
    name: values.name,
    email: values.email,
    phone: values.phone || '',
    message: values.message,
    division: values.division || 'General Inquiry',
    formStartedAt: meta.formStartedAt,
  }

  return await submitContactFormAPI(payload)
}

export async function submitCareer(values, meta) {
  const formData = new FormData()

  formData.append('fullName', values.name || values.fullName || '')
  formData.append('email', values.email || '')
  formData.append('phone', values.phone || '')
  formData.append('division', values.designation || values.division || 'General Application')
  formData.append('message', values.message || '')

  const file = values.resume?.[0]
  if (file) {
    formData.append('resume', file)
  }

  return await submitCareerFormAPI(formData)
}

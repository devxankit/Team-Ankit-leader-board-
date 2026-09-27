import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { careerSchema, MAX_RESUME_BYTES } from '@/lib/schemas'
import { submitCareer } from '@/services/formService'
import { useFormSubmit } from '@/hooks/useFormSubmit'
import FileField from './FileField'
import FloatingField from './FloatingField'
import FormStatus from './FormStatus'
import HoneypotField from './HoneypotField'
import SubmitButton from './SubmitButton'
import TurnstileWidget from './TurnstileWidget'

const MAX_RESUME_MB = Math.round(MAX_RESUME_BYTES / (1024 * 1024))

/**
 * Career application form — PRD B5 / A5.
 *
 * Contact's fields plus address, designation and a resume upload, matching the
 * legacy career.php field set. Like the contact form, the working legacy
 * version was never linked from the navigation (A9.1).
 */
export default function CareerForm() {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(careerSchema),
    mode: 'onBlur',
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      address: '',
      designation: '',
      message: '',
      website: '',
    },
  })

  // Watched so the upload control can show the chosen filename.
  const resume = useWatch({ control, name: 'resume' })

  const { submitState, banner, onSubmit, setCaptchaToken } = useFormSubmit({
    submitFn: submitCareer,
    setError,
    reset,
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
      <FormStatus state={banner.state} message={banner.message} />

      <div className="grid gap-5 sm:grid-cols-2">
        <FloatingField
          label="Your name"
          autoComplete="name"
          error={errors.name?.message}
          {...register('name')}
        />
        <FloatingField
          label="Email address"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <FloatingField
          label="Phone number"
          type="tel"
          autoComplete="tel"
          error={errors.phone?.message}
          {...register('phone')}
        />
        <FloatingField
          label="Role you’re applying for"
          autoComplete="organization-title"
          error={errors.designation?.message}
          {...register('designation')}
        />
      </div>

      <FloatingField
        as="textarea"
        label="Your address"
        rows={3}
        autoComplete="street-address"
        error={errors.address?.message}
        {...register('address')}
      />

      <FloatingField
        as="textarea"
        label="Tell us about yourself"
        rows={6}
        error={errors.message?.message}
        {...register('message')}
      />

      <FileField
        label="Resume"
        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        hint={`PDF or Word document, up to ${MAX_RESUME_MB} MB`}
        value={resume}
        error={errors.resume?.message}
        {...register('resume')}
      />

      <HoneypotField registration={register('website')} />
      <TurnstileWidget onVerify={setCaptchaToken} />

      <div className="mt-1">
        <SubmitButton
          state={submitState}
          idleLabel="Submit application"
          submittingLabel="Submitting…"
          successLabel="Application sent"
        />
      </div>
    </form>
  )
}

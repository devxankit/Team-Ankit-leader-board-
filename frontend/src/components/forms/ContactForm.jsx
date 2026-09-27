import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { contactSchema } from '@/lib/schemas'
import { submitContact } from '@/services/formService'
import { useFormSubmit } from '@/hooks/useFormSubmit'
import FloatingField from './FloatingField'
import FormStatus from './FormStatus'
import HoneypotField from './HoneypotField'
import SubmitButton from './SubmitButton'
import TurnstileWidget from './TurnstileWidget'

/**
 * Contact form — PRD B5 / A5 field set (name, email, phone, message).
 *
 * The legacy equivalent lived in contact-us.php, worked, and was linked from
 * nowhere; the page the nav actually pointed at was an empty template (A9.1).
 */
export default function ContactForm() {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(contactSchema),
    mode: 'onBlur',
    defaultValues: { name: '', email: '', phone: '', message: '', website: '' },
  })

  const { submitState, banner, onSubmit, setCaptchaToken } = useFormSubmit({
    submitFn: submitContact,
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

      <FloatingField
        label="Phone number"
        type="tel"
        autoComplete="tel"
        error={errors.phone?.message}
        {...register('phone')}
      />

      <FloatingField
        as="textarea"
        label="How can we help?"
        rows={6}
        error={errors.message?.message}
        {...register('message')}
      />

      <HoneypotField registration={register('website')} />
      <TurnstileWidget onVerify={setCaptchaToken} />

      <div className="mt-1">
        <SubmitButton
          state={submitState}
          idleLabel="Send message"
          submittingLabel="Sending…"
          successLabel="Message sent"
        />
      </div>
    </form>
  )
}

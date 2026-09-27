import { Copy, WandSparkles } from 'lucide-react'
import { Field, TextInput } from '@/components/ui/Field'
import { copyToClipboard } from '@/lib/clipboard'
import { PASSWORD_MIN_LENGTH } from '@/lib/constants'
import { generatePassword } from '@/lib/password'

/** Temporary password input with Generate and Copy buttons. */
export default function PasswordField({ label = 'Temporary password', value, onChange, error }) {
  return (
    <Field label={label} error={error} hint={`At least ${PASSWORD_MIN_LENGTH} characters. They'll choose their own at first sign-in.`}>
      {(id) => (
        <div className="flex gap-2">
          <TextInput
            id={id}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            error={error}
            autoComplete="off"
            spellCheck={false}
            className="font-mono"
          />
          <button
            type="button"
            onClick={() => onChange(generatePassword())}
            className="grid size-10 shrink-0 place-items-center rounded-xl border border-line text-muted transition hover:bg-subtle hover:text-ink"
            title="Generate a password"
            aria-label="Generate a password"
          >
            <WandSparkles className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => value && copyToClipboard(value, 'Password copied')}
            disabled={!value}
            className="grid size-10 shrink-0 place-items-center rounded-xl border border-line text-muted transition hover:bg-subtle hover:text-ink disabled:opacity-40"
            title="Copy password"
            aria-label="Copy password"
          >
            <Copy className="size-4" />
          </button>
        </div>
      )}
    </Field>
  )
}

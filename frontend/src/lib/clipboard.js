import { toast } from 'sonner'

export async function copyToClipboard(text, successMessage = 'Copied') {
  try {
    await navigator.clipboard.writeText(text)
    toast.success(successMessage)
  } catch {
    toast.error("Couldn't copy — select the text and copy it manually.")
  }
}

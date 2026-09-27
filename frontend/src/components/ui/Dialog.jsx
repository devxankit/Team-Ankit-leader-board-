import { useEffect, useId, useRef } from 'react'
import { X } from 'lucide-react'
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll'
import { cn } from '@/lib/cn'

/**
 * Modal built on the native <dialog>: focus trapping, Esc to close and the top
 * layer come from the browser. `variant="drawer"` is a bottom sheet on phones
 * and a right-hand panel from the `sm` breakpoint up. Children only mount while
 * open, so forms start fresh every time.
 */
export default function Dialog({ open, onClose, title, description, header, footer, variant = 'modal', children }) {
  const ref = useRef(null)
  const titleId = useId()
  useLockBodyScroll(open)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  const drawer = variant === 'drawer'

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
      className={cn(
        'max-h-none max-w-none overflow-visible bg-transparent p-0 backdrop:bg-black/55 backdrop:backdrop-blur-[2px]',
        drawer ? 'mb-0 mt-auto w-full sm:m-0 sm:ml-auto sm:h-dvh sm:w-[440px]' : 'm-auto w-[calc(100%-2rem)] max-w-lg'
      )}
    >
      {open && (
        <div
          className={cn(
            'flex animate-sheet-in flex-col bg-surface text-ink shadow-2xl',
            drawer
              ? 'max-h-[90dvh] rounded-t-3xl pb-[env(safe-area-inset-bottom)] sm:h-full sm:max-h-none sm:rounded-l-3xl sm:rounded-tr-none'
              : 'max-h-[88dvh] rounded-2xl'
          )}
        >
          <header className="flex items-start gap-3 border-b border-line px-5 py-4">
            <div id={titleId} className="min-w-0 flex-1">
              {header ?? (
                <>
                  <h2 className="text-lg font-bold">{title}</h2>
                  {description && <p className="mt-0.5 text-sm text-muted">{description}</p>}
                </>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="-mr-1 grid size-9 place-items-center rounded-xl text-muted transition hover:bg-subtle hover:text-ink"
              aria-label="Close"
            >
              <X className="size-5" />
            </button>
          </header>
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
          {footer && <footer className="border-t border-line px-5 py-3">{footer}</footer>}
        </div>
      )}
    </dialog>
  )
}

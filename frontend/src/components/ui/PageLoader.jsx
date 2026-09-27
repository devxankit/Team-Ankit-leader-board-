export default function PageLoader() {
  return (
    <div role="status" aria-label="Loading" className="flex min-h-[60vh] items-center justify-center">
      <span className="size-9 animate-spin rounded-full border-2 border-line border-t-accent" />
    </div>
  )
}

/**
 * The honeypot input (PRD B6.2).
 *
 * Real users never see or reach this: it is pulled off-screen, hidden from the
 * accessibility tree, and skipped by keyboard tabbing. Bots that fill every
 * input they find will populate it, and the server rejects any submission where
 * it has a value.
 *
 * `autoComplete="off"` matters — without it a browser may helpfully fill in a
 * saved URL and flag a genuine visitor as a bot.
 *
 * @param {object} props.registration - spread from React Hook Form's register()
 */
export default function HoneypotField({ registration }) {
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
      <label htmlFor="website-url">Leave this field empty</label>
      <input
        {...registration}
        id="website-url"
        type="text"
        tabIndex={-1}
        autoComplete="off"
      />
    </div>
  )
}

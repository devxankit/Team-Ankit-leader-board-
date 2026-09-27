import { cn } from '@/lib/cn'

/**
 * Inline SVG icon set.
 *
 * The legacy site pulled in the whole Font Awesome library for about a dozen
 * glyphs. These are the same glyphs as inline paths — no font download, no
 * extra dependency, and they inherit currentColor.
 */
const PATHS = {
  home: 'M3 10.5 12 3l9 7.5M5.25 9.75V20a1 1 0 0 0 1 1h3.5v-5.5h4.5V21h3.5a1 1 0 0 0 1-1V9.75',
  phone:
    'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z',
  shoppingBag:
    'M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4ZM3 6h18M16 10a4 4 0 0 1-8 0',
  mail: 'M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm18 2-10 7L2 6',
  mapPin:
    'M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Zm-8 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  chevronDown: 'm6 9 6 6 6-6',
  chevronUp: 'm18 15-6-6-6 6',
  chevronRight: 'm9 18 6-6-6-6',
  arrowRight: 'M5 12h14m-7-7 7 7-7 7',
  arrowUpRight: 'M7 17 17 7M8 7h9v9',
  menu: 'M3 6h18M3 12h18M3 18h18',
  close: 'M18 6 6 18M6 6l12 12',
  check: 'm20 6-11 11-5-5',
  alert:
    'M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z',
  upload: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12',
  file: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Zm0 0v6h6',
  image:
    'M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Zm2 11 4.5-4.5 3 3L16 11l3 3m-9.5-6a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z',
  building:
    'M3 21h18M5 21V4a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v17M15 21V9h3a1 1 0 0 1 1 1v11M8 7h3M8 11h3M8 15h3',
  spinner: 'M12 3a9 9 0 1 0 9 9',
  facebook: 'M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3Z',
  twitter:
    'M22 4.01c-.79.35-1.63.59-2.5.7a4.36 4.36 0 0 0 1.91-2.41c-.84.5-1.77.86-2.76 1.05A4.35 4.35 0 0 0 11.2 7.3 12.35 12.35 0 0 1 2.24 2.76 4.35 4.35 0 0 0 3.6 8.56c-.71-.02-1.38-.22-1.97-.54v.06a4.35 4.35 0 0 0 3.49 4.26c-.65.18-1.34.2-2 .08a4.35 4.35 0 0 0 4.06 3.02A8.73 8.73 0 0 1 2 17.24a12.31 12.31 0 0 0 6.67 1.95c8 0 12.38-6.63 12.38-12.38l-.01-.56A8.8 8.8 0 0 0 22 4.01Z',
  linkedin:
    'M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6ZM6 9H2v12h4Zm-2-6a2 2 0 1 1 0 4 2 2 0 0 1 0-4Z',
  instagram:
    'M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm5 5.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9ZM17.5 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z',
  youtube:
    'M22.5 7.2a3 3 0 0 0-2.1-2.1C18.6 4.6 12 4.6 12 4.6s-6.6 0-8.4.5A3 3 0 0 0 1.5 7.2C1 9 1 12 1 12s0 3 .5 4.8a3 3 0 0 0 2.1 2.1c1.8.5 8.4.5 8.4.5s6.6 0 8.4-.5a3 3 0 0 0 2.1-2.1C23 15 23 12 23 12s0-3-.5-4.8ZM9.9 15.3V8.7l5.5 3.3Z',
}

/**
 * @param {Object} props
 * @param {keyof typeof PATHS} props.name
 * @param {number} [props.size=20]
 * @param {string} [props.className]
 * @param {string} [props.title] - when set the icon is exposed to screen readers
 */
export default function Icon({ name, size = 20, className, title, ...rest }) {
  const d = PATHS[name]
  if (!d) return null

  const solid = ['facebook', 'twitter', 'linkedin', 'instagram', 'youtube'].includes(name)

  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill={solid ? 'currentColor' : 'none'}
      stroke={solid ? 'none' : 'currentColor'}
      strokeWidth={solid ? 0 : 1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('shrink-0', className)}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : 'true'}
      focusable="false"
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      <path d={d} />
    </svg>
  )
}

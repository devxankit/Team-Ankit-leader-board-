import { Link } from 'react-router-dom'
import { buttonClasses } from '@/lib/buttonStyles'

/** A router link styled as a button. */
export default function ButtonLink({ variant = 'primary', size = 'md', className, ...props }) {
  return <Link className={buttonClasses({ variant, size, className })} {...props} />
}

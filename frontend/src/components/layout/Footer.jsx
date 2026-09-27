import { Link } from 'react-router-dom'
import { siteConfig } from '@/config/site'
import { footerLinks } from '@/data/navigation'
import Logo from './Logo'

export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-slate-400 py-12 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        <div className="space-y-3 md:col-span-2">
          <Logo />
          <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
            {siteConfig.description}
          </p>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">
            Navigation
          </h4>
          <ul className="space-y-2 text-xs">
            {footerLinks.navigation.map((link) => (
              <li key={link.label}>
                <Link to={link.to} className="hover:text-white transition-colors">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">
            Legal & Support
          </h4>
          <ul className="space-y-2 text-xs">
            {footerLinks.legal.map((link) => (
              <li key={link.label}>
                <Link to={link.to} className="hover:text-white transition-colors">
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <a href={`mailto:${siteConfig.contact.email}`} className="hover:text-white transition-colors">
                {siteConfig.contact.email}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
        <p>© {new Date().getFullYear()} {siteConfig.name}. All rights reserved.</p>
        <p>Built with Express + MongoDB + React + Tailwind</p>
      </div>
    </footer>
  )
}

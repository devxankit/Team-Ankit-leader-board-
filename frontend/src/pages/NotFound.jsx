import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-20 text-center">
      <div className="max-w-md space-y-5">
        <p className="text-7xl font-extrabold text-indigo-500 font-mono">404</p>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Page Not Found</h1>
        <p className="text-slate-400 text-sm leading-relaxed">
          The page you are looking for does not exist or has been moved.
        </p>
        <div>
          <Link
            to="/"
            className="inline-flex px-6 py-2.5 rounded-xl font-semibold bg-indigo-600 hover:bg-indigo-500 text-white text-sm shadow-lg shadow-indigo-600/30 transition-all"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}

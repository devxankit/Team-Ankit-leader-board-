export default function About() {
  const folders = [
    { name: 'backend/src/config', desc: 'Environment variables & database connection' },
    { name: 'backend/src/controllers', desc: 'Business logic handlers (Auth, Users)' },
    { name: 'backend/src/middleware', desc: 'Auth guard, rate limit, error handler, upload' },
    { name: 'backend/src/models', desc: 'Mongoose data models' },
    { name: 'backend/src/routes', desc: 'API endpoints definitions' },
    { name: 'frontend/src/components', desc: 'Reusable UI components, layout, forms' },
    { name: 'frontend/src/context', desc: 'React context for auth & global state' },
    { name: 'frontend/src/pages', desc: 'Public and admin application pages' },
    { name: 'frontend/src/services', desc: 'Frontend API client integration' },
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Template Architecture
        </h1>
        <p className="text-slate-400 text-base max-w-xl mx-auto">
          Here is how your ready-to-use template is structured so you can easily plug in new features for any project.
        </p>
      </div>

      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
        <h2 className="text-xl font-semibold text-white border-b border-slate-800 pb-3">
          Directory Structure
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {folders.map((item, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80">
              <code className="text-xs font-mono text-indigo-400 font-semibold">{item.name}</code>
              <p className="text-xs text-slate-400 mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

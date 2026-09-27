import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import PageLoader from '@/components/ui/PageLoader'

export default function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100 font-sans antialiased selection:bg-indigo-500 selection:text-white">
      <Header />

      <main className="flex-1">
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </main>

      <Footer />
    </div>
  )
}

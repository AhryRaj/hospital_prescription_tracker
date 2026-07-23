'use client'

import { usePathname } from 'next/navigation'
import './globals.css'
import { Sidebar } from './components/Sidebar'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isAuthPage = pathname.startsWith('/auth')

  // Auth pages get a clean full-screen layout without sidebar
  if (isAuthPage) {
    return (
      <html lang="en">
        <body className="bg-slate-50 text-slate-900 min-h-screen font-sans antialiased">
          {children}
        </body>
      </html>
    )
  }

  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 min-h-screen font-sans antialiased">
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 w-full pt-16 sm:pt-20 pb-24 sm:pb-28 lg:pt-8 lg:pb-8 p-4 sm:p-6 lg:p-8 min-h-screen overflow-x-hidden overflow-y-auto transition-all duration-300 lg:ml-20">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}

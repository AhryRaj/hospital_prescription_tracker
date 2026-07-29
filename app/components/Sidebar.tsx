'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { 
  LayoutDashboard, 
  PlusCircle, 
  BarChart3, 
  Pill, 
  ClipboardList, 
  Sprout,
  LogOut,
  Loader2,
  X,
  AlertCircle,
  Users
} from 'lucide-react'

interface SessionData {
  userId: number
  hospitalId: number
  email: string
  name: string
  hospitalName: string
}

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [session, setSession] = useState<SessionData | null>(null)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  useEffect(() => {
    fetch('/api/auth/session')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          setSession(data.user)
        }
      })
      .catch(() => {})
  }, [])

  const handleConfirmLogout = async () => {
    setLoggingOut(true)
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      setShowLogoutModal(false)
      router.push('/auth/login')
      router.refresh()
    } catch {
      setLoggingOut(false)
    }
  }

  const navItems = [
    {
      name: 'Overview',
      href: '/',
      icon: LayoutDashboard,
    },
    {
      name: 'Prescribe',
      href: '/prescribe',
      icon: PlusCircle,
    },
    {
      name: 'Expenses',
      href: '/summaries',
      icon: BarChart3,
    },
    {
      name: 'Stats',
      href: '/patient-stats',
      icon: Users,
    },
    {
      name: 'Catalog',
      href: '/drugs',
      icon: Pill,
    },
    {
      name: 'Log',
      href: '/prescriptions',
      icon: ClipboardList,
    },
  ]

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white border-r border-slate-200/80 shadow-2xs">
      {/* Brand Header Logo (Square Badge) */}
      <div className="h-20 flex flex-col items-center justify-center border-b border-slate-100 bg-emerald-700 text-white">
        <img
          src="/icon.png"
          alt="Ayurvedic Hospital Logo"
          className="w-10 h-10 rounded-xl border border-white/40 shadow-xs object-cover"
        />
      </div>

      {/* Navigation Links (Slim Vertical Stack: Icon over Label) */}
      <nav className="flex-1 py-4 space-y-3 overflow-y-auto px-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-xl transition-all group ${
                isActive
                  ? 'bg-emerald-50 text-emerald-800 font-bold shadow-2xs'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
              title={item.name}
            >
              <Icon
                className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                  isActive ? 'text-emerald-700' : 'text-slate-400 group-hover:text-emerald-600'
                }`}
              />
              <span className="text-[10px] font-bold tracking-tight text-center mt-1 truncate max-w-full">
                {item.name}
              </span>
            </Link>
          )
        })}
      </nav>

      {/* Bottom: Sign Out */}
      <div className="border-t border-slate-100 p-2 pb-3">
        <button
          type="button"
          onClick={() => setShowLogoutModal(true)}
          className="flex flex-col items-center justify-center py-2.5 px-1 rounded-xl transition-all group text-slate-400 hover:bg-red-50 hover:text-red-600 w-full cursor-pointer"
          title="Sign Out"
        >
          <LogOut className="w-5 h-5 transition-transform group-hover:scale-110" />
          <span className="text-[10px] font-bold tracking-tight text-center mt-1">
            Sign Out
          </span>
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* 1. Mobile Top Header Bar (< lg) */}
      <div className="no-print lg:hidden fixed top-0 left-0 right-0 h-14 bg-gradient-to-r from-emerald-800 to-teal-800 text-white px-4 flex items-center justify-between z-40 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center border border-white/20">
            <Sprout className="w-4 h-4 text-emerald-300" />
          </div>
          <span className="font-extrabold text-sm tracking-tight truncate max-w-[200px]">
            {session?.hospitalName || 'AyurMed System'}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setShowLogoutModal(true)}
          className="flex items-center gap-1.5 text-white/90 hover:text-white transition-colors px-2.5 py-1.5 rounded-lg hover:bg-white/10 text-xs font-bold bg-white/10 border border-white/20 cursor-pointer"
          title="Exit / Sign Out"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Exit</span>
        </button>
      </div>

      {/* 2. Mobile Bottom Navigation Bar (< lg) */}
      <div className="no-print lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200/80 z-40 flex items-center justify-around px-2 shadow-lg">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
                isActive
                  ? 'text-emerald-700 font-extrabold'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              <div className={`p-1 rounded-lg ${isActive ? 'bg-emerald-50' : ''}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] tracking-tight mt-0.5">
                {item.name}
              </span>
            </Link>
          )
        })}
      </div>

      {/* 3. Persistent Desktop Slim Left Sidebar (w-20 / 80px) */}
      <aside className="no-print hidden lg:block w-20 min-h-screen fixed left-0 top-0 bottom-0 z-30">
        <SidebarContent />
      </aside>

      {/* 4. RESPONSIVE SIGN OUT CONFIRMATION MODAL */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-100 space-y-4 sm:space-y-5 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl border border-rose-100 shrink-0">
                  <LogOut className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base sm:text-lg tracking-tight">
                    Are you sure you want to sign out?
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    You will need to sign back in to access your portal.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Action Buttons (Mobile Stack & Desktop Row) */}
            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                disabled={loggingOut}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer text-center w-full sm:w-auto"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmLogout}
                disabled={loggingOut}
                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2 w-full sm:w-auto disabled:opacity-50"
              >
                {loggingOut ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing Out...</span>
                  </>
                ) : (
                  <>
                    <LogOut className="w-4 h-4" />
                    <span>Yes, Sign Out</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

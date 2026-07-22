'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  PlusCircle, 
  BarChart3, 
  Pill, 
  ClipboardList, 
  Sprout
} from 'lucide-react'

export function Sidebar() {
  const pathname = usePathname()

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
        <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-xs">
          <Sprout className="w-6 h-6 text-white" />
        </div>
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
    </div>
  )

  return (
    <>
      {/* 1. Mobile Top Header Bar (< lg) */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-gradient-to-r from-emerald-800 to-teal-800 text-white px-4 flex items-center justify-between z-40 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center border border-white/20">
            <Sprout className="w-4 h-4 text-emerald-300" />
          </div>
          <span className="font-extrabold text-sm tracking-tight">AyurMed System</span>
        </div>
        <span className="text-[11px] font-bold bg-white/15 px-2.5 py-0.5 rounded-full border border-white/20">
          Prescription Tracker
        </span>
      </div>

      {/* 2. Mobile Bottom Navigation Bar (< lg) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200/80 z-40 flex items-center justify-around px-2 shadow-lg">
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
      <aside className="hidden lg:block w-20 min-h-screen fixed left-0 top-0 bottom-0 z-30">
        <SidebarContent />
      </aside>
    </>
  )
}

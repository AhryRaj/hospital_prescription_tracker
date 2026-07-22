'use client'

import { useState, useRef, useEffect } from 'react'
import { Filter, ChevronDown, Check, Search, X } from 'lucide-react'

interface CategorySelectProps {
  categories: string[]
  selectedCategory: string
  onSelectCategory: (category: string) => void
}

export function CategorySelect({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategorySelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  // Click outside listener to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filteredCategories = categories.filter((cat) =>
    cat.toLowerCase().includes(search.toLowerCase())
  )

  const activeLabel =
    selectedCategory === 'all'
      ? `All Categories (${categories.length})`
      : selectedCategory

  return (
    <div className="relative w-full sm:w-64" ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3.5 py-2 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/90 rounded-xl text-xs font-bold text-slate-800 flex items-center justify-between gap-2 shadow-2xs transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
      >
        <div className="flex items-center gap-2 truncate">
          <Filter className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span className="truncate text-slate-700">{activeLabel}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Floating Category Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-1.5 w-full sm:w-72 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-2 space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Quick Category Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search category..."
              className="w-full pl-8 pr-7 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              autoFocus
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2 top-2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Options List */}
          <div className="max-h-60 overflow-y-auto divide-y divide-slate-50 space-y-0.5 pr-0.5">
            {/* All Categories Option */}
            <button
              type="button"
              onClick={() => {
                onSelectCategory('all')
                setIsOpen(false)
                setSearch('')
              }}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-emerald-50 text-emerald-900'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span>All Categories ({categories.length})</span>
              {selectedCategory === 'all' && <Check className="w-3.5 h-3.5 text-emerald-700" />}
            </button>

            {/* Individual Categories */}
            {filteredCategories.length === 0 ? (
              <div className="p-3 text-center text-xs text-slate-400 font-medium">
                No matching category
              </div>
            ) : (
              filteredCategories.map((cat) => {
                const isSelected = selectedCategory === cat
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      onSelectCategory(cat)
                      setIsOpen(false)
                      setSearch('')
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50 text-emerald-900'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="truncate">{cat}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0" />}
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}

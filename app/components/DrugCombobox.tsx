'use client'

import { useState, useRef, useEffect } from 'react'
import { Search, ChevronDown, Check, Sprout, Building2 } from 'lucide-react'

export interface DrugOption {
  id: number
  name: string
  category: string
  size_amount: number
  size_unit: string
  unit_price: number
  standard_dose?: number
}

interface DrugComboboxProps {
  drugs: DrugOption[]
  selectedDrugId: number | 'all' | ''
  onSelect: (drugId: number | 'all') => void
  placeholder?: string
  includeAllOption?: boolean
  allOptionLabel?: string
  compact?: boolean
}

export function DrugCombobox({
  drugs,
  selectedDrugId,
  onSelect,
  placeholder = 'Search or select drug from catalog...',
  includeAllOption = false,
  allOptionLabel = 'Whole Hospital Total (All Drugs)',
  compact = false,
}: DrugComboboxProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  const isAllSelected = selectedDrugId === 'all'
  const selectedDrug = !isAllSelected
    ? drugs.find((d) => d.id === Number(selectedDrugId))
    : null

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filteredDrugs = drugs.filter((d) => {
    const q = searchQuery.toLowerCase()
    return d.name.toLowerCase().includes(q) || d.category.toLowerCase().includes(q)
  })

  const showAllOptionInSearch =
    includeAllOption &&
    (searchQuery === '' ||
      allOptionLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      'all'.includes(searchQuery.toLowerCase()) ||
      'hospital'.includes(searchQuery.toLowerCase()))

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-white border border-slate-200 rounded-xl text-left shadow-2xs hover:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all flex items-center justify-between gap-2.5 group cursor-pointer ${
          compact ? 'px-3 py-2 text-xs' : 'px-4 py-2.5 text-sm'
        }`}
      >
        <div className="flex items-center gap-2 truncate">
          <div
            className={`rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 border border-emerald-100 ${
              compact ? 'w-5 h-5' : 'w-8 h-8'
            }`}
          >
            {isAllSelected ? (
              <Building2 className={`${compact ? 'w-3 h-3' : 'w-4 h-4'} text-emerald-700`} />
            ) : (
              <Sprout className={compact ? 'w-3 h-3' : 'w-4 h-4'} />
            )}
          </div>

          {compact ? (
            /* Compact single-line label for filter toolbars & sidebar */
            <span className="font-bold text-slate-900 truncate text-[11px]">
              {isAllSelected ? (
                `🏥 Whole Hospital`
              ) : selectedDrug ? (
                `🌿 ${selectedDrug.name}`
              ) : (
                placeholder
              )}
            </span>
          ) : (
            /* Standard 2-line rich label for forms */
            <div className="truncate">
              {isAllSelected ? (
                <>
                  <span className="font-bold text-slate-900 text-sm block truncate">
                    🏥 {allOptionLabel}
                  </span>
                  <span className="text-xs text-slate-500 font-medium block truncate">
                    Aggregated expenditure for all 261 Ayurvedic drugs
                  </span>
                </>
              ) : selectedDrug ? (
                <>
                  <span className="font-bold text-slate-900 text-sm block truncate">
                    {selectedDrug.name}
                  </span>
                  <span className="text-xs text-slate-500 font-medium block truncate">
                    {selectedDrug.category} • {selectedDrug.size_amount} {selectedDrug.size_unit} @ LKR {selectedDrug.unit_price.toFixed(2)}
                  </span>
                </>
              ) : (
                <span className="text-slate-400 text-sm">{placeholder}</span>
              )}
            </div>
          )}
        </div>

        <ChevronDown
          className={`text-slate-400 flex-shrink-0 transition-transform ${
            compact ? 'w-3.5 h-3.5' : 'w-4 h-4'
          } ${isOpen ? 'rotate-180 text-emerald-600' : ''}`}
        />
      </button>

      {/* Dropdown Menu Overlay */}
      {isOpen && (
        <div
          className={`absolute top-full mt-2 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in duration-150 ${
            compact ? 'left-0 w-64' : 'left-0 right-0 w-full'
          }`}
        >
          <div className="p-2 border-b border-slate-100 bg-slate-50/80 sticky top-0 z-10 backdrop-blur-xs">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type to search drugs..."
                className="w-full pl-7 pr-2 py-1 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                autoFocus
              />
            </div>
          </div>

          <div className="max-h-56 overflow-y-auto divide-y divide-slate-50 p-1">
            {/* Top Option: Whole Hospital Total */}
            {showAllOptionInSearch && (
              <button
                type="button"
                onClick={() => {
                  onSelect('all')
                  setIsOpen(false)
                  setSearchQuery('')
                }}
                className={`w-full text-left p-2 rounded-lg flex items-center justify-between transition-colors cursor-pointer ${
                  isAllSelected
                    ? 'bg-emerald-50 text-emerald-900 font-semibold'
                    : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs">🏥</span>
                  <div>
                    <div className="font-bold text-xs text-slate-900">Whole Hospital Total</div>
                    <div className="text-[10px] text-slate-500 font-medium">All drugs aggregated</div>
                  </div>
                </div>

                {isAllSelected && <Check className="w-3.5 h-3.5 text-emerald-600" />}
              </button>
            )}

            {filteredDrugs.length === 0 && !showAllOptionInSearch ? (
              <div className="py-6 text-center text-slate-400 text-xs font-medium">
                No drugs found matching &quot;{searchQuery}&quot;
              </div>
            ) : (
              filteredDrugs.map((drug) => {
                const isSelected = drug.id === Number(selectedDrugId)

                return (
                  <button
                    key={drug.id}
                    type="button"
                    onClick={() => {
                      onSelect(drug.id)
                      setIsOpen(false)
                      setSearchQuery('')
                    }}
                    className={`w-full text-left p-2 rounded-lg flex items-center justify-between transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50 text-emerald-900 font-semibold'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="truncate pr-2">
                      <div className="font-bold text-xs text-slate-900 truncate">{drug.name}</div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-0.5 truncate">
                        <span className="bg-slate-100 text-slate-700 px-1 py-0.2 rounded text-[9px] font-medium border border-slate-200">
                          {drug.category}
                        </span>
                        <span className="truncate">
                          {drug.size_amount} {drug.size_unit}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        LKR {drug.unit_price.toFixed(0)}
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                    </div>
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

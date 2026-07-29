'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  BarChart3,
  Calendar,
  Filter,
  Pill,
  DollarSign,
  TrendingUp,
  FileText,
  ChevronRight,
  ChevronLeft,
  RefreshCw,
  Sprout,
  Search,
  FileDown,
  Printer
} from 'lucide-react'
import { Pagination } from '../components/Pagination'
import { DrugCombobox } from '../components/DrugCombobox'

interface Drug {
  id: number
  name: string
  category: string
  size_amount: number
  size_unit: string
  unit_price: number
}

interface DrugBreakdown {
  drugId: number
  drugName: string
  category: string
  sizeAmount: number
  sizeUnit: string
  unitPrice: number
  qty: number
  cost: number
  count: number
}

interface SummaryPeriod {
  periodKey: string
  totalCost: number
  totalQty: number
  prescriptionCount: number
  drugBreakdown: DrugBreakdown[]
}

interface SummaryResponse {
  period: string
  grandTotalCost: number
  grandTotalQty: number
  grandTotalPrescriptions: number
  summaries: SummaryPeriod[]
}

function SummariesContent() {
  const searchParams = useSearchParams()
  const periodParam = searchParams.get('period') as 'daily' | 'weekly' | 'monthly' | null

  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>(periodParam || 'daily')
  const [selectedDrugId, setSelectedDrugId] = useState<string>('all')
  const [drugsCatalog, setDrugsCatalog] = useState<Drug[]>([])

  const [data, setData] = useState<SummaryResponse | null>(null)
  const [loading, setLoading] = useState(true)

  // Master-Detail active period state
  const [activePeriodKey, setActivePeriodKey] = useState<string | null>(null)

  // Filters for Master List & Detail Table
  const [dateSearchQuery, setDateSearchQuery] = useState('')
  const [detailDrugSearchQuery, setDetailDrugSearchQuery] = useState('')

  // Secondary Sub-Sidebar open/close toggle state
  const [isSubSidebarOpen, setIsSubSidebarOpen] = useState(true)

  // Internal pagination for Detail Table
  const [detailCurrentPage, setDetailCurrentPage] = useState(1)
  const detailItemsPerPage = 10

  useEffect(() => {
    fetchDrugCatalog()
  }, [])

  useEffect(() => {
    fetchSummaryData()

    const handleFocus = () => {
      fetchSummaryData()
    }

    window.addEventListener('focus', handleFocus)
    return () => {
      window.removeEventListener('focus', handleFocus)
    }
  }, [period, selectedDrugId])

  useEffect(() => {
    setDetailCurrentPage(1)
    setDetailDrugSearchQuery('')
  }, [activePeriodKey])

  const fetchDrugCatalog = async () => {
    try {
      const res = await fetch(`/api/drugs?t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      })
      if (res.ok) {
        const catalog = await res.json()
        setDrugsCatalog(catalog)
      }
    } catch (err) {
      console.error('Failed to load drugs catalog:', err)
    }
  }

  const fetchSummaryData = async () => {
    setLoading(true)
    try {
      const url = `/api/summaries?period=${period}&drug_id=${selectedDrugId}&t=${Date.now()}`
      const res = await fetch(url, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      })
      if (res.ok) {
        const result = await res.json()
        setData(result)
        if (result.summaries.length > 0) {
          setActivePeriodKey((prev) => {
            const exists = result.summaries.some((s: SummaryPeriod) => s.periodKey === prev)
            return exists ? prev : result.summaries[0].periodKey
          })
        } else {
          setActivePeriodKey(null)
        }
      }
    } catch (err) {
      console.error('Error fetching summary data:', err)
    } finally {
      setLoading(false)
    }
  }

  // Human-friendly period key formatter
  const formatPeriodLabel = (periodKey: string, periodType: 'daily' | 'weekly' | 'monthly') => {
    if (!periodKey) return ''

    if (periodType === 'daily') {
      try {
        const parts = periodKey.split('-').map(Number)
        if (parts.length === 3) {
          const d = new Date(parts[0], parts[1] - 1, parts[2])
          return d.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            weekday: 'short'
          })
        }
      } catch {}
      return periodKey
    }

    if (periodType === 'weekly') {
      try {
        const rawDate = periodKey.replace('Week of ', '').trim()
        const parts = rawDate.split('-').map(Number)
        if (parts.length === 3) {
          const monday = new Date(parts[0], parts[1] - 1, parts[2])
          const sunday = new Date(monday)
          sunday.setDate(monday.getDate() + 6)

          const dayOfMonth = monday.getDate()
          const weekNum = Math.ceil(dayOfMonth / 7)
          const ordinalSuffixes = ['1st', '2nd', '3rd', '4th', '5th']
          const weekOrdinal = ordinalSuffixes[Math.min(weekNum - 1, 4)] || `${weekNum}th`

          const fullMonthName = monday.toLocaleDateString('en-US', { month: 'long' })
          const yearNum = monday.getFullYear()

          const startMonth = monday.toLocaleDateString('en-US', { month: 'short' })
          const startDay = String(monday.getDate()).padStart(2, '0')
          const endMonth = sunday.toLocaleDateString('en-US', { month: 'short' })
          const endDay = String(sunday.getDate()).padStart(2, '0')

          const rangeStr = startMonth === endMonth
            ? `${startMonth} ${startDay} – ${endDay}`
            : `${startMonth} ${startDay} – ${endMonth} ${endDay}`

          return `${weekOrdinal} Week of ${fullMonthName} ${yearNum} (${rangeStr})`
        }
      } catch {}
      return periodKey
    }

    if (periodType === 'monthly') {
      try {
        const parts = periodKey.split('-').map(Number)
        if (parts.length === 2) {
          const d = new Date(parts[0], parts[1] - 1, 1)
          return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        }
      } catch {}
      return periodKey
    }

    return periodKey
  }

  const selectedDrugObj = drugsCatalog.find((d) => d.id === Number(selectedDrugId))
  const totalSummaries = data?.summaries || []

  // Master Date List Pagination
  const [masterCurrentPage, setMasterCurrentPage] = useState(1)
  const masterItemsPerPage = 10

  useEffect(() => {
    setMasterCurrentPage(1)
  }, [period, dateSearchQuery])

  // Master Period List Filter & Pagination
  const filteredSummaries = totalSummaries.filter((s) => {
    const rawMatch = s.periodKey.toLowerCase().includes(dateSearchQuery.toLowerCase())
    const formattedLabel = formatPeriodLabel(s.periodKey, period).toLowerCase()
    const formattedMatch = formattedLabel.includes(dateSearchQuery.toLowerCase())
    return rawMatch || formattedMatch
  })

  const masterTotalPages = Math.max(1, Math.ceil(filteredSummaries.length / masterItemsPerPage))
  const paginatedSummaries = filteredSummaries.slice(
    (masterCurrentPage - 1) * masterItemsPerPage,
    masterCurrentPage * masterItemsPerPage
  )

  // Active Period object for detail pane
  const activePeriodObj =
    totalSummaries.find((s) => s.periodKey === activePeriodKey) ||
    (totalSummaries.length > 0 ? totalSummaries[0] : null)

  // Detail Drug Breakdown Filter & Pagination inside active period
  const detailDrugList = activePeriodObj?.drugBreakdown || []
  const filteredDetailDrugs = detailDrugList.filter((d) =>
    d.drugName.toLowerCase().includes(detailDrugSearchQuery.toLowerCase()) ||
    d.category.toLowerCase().includes(detailDrugSearchQuery.toLowerCase())
  )

  const detailTotalPages = Math.max(1, Math.ceil(filteredDetailDrugs.length / detailItemsPerPage))
  const paginatedDetailDrugs = filteredDetailDrugs.slice(
    (detailCurrentPage - 1) * detailItemsPerPage,
    detailCurrentPage * detailItemsPerPage
  )

  const handleExportPDF = () => {
    if (typeof window !== 'undefined') {
      window.print()
    }
  }

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-6">
      {/* Dynamic Print CSS - Zero Margin Browser Suppression & Multi-Page Table Styling */}
      <style jsx global>{`
        @media print {
          @page {
            margin: 0 !important;
            size: A4 portrait;
          }
          body {
            background-color: white !important;
            color: black !important;
            font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .no-print, nav, aside, button, input, header, footer {
            display: none !important;
          }
          .print-only {
            display: block !important;
          }
          .print-container {
            padding: 15mm 15mm 15mm 15mm !important;
            width: 100% !important;
            box-sizing: border-box !important;
          }
          thead {
            display: table-header-group !important;
          }
          tr {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
        }
        @media screen {
          .print-only {
            display: none !important;
          }
        }
      `}</style>

      {/* TOP REPORT CATEGORY SEGMENTED TOGGLE BAR */}
      <div className="no-print bg-white p-2.5 sm:p-3 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 px-1">
          <BarChart3 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-extrabold text-sm text-slate-800 tracking-tight">Expenditure Reports</span>
        </div>

        {/* 3-Tab Segmented Pill Switcher */}
        <div className="grid grid-cols-3 gap-1.5 w-full sm:w-auto bg-slate-100/90 p-1 rounded-xl border border-slate-200/60">
          {[
            { id: 'daily', label: 'Daily', fullLabel: 'Daily Summary', icon: Calendar },
            { id: 'weekly', label: 'Weekly', fullLabel: 'Weekly Summary', icon: BarChart3 },
            { id: 'monthly', label: 'Monthly', fullLabel: 'Monthly Summary', icon: TrendingUp },
          ].map((tab) => {
            const Icon = tab.icon
            const isSelected = period === tab.id

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setPeriod(tab.id as 'daily' | 'weekly' | 'monthly')
                  setDateSearchQuery('')
                }}
                className={`flex items-center justify-center gap-2 px-3 sm:px-5 py-2.5 rounded-lg font-extrabold text-xs transition-all cursor-pointer select-none ${isSelected
                    ? 'bg-white text-emerald-900 shadow-xs border border-emerald-300/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                  }`}
              >
                <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span className="sm:hidden">{tab.label}</span>
                <span className="hidden sm:inline">{tab.fullLabel}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* MAIN REPORT DASHBOARD VIEW */}
      <div className="w-full space-y-6">
        {/* Top Header Card */}
        <div className="no-print bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-700 font-semibold text-sm">
              <Sprout className="w-5 h-5 text-emerald-600" />
              <span>Ayurvedic Hospital Expenditure Reports</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-1 capitalize">
              {period} Expenditure Report
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">
              Analyze herbal drug consumption and cost breakdown for individual drugs or whole hospital operations.
            </p>
          </div>

          {/* Controls: Medicine Scope Combobox & Refresh Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            <div className="w-full sm:w-64">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Filter Drug Scope:
              </span>
              <DrugCombobox
                drugs={drugsCatalog}
                selectedDrugId={selectedDrugId === 'all' ? 'all' : Number(selectedDrugId)}
                onSelect={(id) => setSelectedDrugId(String(id))}
                includeAllOption={true}
                allOptionLabel="All Medicines"
              />
            </div>

            <button
              onClick={fetchSummaryData}
              className="mt-auto flex items-center justify-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all cursor-pointer h-[38px]"
              title="Refresh reports"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Selected Drug Filter Info Alert */}
        {selectedDrugObj && (
          <div className="no-print bg-emerald-50/80 border border-emerald-200/80 p-3.5 rounded-xl text-xs text-emerald-900 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 font-medium">
              <Pill className="w-4 h-4 text-emerald-700" />
              <span>
                Filtering summary reports specifically for <strong className="font-bold">{selectedDrugObj.name}</strong> ({selectedDrugObj.category}).
              </span>
            </div>
            <button
              onClick={() => setSelectedDrugId('all')}
              className="text-emerald-800 underline font-bold text-[11px] hover:text-emerald-950 cursor-pointer"
            >
              Clear Filter
            </button>
          </div>
        )}

        {/* MAIN MASTER-DETAIL REPORT GRID */}
        {loading ? (
          <div className="no-print bg-white p-12 rounded-2xl border border-slate-200/80 text-center text-slate-400 animate-pulse font-medium">
            Generating hospital expenditure reports...
          </div>
        ) : totalSummaries.length === 0 ? (
          <div className="no-print bg-white p-12 rounded-2xl border border-slate-200/80 text-center text-slate-500 space-y-3">
            <BarChart3 className="w-10 h-10 text-slate-300 mx-auto" />
            <div className="font-bold text-slate-700">No Prescription Records Found</div>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              There are no prescription records issued for the selected period or drug filter.
            </p>
            <a
              href="/prescribe"
              className="inline-flex items-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Sprout className="w-4 h-4" />
              <span>Issue First Prescription</span>
            </a>
          </div>
        ) : (
          <div className="no-print grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch flex-1">
            {/* LEFT PANE: MASTER PERIODS LIST */}
            <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden flex flex-col max-h-[320px] lg:max-h-none lg:h-[calc(100vh-14.5rem)] lg:min-h-[580px]">
              <div className="p-3.5 sm:p-4 border-b border-slate-100 bg-slate-50/50 space-y-2 sm:space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {period} Records ({totalSummaries.length})
                  </h2>
                </div>

                {/* Filter Dates Search Bar */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={dateSearchQuery}
                    onChange={(e) => setDateSearchQuery(e.target.value)}
                    placeholder="Filter period dates..."
                    className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Scrollable Master Period List Cards */}
              <div className="divide-y divide-slate-100 overflow-y-auto flex-1 p-2 space-y-1">
                {paginatedSummaries.map((s) => {
                  const isSelected = activePeriodObj?.periodKey === s.periodKey
                  const displayLabel = formatPeriodLabel(s.periodKey, period)

                  return (
                    <div
                      key={s.periodKey}
                      onClick={() => setActivePeriodKey(s.periodKey)}
                      className={`p-3.5 rounded-xl transition-all cursor-pointer border select-none ${isSelected
                          ? 'bg-emerald-50/80 border-emerald-500 shadow-2xs text-emerald-900'
                          : 'bg-white border-transparent hover:bg-slate-50 text-slate-700'
                        }`}
                    >
                      {/* Top Header: Full Width Period Title & Date Range */}
                      <div className="flex items-start gap-2 mb-2">
                        <span className="shrink-0 mt-0.5 text-base">{period === 'daily' ? '📅' : period === 'weekly' ? '📆' : '📊'}</span>
                        <span className="font-extrabold text-xs sm:text-sm text-slate-900 leading-snug">
                          {displayLabel}
                        </span>
                      </div>

                      {/* Bottom Row: Metrics Left & Formatted Cost Badge Right */}
                      <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200/50 text-xs text-slate-500 font-medium">
                        <span className="truncate text-[11px] sm:text-xs">
                          {s.prescriptionCount} Prescription{s.prescriptionCount > 1 ? 's' : ''} • {s.drugBreakdown.length} Drug{s.drugBreakdown.length > 1 ? 's' : ''}
                        </span>
                        <span className="font-extrabold text-xs sm:text-sm text-emerald-800 shrink-0 bg-emerald-100/60 px-2 py-0.5 rounded-lg border border-emerald-200/80">
                          LKR {s.totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Left Pane Date List Pagination */}
              <Pagination
                currentPage={masterCurrentPage}
                totalPages={masterTotalPages}
                totalItems={filteredSummaries.length}
                itemsPerPage={masterItemsPerPage}
                onPageChange={setMasterCurrentPage}
              />
            </div>

            {/* RIGHT PANE: ACTIVE PERIOD DETAIL DASHBOARD */}
            {activePeriodObj ? (
              <div className="lg:col-span-8 flex flex-col justify-between lg:h-[calc(100vh-14.5rem)] lg:min-h-[580px] space-y-5">
                {/* Active Period Highlights Card */}
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
                  <div className="flex flex-row items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div>
                      <span className="text-[10px] sm:text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                        Inspecting Active Period
                      </span>
                      <h2 className="text-base sm:text-xl font-extrabold text-slate-900 flex items-center gap-2 mt-0.5">
                        <span>{formatPeriodLabel(activePeriodObj.periodKey, period)}</span>
                      </h2>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] sm:text-xs text-slate-500 block font-medium">
                        {period === 'daily'
                          ? 'Total Daily Expenditure:'
                          : period === 'weekly'
                            ? 'Total Weekly Expenditure:'
                            : 'Total Monthly Expenditure:'}
                      </span>
                      <span className="text-base sm:text-2xl font-black text-emerald-800">
                        LKR {activePeriodObj.totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  {/* Summary KPI Strip with Download PDF Button */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center bg-slate-50 p-3.5 rounded-xl border border-slate-200/60 text-xs">
                    <div>
                      <span className="text-slate-500 block font-medium">Prescriptions Issued:</span>
                      <span className="font-bold text-slate-900 text-sm">{activePeriodObj.prescriptionCount}</span>
                    </div>

                    <div>
                      <span className="text-slate-500 block font-medium">Unique Drug Types:</span>
                      <span className="font-bold text-emerald-800 text-sm">{activePeriodObj.drugBreakdown.length} Types</span>
                    </div>

                    <div className="sm:text-right">
                      <button
                        type="button"
                        onClick={handleExportPDF}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer w-full sm:w-auto shrink-0"
                        title="Export official PDF report"
                      >
                        <FileDown className="w-4 h-4 shrink-0" />
                        <span className="whitespace-nowrap">Download PDF Report</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Drug Breakdown Table Container */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden flex-1 flex flex-col justify-between">
                  {/* Table Control Header & In-Period Search Bar */}
                  <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Drug Breakdown ({filteredDetailDrugs.length})
                    </h3>

                    {/* In-Period Search Filter */}
                    <div className="relative w-full sm:w-64">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        value={detailDrugSearchQuery}
                        onChange={(e) => setDetailDrugSearchQuery(e.target.value)}
                        placeholder={`Search drugs in period...`}
                        className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  {filteredDetailDrugs.length === 0 ? (
                    <div className="p-10 text-center text-slate-400 text-xs font-medium">
                      No drugs found matching &quot;{detailDrugSearchQuery}&quot;.
                    </div>
                  ) : (
                    <>
                      <div className="overflow-x-auto flex-1">
                        <table className="w-full text-left border-collapse text-sm min-w-[750px]">
                          <thead>
                            <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 text-xs font-semibold">
                              <th className="py-2.5 px-4">Drug Name</th>
                              <th className="py-2.5 px-4">Category</th>
                              <th className="py-2.5 px-4">Package Size</th>
                              <th className="py-2.5 px-4">Package Price</th>
                              <th className="py-2.5 px-4">Prescriptions</th>
                              <th className="py-2.5 px-4">Total Dispensed</th>
                              <th className="py-2.5 px-4 text-right">Total Expenditure</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
                            {paginatedDetailDrugs.map((d) => (
                              <tr key={d.drugId} className="hover:bg-slate-50/80 transition-colors">
                                <td className="py-2.5 px-4 font-bold text-slate-900">{d.drugName}</td>
                                <td className="py-2.5 px-4">
                                  <span className="whitespace-nowrap inline-block bg-emerald-50 text-emerald-800 border border-emerald-200/80 font-bold px-2.5 py-0.5 rounded-md text-[11px]">
                                    {d.category}
                                  </span>
                                </td>
                                <td className="py-2.5 px-4 font-medium">
                                  {d.sizeAmount} {d.sizeUnit}
                                </td>
                                <td className="py-2.5 px-4 font-semibold">
                                  LKR {d.unitPrice.toFixed(2)}
                                </td>
                                <td className="py-2.5 px-4 font-semibold">{d.count}</td>
                                <td className="py-2.5 px-4 font-bold text-slate-900">
                                  {d.qty} {d.sizeUnit}
                                </td>
                                <td className="py-2.5 px-4 text-right font-bold text-emerald-800">
                                  LKR {d.cost.toFixed(2)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Internal Table Pagination */}
                      <Pagination
                        currentPage={detailCurrentPage}
                        totalPages={detailTotalPages}
                        totalItems={filteredDetailDrugs.length}
                        itemsPerPage={detailItemsPerPage}
                        onPageChange={setDetailCurrentPage}
                      />
                    </>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* PRINT-ONLY OFFICIAL HOSPITAL PDF TEMPLATE */}
      {activePeriodObj && (
        <div className="print-only print-container text-black space-y-6">
          {/* Header Branding */}
          <div className="border-b-2 border-emerald-700 pb-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-emerald-900 uppercase tracking-tight">
                Ayurvedic Hospital Expenditure Report
              </h1>
              <p className="text-xs text-slate-600 mt-1">
                Official Drug Consumption & Inventory Financial Audit
              </p>
            </div>
            <div className="text-right text-xs text-slate-600">
              <div>Printed: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
              <div className="font-bold text-slate-900 mt-1">
                Scope: {period.toUpperCase()} SUMMARY
              </div>
            </div>
          </div>

          {/* Period Summary Card */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 grid grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-slate-500 font-bold block uppercase text-[10px]">Reporting Period</span>
              <span className="font-extrabold text-sm text-slate-900">
                {formatPeriodLabel(activePeriodObj.periodKey, period)}
              </span>
            </div>
            <div>
              <span className="text-slate-500 font-bold block uppercase text-[10px]">Total Prescriptions Issued</span>
              <span className="font-extrabold text-sm text-slate-900">
                {activePeriodObj.prescriptionCount} Prescriptions
              </span>
            </div>
            <div className="text-right">
              <span className="text-slate-500 font-bold block uppercase text-[10px]">Total Expenditure</span>
              <span className="font-black text-base text-emerald-800">
                LKR {activePeriodObj.totalCost.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Drug Breakdown Table */}
          <div className="space-y-2">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Medicine Consumption Breakdown ({activePeriodObj.drugBreakdown.length} Types)
            </h2>
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 text-slate-800 font-bold">
                  <th className="py-2 px-3">#</th>
                  <th className="py-2 px-3">Medicine Name</th>
                  <th className="py-2 px-3">Category</th>
                  <th className="py-2 px-3">Pkg Size</th>
                  <th className="py-2 px-3">Pkg Price</th>
                  <th className="py-2 px-3 text-center">Prescriptions</th>
                  <th className="py-2 px-3">Total Dispensed</th>
                  <th className="py-2 px-3 text-right">Total Expenditure</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {activePeriodObj.drugBreakdown.map((d, index) => (
                  <tr key={d.drugId}>
                    <td className="py-2 px-3 font-medium text-slate-500">{index + 1}</td>
                    <td className="py-2 px-3 font-bold text-slate-900">{d.drugName}</td>
                    <td className="py-2 px-3">{d.category}</td>
                    <td className="py-2 px-3">{d.sizeAmount} {d.sizeUnit}</td>
                    <td className="py-2 px-3">LKR {d.unitPrice.toFixed(2)}</td>
                    <td className="py-2 px-3 text-center font-bold">{d.count}</td>
                    <td className="py-2 px-3 font-bold">{d.qty} {d.sizeUnit}</td>
                    <td className="py-2 px-3 text-right font-black text-emerald-900">
                      LKR {d.cost.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="pt-6 border-t border-slate-200 text-[10px] text-slate-500 flex justify-between items-center">
            <div>Ayurvedic Hospital Prescription Tracker • Confidential Financial Audit</div>
            <div className="font-semibold text-slate-600">Official Audit Report</div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function SummariesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading summaries...</div>}>
      <SummariesContent />
    </Suspense>
  )
}

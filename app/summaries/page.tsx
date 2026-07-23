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
  Search
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

  // Secondary Sub-Sidebar open/close toggle state (Default open on desktop)
  const [isSubSidebarOpen, setIsSubSidebarOpen] = useState(true)

  // Internal pagination for Detail Table
  const [detailCurrentPage, setDetailCurrentPage] = useState(1)
  const [detailItemsPerPage, setDetailItemsPerPage] = useState(10)

  useEffect(() => {
    if (periodParam && ['daily', 'weekly', 'monthly'].includes(periodParam)) {
      setPeriod(periodParam)
    }
  }, [periodParam])

  useEffect(() => {
    fetchDrugCatalog()
  }, [])

  useEffect(() => {
    fetchSummaryData()
  }, [period, selectedDrugId])

  useEffect(() => {
    setDetailCurrentPage(1)
    setDetailDrugSearchQuery('')
  }, [activePeriodKey])

  const fetchDrugCatalog = async () => {
    try {
      const res = await fetch('/api/drugs')
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
      const url = `/api/summaries?period=${period}&drug_id=${selectedDrugId}`
      const res = await fetch(url)
      if (res.ok) {
        const result = await res.json()
        setData(result)
        if (result.summaries.length > 0) {
          setActivePeriodKey(result.summaries[0].periodKey)
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

  const selectedDrugObj = drugsCatalog.find((d) => d.id === Number(selectedDrugId))

  const totalSummaries = data?.summaries || []

  // Master Date List Pagination
  const [masterCurrentPage, setMasterCurrentPage] = useState(1)
  const masterItemsPerPage = 10

  useEffect(() => {
    setMasterCurrentPage(1)
  }, [period, dateSearchQuery])

  // Master Period List Filter & Pagination
  const filteredSummaries = totalSummaries.filter((s) =>
    s.periodKey.toLowerCase().includes(dateSearchQuery.toLowerCase())
  )
  const masterTotalPages = Math.max(1, Math.ceil(filteredSummaries.length / masterItemsPerPage))
  const paginatedSummaries = filteredSummaries.slice(
    (masterCurrentPage - 1) * masterItemsPerPage,
    masterCurrentPage * masterItemsPerPage
  )

  // Active Period object for Detail Dashboard
  const activePeriodObj = totalSummaries.find((s) => s.periodKey === activePeriodKey) || filteredSummaries[0] || null

  // In-Detail Drug Search Filter
  const activeDrugBreakdown = activePeriodObj ? activePeriodObj.drugBreakdown : []
  const filteredDetailDrugs = activeDrugBreakdown.filter(
    (d) =>
      d.drugName.toLowerCase().includes(detailDrugSearchQuery.toLowerCase()) ||
      d.category.toLowerCase().includes(detailDrugSearchQuery.toLowerCase())
  )

  // Pagination for Detail Table
  const detailTotalPages = Math.ceil(filteredDetailDrugs.length / detailItemsPerPage)
  const paginatedDetailDrugs = filteredDetailDrugs.slice(
    (detailCurrentPage - 1) * detailItemsPerPage,
    detailCurrentPage * detailItemsPerPage
  )

  return (
    <div className="relative">
      {/* ------------------------------------------------------------- */}
      {/* SECONDARY SUB-SIDEBAR PANEL (Matching Reference Screenshot 3) */}
      {/* ------------------------------------------------------------- */}
      <aside
        className={`hidden lg:flex fixed left-20 top-0 bottom-0 z-20 bg-white border-r border-slate-200/80 shadow-2xs flex-col transition-all duration-300 ${
          isSubSidebarOpen ? 'w-56 opacity-100 translate-x-0' : 'w-0 opacity-0 -translate-x-full overflow-hidden'
        }`}
      >
        {/* Secondary Sub-Sidebar Header */}
        <div className="h-20 flex items-center justify-between px-5 border-b border-slate-100 bg-white">
          <h2 className="text-sm font-extrabold text-slate-900 tracking-tight">
            Expenditure Reports
          </h2>

          <button
            type="button"
            onClick={() => setIsSubSidebarOpen(false)}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            title="Minimize Secondary Sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Sub-Navigation Links */}
        <div className="flex-1 p-3 space-y-1.5 overflow-y-auto">
          <button
            type="button"
            onClick={() => setPeriod('daily')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              period === 'daily'
                ? 'bg-emerald-50 text-emerald-800 shadow-2xs'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            Daily Summary
          </button>

          <button
            type="button"
            onClick={() => setPeriod('weekly')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              period === 'weekly'
                ? 'bg-emerald-50 text-emerald-800 shadow-2xs'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            Weekly Summary
          </button>

          <button
            type="button"
            onClick={() => setPeriod('monthly')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              period === 'monthly'
                ? 'bg-emerald-50 text-emerald-800 shadow-2xs'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            Monthly Summary
          </button>
        </div>
      </aside>

      {/* Floating Re-Open Chevron Button ( > ) when minimized */}
      {!isSubSidebarOpen && (
        <button
          type="button"
          onClick={() => setIsSubSidebarOpen(true)}
          className="hidden lg:flex fixed left-20 top-6 z-30 w-7 h-7 bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-900 rounded-full border border-slate-300 shadow-md items-center justify-center transition-all cursor-pointer"
          title="Expand Secondary Sidebar"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MAIN EXPENDITURE REPORT WORKSPACE CONTAINER                  */}
      {/* ------------------------------------------------------------- */}
      <div
        className={`transition-all duration-300 w-full max-w-[1600px] mx-auto min-h-[calc(100vh-6.5rem)] flex flex-col justify-between space-y-6 ${
          isSubSidebarOpen ? 'lg:pl-56' : 'lg:pl-0'
        }`}
      >
        {/* Mobile/Tablet Control Bar for Period Switching (< lg) */}
        <div className="lg:hidden bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between gap-3">
          <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider shrink-0">Report View:</span>
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl flex-1 max-w-sm">
            <button
              type="button"
              onClick={() => setPeriod('daily')}
              className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                period === 'daily' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Daily
            </button>
            <button
              type="button"
              onClick={() => setPeriod('weekly')}
              className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                period === 'weekly' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Weekly
            </button>
            <button
              type="button"
              onClick={() => setPeriod('monthly')}
              className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                period === 'monthly' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly
            </button>
          </div>
        </div>

        {/* Top Header Banner + DRUG SCOPE FILTER INSIDE MAIN BODY */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-700 font-semibold text-sm">
              <Sprout className="w-5 h-5 text-emerald-600" />
              <span>Ayurvedic Hospital Expenditure Reports</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 mt-1 capitalize">
              {period} Expenditure Report
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">
              Analyze herbal drug consumption and cost breakdown for individual drugs or whole hospital operations.
            </p>
          </div>

          {/* DRUG SCOPE SEARCH COMBOBOX (INSIDE MAIN BODY CONTENT) */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="w-full md:w-72">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Filter Drug Scope:
              </span>
              <DrugCombobox
                drugs={drugsCatalog}
                selectedDrugId={selectedDrugId === 'all' ? 'all' : Number(selectedDrugId)}
                onSelect={(val) => setSelectedDrugId(String(val))}
                includeAllOption={true}
                compact={true}
                placeholder="Search drug scope..."
              />
            </div>

            <button
              onClick={fetchSummaryData}
              className="mt-5 p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition-all cursor-pointer flex-shrink-0"
              title="Refresh Reports"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* MASTER-DETAIL SPLIT WORKSPACE GRID                            */}
        {/* ------------------------------------------------------------- */}
        {loading ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400 animate-pulse font-medium">
            Loading expenditure summaries...
          </div>
        ) : !data || totalSummaries.length === 0 ? (
          <div className="flex-1 bg-white p-12 sm:p-16 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col items-center justify-center text-center my-auto min-h-[420px] space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200/80 shadow-2xs flex items-center justify-center">
              <BarChart3 className="w-8 h-8" />
            </div>
            
            <div className="space-y-1.5 max-w-md">
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">No Expenditure Records Found</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                There are no patient prescriptions recorded yet for this hospital. Issue new prescriptions to generate daily, weekly, and monthly expenditure reports automatically.
              </p>
            </div>

            <a
              href="/prescribe"
              className="inline-flex items-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Sprout className="w-4 h-4" />
              <span>Issue First Prescription</span>
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch flex-1">
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

                  return (
                    <div
                      key={s.periodKey}
                      onClick={() => setActivePeriodKey(s.periodKey)}
                      className={`p-3.5 rounded-xl transition-all cursor-pointer border select-none ${
                        isSelected
                          ? 'bg-emerald-50/80 border-emerald-500 shadow-2xs text-emerald-900'
                          : 'bg-white border-transparent hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                          <span>{period === 'daily' ? '📅' : period === 'weekly' ? '📆' : '📊'}</span>
                          <span>{s.periodKey}</span>
                        </span>
                        <span className="font-extrabold text-xs text-emerald-800">
                          LKR {s.totalCost.toFixed(2)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-500 mt-2 font-medium">
                        <span>
                          {s.prescriptionCount} Prescription{s.prescriptionCount > 1 ? 's' : ''} • {s.drugBreakdown.length} Drug{s.drugBreakdown.length > 1 ? 's' : ''}
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
                  <div className="flex flex-row items-center justify-between gap-2 sm:gap-3 pb-3 border-b border-slate-100">
                    <div>
                      <span className="text-[10px] sm:text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                        Inspecting Active Period
                      </span>
                      <h2 className="text-base sm:text-xl font-extrabold text-slate-900 flex items-center gap-2 mt-0.5">
                        <span>{activePeriodObj.periodKey}</span>
                      </h2>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-[10px] sm:text-xs text-slate-500 block font-medium">
                          {period === 'daily'
                            ? 'Total Daily Expenditure:'
                            : period === 'weekly'
                            ? 'Total Weekly Expenditure:'
                            : 'Total Monthly Expenditure:'}
                        </span>
                        <span className="text-sm sm:text-lg font-black text-emerald-800">
                          LKR {activePeriodObj.totalCost.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Summary KPI Strip */}
                  <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200/60">
                    <div>
                      <span className="text-slate-500 block font-medium">Prescriptions Issued:</span>
                      <span className="font-bold text-slate-900 text-sm">{activePeriodObj.prescriptionCount}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block font-medium">Unique Drug Types:</span>
                      <span className="font-bold text-emerald-800 text-sm">{activePeriodObj.drugBreakdown.length} Types</span>
                    </div>
                  </div>
                </div>

                {/* Drug Breakdown Table Container */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden flex-1 flex flex-col justify-between">
                  {/* Table Control Header & In-Period Search Bar */}
                  <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Drug Breakdown for {activePeriodObj.periodKey} ({filteredDetailDrugs.length})
                    </h3>

                    {/* In-Period Search Filter */}
                    <div className="relative w-full sm:w-64">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        value={detailDrugSearchQuery}
                        onChange={(e) => setDetailDrugSearchQuery(e.target.value)}
                        placeholder={`Search drugs in ${activePeriodObj.periodKey}...`}
                        className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  {filteredDetailDrugs.length === 0 ? (
                    <div className="p-10 text-center text-slate-400 text-xs font-medium">
                      No drugs found matching &quot;{detailDrugSearchQuery}&quot; in {activePeriodObj.periodKey}.
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

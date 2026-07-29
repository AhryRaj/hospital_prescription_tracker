'use client'

import { useState, useEffect } from 'react'
import {
  Users,
  UserCheck,
  BarChart3,
  Calendar,
  FileDown,
  RefreshCw,
  Sprout,
  Filter,
  Layers,
  Clock
} from 'lucide-react'

interface MatrixData {
  period: string
  totalPatients: number
  totalMale: number
  totalFemale: number
  totalOther: number
  ageCategories: string[]
  systemCategories: string[]
  maleMatrix: Record<string, Record<string, number>>
  femaleMatrix: Record<string, Record<string, number>>
  otherMatrix: Record<string, Record<string, number>>
  combinedMatrix: Record<string, Record<string, number>>
}

export default function PatientStatsPage() {
  const todayStr = new Date().toISOString().split('T')[0]
  const currentMonthStr = todayStr.substring(0, 7)

  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'all'>('monthly')
  const [selectedDate, setSelectedDate] = useState<string>(todayStr)
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthStr)

  const [data, setData] = useState<MatrixData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [period, selectedDate, selectedMonth])

  const fetchStats = async () => {
    setLoading(true)
    try {
      let url = `/api/patient-stats?period=${period}`
      if (period === 'daily') {
        url += `&date=${selectedDate}`
      } else if (period === 'weekly') {
        url += `&week_date=${selectedDate}`
      } else if (period === 'monthly') {
        url += `&month=${selectedMonth}`
      }

      const res = await fetch(url)
      if (res.ok) {
        const result: MatrixData = await res.json()
        setData(result)
      }
    } catch (err) {
      console.error('Failed to load patient stats:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleExportPDF = () => {
    if (typeof window !== 'undefined') {
      window.print()
    }
  }

  // Calculate row total for a specific age category
  const getRowTotal = (matrix: Record<string, Record<string, number>> | null, age: string) => {
    if (!matrix || !matrix[age]) return 0
    return Object.values(matrix[age]).reduce((sum, val) => sum + val, 0)
  }

  // Calculate column total for a specific system category
  const getColTotal = (matrix: Record<string, Record<string, number>> | null, sys: string) => {
    if (!matrix || !data) return 0
    return data.ageCategories.reduce((sum, age) => sum + (matrix[age]?.[sys] || 0), 0)
  }

  // Calculate grand total across matrix
  const getGrandTotal = (matrix: Record<string, Record<string, number>> | null) => {
    if (!matrix || !data) return 0
    return data.ageCategories.reduce((sum, age) => sum + getRowTotal(matrix, age), 0)
  }

  const formatWeeklyLabel = (dateStr: string) => {
    try {
      const parts = dateStr.split('-').map(Number)
      const d = parts.length === 3 ? new Date(parts[0], parts[1] - 1, parts[2]) : new Date()
      const dayOfWeek = d.getDay()
      const diff = d.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)
      const monday = new Date(d.setDate(diff))
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
    } catch {
      return 'Weekly Attendance Report'
    }
  }

  const getPeriodTitle = () => {
    if (period === 'daily') {
      try {
        const parts = selectedDate.split('-').map(Number)
        const d = new Date(parts[0], parts[1] - 1, parts[2])
        const dateFormatted = d.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        })
        return `Daily Patient Attendance Report — ${dateFormatted}`
      } catch {
        return `Daily Patient Attendance Report (${selectedDate})`
      }
    }
    if (period === 'weekly') {
      return `Weekly Patient Attendance Report — ${formatWeeklyLabel(selectedDate)}`
    }
    if (period === 'monthly') {
      try {
        const parts = selectedMonth.split('-').map(Number)
        const d = new Date(parts[0], parts[1] - 1, 1)
        const monthFormatted = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        return `Monthly Patient Attendance Report — ${monthFormatted}`
      } catch {
        return `Monthly Patient Attendance Report (${selectedMonth})`
      }
    }
    return `All-Time Patient Attendance Audit`
  }

  const getDownloadButtonLabel = () => {
    if (period === 'daily') return 'Download Daily PDF Report'
    if (period === 'weekly') return 'Download Weekly PDF Report'
    if (period === 'monthly') return 'Download Monthly PDF Report'
    return 'Download All-Time Audit PDF'
  }

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-6">
      {/* Dynamic Print CSS */}
      <style jsx global>{`
        @media print {
          @page {
            margin: 0 !important;
            size: A4 landscape;
          }
          html, body {
            background-color: white !important;
            color: black !important;
            font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
            margin: 0 !important;
            padding: 0 !important;
            height: 100% !important;
            overflow: hidden !important;
          }
          .no-print, nav, aside, button, input, header, footer {
            display: none !important;
          }
          .print-only {
            display: block !important;
          }
          .print-container {
            padding: 6mm 8mm !important;
            margin: 0 !important;
            box-sizing: border-box !important;
            transform: scale(0.90);
            transform-origin: top left;
            width: 111% !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          table, tr, td, th {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        }
        @media screen {
          .print-only {
            display: none !important;
          }
        }
      `}</style>

      {/* Top Banner Card */}
      <div className="no-print bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 overflow-hidden">
        <div className="max-w-full">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs font-bold border border-emerald-200/80 mb-2">
            <Sprout className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Hospital Attendance Statistics</span>
          </div>
          <h1 className="text-lg sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-snug">
            Patient Statistics & Demographics Reports
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Daily, Weekly, and Monthly cross-tabulation reports split by Gender, Age Category, and System Category.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 w-full lg:w-auto shrink-0">
          <button
            onClick={fetchStats}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all cursor-pointer shrink-0"
            title="Refresh statistics"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            onClick={handleExportPDF}
            className="flex-1 lg:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all cursor-pointer whitespace-nowrap"
          >
            <FileDown className="w-4 h-4 shrink-0" />
            <span className="hidden xl:inline">{getDownloadButtonLabel()}</span>
            <span className="xl:hidden">Download PDF Report</span>
          </button>
        </div>
      </div>

      {/* Period Selection & Date Picker Bar */}
      <div className="no-print bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 sm:gap-4 overflow-hidden">
        {/* Segmented Period Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:flex items-center gap-1 sm:gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold w-full lg:w-auto">
          <button
            onClick={() => setPeriod('daily')}
            className={`px-3 sm:px-4 py-2 rounded-lg transition-all cursor-pointer text-center ${period === 'daily' ? 'bg-white text-emerald-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            📅 Daily
          </button>
          <button
            onClick={() => setPeriod('weekly')}
            className={`px-3 sm:px-4 py-2 rounded-lg transition-all cursor-pointer text-center ${period === 'weekly' ? 'bg-white text-emerald-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            📊 Weekly
          </button>
          <button
            onClick={() => setPeriod('monthly')}
            className={`px-3 sm:px-4 py-2 rounded-lg transition-all cursor-pointer text-center ${period === 'monthly' ? 'bg-white text-emerald-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            🗓️ Monthly
          </button>
          <button
            onClick={() => setPeriod('all')}
            className={`px-3 sm:px-4 py-2 rounded-lg transition-all cursor-pointer text-center ${period === 'all' ? 'bg-white text-emerald-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            🌐 All-Time
          </button>
        </div>

        {/* Date Filter Pickers */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full lg:w-auto justify-between lg:justify-end">
          {period === 'daily' && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <label className="text-xs font-bold text-slate-500 uppercase whitespace-nowrap">Target Date:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full sm:w-auto px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          )}

          {period === 'weekly' && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <label className="text-xs font-bold text-slate-500 uppercase whitespace-nowrap">Week Date:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full sm:w-auto px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          )}

          {period === 'monthly' && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <label className="text-xs font-bold text-slate-500 uppercase whitespace-nowrap">Target Month:</label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full sm:w-auto px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          )}
        </div>
      </div>

      {/* KPI Highlights Cards */}
      {data && (
        <div className="no-print grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between gap-2">
            <div>
              <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Patients</span>
              <span className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5 block">{data.totalPatients}</span>
              <span className="text-[10px] sm:text-[11px] text-slate-500 font-medium truncate block max-w-[120px] sm:max-w-none">{getPeriodTitle()}</span>
            </div>
            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-600 shrink-0">
              <Users className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
          </div>

          <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between gap-2">
            <div>
              <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider block">Male Patients</span>
              <span className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5 block">{data.totalMale}</span>
              <span className="text-[10px] sm:text-[11px] text-emerald-700 font-bold block">
                {data.totalPatients > 0 ? ((data.totalMale / data.totalPatients) * 100).toFixed(1) : '0.0'}% of total
              </span>
            </div>
            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-blue-50 border border-blue-200/60 flex items-center justify-center text-blue-600 shrink-0">
              <UserCheck className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
          </div>

          <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between gap-2">
            <div>
              <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider block">Female Patients</span>
              <span className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5 block">{data.totalFemale}</span>
              <span className="text-[10px] sm:text-[11px] text-pink-700 font-bold block">
                {data.totalPatients > 0 ? ((data.totalFemale / data.totalPatients) * 100).toFixed(1) : '0.0'}% of total
              </span>
            </div>
            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-pink-50 border border-pink-200/60 flex items-center justify-center text-pink-600 shrink-0">
              <UserCheck className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
          </div>

          <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between gap-2">
            <div>
              <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider block">Other Patients</span>
              <span className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5 block">{data.totalOther}</span>
              <span className="text-[10px] sm:text-[11px] text-purple-700 font-bold block">
                {data.totalPatients > 0 ? ((data.totalOther / data.totalPatients) * 100).toFixed(1) : '0.0'}% of total
              </span>
            </div>
            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-purple-50 border border-purple-200/60 flex items-center justify-center text-purple-600 shrink-0">
              <Layers className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
          </div>
        </div>
      )}

      {/* Main Matrix Attendance Report Display */}
      <div className="no-print bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden space-y-6 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900">{getPeriodTitle()}</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Attendance statistics breakdown by Gender, Age Group, and System Code. Swipe sideways to view all system codes on mobile or tablet.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 animate-pulse font-medium text-xs sm:text-sm">
            Computing patient attendance statistics...
          </div>
        ) : !data ? (
          <div className="p-12 text-center text-slate-500 font-medium text-xs sm:text-sm">
            No statistics data available.
          </div>
        ) : (
          <div className="space-y-8">
            {/* 1. MALE RECORD TABLE */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-blue-900 uppercase">
                <span className="w-3 h-3 rounded-full bg-blue-600 inline-block"></span>
                <span>MALE PATIENTS</span>
              </div>
              <div className="overflow-x-auto rounded-xl border border-slate-200/90 shadow-2xs max-w-full">
                <table className="w-full text-center border-collapse text-xs min-w-[1050px]">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 text-slate-800 font-bold uppercase tracking-wider">
                      <th className="sticky left-0 z-20 py-3 px-3.5 text-left border-r-2 border-slate-300 bg-slate-200 min-w-[100px] shadow-xs">
                        Male
                      </th>
                      {data.systemCategories.map((sys) => (
                        <th key={sys} className="py-3 px-3 border-r border-slate-200 min-w-[85px] sm:min-w-[95px] whitespace-nowrap">
                          {sys}
                        </th>
                      ))}
                      <th className="sticky right-0 z-20 py-3 px-3.5 bg-blue-100 text-blue-950 font-black min-w-[95px] border-l-2 border-slate-300 shadow-xs">
                        TOTAL NO
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {data.ageCategories.map((age) => {
                      const rowTotal = getRowTotal(data.maleMatrix, age)
                      return (
                        <tr key={age} className="hover:bg-slate-50 transition-colors">
                          <td className="sticky left-0 z-10 py-2.5 px-3.5 text-left font-extrabold text-slate-900 border-r-2 border-slate-200 bg-slate-50 shadow-xs">
                            {age}
                          </td>
                          {data.systemCategories.map((sys) => {
                            const val = data.maleMatrix?.[age]?.[sys] || 0
                            return (
                              <td
                                key={sys}
                                className={`py-2.5 px-3 border-r border-slate-100 whitespace-nowrap ${val > 0 ? 'font-bold text-slate-900 bg-blue-50/30' : 'text-slate-400'}`}
                              >
                                {val}
                              </td>
                            )
                          })}
                          <td className="sticky right-0 z-10 py-2.5 px-3.5 font-extrabold text-blue-900 bg-blue-50/90 border-l-2 border-slate-200 shadow-xs">
                            {rowTotal}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-200/80 border-t-2 border-slate-300 font-black text-slate-900">
                      <td className="sticky left-0 z-10 py-3 px-3.5 text-left uppercase border-r-2 border-slate-300 bg-slate-200 shadow-xs">
                        TOTAL NO
                      </td>
                      {data.systemCategories.map((sys) => (
                        <td key={sys} className="py-3 px-3 border-r border-slate-300 whitespace-nowrap">
                          {getColTotal(data.maleMatrix, sys)}
                        </td>
                      ))}
                      <td className="sticky right-0 z-10 py-3 px-3.5 bg-blue-800 text-white font-black border-l-2 border-slate-300 shadow-xs">
                        {data.totalMale}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* 2. FEMALE RECORD TABLE */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-pink-900 uppercase">
                <span className="w-3 h-3 rounded-full bg-pink-600 inline-block"></span>
                <span>FEMALE PATIENTS</span>
              </div>
              <div className="overflow-x-auto rounded-xl border border-slate-200/90 shadow-2xs max-w-full">
                <table className="w-full text-center border-collapse text-xs min-w-[1050px]">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 text-slate-800 font-bold uppercase tracking-wider">
                      <th className="sticky left-0 z-20 py-3 px-3.5 text-left border-r-2 border-slate-300 bg-slate-200 min-w-[100px] shadow-xs">
                        Female
                      </th>
                      {data.systemCategories.map((sys) => (
                        <th key={sys} className="py-3 px-3 border-r border-slate-200 min-w-[85px] sm:min-w-[95px] whitespace-nowrap">
                          {sys}
                        </th>
                      ))}
                      <th className="sticky right-0 z-20 py-3 px-3.5 bg-pink-100 text-pink-950 font-black min-w-[95px] border-l-2 border-slate-300 shadow-xs">
                        TOTAL NO
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {data.ageCategories.map((age) => {
                      const rowTotal = getRowTotal(data.femaleMatrix, age)
                      return (
                        <tr key={age} className="hover:bg-slate-50 transition-colors">
                          <td className="sticky left-0 z-10 py-2.5 px-3.5 text-left font-extrabold text-slate-900 border-r-2 border-slate-200 bg-slate-50 shadow-xs">
                            {age}
                          </td>
                          {data.systemCategories.map((sys) => {
                            const val = data.femaleMatrix?.[age]?.[sys] || 0
                            return (
                              <td
                                key={sys}
                                className={`py-2.5 px-3 border-r border-slate-100 whitespace-nowrap ${val > 0 ? 'font-bold text-slate-900 bg-pink-50/30' : 'text-slate-400'}`}
                              >
                                {val}
                              </td>
                            )
                          })}
                          <td className="sticky right-0 z-10 py-2.5 px-3.5 font-extrabold text-pink-900 bg-pink-50/90 border-l-2 border-slate-200 shadow-xs">
                            {rowTotal}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-200/80 border-t-2 border-slate-300 font-black text-slate-900">
                      <td className="sticky left-0 z-10 py-3 px-3.5 text-left uppercase border-r-2 border-slate-300 bg-slate-200 shadow-xs">
                        TOTAL NO
                      </td>
                      {data.systemCategories.map((sys) => (
                        <td key={sys} className="py-3 px-3 border-r border-slate-300 whitespace-nowrap">
                          {getColTotal(data.femaleMatrix, sys)}
                        </td>
                      ))}
                      <td className="sticky right-0 z-10 py-3 px-3.5 bg-pink-800 text-white font-black border-l-2 border-slate-300 shadow-xs">
                        {data.totalFemale}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* 3. OVERALL COMBINED GRAND TOTAL */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-emerald-900 uppercase">
                <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block"></span>
                <span>OVERALL COMBINED GRAND TOTAL</span>
              </div>
              <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-2xs max-w-full">
                <table className="w-full text-center border-collapse text-xs min-w-[1050px]">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 text-slate-800 font-bold uppercase tracking-wider">
                      <th className="sticky left-0 z-20 py-3 px-3.5 text-left border-r-2 border-slate-300 bg-slate-200 min-w-[100px] shadow-xs">
                        Age Category
                      </th>
                      {data.systemCategories.map((sys) => (
                        <th key={sys} className="py-3 px-3 border-r border-slate-200 min-w-[85px] sm:min-w-[95px] whitespace-nowrap">
                          {sys}
                        </th>
                      ))}
                      <th className="sticky right-0 z-20 py-3 px-3.5 bg-emerald-100 text-emerald-950 font-black min-w-[95px] border-l-2 border-slate-300 shadow-xs">
                        TOTAL NO
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {data.ageCategories.map((age) => {
                      const rowTotal = getRowTotal(data.combinedMatrix, age)
                      return (
                        <tr key={age} className="hover:bg-slate-50 transition-colors">
                          <td className="sticky left-0 z-10 py-2.5 px-3.5 text-left font-extrabold text-slate-900 border-r-2 border-slate-200 bg-slate-50 shadow-xs">
                            {age}
                          </td>
                          {data.systemCategories.map((sys) => {
                            const val = data.combinedMatrix?.[age]?.[sys] || 0
                            return (
                              <td
                                key={sys}
                                className={`py-2.5 px-3 border-r border-slate-100 whitespace-nowrap ${val > 0 ? 'font-bold text-slate-900 bg-emerald-50/30' : 'text-slate-400'}`}
                              >
                                {val}
                              </td>
                            )
                          })}
                          <td className="sticky right-0 z-10 py-2.5 px-3.5 font-extrabold text-emerald-900 bg-emerald-50/90 border-l-2 border-slate-200 shadow-xs">
                            {rowTotal}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-200/80 border-t-2 border-slate-300 font-black text-slate-900">
                      <td className="sticky left-0 z-10 py-3 px-3.5 text-left uppercase border-r-2 border-slate-300 bg-slate-200 shadow-xs">
                        TOTAL NO
                      </td>
                      {data.systemCategories.map((sys) => (
                        <td key={sys} className="py-3 px-3 border-r border-slate-300 whitespace-nowrap">
                          {getColTotal(data.combinedMatrix, sys)}
                        </td>
                      ))}
                      <td className="sticky right-0 z-10 py-3 px-3.5 bg-emerald-800 text-white font-black border-l-2 border-slate-300 shadow-xs">
                        {data.totalPatients}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* PRINT-ONLY OFFICIAL HOSPITAL PATIENT STATS PDF TEMPLATE */}
      {data && (
        <div className="print-only print-container text-black space-y-1.5">
          {/* Header Branding */}
          <div className="border-b border-emerald-900 pb-1 flex items-center justify-between">
            <div>
              <h1 className="text-base font-black text-emerald-950 uppercase tracking-tight">
                AYURVEDIC HOSPITAL PATIENT STATISTICS
              </h1>
              <p className="text-[10px] text-slate-700 font-bold uppercase">
                {getPeriodTitle()}
              </p>
            </div>
            <div className="text-right text-[10px] text-slate-600">
              <div>Printed: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
              <div className="font-extrabold text-slate-900">
                TOTAL PATIENTS: {data.totalPatients}
              </div>
            </div>
          </div>

          {/* 1. MALE RECORD TABLE (PRINT) */}
          <div>
            <h2 className="text-[10px] font-black text-blue-900 uppercase mb-0.5">MALE PATIENTS</h2>
            <table className="w-full text-center border-collapse text-[9px] border border-slate-400">
              <thead>
                <tr className="bg-slate-200 border-b border-slate-400 text-slate-900 font-bold">
                  <th className="py-[1px] px-1 text-left border-r border-slate-400 min-w-[70px]">Male</th>
                  {data.systemCategories.map((sys) => (
                    <th key={sys} className="py-[1px] px-0.5 border-r border-slate-400">
                      {sys}
                    </th>
                  ))}
                  <th className="py-[1px] px-1 bg-slate-300 font-black min-w-[65px]">TOTAL NO</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300">
                {data.ageCategories.map((age) => (
                  <tr key={age}>
                    <td className="py-[1px] px-1 text-left font-bold border-r border-slate-400 bg-slate-50">{age}</td>
                    {data.systemCategories.map((sys) => (
                      <td key={sys} className="py-[1px] px-0.5 border-r border-slate-300">
                        {data.maleMatrix[age]?.[sys] || 0}
                      </td>
                    ))}
                    <td className="py-[1px] px-1 font-black bg-slate-100">{getRowTotal(data.maleMatrix, age)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-300 font-black text-slate-900 border-t border-slate-400">
                  <td className="py-[1px] px-1 text-left uppercase border-r border-slate-400">TOTAL NO</td>
                  {data.systemCategories.map((sys) => (
                    <td key={sys} className="py-[1px] px-0.5 border-r border-slate-400">
                      {getColTotal(data.maleMatrix, sys)}
                    </td>
                  ))}
                  <td className="py-[1px] px-1 bg-blue-800 text-white font-black">{data.totalMale}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* 2. FEMALE RECORD TABLE (PRINT) */}
          <div>
            <h2 className="text-[10px] font-black text-pink-900 uppercase mb-0.5">FEMALE PATIENTS</h2>
            <table className="w-full text-center border-collapse text-[9px] border border-slate-400">
              <thead>
                <tr className="bg-slate-200 border-b border-slate-400 text-slate-900 font-bold">
                  <th className="py-[1px] px-1 text-left border-r border-slate-400 min-w-[70px]">Female</th>
                  {data.systemCategories.map((sys) => (
                    <th key={sys} className="py-[1px] px-0.5 border-r border-slate-400">
                      {sys}
                    </th>
                  ))}
                  <th className="py-[1px] px-1 bg-slate-300 font-black min-w-[65px]">TOTAL NO</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300">
                {data.ageCategories.map((age) => (
                  <tr key={age}>
                    <td className="py-[1px] px-1 text-left font-bold border-r border-slate-400 bg-slate-50">{age}</td>
                    {data.systemCategories.map((sys) => (
                      <td key={sys} className="py-[1px] px-0.5 border-r border-slate-300">
                        {data.femaleMatrix[age]?.[sys] || 0}
                      </td>
                    ))}
                    <td className="py-[1px] px-1 font-black bg-slate-100">{getRowTotal(data.femaleMatrix, age)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-300 font-black text-slate-900 border-t border-slate-400">
                  <td className="py-[1px] px-1 text-left uppercase border-r border-slate-400">TOTAL NO</td>
                  {data.systemCategories.map((sys) => (
                    <td key={sys} className="py-[1px] px-0.5 border-r border-slate-400">
                      {getColTotal(data.femaleMatrix, sys)}
                    </td>
                  ))}
                  <td className="py-[1px] px-1 bg-pink-800 text-white font-black">{data.totalFemale}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* 3. COMBINED GRAND TOTAL TABLE (PRINT) */}
          <div>
            <h2 className="text-[10px] font-black text-emerald-950 uppercase mb-0.5">OVERALL COMBINED GRAND TOTAL</h2>
            <table className="w-full text-center border-collapse text-[9px] border border-slate-400">
              <thead>
                <tr className="bg-slate-200 border-b border-slate-400 text-slate-900 font-bold">
                  <th className="py-[1px] px-1 text-left border-r border-slate-400 min-w-[70px]">Age Category</th>
                  {data.systemCategories.map((sys) => (
                    <th key={sys} className="py-[1px] px-0.5 border-r border-slate-400">
                      {sys}
                    </th>
                  ))}
                  <th className="py-[1px] px-1 bg-emerald-200 text-emerald-950 font-black min-w-[65px]">TOTAL NO</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300">
                {data.ageCategories.map((age) => (
                  <tr key={age}>
                    <td className="py-[1px] px-1 text-left font-bold border-r border-slate-400 bg-slate-50">{age}</td>
                    {data.systemCategories.map((sys) => (
                      <td key={sys} className="py-[1px] px-0.5 border-r border-slate-300">
                        {data.combinedMatrix[age]?.[sys] || 0}
                      </td>
                    ))}
                    <td className="py-[1px] px-1 font-black bg-emerald-100 text-emerald-950">{getRowTotal(data.combinedMatrix, age)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-300 font-black text-slate-900 border-t border-slate-400">
                  <td className="py-[1px] px-1 text-left uppercase border-r border-slate-400">TOTAL NO</td>
                  {data.systemCategories.map((sys) => (
                    <td key={sys} className="py-[1px] px-0.5 border-r border-slate-400">
                      {getColTotal(data.combinedMatrix, sys)}
                    </td>
                  ))}
                  <td className="py-[1px] px-1 bg-emerald-800 text-white font-black">{data.totalPatients}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

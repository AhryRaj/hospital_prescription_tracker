'use client'

import { useState, useEffect } from 'react'
import {
  FileText,
  Calendar,
  Filter,
  DollarSign,
  Users,
  RefreshCw,
  Sprout,
  Printer
} from 'lucide-react'

interface VarietyItem {
  code: string
  name: string
  rawName: string
  quantity: string
  value: number
}

interface PatientStats {
  totalUniquePatients: number
  firstVisitMale: number
  firstVisitFemale: number
  firstVisitOther: number
  totalFirstVisits: number
  subsequentVisitMale: number
  subsequentVisitFemale: number
  subsequentVisitOther: number
  totalSubsequentVisits: number
}

interface ExpenditureReportData {
  period: string
  startDate: string | null
  endDate: string | null
  varieties: VarietyItem[]
  totalExpenditure: number
  totalPrescriptionsCount: number
  patientStats: PatientStats
}

export default function CategoryExpenditurePage() {
  const todayStr = new Date().toISOString().split('T')[0]
  const currentMonthStr = todayStr.substring(0, 7)

  const [period, setPeriod] = useState<'monthly' | 'daily' | 'weekly' | 'all'>('monthly')
  const [selectedDate, setSelectedDate] = useState<string>(todayStr)
  const [selectedWeekDate, setSelectedWeekDate] = useState<string>(todayStr)
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthStr)

  const [data, setData] = useState<ExpenditureReportData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReport()
  }, [period, selectedDate, selectedWeekDate, selectedMonth])

  const fetchReport = async () => {
    setLoading(true)
    try {
      let url = `/api/category-expenditure?period=${period}`
      if (period === 'daily') {
        url += `&date=${selectedDate}`
      } else if (period === 'weekly') {
        url += `&week_date=${selectedWeekDate}`
      } else if (period === 'monthly') {
        url += `&month=${selectedMonth}`
      }

      const res = await fetch(url)
      if (res.ok) {
        const result: ExpenditureReportData = await res.json()
        setData(result)
      }
    } catch (err) {
      console.error('Failed to load category expenditure report:', err)
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print()
    }
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
      .format(val)
      .replace('LKR', 'Rs.')
  }

  const getPeriodBadgeLabel = () => {
    if (period === 'daily') return `Daily Report — ${selectedDate}`
    if (period === 'weekly') return `Weekly Report`
    if (period === 'monthly') return `Monthly Report — ${selectedMonth}`
    return 'All-Time Report'
  }

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-6">
      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          @page {
            margin: 0 !important;
            size: A4 portrait;
          }
          html, body {
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
            padding: 6mm 10mm !important;
            margin: 0 !important;
            box-sizing: border-box !important;
            width: 100% !important;
          }
          .print-avoid-break {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          table {
            width: 100% !important;
          }
          tr, td, th {
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

      {/* Top Banner Header (Screen Only) */}
      <div className="no-print bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 overflow-visible relative z-30">
        <div className="flex-1 min-w-0">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs font-bold border border-emerald-200/80 mb-2">
            <Sprout className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Ayurvedic Hospital Expenditure Report</span>
          </div>
          <h1 className="text-lg sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-snug">
            Details of Drugs Expenditure & Patient Visit Analytics
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Category-wise expenditure Breakdown (Ayurvedic Drugs Co-Operation) & 1st Visit / Subsequent Visit Statistics.
          </p>
        </div>

        <div className="relative z-50 flex items-center gap-2 sm:gap-3 w-full lg:w-auto shrink-0">
          <button
            onClick={fetchReport}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all cursor-pointer shrink-0"
            title="Refresh statistics"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="relative z-50 flex-1 lg:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all cursor-pointer whitespace-nowrap"
          >
            <Printer className="w-4 h-4 shrink-0 pointer-events-none" />
            <span className="pointer-events-none">Print / Export PDF Report</span>
          </button>
        </div>
      </div>

      {/* Period Selection & Date Picker Bar (Screen Only) */}
      <div className="no-print bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 sm:gap-4 overflow-hidden">
        {/* Period Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 items-center gap-1 sm:gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold w-full lg:w-auto">
          <button
            onClick={() => setPeriod('monthly')}
            className={`px-3.5 py-2 rounded-lg transition-all cursor-pointer text-center ${
              period === 'monthly' ? 'bg-white text-emerald-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🗓️ Monthly
          </button>
          <button
            onClick={() => setPeriod('daily')}
            className={`px-3.5 py-2 rounded-lg transition-all cursor-pointer text-center ${
              period === 'daily' ? 'bg-white text-emerald-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📅 Daily
          </button>
          <button
            onClick={() => setPeriod('weekly')}
            className={`px-3.5 py-2 rounded-lg transition-all cursor-pointer text-center ${
              period === 'weekly' ? 'bg-white text-emerald-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📊 Weekly
          </button>
          <button
            onClick={() => setPeriod('all')}
            className={`px-3.5 py-2 rounded-lg transition-all cursor-pointer text-center ${
              period === 'all' ? 'bg-white text-emerald-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🌐 All-Time
          </button>
        </div>

        {/* Date Filter Inputs */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full lg:w-auto justify-between lg:justify-end">
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
                value={selectedWeekDate}
                onChange={(e) => setSelectedWeekDate(e.target.value)}
                className="w-full sm:w-auto px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          )}
        </div>
      </div>

      {/* Loading Indicator */}
      {loading && (
        <div className="no-print p-12 bg-white rounded-2xl border border-slate-200/80 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
          <p className="text-sm font-bold text-slate-600">Calculating Category Expenditure & Patient Visit Analytics...</p>
        </div>
      )}

      {/* 1. SCREEN VIEW CONTAINER */}
      {!loading && data && (
        <div className="no-print bg-white p-4 sm:p-8 rounded-2xl border border-slate-200/80 shadow-2xs space-y-6">
          {/* Header Title on Form */}
          <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base sm:text-xl font-black text-slate-900 tracking-tight uppercase">
                DETAILS OF DRUGS EXPENDITURE
              </h2>
              <p className="text-xs font-bold text-emerald-800 mt-0.5">
                Ayurvedic Drugs Co-Operation Summary & Patient Attendance Breakdown
              </p>
            </div>
            <div className="px-3 py-1 bg-slate-100 border border-slate-200 rounded-lg text-xs font-extrabold text-slate-700">
              {getPeriodBadgeLabel()}
            </div>
          </div>

          {/* Category Expenditure Table (Screen) */}
          <div className="overflow-x-auto rounded-xl border border-slate-300 shadow-2xs max-w-full">
            <table className="w-full text-left border-collapse text-xs min-w-[600px]">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 text-slate-900 font-extrabold uppercase tracking-wider">
                  <th rowSpan={2} className="py-3 px-4 border-r border-slate-300 text-left align-middle w-1/2">
                    Variety
                  </th>
                  <th colSpan={2} className="py-2.5 px-4 border-b border-slate-300 text-center">
                    Ayurvedic Drugs Co-Operation
                  </th>
                </tr>
                <tr className="bg-slate-100 border-b-2 border-slate-300 text-slate-900 font-extrabold uppercase tracking-wider text-xs">
                  <th className="py-2 px-4 border-r border-slate-300 text-center w-1/4">
                    Quantity
                  </th>
                  <th className="py-2 px-4 text-right w-1/4">
                    Value (Rs)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-semibold text-slate-800">
                {data.varieties.map((v) => {
                  const hasValue = v.value > 0
                  return (
                    <tr
                      key={v.name}
                      className={`hover:bg-slate-50 transition-colors ${
                        hasValue ? 'bg-emerald-50/20 font-bold' : ''
                      }`}
                    >
                      <td className="py-2.5 px-4 border-r border-slate-200 font-bold text-slate-900">
                        {v.name}
                      </td>
                      <td className="py-2.5 px-4 border-r border-slate-200 text-center font-mono text-slate-700">
                        {v.quantity}
                      </td>
                      <td className={`py-2.5 px-4 text-right font-mono ${hasValue ? 'text-emerald-950 font-black' : 'text-slate-400'}`}>
                        {hasValue ? v.value.toFixed(2) : '-'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr className="bg-slate-200/90 border-t-2 border-slate-400 font-black text-slate-900 text-sm">
                  <td className="py-3 px-4 uppercase border-r border-slate-300 font-black whitespace-nowrap">
                    Total Expenditure
                  </td>
                  <td className="py-3 px-4 border-r border-slate-300 text-center text-slate-500 font-bold whitespace-nowrap">-</td>
                  <td className="py-3 px-4 text-right bg-emerald-800 text-white font-black text-xs sm:text-base font-mono whitespace-nowrap">
                    {formatCurrency(data.totalExpenditure)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Patient Visit Breakdown Statistics (Screen) */}
          <div className="pt-4 border-t border-slate-200 space-y-3 sm:space-y-4">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide">
              Patient Attendance Summary (1st Visit vs. Subsequent Visit)
            </h3>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
              <div className="p-3 sm:p-4 bg-slate-50 border border-slate-300 rounded-xl space-y-1">
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-600 block leading-tight">
                  Total No of 1st Visit Male
                </span>
                <span className="text-lg sm:text-2xl font-black text-slate-900 block pt-0.5">
                  {data.patientStats.firstVisitMale}
                </span>
              </div>

              <div className="p-3 sm:p-4 bg-slate-50 border border-slate-300 rounded-xl space-y-1">
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-600 block leading-tight">
                  Total No of 1st Visit Female
                </span>
                <span className="text-lg sm:text-2xl font-black text-slate-900 block pt-0.5">
                  {data.patientStats.firstVisitFemale}
                </span>
              </div>

              <div className="p-3 sm:p-4 bg-slate-50 border border-slate-300 rounded-xl space-y-1">
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-600 block leading-tight">
                  Subsequent Visit Male
                </span>
                <span className="text-lg sm:text-2xl font-black text-slate-900 block pt-0.5">
                  {data.patientStats.subsequentVisitMale}
                </span>
              </div>

              <div className="p-3 sm:p-4 bg-slate-50 border border-slate-300 rounded-xl space-y-1">
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-600 block leading-tight">
                  Subsequent Visit Female
                </span>
                <span className="text-lg sm:text-2xl font-black text-slate-900 block pt-0.5">
                  {data.patientStats.subsequentVisitFemale}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. PRINT-ONLY DEDICATED REPORT CONTAINER */}
      {!loading && data && (
        <div className="print-only print-container space-y-3">
          <div className="border-b border-slate-400 pb-1.5 flex items-center justify-between">
            <div>
              <h1 className="text-sm font-black text-slate-900 uppercase tracking-tight">
                DETAILS OF DRUGS EXPENDITURE
              </h1>
              <p className="text-[10px] font-bold text-slate-700">
                Ayurvedic Drugs Co-Operation Summary & Patient Attendance Breakdown
              </p>
            </div>
            <div className="text-right text-[10px] font-bold text-slate-700">
              <div>{getPeriodBadgeLabel()}</div>
              <div>Printed: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
            </div>
          </div>

          {/* Category Expenditure Table for Print */}
          <table className="w-full text-left border-collapse text-[9.5px] border border-slate-400">
            <thead>
              <tr className="bg-slate-200 border-b border-slate-400 text-slate-900 font-extrabold uppercase">
                <th rowSpan={2} className="py-1 px-2 border-r border-slate-400 text-left align-middle w-1/2">
                  Variety
                </th>
                <th colSpan={2} className="py-0.5 px-2 border-b border-slate-400 text-center">
                  Ayurvedic Drugs Co-Operation
                </th>
              </tr>
              <tr className="bg-slate-200 border-b border-slate-400 text-slate-900 font-extrabold uppercase text-[9px]">
                <th className="py-0.5 px-2 border-r border-slate-400 text-center w-1/4">
                  Quantity
                </th>
                <th className="py-0.5 px-2 text-right w-1/4">
                  Value (Rs)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300 font-semibold text-slate-900">
              {data.varieties.map((v) => {
                const hasValue = v.value > 0
                return (
                  <tr key={v.name} className={hasValue ? 'bg-slate-50 font-bold' : ''}>
                    <td className="py-[1px] px-2 border-r border-slate-300 font-bold text-slate-900">
                      {v.name}
                    </td>
                    <td className="py-[1px] px-2 border-r border-slate-300 text-center font-mono">
                      {v.quantity}
                    </td>
                    <td className="py-[1px] px-2 text-right font-mono font-bold">
                      {hasValue ? v.value.toFixed(2) : '-'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr className="bg-slate-300 font-black text-slate-900 border-t-2 border-slate-400 text-[10px]">
                <td className="py-1 px-2 uppercase border-r border-slate-400 font-black">
                  Total Expenditure
                </td>
                <td className="py-1 px-2 border-r border-slate-400 text-center">-</td>
                <td className="py-1 px-2 text-right font-black text-xs font-mono">
                  {formatCurrency(data.totalExpenditure)}
                </td>
              </tr>
            </tfoot>
          </table>

          {/* Patient Attendance Summary for Print */}
          <div className="pt-2 border-t border-slate-400 space-y-1.5 print-avoid-break">
            <h3 className="text-[10px] font-black text-slate-900 uppercase">
              Patient Attendance Summary (1st Visit vs. Subsequent Visit)
            </h3>
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="p-1.5 border border-slate-400 rounded bg-slate-50">
                <div className="text-[9px] font-bold text-slate-700 leading-tight">Total No of 1st Visit Male</div>
                <div className="text-xs font-black text-slate-900 pt-0.5">{data.patientStats.firstVisitMale}</div>
              </div>
              <div className="p-1.5 border border-slate-400 rounded bg-slate-50">
                <div className="text-[9px] font-bold text-slate-700 leading-tight">Total No of 1st Visit Female</div>
                <div className="text-xs font-black text-slate-900 pt-0.5">{data.patientStats.firstVisitFemale}</div>
              </div>
              <div className="p-1.5 border border-slate-400 rounded bg-slate-50">
                <div className="text-[9px] font-bold text-slate-700 leading-tight">Subsequent Visit Male</div>
                <div className="text-xs font-black text-slate-900 pt-0.5">{data.patientStats.subsequentVisitMale}</div>
              </div>
              <div className="p-1.5 border border-slate-400 rounded bg-slate-50">
                <div className="text-[9px] font-bold text-slate-700 leading-tight">Subsequent Visit Female</div>
                <div className="text-xs font-black text-slate-900 pt-0.5">{data.patientStats.subsequentVisitFemale}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

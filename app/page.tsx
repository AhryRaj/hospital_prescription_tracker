'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  LayoutDashboard, 
  PlusCircle, 
  BarChart3, 
  Pill, 
  ClipboardList, 
  TrendingUp, 
  FileText, 
  Users, 
  ArrowRight,
  Sprout,
  Leaf,
  Award,
  Layers
} from 'lucide-react'

interface Drug {
  id: number
  name: string
  category: string
  size_amount: number
  size_unit: string
  unit_price: number
}

interface Prescription {
  id: number
  date: string
  patient_id: string
  drug_id: number
  drug: Drug
  dose: number
  total_qty: number
  total_cost: number
  created_at: string
}

export default function DashboardPage() {
  const [drugs, setDrugs] = useState<Drug[]>([])
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const [drugsRes, prescriptionsRes] = await Promise.all([
        fetch('/api/drugs'),
        fetch('/api/prescriptions'),
      ])

      if (drugsRes.ok) setDrugs(await drugsRes.json())
      if (prescriptionsRes.ok) setPrescriptions(await prescriptionsRes.json())
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }

  // Calculated Metrics
  const totalExpenditure = prescriptions.reduce((acc, p) => acc + p.total_cost, 0)
  const totalPrescriptions = prescriptions.length
  const avgCostPerPrescription = totalPrescriptions > 0 ? totalExpenditure / totalPrescriptions : 0

  // 1. Top 5 Most Expended Drugs Calculation
  const drugCostMap = new Map<number, { drug: Drug; totalCost: number; count: number }>()
  prescriptions.forEach((p) => {
    if (!drugCostMap.has(p.drug_id)) {
      drugCostMap.set(p.drug_id, { drug: p.drug, totalCost: 0, count: 0 })
    }
    const item = drugCostMap.get(p.drug_id)!
    item.totalCost += p.total_cost
    item.count += 1
  })

  const topDrugs = Array.from(drugCostMap.values())
    .sort((a, b) => b.totalCost - a.totalCost)
    .slice(0, 5)

  // 2. Daily Expenditure Trend Calculation
  const dailyMap = new Map<string, number>()
  prescriptions.forEach((p) => {
    const dStr = p.date.split('T')[0]
    dailyMap.set(dStr, (dailyMap.get(dStr) || 0) + p.total_cost)
  })

  const sortedDailyTrends = Array.from(dailyMap.entries())
    .map(([date, cost]) => ({ date, cost: Math.round(cost * 100) / 100 }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-7)

  const maxDailyCost = Math.max(...sortedDailyTrends.map((t) => t.cost), 1)

  // 3. Category Expenditure Breakdown
  const categoryMap = new Map<string, number>()
  prescriptions.forEach((p) => {
    const cat = p.drug.category
    categoryMap.set(cat, (categoryMap.get(cat) || 0) + p.total_cost)
  })

  const topCategories = Array.from(categoryMap.entries())
    .map(([cat, cost]) => ({ cat, cost }))
    .sort((a, b) => b.cost - a.cost)
    .slice(0, 4)

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-6">
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white p-5 sm:p-7 rounded-2xl shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold text-emerald-100 border border-white/20 mb-2">
            <Sprout className="w-3.5 h-3.5 text-emerald-300" />
            <span>Ayurvedic Executive Analytics</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>Ayurvedic Prescription & Expenditure Tracker</span>
          </h1>
          <p className="text-emerald-100 text-xs sm:text-sm mt-0.5 max-w-xl">
            Real-time management system for patient drug prescriptions, herbal inventory pricing, and hospital expenditure.
          </p>
        </div>

        <div className="relative z-10 w-full sm:w-auto shrink-0">
          <Link
            href="/prescribe"
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-3 bg-white text-emerald-900 font-bold text-sm rounded-xl shadow-md hover:bg-emerald-50 transition-all hover:scale-105 whitespace-nowrap shrink-0"
          >
            <PlusCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="whitespace-nowrap">Issue New Prescription</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid (2x2 on Mobile, 4-col on Tablet & Desktop) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5">
        <div className="bg-white p-3.5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider">
            <span>Expenditure</span>
            <div className="p-1.5 sm:p-2.5 bg-emerald-50 text-emerald-700 rounded-lg sm:rounded-xl border border-emerald-100">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-2 sm:mt-4">
            <div className="text-base sm:text-2xl font-black text-slate-900">
              LKR {totalExpenditure.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1 font-medium truncate">Total hospital cost</p>
          </div>
        </div>

        <div className="bg-white p-3.5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider">
            <span>Prescriptions</span>
            <div className="p-1.5 sm:p-2.5 bg-teal-50 text-teal-700 rounded-lg sm:rounded-xl border border-teal-100">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-2 sm:mt-4">
            <div className="text-base sm:text-2xl font-black text-slate-900">{totalPrescriptions}</div>
            <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1 font-medium truncate">Patient transactions</p>
          </div>
        </div>

        <div className="bg-white p-3.5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider">
            <span>Avg / Patient</span>
            <div className="p-1.5 sm:p-2.5 bg-amber-50 text-amber-700 rounded-lg sm:rounded-xl border border-amber-100">
              <Users className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-2 sm:mt-4">
            <div className="text-base sm:text-2xl font-black text-slate-900">
              LKR {avgCostPerPrescription.toFixed(2)}
            </div>
            <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1 font-medium truncate">Average cost</p>
          </div>
        </div>

        <div className="bg-white p-3.5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider">
            <span>Medicines</span>
            <div className="p-1.5 sm:p-2.5 bg-emerald-50 text-emerald-700 rounded-lg sm:rounded-xl border border-emerald-100">
              <Pill className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-2 sm:mt-4">
            <div className="text-base sm:text-2xl font-black text-slate-900">{drugs.length}</div>
            <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1 font-medium truncate">Herbal preparations</p>
          </div>
        </div>
      </div>

      {/* Visual Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart 1: Daily Expenditure Trend Graph */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Daily Expenditure Trend</h2>
                  <p className="text-xs text-slate-500 font-medium">Hospital expenditure over time</p>
                </div>
              </div>
              <span className="text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full">
                Last 7 Days
              </span>
            </div>

            {loading ? (
              <div className="py-16 text-center text-slate-400 animate-pulse font-medium">
                Loading expenditure trend...
              </div>
            ) : sortedDailyTrends.length === 0 ? (
              <div className="py-16 text-center text-slate-400 text-xs">
                No daily trends recorded yet.
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                <div className="h-44 flex items-end justify-between gap-3 pt-6 px-2 border-b border-slate-100 pb-2">
                  {sortedDailyTrends.map((t) => {
                    const heightPercent = Math.max(12, Math.round((t.cost / maxDailyCost) * 100))
                    const dFormat = new Date(t.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })

                    return (
                      <div key={t.date} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                        <span className="text-[10px] font-bold text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-100 px-1.5 py-0.5 rounded">
                          LKR {t.cost.toFixed(0)}
                        </span>

                        <div className="w-full bg-slate-100 rounded-t-lg overflow-hidden flex items-end h-full">
                          <div
                            style={{ height: `${heightPercent}%` }}
                            className="w-full bg-gradient-to-t from-emerald-700 to-teal-500 rounded-t-lg transition-all group-hover:brightness-110"
                          ></div>
                        </div>

                        <span className="text-[11px] font-bold text-slate-500">{dFormat}</span>
                      </div>
                    )
                  })}
                </div>

                <div className="pt-3 border-t border-slate-100 mt-2 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span className="flex items-center gap-1.5 text-slate-600">
                      <Layers className="w-4 h-4 text-emerald-600" />
                      <span>Top Hospital Categories</span>
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400">By Expenditure</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {topCategories.map((c) => (
                      <div key={c.cat} className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-2.5 flex flex-col justify-between">
                        <span className="text-[11px] font-extrabold text-slate-900 truncate">{c.cat}</span>
                        <span className="text-xs font-black text-emerald-800 mt-0.5">LKR {c.cost.toFixed(0)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Chart 2: Top 5 Most Expended Drugs */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Top 5 Expended Drugs</h2>
                  <p className="text-xs text-slate-500 font-medium">Ranked by total hospital cost</p>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Highest Cost
              </span>
            </div>

            {loading ? (
              <div className="py-16 text-center text-slate-400 animate-pulse font-medium">
                Calculating top drugs...
              </div>
            ) : topDrugs.length === 0 ? (
              <div className="py-16 text-center text-slate-400 text-xs">
                No prescription data recorded yet.
              </div>
            ) : (
              <div className="mt-5 space-y-3.5">
                {topDrugs.map((item, index) => {
                  const sharePercent = totalExpenditure > 0 ? (item.totalCost / totalExpenditure) * 100 : 0

                  return (
                    <div key={item.drug.id} className="space-y-1">
                      <div className="flex items-center justify-between text-xs gap-2">
                        <div className="flex items-center gap-2 font-bold text-slate-900 truncate">
                          <span className="w-5 h-5 shrink-0 rounded-full bg-slate-100 text-slate-600 text-[10px] flex items-center justify-center font-mono">
                            #{index + 1}
                          </span>
                          <span className="truncate">{item.drug.name}</span>
                          <span className="shrink-0 text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200/80 font-bold px-2 py-0.5 rounded-md">
                            {item.drug.category}
                          </span>
                        </div>
                        <span className="shrink-0 font-extrabold text-emerald-800">
                          LKR {item.totalCost.toFixed(2)}
                        </span>
                      </div>

                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${Math.max(8, sharePercent)}%` }}
                          className="bg-gradient-to-r from-emerald-600 to-teal-500 h-full rounded-full transition-all"
                        ></div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Panels */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-5">
        <Link
          href="/prescribe"
          className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-emerald-400 hover:shadow-md transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold border border-emerald-100 shrink-0">
                <PlusCircle className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 mt-3 sm:mt-5">Issue New Prescription</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed hidden sm:block">
              Auto-populated date picker, searchable catalog, and proportional expenditure calculations.
            </p>
          </div>
        </Link>

        <Link
          href="/summaries"
          className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-emerald-400 hover:shadow-md transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold border border-teal-100 shrink-0">
                <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 group-hover:text-teal-600 group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 mt-3 sm:mt-5">Expenditure Summaries</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed hidden sm:block">
              Analyze Daily, Weekly, and Monthly reports for individual drugs or whole hospital operations.
            </p>
          </div>
        </Link>

        <Link
          href="/drugs"
          className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-emerald-400 hover:shadow-md transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold border border-emerald-100 shrink-0">
                <Pill className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 mt-3 sm:mt-5">Browse Medicine Catalog</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed hidden sm:block">
              Browse all 261 registered medicines, package sizes, unit prices, and add new inventory.
            </p>
          </div>
        </Link>
      </div>

      {/* Recent Prescriptions Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recent Prescriptions Log</h2>
            <p className="text-xs text-slate-500 mt-0.5">Latest recorded patient prescriptions</p>
          </div>

          <Link
            href="/prescriptions"
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 animate-pulse font-medium">
            Loading recent transactions...
          </div>
        ) : prescriptions.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            No prescriptions recorded yet.
          </div>
        ) : (
          <>
            {/* Mobile Card List View (< md) */}
            <div className="block md:hidden divide-y divide-slate-100">
              {[...prescriptions]
                .sort((a, b) => {
                  const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime()
                  if (dateDiff !== 0) return dateDiff
                  return b.id - a.id
                })
                .slice(0, 5)
                .map((p) => {
                  const pDate = new Date(p.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })

                  return (
                    <div key={p.id} className="p-4 space-y-2 bg-white hover:bg-slate-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="bg-emerald-50 text-emerald-900 border border-emerald-200/80 font-bold px-2.5 py-0.5 rounded-lg text-xs">
                          🏥 Patient: {p.patient_id}
                        </span>
                        <span className="text-[11px] font-medium text-slate-400">📅 {pDate}</span>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <div>
                          <div className="font-extrabold text-sm text-slate-900">{p.drug.name}</div>
                          <div className="text-xs text-slate-500 font-medium mt-0.5">
                            Dose: <span className="font-semibold text-slate-700">{p.dose} {p.drug.size_unit}</span> • Total: <span className="font-bold text-slate-900">{p.total_qty} {p.drug.size_unit}</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-black text-emerald-800 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200 block">
                            LKR {p.total_cost.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
            </div>

            {/* Desktop & Tablet Table View (>= md) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm min-w-[700px]">
                <thead>
                  <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 text-xs font-semibold">
                    <th className="py-3 px-5">Date</th>
                    <th className="py-3 px-5">Patient ID</th>
                    <th className="py-3 px-5">Drug Name</th>
                    <th className="py-3 px-5">Single Dose</th>
                    <th className="py-3 px-5">Total Dispensed</th>
                    <th className="py-3 px-5 text-right">Calculated Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {[...prescriptions]
                    .sort((a, b) => {
                      const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime()
                      if (dateDiff !== 0) return dateDiff
                      return b.id - a.id
                    })
                    .slice(0, 5)
                    .map((p) => {
                    const pDate = new Date(p.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })

                    return (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-5 text-slate-500 text-xs font-medium">{pDate}</td>
                        <td className="py-3.5 px-5 font-bold text-slate-900">{p.patient_id}</td>
                        <td className="py-3.5 px-5 font-bold text-slate-900">{p.drug.name}</td>
                        <td className="py-3.5 px-5 text-xs font-medium">
                          {p.dose} {p.drug.size_unit}
                        </td>
                        <td className="py-3.5 px-5 font-semibold text-slate-900">
                          {p.total_qty} {p.drug.size_unit}
                        </td>
                        <td className="py-3.5 px-5 text-right font-bold text-emerald-700">
                          LKR {p.total_cost.toFixed(2)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

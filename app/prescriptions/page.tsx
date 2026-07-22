'use client'

import { useState, useEffect } from 'react'
import { 
  ClipboardList, 
  Search, 
  User, 
  Pill, 
  Calendar, 
  DollarSign, 
  RefreshCw,
  Sprout
} from 'lucide-react'
import { Pagination } from '../components/Pagination'

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

export default function PrescriptionLogPage() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [loading, setLoading] = useState(true)
  const [patientSearch, setPatientSearch] = useState('')

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  useEffect(() => {
    fetchPrescriptions()
  }, [])

  useEffect(() => {
    setCurrentPage(1)
  }, [patientSearch])

  const fetchPrescriptions = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/prescriptions')
      if (res.ok) {
        const data = await res.json()
        setPrescriptions(data)
      }
    } catch (err) {
      console.error('Failed to fetch prescriptions log:', err)
    } finally {
      setLoading(false)
    }
  }

  const filtered = prescriptions
    .filter(
      (p) =>
        p.patient_id.toLowerCase().includes(patientSearch.toLowerCase()) ||
        p.drug.name.toLowerCase().includes(patientSearch.toLowerCase())
    )
    .sort((a, b) => {
      const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime()
      if (dateDiff !== 0) return dateDiff
      return b.id - a.id
    })

  const grandTotalExpenditure = filtered.reduce((acc, p) => acc + p.total_cost, 0)

  const totalPages = Math.ceil(filtered.length / itemsPerPage)
  const paginatedPrescriptions = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-700 font-semibold text-sm">
            <Sprout className="w-5 h-5 text-emerald-600" />
            <span>Prescription Log Audit</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Prescription Log History</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Full historical audit log of all patient prescriptions and recorded expenditures.
          </p>
        </div>

        <button
          onClick={fetchPrescriptions}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition-all cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Log</span>
        </button>
      </div>

      {/* Search and Summary Strip */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={patientSearch}
            onChange={(e) => setPatientSearch(e.target.value)}
            placeholder="Search Patient ID or Drug Name..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
          />
        </div>

        <div className="text-right text-xs text-slate-500 font-medium">
          <span className="font-semibold text-slate-700">{filtered.length} Total Records</span> • Total Expenditure:{' '}
          <span className="font-bold text-emerald-700">LKR {grandTotalExpenditure.toFixed(2)}</span>
        </div>
      </div>

      {/* Prescriptions Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden flex flex-col">
        {loading ? (
          <div className="p-12 text-center text-slate-400 animate-pulse font-medium">
            Loading prescription history...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            No prescription records found matching search.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse text-sm min-w-[750px]">
                <thead>
                  <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 text-xs font-semibold">
                    <th className="py-3 px-5">Date</th>
                    <th className="py-3 px-5">Patient ID</th>
                    <th className="py-3 px-5">Prescribed Drug</th>
                    <th className="py-3 px-5">Single Dose</th>
                    <th className="py-3 px-5">Total Dispensed</th>
                    <th className="py-3 px-5 text-right">Calculated Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {paginatedPrescriptions.map((p) => {
                    const pDate = new Date(p.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })

                    return (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-5 text-slate-500 font-medium text-xs">{pDate}</td>
                        <td className="py-3.5 px-5 font-bold text-slate-900">{p.patient_id}</td>
                        <td className="py-3.5 px-5">
                          <div className="font-bold text-slate-900">{p.drug.name}</div>
                          <span className="whitespace-nowrap inline-block mt-1 bg-emerald-50 text-emerald-800 border border-emerald-200/80 font-bold px-2 py-0.5 rounded-md text-[10px]">
                            {p.drug.category}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-xs text-slate-600 font-medium">
                          {p.dose} {p.drug.size_unit}
                        </td>
                        <td className="py-3.5 px-5 font-semibold text-slate-900">
                          {p.total_qty} {p.drug.size_unit}
                        </td>
                        <td className="py-3.5 px-5 text-right font-bold text-emerald-800">
                          LKR {p.total_cost.toFixed(2)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filtered.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>
    </div>
  )
}

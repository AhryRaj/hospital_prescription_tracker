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
  Sprout,
  Trash2,
  AlertTriangle,
  CheckSquare,
  Square,
  X
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
  gender?: string | null
  age_category?: string | null
  system_category?: string | null
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

  // Selection & Bulk Delete State
  const [selectedPrescriptionIds, setSelectedPrescriptionIds] = useState<number[]>([])
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false)
  const [deletingPrescription, setDeletingPrescription] = useState<Prescription | null>(null)
  const [actionSubmitting, setActionSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchPrescriptions()
  }, [])

  useEffect(() => {
    setCurrentPage(1)
  }, [patientSearch])

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage('')
      }, 3500)
      return () => clearTimeout(timer)
    }
  }, [message])

  const fetchPrescriptions = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/prescriptions?t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      })
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

  // Selection Helpers
  const isAllFilteredSelected = filtered.length > 0 && filtered.every((p) => selectedPrescriptionIds.includes(p.id))

  const toggleSelectAllFiltered = () => {
    if (isAllFilteredSelected) {
      setSelectedPrescriptionIds([])
    } else {
      setSelectedPrescriptionIds(filtered.map((p) => p.id))
    }
  }

  const toggleSelectPrescription = (id: number) => {
    setSelectedPrescriptionIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  // Deletion Actions
  const handleConfirmSingleDelete = async () => {
    if (!deletingPrescription) return
    setActionSubmitting(true)

    try {
      const res = await fetch(`/api/prescriptions?id=${deletingPrescription.id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setMessage(`Prescription for Patient #${deletingPrescription.patient_id} deleted successfully.`)
        setSelectedPrescriptionIds((prev) => prev.filter((id) => id !== deletingPrescription.id))
        setDeletingPrescription(null)
        fetchPrescriptions()
      } else {
        const errorData = await res.json()
        alert(errorData.error || 'Failed to delete prescription record.')
      }
    } catch (err) {
      console.error('Error deleting prescription:', err)
      alert('Error connecting to server.')
    } finally {
      setActionSubmitting(false)
    }
  }

  const handleConfirmBulkDelete = async () => {
    if (selectedPrescriptionIds.length === 0) return
    setActionSubmitting(true)

    try {
      const res = await fetch('/api/prescriptions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedPrescriptionIds }),
      })

      if (res.ok) {
        const result = await res.json()
        setMessage(`Successfully deleted ${result.count || selectedPrescriptionIds.length} prescription records.`)
        setSelectedPrescriptionIds([])
        setShowBulkDeleteModal(false)
        fetchPrescriptions()
      } else {
        const errorData = await res.json()
        alert(errorData.error || 'Failed to delete selected prescriptions.')
      }
    } catch (err) {
      console.error('Error executing bulk prescription deletion:', err)
      alert('Error executing bulk deletion.')
    } finally {
      setActionSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-6">
      {/* Toast Notification */}
      {message && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-900 text-white px-5 py-3.5 rounded-xl shadow-xl border border-emerald-700/50 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <Sprout className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-semibold">{message}</span>
        </div>
      )}

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

      {/* Bulk Action Bar - 100% Mobile & Tablet Responsive */}
      {selectedPrescriptionIds.length > 0 && (
        <div className="bg-emerald-50/90 border border-emerald-200/90 rounded-2xl p-3.5 sm:p-4 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs sm:text-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
            <span>{selectedPrescriptionIds.length} Record{selectedPrescriptionIds.length > 1 ? 's' : ''} Selected</span>
          </div>

          <div className="grid grid-cols-2 sm:flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={toggleSelectAllFiltered}
              className="px-3 py-2 sm:py-1.5 bg-white border border-emerald-200 text-emerald-800 hover:bg-emerald-100/50 font-bold text-xs rounded-xl transition-all cursor-pointer text-center justify-center truncate"
            >
              {isAllFilteredSelected ? 'Select All' : `Select All (${filtered.length})`}
            </button>

            <button
              type="button"
              onClick={() => setSelectedPrescriptionIds([])}
              className="px-3 py-2 sm:py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs rounded-xl transition-all cursor-pointer text-center justify-center truncate"
            >
              Deselect All
            </button>

            <button
              type="button"
              onClick={() => setShowBulkDeleteModal(true)}
              className="col-span-2 sm:col-span-1 flex items-center justify-center gap-1.5 px-4 py-2 sm:py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer w-full sm:w-auto"
            >
              <Trash2 className="w-3.5 h-3.5 shrink-0" />
              <span className="whitespace-nowrap">Delete Selected ({selectedPrescriptionIds.length})</span>
            </button>
          </div>
        </div>
      )}

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
              <table className="w-full text-left border-collapse text-sm min-w-[850px]">
                <thead>
                  <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 text-xs font-semibold">
                    <th className="py-3 px-4 w-12 text-center">
                      <button
                        type="button"
                        onClick={toggleSelectAllFiltered}
                        className="text-slate-400 hover:text-emerald-600 transition-colors cursor-pointer align-middle"
                        title={isAllFilteredSelected ? "Deselect all" : "Select all filtered"}
                      >
                        {isAllFilteredSelected ? (
                          <CheckSquare className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </th>
                    <th className="py-3 px-5">Date</th>
                    <th className="py-3 px-5">Patient ID</th>
                    <th className="py-3 px-5">Prescribed Drug</th>
                    <th className="py-3 px-5">Total Dispensed</th>
                    <th className="py-3 px-5 text-right">Calculated Cost</th>
                    <th className="py-3 px-5 text-center w-24">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {paginatedPrescriptions.map((p) => {
                    const isSelected = selectedPrescriptionIds.includes(p.id)
                    const pDate = new Date(p.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })

                    return (
                      <tr 
                        key={p.id} 
                        className={`transition-colors ${isSelected ? 'bg-emerald-50/50 hover:bg-emerald-50/80' : 'hover:bg-slate-50/80'}`}
                      >
                        <td className="py-3.5 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => toggleSelectPrescription(p.id)}
                            className="text-slate-400 hover:text-emerald-600 transition-colors cursor-pointer align-middle"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </button>
                        </td>
                        <td className="py-3.5 px-5 text-slate-500 font-medium text-xs whitespace-nowrap">{pDate}</td>
                        <td className="py-3.5 px-5 font-bold text-slate-900">
                          <div>{p.patient_id}</div>
                          {(p.gender || p.age_category || p.system_category) && (
                            <div className="flex flex-wrap items-center gap-1 mt-1 font-semibold text-[10px]">
                              {p.gender && (
                                <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200">
                                  {p.gender}
                                </span>
                              )}
                              {p.age_category && (
                                <span className="bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded border border-emerald-200/70 font-bold">
                                  {p.age_category}
                                </span>
                              )}
                              {p.system_category && (
                                <span className="bg-teal-50 text-teal-800 px-1.5 py-0.5 rounded border border-teal-200/70 font-bold">
                                  {p.system_category}
                                </span>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-5">
                          <div className="font-bold text-slate-900">{p.drug.name}</div>
                          <span className="whitespace-nowrap inline-block mt-1 bg-emerald-50 text-emerald-800 border border-emerald-200/80 font-bold px-2 py-0.5 rounded-md text-[10px]">
                            {p.drug.category}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 font-semibold text-slate-900 whitespace-nowrap">
                          {p.total_qty} {p.drug.size_unit}
                        </td>
                        <td className="py-3.5 px-5 text-right font-bold text-emerald-800 whitespace-nowrap">
                          LKR {p.total_cost.toFixed(2)}
                        </td>
                        <td className="py-3.5 px-5 text-center whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => setDeletingPrescription(p)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete prescription record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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

      {/* SINGLE DELETE CONFIRMATION MODAL */}
      {deletingPrescription && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-red-50 text-red-600 rounded-xl border border-red-100">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">Delete Prescription Record</h3>
                  <p className="text-xs text-slate-500 font-medium">This action cannot be undone.</p>
                </div>
              </div>
              <button
                onClick={() => setDeletingPrescription(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 text-xs text-slate-700 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Patient ID:</span>
                <span className="font-bold text-slate-900">#{deletingPrescription.patient_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Prescribed Medicine:</span>
                <span className="font-bold text-slate-900">{deletingPrescription.drug.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Date Issued:</span>
                <span className="font-medium text-slate-700">
                  {new Date(deletingPrescription.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200">
                <span className="text-slate-500 font-medium">Recorded Expenditure:</span>
                <span className="font-bold text-emerald-800">LKR {deletingPrescription.total_cost.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingPrescription(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSingleDelete}
                disabled={actionSubmitting}
                className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
              >
                {actionSubmitting ? 'Deleting...' : 'Delete Record'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BULK DELETE CONFIRMATION MODAL */}
      {showBulkDeleteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-red-50 text-red-600 rounded-xl border border-red-100">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">Bulk Delete Prescriptions</h3>
                  <p className="text-xs text-slate-500 font-medium">Permanent database deletion</p>
                </div>
              </div>
              <button
                onClick={() => setShowBulkDeleteModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-slate-600 text-xs leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-slate-900 font-bold">{selectedPrescriptionIds.length} selected prescription log records</strong>? 
              This will remove them permanently from your hospital history and recalculate summary reports.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowBulkDeleteModal(false)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmBulkDelete}
                disabled={actionSubmitting}
                className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
              >
                {actionSubmitting ? 'Deleting Records...' : `Yes, Delete ${selectedPrescriptionIds.length} Records`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

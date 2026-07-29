'use client'

import { useState, useEffect } from 'react'
import { 
  Pill, 
  Search, 
  PlusCircle, 
  Sprout, 
  Leaf,
  Edit3,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  X,
  CheckSquare,
  Square
} from 'lucide-react'
import { Pagination } from '../components/Pagination'
import { CategorySelect } from '../components/CategorySelect'

interface Drug {
  id: number
  name: string
  category: string
  size_amount: number
  size_unit: string
  unit_price: number
  standard_dose: number
}

export default function DrugCatalogPage() {
  const [drugs, setDrugs] = useState<Drug[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Selection & Bulk Actions State
  const [selectedDrugIds, setSelectedDrugIds] = useState<number[]>([])
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false)

  // Add Drug Modal State
  const [showAddModal, setShowAddModal] = useState(false)
  const [newDrugName, setNewDrugName] = useState('')
  const [newCategory, setNewCategory] = useState('Arishta')
  const [newSizeAmount, setNewSizeAmount] = useState<number | string>(750)
  const [newSizeUnit, setNewSizeUnit] = useState('ml')
  const [newUnitPrice, setNewUnitPrice] = useState<number | string>(1500)
  const [newStandardDose, setNewStandardDose] = useState<number | string>(120)

  // Edit & Delete State
  const [editingDrug, setEditingDrug] = useState<Drug | null>(null)
  const [deletingDrug, setDeletingDrug] = useState<Drug | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [actionSubmitting, setActionSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchDrugs()
  }, [])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, selectedCategory])

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage('')
      }, 3500)
      return () => clearTimeout(timer)
    }
  }, [message])

  const fetchDrugs = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/drugs?t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      })
      if (res.ok) {
        const data = await res.json()
        setDrugs(data)
      }
    } catch (err) {
      console.error('Failed to fetch drugs catalog:', err)
    } finally {
      setLoading(false)
    }
  }

  const categories = Array.from(new Set(drugs.map((d) => d.category))).filter(Boolean)

  const filteredDrugs = drugs.filter((d) => {
    const matchesSearch =
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.category.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || d.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const totalPages = Math.max(1, Math.ceil(filteredDrugs.length / itemsPerPage))
  const paginatedDrugs = filteredDrugs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Selection Helper Functions
  const toggleSelectAll = () => {
    const allFilteredIds = filteredDrugs.map((d) => d.id)
    const isAllSelected = allFilteredIds.length > 0 && allFilteredIds.every((id) => selectedDrugIds.includes(id))

    if (isAllSelected) {
      setSelectedDrugIds((prev) => prev.filter((id) => !allFilteredIds.includes(id)))
    } else {
      const merged = Array.from(new Set([...selectedDrugIds, ...allFilteredIds]))
      setSelectedDrugIds(merged)
    }
  }

  const toggleSelectDrug = (id: number) => {
    setSelectedDrugIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const handleAddDrug = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newDrugName || !newCategory || !newSizeAmount || !newSizeUnit || !newUnitPrice) {
      alert('Please fill out all required fields.')
      return
    }

    setSubmitting(true)
    setMessage('')
    try {
      const res = await fetch('/api/drugs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newDrugName,
          category: newCategory,
          size_amount: newSizeAmount,
          size_unit: newSizeUnit,
          unit_price: newUnitPrice,
          standard_dose: newStandardDose,
        }),
      })

      if (res.ok) {
        const created = await res.json()
        setDrugs((prev) => [...prev, created])
        setMessage(`New medicine "${created.name}" added to catalog.`)
        setShowAddModal(false)
        setNewDrugName('')
      } else {
        alert('Failed to add drug.')
      }
    } catch (err) {
      console.error(err)
      alert('Error adding drug.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdateDrug = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingDrug) return

    setActionSubmitting(true)
    setMessage('')
    try {
      const res = await fetch('/api/drugs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingDrug),
      })

      if (res.ok) {
        const updated = await res.json()
        setDrugs((prev) => prev.map((d) => (d.id === updated.id ? updated : d)))
        setMessage(`Medicine "${updated.name}" updated successfully.`)
        setEditingDrug(null)
      } else {
        alert('Failed to update drug.')
      }
    } catch (err) {
      console.error(err)
      alert('Error updating drug.')
    } finally {
      setActionSubmitting(false)
    }
  }

  const handleDeleteDrug = async () => {
    if (!deletingDrug) return

    setActionSubmitting(true)
    setMessage('')
    try {
      const res = await fetch(`/api/drugs?id=${deletingDrug.id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setDrugs((prev) => prev.filter((d) => d.id !== deletingDrug.id))
        setSelectedDrugIds((prev) => prev.filter((id) => id !== deletingDrug.id))
        setMessage(`Medicine "${deletingDrug.name}" deleted from catalog.`)
        setDeletingDrug(null)
      } else {
        alert('Failed to delete drug.')
      }
    } catch (err) {
      console.error(err)
      alert('Error deleting drug.')
    } finally {
      setActionSubmitting(false)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedDrugIds.length === 0) return

    setActionSubmitting(true)
    setMessage('')
    try {
      const res = await fetch('/api/drugs', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedDrugIds }),
      })

      if (res.ok) {
        const data = await res.json()
        const count = data.count || selectedDrugIds.length
        setDrugs((prev) => prev.filter((d) => !selectedDrugIds.includes(d.id)))
        setMessage(`Successfully deleted ${count} selected medicines from catalog.`)
        setSelectedDrugIds([])
        setShowBulkDeleteModal(false)
      } else {
        alert('Failed to bulk delete selected medicines.')
      }
    } catch (err) {
      console.error(err)
      alert('Error executing bulk deletion.')
    } finally {
      setActionSubmitting(false)
    }
  }

  const isAllFilteredSelected = filteredDrugs.length > 0 && filteredDrugs.every((d) => selectedDrugIds.includes(d.id))

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs font-bold border border-emerald-200/80 mb-2">
            <Sprout className="w-3.5 h-3.5 text-emerald-600" />
            <span>Ayurvedic Herbal Catalog</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Ayurvedic Medicine Catalog ({drugs.length})
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Browse, search, select multiple medicines to delete in bulk, or edit package prices and doses.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 px-4.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-xs transition-all cursor-pointer whitespace-nowrap shrink-0 w-full sm:w-auto"
        >
          <PlusCircle className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
          <span className="whitespace-nowrap">Add New Drug</span>
        </button>
      </div>

      {/* Bulk Action Bar (When Items Selected) - 100% Mobile & Tablet Responsive */}
      {selectedDrugIds.length > 0 && (
        <div className="bg-emerald-50 p-3 sm:p-4 rounded-2xl shadow-xs border border-emerald-200/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 animate-in slide-in-from-top-3 duration-200">
          <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs sm:text-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
            <span>{selectedDrugIds.length} {selectedDrugIds.length === 1 ? 'Medicine' : 'Medicines'} Selected</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setSelectedDrugIds([])}
              className="flex-1 sm:flex-none px-3.5 py-2 sm:py-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-colors cursor-pointer text-center truncate"
            >
              Deselect All
            </button>

            <button
              type="button"
              onClick={() => setShowBulkDeleteModal(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 sm:py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold rounded-xl shadow-xs transition-all cursor-pointer whitespace-nowrap"
            >
              <Trash2 className="w-3.5 h-3.5 shrink-0" />
              <span>Delete Selected ({selectedDrugIds.length})</span>
            </button>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search drug name or category..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
          />
        </div>

        <CategorySelect
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
      </div>

      {/* Catalog Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-end">

          {filteredDrugs.length > 0 && (
            <button
              type="button"
              onClick={toggleSelectAll}
              className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1.5 cursor-pointer"
            >
              {isAllFilteredSelected ? (
                <>
                  <CheckSquare className="w-4 h-4 text-emerald-600" />
                  <span>Deselect All on Page</span>
                </>
              ) : (
                <>
                  <Square className="w-4 h-4 text-slate-400" />
                  <span>Select All</span>
                </>
              )}
            </button>
          )}
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 animate-pulse font-medium">
            Loading medicine catalog...
          </div>
        ) : filteredDrugs.length === 0 ? (
          <div className="p-12 text-center text-slate-500 font-medium">
            No medicines found matching your search.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm min-w-[850px]">
                <thead>
                  <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 text-xs font-semibold">
                    <th className="py-3 px-4 w-10">
                      <input
                        type="checkbox"
                        checked={isAllFilteredSelected}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                        title="Select All Filtered Medicines"
                      />
                    </th>
                    <th className="py-3 px-4">ID</th>
                    <th className="py-3 px-4">Drug Name</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Package Size</th>
                    <th className="py-3 px-4">Package Price</th>
                    <th className="py-3 px-4">Calculated Rate</th>
                    <th className="py-3 px-4">Standard Dose</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  {paginatedDrugs.map((d) => {
                    const unitRate = d.unit_price / d.size_amount
                    const isSelected = selectedDrugIds.includes(d.id)

                    return (
                      <tr
                        key={d.id}
                        className={`transition-colors ${
                          isSelected ? 'bg-emerald-50/60 font-semibold' : 'hover:bg-slate-50/80'
                        }`}
                      >
                        <td className="py-3 px-4">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectDrug(d.id)}
                            className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                          />
                        </td>
                        <td className="py-3 px-4 text-xs font-mono text-slate-400">#{d.id}</td>
                        <td className="py-3 px-4 font-bold text-slate-900">{d.name}</td>
                        <td className="py-3 px-4">
                          <span className="whitespace-nowrap inline-block bg-emerald-50 text-emerald-800 border border-emerald-200/80 font-bold px-2.5 py-0.5 rounded-md text-xs">
                            {d.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-800 font-semibold whitespace-nowrap">
                          {d.size_amount} {d.size_unit}
                        </td>
                        <td className="py-3 px-4 font-extrabold text-slate-900 whitespace-nowrap">
                          LKR {d.unit_price.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-emerald-700 font-bold text-xs whitespace-nowrap">
                          LKR {unitRate.toFixed(4)} / {d.size_unit}
                        </td>
                        <td className="py-3 px-4">
                          <span className="bg-slate-100 text-slate-800 border border-slate-200/80 font-bold px-2.5 py-0.5 rounded-md text-xs whitespace-nowrap">
                            {d.standard_dose} {d.size_unit}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setEditingDrug(d)}
                              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                              title="Edit Drug Details"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeletingDrug(d)}
                              className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete Drug"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredDrugs.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
              />
            </div>
          </>
        )}
      </div>

      {/* 1. Add New Drug Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200/90 max-w-lg w-full p-6 space-y-6 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
                  <Leaf className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Add New Ayurvedic Medicine</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddDrug} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Medicine Name *</label>
                <input
                  type="text"
                  required
                  value={newDrugName}
                  onChange={(e) => setNewDrugName(e.target.value)}
                  placeholder="e.g. Abhayarishta Special"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Category *</label>
                <input
                  type="text"
                  required
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="e.g. Arishta, Kwatha, Vati..."
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Package Amount *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={newSizeAmount}
                    onWheel={(e) => (e.target as HTMLElement).blur()}
                    onChange={(e) => setNewSizeAmount(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 text-sm font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Unit (ml / g / s) *</label>
                  <input
                    type="text"
                    required
                    value={newSizeUnit}
                    onChange={(e) => setNewSizeUnit(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 text-sm font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Package Price (LKR) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newUnitPrice}
                    onWheel={(e) => (e.target as HTMLElement).blur()}
                    onChange={(e) => setNewUnitPrice(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 text-sm font-bold text-emerald-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Standard Dose Qty *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={newStandardDose}
                    onWheel={(e) => (e.target as HTMLElement).blur()}
                    onChange={(e) => setNewStandardDose(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 text-sm font-bold text-emerald-800"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 text-slate-700 font-bold text-sm rounded-xl hover:bg-slate-100 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  {submitting ? 'Adding...' : 'Add Medicine'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Edit Drug Modal */}
      {editingDrug && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200/90 max-w-lg w-full p-6 space-y-6 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
                  <Edit3 className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Edit Medicine Details</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingDrug(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateDrug} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Medicine Name *</label>
                <input
                  type="text"
                  required
                  value={editingDrug.name}
                  onChange={(e) => setEditingDrug({ ...editingDrug, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Category *</label>
                <input
                  type="text"
                  required
                  value={editingDrug.category}
                  onChange={(e) => setEditingDrug({ ...editingDrug, category: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Package Amount *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={editingDrug.size_amount}
                    onWheel={(e) => (e.target as HTMLElement).blur()}
                    onChange={(e) =>
                      setEditingDrug({
                        ...editingDrug,
                        size_amount: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 font-bold text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Unit (ml / g / s) *</label>
                  <input
                    type="text"
                    required
                    value={editingDrug.size_unit}
                    onChange={(e) => setEditingDrug({ ...editingDrug, size_unit: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 text-sm font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Package Price (LKR) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editingDrug.unit_price}
                    onWheel={(e) => (e.target as HTMLElement).blur()}
                    onChange={(e) =>
                      setEditingDrug({
                        ...editingDrug,
                        unit_price: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 font-black text-sm text-emerald-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Standard Dose Qty *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={editingDrug.standard_dose}
                    onWheel={(e) => (e.target as HTMLElement).blur()}
                    onChange={(e) =>
                      setEditingDrug({
                        ...editingDrug,
                        standard_dose: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 font-black text-sm text-emerald-800"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingDrug(null)}
                  className="px-5 py-2.5 text-slate-700 font-bold text-sm rounded-xl hover:bg-slate-100 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionSubmitting}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  {actionSubmitting ? 'Updating...' : 'Update Medicine'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Single Delete Confirmation Modal */}
      {deletingDrug && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200/90 max-w-lg w-full p-6 space-y-5 animate-in fade-in duration-150">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-200/80 shadow-2xs">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Delete Medicine Record</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Are you sure you want to delete <strong className="text-slate-900 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-lg font-bold">{deletingDrug.name}</strong> from the hospital catalog? This will automatically erase the record from the database.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeletingDrug(null)}
                className="px-5 py-2.5 text-slate-700 hover:bg-slate-100 font-bold text-sm rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteDrug}
                disabled={actionSubmitting}
                className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm rounded-xl shadow-xs transition-all cursor-pointer"
              >
                {actionSubmitting ? 'Deleting...' : 'Delete Medicine'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Bulk Delete Confirmation Modal */}
      {showBulkDeleteModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200/90 max-w-lg w-full p-6 space-y-5 animate-in fade-in duration-150">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-200/80 shadow-2xs">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Bulk Delete Medicines</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Are you sure you want to delete <strong className="text-rose-700 font-extrabold">{selectedDrugIds.length} selected medicines</strong> from your catalog? This action is permanent and will remove them from the database.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowBulkDeleteModal(false)}
                className="px-5 py-2.5 text-slate-700 hover:bg-slate-100 font-bold text-sm rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBulkDelete}
                disabled={actionSubmitting}
                className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>{actionSubmitting ? 'Deleting...' : `Delete ${selectedDrugIds.length} Medicines`}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Auto-Dismissing Toast Notification Popup */}
      {message && (
        <div className="fixed bottom-20 lg:bottom-6 right-6 z-50 bg-emerald-50 text-emerald-950 px-4.5 py-3 rounded-2xl shadow-xl border border-emerald-200/90 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-300">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <span className="text-xs font-extrabold text-emerald-900 pr-2">{message}</span>
          <button
            type="button"
            onClick={() => setMessage('')}
            className="text-emerald-600 hover:text-emerald-900 p-1 rounded-lg hover:bg-emerald-100 transition-colors cursor-pointer"
            title="Dismiss Notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  PlusCircle,
  Pill,
  CheckCircle2,
  AlertCircle,
  Calendar,
  User,
  Sprout,
  Leaf,
  Receipt,
  X,
  BarChart3,
  ArrowRight,
  Trash2,
  Edit3,
  ShoppingCart,
  Plus
} from 'lucide-react'
import { DrugCombobox, DrugOption } from '../components/DrugCombobox'
import { CustomSelect } from '../components/CustomSelect'

const GENDER_OPTIONS = [
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
  { value: 'Other', label: 'Other' },
]

const AGE_CATEGORY_OPTIONS = [
  { value: '0-1', label: '0-1' },
  { value: '1+', label: '1+' },
  { value: '5+', label: '5+' },
  { value: '10+', label: '10+' },
  { value: '20+', label: '20+' },
  { value: '40+', label: '40+' },
  { value: '60+', label: '60+' },
]

const SYSTEM_CATEGORY_OPTIONS = [
  { value: 'b / o', label: 'b / o' },
  { value: 'c / SP 60', label: 'c / SP 60' },
  { value: 'e / SM 39', label: 'e / SM 39' },
  { value: 'g / O', label: 'g / O' },
  { value: 'h / SP 12', label: 'h / SP 12' },
  { value: 'i / O', label: 'i / O' },
  { value: 'j / SP 41', label: 'j / SP 41' },
  { value: 'k / O', label: 'k / O' },
  { value: 'l / SK 95', label: 'l / SK 95' },
  { value: 'm / SN 49', label: 'm / SN 49' },
  { value: 'n / O', label: 'n / O' },
]

interface BasketItem {
  key: string
  drug_id: number
  name: string
  category: string
  size_amount: number
  size_unit: string
  unit_price: number
  dispense_qty: number
  item_cost: number
}

export default function PrescribePage() {
  const [drugs, setDrugs] = useState<DrugOption[]>([])
  const [loading, setLoading] = useState(true)

  const todayStr = new Date().toISOString().split('T')[0]
  const [prescriptionDate, setPrescriptionDate] = useState<string>(todayStr)
  const [patientId, setPatientId] = useState('')
  const [selectedDrugId, setSelectedDrugId] = useState<number | ''>('')
  const [gender, setGender] = useState<string>('Male')
  const [ageCategory, setAgeCategory] = useState<string>('20+')
  const [systemCategory, setSystemCategory] = useState<string>('g / O')

  // Basket state for multi-drug prescription
  const [basket, setBasket] = useState<BasketItem[]>([])
  const [customQty, setCustomQty] = useState<number | string>('')
  const [editingItemKey, setEditingItemKey] = useState<string | null>(null)
  const [editQtyInput, setEditQtyInput] = useState<number | string>('')

  const [submitting, setSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    fetchDrugs()
  }, [])

  const fetchDrugs = async () => {
    try {
      const res = await fetch('/api/drugs')
      if (res.ok) {
        const data: DrugOption[] = await res.json()
        setDrugs(data)
        if (data.length > 0) {
          setSelectedDrugId(data[0].id)
          setCustomQty(data[0].standard_dose || 8)
        }
      }
    } catch (err) {
      console.error('Failed to load drugs catalog:', err)
      setErrorMessage('Could not load herbal medicine catalog.')
    } finally {
      setLoading(false)
    }
  }

  const selectedDrug = drugs.find((d) => d.id === Number(selectedDrugId))

  // Update quantity field whenever selected drug changes
  const handleDrugSelect = (drugIdNum: number) => {
    setSelectedDrugId(drugIdNum)
    const drugObj = drugs.find((d) => d.id === drugIdNum)
    if (drugObj) {
      setCustomQty(drugObj.standard_dose || 8)
    }
  }

  // Calculate live single item cost preview for current selection
  const numCustomQty = typeof customQty === 'number' ? customQty : parseFloat(customQty as string) || 0
  const selectedUnitRate = selectedDrug ? selectedDrug.unit_price / selectedDrug.size_amount : 0
  const previewItemCost = selectedDrug && numCustomQty > 0 ? numCustomQty * selectedUnitRate : 0

  // Add currently selected drug into the basket
  const handleAddToBasket = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!selectedDrug) return

    const qtyToAdd = numCustomQty > 0 ? numCustomQty : (selectedDrug.standard_dose || 8)
    const itemCost = (qtyToAdd / selectedDrug.size_amount) * selectedDrug.unit_price

    // Check if drug is already in basket
    const existingIndex = basket.findIndex((item) => item.drug_id === selectedDrug.id)

    if (existingIndex >= 0) {
      // Update existing item
      const updatedBasket = [...basket]
      updatedBasket[existingIndex] = {
        ...updatedBasket[existingIndex],
        dispense_qty: updatedBasket[existingIndex].dispense_qty + qtyToAdd,
        item_cost: ((updatedBasket[existingIndex].dispense_qty + qtyToAdd) / selectedDrug.size_amount) * selectedDrug.unit_price,
      }
      setBasket(updatedBasket)
    } else {
      // Add new item
      const newItem: BasketItem = {
        key: `${selectedDrug.id}-${Date.now()}`,
        drug_id: selectedDrug.id,
        name: selectedDrug.name,
        category: selectedDrug.category,
        size_amount: selectedDrug.size_amount,
        size_unit: selectedDrug.size_unit,
        unit_price: selectedDrug.unit_price,
        dispense_qty: qtyToAdd,
        item_cost: Math.round(itemCost * 100) / 100,
      }
      setBasket((prev) => [...prev, newItem])
    }

    setErrorMessage(null)
  }

  // Remove item from basket
  const handleRemoveFromBasket = (itemKey: string) => {
    setBasket((prev) => prev.filter((item) => item.key !== itemKey))
  }

  // Save edit for a basket item
  const handleSaveEditItem = (itemKey: string) => {
    const parsedQty = typeof editQtyInput === 'number' ? editQtyInput : parseFloat(editQtyInput as string) || 0
    if (parsedQty <= 0) return

    setBasket((prev) =>
      prev.map((item) => {
        if (item.key === itemKey) {
          const newCost = (parsedQty / item.size_amount) * item.unit_price
          return {
            ...item,
            dispense_qty: parsedQty,
            item_cost: Math.round(newCost * 100) / 100,
          }
        }
        return item
      })
    )
    setEditingItemKey(null)
  }

  // Calculate Grand Total for entire Basket
  const grandTotalCost = basket.reduce((acc, item) => acc + item.item_cost, 0)

  // Submit complete multi-drug prescription
  const handleSubmitPrescription = async () => {
    setErrorMessage('')
    setSuccessMessage('')

    if (!patientId.trim()) {
      setErrorMessage('Please enter a valid Patient ID or Registration Number.')
      return
    }

    if (basket.length === 0) {
      setErrorMessage('Please add at least one medicine to the prescription basket.')
      return
    }

    setSubmitting(true)

    try {
      const payloadItems = basket.map((item) => ({
        drug_id: item.drug_id,
        custom_qty: item.dispense_qty,
      }))

      const res = await fetch('/api/prescriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: prescriptionDate,
          patient_id: patientId,
          gender,
          age_category: ageCategory,
          system_category: systemCategory,
          items: payloadItems,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setSuccessMessage(
          `Successfully recorded prescription (${data.count} medicines) for Patient ${data.patient_id}! Total Expenditure: LKR ${data.grandTotalCost.toFixed(2)}`
        )
        setPatientId('')
        setBasket([])

        // Auto dismiss toast after 5 seconds
        setTimeout(() => {
          setSuccessMessage(null)
        }, 5000)
      } else {
        const errData = await res.json()
        setErrorMessage(errData.error || 'Failed to record prescription.')
      }
    } catch (err) {
      console.error(err)
      setErrorMessage('An unexpected error occurred.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-[1600px] mx-auto min-h-[calc(100vh-6.5rem)] flex flex-col justify-between space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs font-bold border border-emerald-200/80 mb-2">
            <Sprout className="w-3.5 h-3.5 text-emerald-600" />
            <span>Ayurvedic Prescription Workspace</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">Issue Patient Prescription</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Add multiple herbal remedies per patient ticket, adjust dispense quantities, and record overall expenditure.
          </p>
        </div>

        <Link
          href="/summaries"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 text-emerald-900 border border-emerald-200/90 rounded-xl text-xs sm:text-sm font-extrabold shadow-2xs transition-all cursor-pointer shrink-0 w-full sm:w-auto justify-center"
        >
          <BarChart3 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Expenditure Reports</span>
          <ArrowRight className="w-4 h-4 text-emerald-600 shrink-0" />
        </Link>
      </div>

      {/* Floating Notification Toast */}
      {successMessage && (
        <div className="fixed top-16 left-4 right-4 sm:top-20 sm:left-auto sm:right-6 sm:max-w-md z-50 bg-emerald-50 text-emerald-950 p-3.5 sm:p-4 rounded-2xl shadow-xl border border-emerald-300/90 flex items-center justify-between gap-3 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="text-xs sm:text-sm font-extrabold text-emerald-950 leading-snug">
              {successMessage}
            </span>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-700 hover:text-emerald-950 transition-colors cursor-pointer p-1 rounded-lg hover:bg-emerald-100 shrink-0"
            title="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="bg-rose-50 border border-rose-200 text-rose-900 px-5 py-4 rounded-xl flex items-center gap-3 shadow-2xs">
          <AlertCircle className="w-6 h-6 text-rose-600 flex-shrink-0" />
          <div className="flex-1 text-sm font-semibold">{errorMessage}</div>
        </div>
      )}

      {/* Main Grid Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch flex-1">
        {/* Left Column: Form & Itemized Basket (7 cols) */}
        <div className="lg:col-span-7 space-y-6 flex flex-col">
          {/* Patient Details & Add Drug Builder */}
          <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/80 shadow-2xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <User className="w-5 h-5 text-emerald-600" />
                <span>1. Patient & Visit Info</span>
              </h2>
              <span className="text-xs text-slate-400 font-medium">* Required fields</span>
            </div>

            {/* Row 1: Prescription Date & Patient ID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Prescription Date *</span>
                </label>
                <input
                  type="date"
                  required
                  value={prescriptionDate}
                  onChange={(e) => setPrescriptionDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Patient ID / Ticket No. *</span>
                </label>
                <input
                  type="text"
                  required
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  placeholder="e.g. PAT-2026-0042"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>
            </div>

            {/* Row 2: Demographics (Gender, Age Category, System Category) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              {/* Gender */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Gender
                </label>
                <CustomSelect
                  options={GENDER_OPTIONS}
                  value={gender}
                  onChange={setGender}
                />
              </div>

              {/* Age Category */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Age Category
                </label>
                <CustomSelect
                  options={AGE_CATEGORY_OPTIONS}
                  value={ageCategory}
                  onChange={setAgeCategory}
                />
              </div>

              {/* System Category */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  System Category
                </label>
                <CustomSelect
                  options={SYSTEM_CATEGORY_OPTIONS}
                  value={systemCategory}
                  onChange={setSystemCategory}
                />
              </div>
            </div>

            {/* Row 2: Select & Add Drug into Basket */}
            <div className="pt-2 border-t border-slate-100 space-y-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Leaf className="w-5 h-5 text-emerald-600" />
                <span>2. Medicine & Dosage</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                <div className="sm:col-span-7">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Drug Name / Category
                  </label>
                  {loading ? (
                    <div className="h-10 bg-slate-100 rounded-xl animate-pulse"></div>
                  ) : (
                    <DrugCombobox
                      drugs={drugs}
                      selectedDrugId={selectedDrugId}
                      onSelect={handleDrugSelect}
                      placeholder="Search medicines..."
                    />
                  )}
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Dispense Qty ({selectedDrug?.size_unit || 'ml'})
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={customQty}
                    onChange={(e) => setCustomQty(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900"
                  />
                </div>

                <div className="sm:col-span-2">
                  <button
                    type="button"
                    onClick={() => handleAddToBasket()}
                    disabled={!selectedDrug}
                    className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-2xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Itemized Prescription Basket Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden flex-1 flex flex-col justify-between">
            <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-emerald-600" />
                <h3 className="font-extrabold text-sm text-slate-900">
                  Prescription Basket ({basket.length} {basket.length === 1 ? 'Drug' : 'Drugs'})
                </h3>
              </div>

              {basket.length > 0 && (
                <button
                  type="button"
                  onClick={() => setBasket([])}
                  className="text-xs text-rose-600 hover:text-rose-800 font-semibold cursor-pointer"
                >
                  Clear All
                </button>
              )}
            </div>

            <div className="overflow-x-auto flex-1">
              {basket.length === 0 ? (
                <div className="p-10 text-center text-slate-400 space-y-2">
                  <Pill className="w-10 h-10 mx-auto text-slate-300" />
                  <p className="text-sm font-bold text-slate-600">Prescription Basket is Empty</p>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Select a medicine from the catalog above and click <strong className="text-emerald-700">+ Add</strong> to build the patient&apos;s prescription.
                  </p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse text-sm min-w-[600px]">
                  <thead>
                    <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 text-xs font-semibold">
                      <th className="py-3 px-4">#</th>
                      <th className="py-3 px-4">Drug Name</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Dispense Qty</th>
                      <th className="py-3 px-4">Item Cost</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {basket.map((item, idx) => {
                      const isEditing = editingItemKey === item.key

                      return (
                        <tr key={item.key} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4 text-xs font-mono text-slate-400">{idx + 1}</td>
                          <td className="py-3 px-4 font-bold text-slate-900">{item.name}</td>
                          <td className="py-3 px-4">
                            <span className="bg-emerald-50 text-emerald-800 border border-emerald-200/80 font-bold px-2 py-0.5 rounded text-[11px]">
                              {item.category}
                            </span>
                          </td>

                          {/* Dispense Qty (Editable) */}
                          <td className="py-3 px-4">
                            {isEditing ? (
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="number"
                                  step="0.1"
                                  min="0.1"
                                  value={editQtyInput}
                                  onChange={(e) => setEditQtyInput(e.target.value)}
                                  className="w-20 px-2 py-1 bg-white border border-emerald-500 rounded text-xs font-bold text-slate-900 focus:outline-none"
                                  autoFocus
                                />
                                <button
                                  type="button"
                                  onClick={() => handleSaveEditItem(item.key)}
                                  className="px-2 py-1 bg-emerald-600 text-white rounded text-[11px] font-bold"
                                >
                                  Save
                                </button>
                              </div>
                            ) : (
                              <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-xs">
                                {item.dispense_qty} {item.size_unit}
                              </span>
                            )}
                          </td>

                          {/* Item Cost */}
                          <td className="py-3 px-4 font-extrabold text-emerald-800">
                            LKR {item.item_cost.toFixed(2)}
                          </td>

                          {/* Actions: Edit & Delete */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingItemKey(item.key)
                                  setEditQtyInput(item.dispense_qty)
                                }}
                                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                                title="Edit Quantity"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleRemoveFromBasket(item.key)}
                                className="p-1.5 rounded-lg border border-red-200 hover:bg-red-50 text-red-600 hover:text-red-700 transition-colors cursor-pointer"
                                title="Remove from Prescription"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Live Expenditure Summary & Grand Total (5 cols) */}
        <div className="lg:col-span-5 bg-slate-50/50 p-7 sm:p-8 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between relative overflow-hidden h-full space-y-6">
          <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200/80">
              <div className="flex items-center gap-2.5 text-slate-900">
                <Receipt className="w-5 h-5 text-emerald-600" />
                <span className="font-extrabold text-xs tracking-wider uppercase">Live Expenditure Summary</span>
              </div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-900 px-2.5 py-1 rounded-full border border-emerald-200/80 shadow-2xs">
                {basket.length} {basket.length === 1 ? 'Item' : 'Items'}
              </span>
            </div>

            {/* Itemized Breakdown List */}
            {basket.length > 0 ? (
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {basket.map((item, idx) => (
                  <div
                    key={item.key}
                    className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-400">#{idx + 1}</span>
                        <span className="font-bold text-slate-900 truncate">{item.name}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {item.category} • {item.dispense_qty} {item.size_unit}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-extrabold text-emerald-800 block text-xs">
                        LKR {item.item_cost.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center text-slate-400 text-xs font-medium bg-white rounded-xl border border-dashed border-slate-300 space-y-2">
                <Leaf className="w-8 h-8 mx-auto text-emerald-500" />
                <p className="font-bold text-slate-700 text-sm">No Medicines Added</p>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Add medicines to the prescription basket to view live expenditure breakdown and submit.
                </p>
              </div>
            )}
          </div>

          {/* Grand Calculated Cost Callout Box & Submit Button */}
          <div className="space-y-4 pt-4 border-t border-slate-200/80 mt-auto">
            <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-800 via-teal-900 to-emerald-950 text-white border border-emerald-700/80 shadow-md flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold text-emerald-200 uppercase tracking-wider block">
                  Grand Total Prescription Cost
                </span>
                <span className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-0.5 block">
                  LKR {grandTotalCost.toFixed(2)}
                </span>
              </div>
              <div className="bg-white/10 p-3 rounded-xl border border-white/20 shrink-0">
                <Receipt className="w-6 h-6 text-white" />
              </div>
            </div>

            <button
              type="button"
              onClick={handleSubmitPrescription}
              disabled={submitting || basket.length === 0 || !patientId.trim()}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 group cursor-pointer"
            >
              <PlusCircle className="w-5 h-5 transition-transform group-hover:rotate-90" />
              <span>
                {submitting
                  ? 'Submitting Prescription...'
                  : `Submit Patient Prescription (${basket.length} ${basket.length === 1 ? 'Item' : 'Items'})`}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

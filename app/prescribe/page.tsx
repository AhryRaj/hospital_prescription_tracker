'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  PlusCircle, 
  Pill, 
  Calculator, 
  CheckCircle2, 
  AlertCircle,
  Calendar,
  User,
  Sprout,
  Leaf,
  Receipt,
  X,
  BarChart3,
  ArrowRight
} from 'lucide-react'
import { DrugCombobox, DrugOption } from '../components/DrugCombobox'

export default function PrescribePage() {
  const [drugs, setDrugs] = useState<DrugOption[]>([])
  const [loading, setLoading] = useState(true)

  const todayStr = new Date().toISOString().split('T')[0]
  const [prescriptionDate, setPrescriptionDate] = useState<string>(todayStr)
  const [patientId, setPatientId] = useState('')
  const [selectedDrugId, setSelectedDrugId] = useState<number | ''>('')
  const [dose, setDose] = useState<number | string>(15)
  const [doseUnit, setDoseUnit] = useState<string>('ml')
  const [frequency, setFrequency] = useState<number | string>(3)
  const [days, setDays] = useState<number | string>(5)

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
        const data = await res.json()
        setDrugs(data)
        if (data.length > 0) {
          setSelectedDrugId(data[0].id)
          setFrequency(data[0].frequency || 3)
          setDays(data[0].days || 5)
          setDoseUnit(data[0].size_unit || 'ml')
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

  // Automatically update dose unit whenever the selected drug changes
  useEffect(() => {
    if (selectedDrug?.size_unit) {
      setDoseUnit(selectedDrug.size_unit)
    }
  }, [selectedDrugId, selectedDrug])

  const numDose = typeof dose === 'number' ? dose : parseFloat(dose as string) || 0
  const numFreq = typeof frequency === 'number' ? frequency : parseInt(frequency as string) || 0
  const numDays = typeof days === 'number' ? days : parseInt(days as string) || 0

  const calculatedTotalQty = numDose && numFreq && numDays ? numDose * numFreq * numDays : 0
  const perUnitRate = selectedDrug ? selectedDrug.unit_price / selectedDrug.size_amount : 0
  const calculatedTotalCost = selectedDrug && calculatedTotalQty > 0
    ? calculatedTotalQty * perUnitRate
    : 0

  const handleDrugSelect = (drugIdNum: number) => {
    setSelectedDrugId(drugIdNum)
    const drugObj = drugs.find((d) => d.id === drugIdNum)
    if (drugObj) {
      setFrequency(drugObj.frequency || 3)
      setDays(drugObj.days || 5)
      setDoseUnit(drugObj.size_unit || 'ml')
    }
  }



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    if (!patientId.trim()) {
      setErrorMessage('Please enter a valid Patient ID or Registration Number.')
      return
    }

    if (!selectedDrugId) {
      setErrorMessage('Please select a drug from the catalog.')
      return
    }

    if (numDose <= 0 || numFreq <= 0 || numDays <= 0) {
      setErrorMessage('Dose, frequency, and duration must be greater than zero.')
      return
    }

    setSubmitting(true)

    try {
      const res = await fetch('/api/prescriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: prescriptionDate,
          patient_id: patientId,
          drug_id: selectedDrugId,
          dose: numDose,
          frequency: numFreq,
          days: numDays,
        }),
      })

      if (res.ok) {
        const created = await res.json()
        setSuccessMessage(
          `Prescription successfully recorded for Patient ${created.patient_id}! Total Expenditure: LKR ${created.total_cost.toFixed(2)}`
        )
        setPatientId('')

        // Auto dismiss toast after 4 seconds
        setTimeout(() => {
          setSuccessMessage(null)
        }, 4000)
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
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs font-bold border border-emerald-200/80 mb-2">
            <Sprout className="w-3.5 h-3.5 text-emerald-600" />
            <span>Ayurvedic Prescription Workspace</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">Issue New Patient Prescription</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Auto-populated prescription date, searchable 261-drug catalog, and live proportional expenditure calculator.
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

      {/* Floating Toast Notification Popup */}
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
        {/* Prescription Form Section */}
        <div className="lg:col-span-7 bg-white p-7 sm:p-8 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between space-y-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <User className="w-5 h-5 text-emerald-600" />
                <span>Patient & Dosage Details</span>
              </h2>
              <span className="text-xs text-slate-400 font-medium">* Required fields</span>
            </div>

            {/* Mobile & Tablet Compact Live Expenditure Summary Card (< lg) */}
            {selectedDrug && (
              <div className="lg:hidden bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2.5 animate-in fade-in duration-200">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-[9px] font-extrabold uppercase tracking-wider text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-200 shrink-0">
                      {selectedDrug.category}
                    </span>
                    <span className="text-xs sm:text-sm font-extrabold text-slate-900 truncate">
                      {selectedDrug.name}
                    </span>
                  </div>
                  <span className="text-[11px] sm:text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200/60 whitespace-nowrap shrink-0">
                    {numDose} {doseUnit} × {numFreq}/d × {numDays}d
                  </span>
                </div>

                <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-emerald-950 text-white px-4 py-2.5 rounded-xl border border-emerald-700/80 shadow-xs flex items-center justify-between gap-2">
                  <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-wider text-emerald-100 whitespace-nowrap">
                    Total Prescription Cost
                  </span>
                  <span className="text-xs sm:text-sm font-black tracking-tight whitespace-nowrap bg-emerald-900/90 text-white px-2.5 py-1 rounded-lg border border-emerald-700/60">
                    LKR {calculatedTotalCost.toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6 flex-1 flex flex-col justify-between">
              <div className="space-y-6">
                {/* Row 1: Auto-populated Date & Patient ID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Prescription Date */}
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
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">Automatically defaults to today</p>
                  </div>

                  {/* Patient Registration ID */}
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
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">Enter hospital ticket or patient ID</p>
                  </div>
                </div>

                {/* Row 2: Searchable Drug Combobox */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Select Drug from Catalog *</span>
                  </label>

                  {loading ? (
                    <div className="h-12 bg-slate-100 rounded-xl animate-pulse"></div>
                  ) : (
                    <DrugCombobox
                      drugs={drugs}
                      selectedDrugId={selectedDrugId}
                      onSelect={handleDrugSelect}
                      placeholder="Type drug name or category (e.g. Abhayarishta)..."
                    />
                  )}
                </div>

                {/* Row 3: Dosage & Schedule Breakdown (Superior 2-Row Layout) */}
                <div className="space-y-4 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Dose per Intake ({doseUnit}) *
                    </label>
                    <input
                      type="number"
                      min="0.1"
                      step="0.1"
                      required
                      value={dose}
                      onWheel={(e) => (e.target as HTMLElement).blur()}
                      onChange={(e) => {
                        const val = e.target.value
                        setDose(val === '' ? '' : parseFloat(val))
                      }}
                      placeholder={`e.g. 15 ${doseUnit}`}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Frequency (Times / Day) *
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="12"
                        required
                        value={frequency}
                        onWheel={(e) => (e.target as HTMLElement).blur()}
                        onChange={(e) => {
                          const val = e.target.value
                          setFrequency(val === '' ? '' : parseInt(val))
                        }}
                        placeholder="e.g. 3"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Duration (Days) *
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="365"
                        required
                        value={days}
                        onWheel={(e) => (e.target as HTMLElement).blur()}
                        onChange={(e) => {
                          const val = e.target.value
                          setDays(val === '' ? '' : parseInt(val))
                        }}
                        placeholder="e.g. 5"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-5 border-t border-slate-100 mt-auto">
                <button
                  type="submit"
                  disabled={submitting || !selectedDrug}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <PlusCircle className="w-5 h-5 transition-transform group-hover:rotate-90" />
                  <span>{submitting ? 'Recording Prescription...' : 'Record Prescription & Save Expenditure'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* High-Contrast Layered Green Theme Expenditure Preview Card */}
        <div className="lg:col-span-5 bg-slate-50/50 p-7 sm:p-8 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between relative overflow-hidden h-full">
          <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200/80">
              <div className="flex items-center gap-2.5 text-slate-900">
                <Receipt className="w-5 h-5 text-emerald-600" />
                <span className="font-extrabold text-xs tracking-wider uppercase">Expenditure Preview</span>
              </div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-900 px-2.5 py-1 rounded-full border border-emerald-200/80 shadow-2xs">
                Live Calculator
              </span>
            </div>

            {selectedDrug ? (
              <div className="space-y-4">
                {/* Drug Details Header Banner (Accent Left Border) */}
                <div className="bg-white p-4 rounded-xl border-l-4 border-l-emerald-600 border-y border-r border-slate-200/80 shadow-2xs space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-0.5 min-w-0">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                        Selected Herbal Preparation
                      </span>
                      <h3 className="text-xl font-black text-slate-900 tracking-tight truncate">{selectedDrug.name}</h3>
                    </div>
                    <span className="bg-emerald-50 text-emerald-900 text-xs font-bold px-2.5 py-1 rounded-lg border border-emerald-200/80 shrink-0 whitespace-nowrap">
                      {selectedDrug.category}
                    </span>
                  </div>
                </div>

                {/* Package Metrics Box */}
                <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs space-y-3">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                    Catalog Base Metrics
                  </span>
                  
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/60">
                      <span className="text-slate-500 block text-[11px] font-medium">Package Size</span>
                      <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                        {selectedDrug.size_amount} {selectedDrug.size_unit}
                      </span>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/60 text-right">
                      <span className="text-slate-500 block text-[11px] font-medium">Package Price</span>
                      <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                        LKR {selectedDrug.unit_price.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-semibold">Calculated Unit Rate:</span>
                    <span className="font-extrabold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200/80">
                      LKR {perUnitRate.toFixed(4)} / {selectedDrug.size_unit}
                    </span>
                  </div>
                </div>

                {/* Dosage Breakdown Box */}
                <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs space-y-2.5 text-xs">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                    Prescription Regimen Summary
                  </span>
                  
                  <div className="flex justify-between items-center text-slate-600 py-1 border-b border-slate-100">
                    <span className="font-medium flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Prescription Date</span>
                    </span>
                    <span className="font-bold text-slate-900">{prescriptionDate}</span>
                  </div>

                  <div className="flex justify-between items-center text-slate-600 py-1 border-b border-slate-100">
                    <span className="font-medium">Prescribed Dosage</span>
                    <span className="font-bold text-teal-900 bg-teal-50 px-2 py-0.5 rounded border border-teal-200/80">
                      {dose} {doseUnit} × {frequency}/day × {days} days
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-slate-600 pt-1">
                    <span className="font-medium">Total Regimen Volume</span>
                    <span className="font-black text-emerald-800 text-sm">
                      {calculatedTotalQty} {doseUnit}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-20 text-center text-slate-400 text-xs font-medium bg-white rounded-xl border border-dashed border-slate-300 space-y-2">
                <Leaf className="w-8 h-8 mx-auto text-emerald-500" />
                <p className="font-bold text-slate-700 text-sm">No Drug Selected</p>
                <p className="text-xs text-slate-400">Select a drug from the catalog to view live expenditure breakdown.</p>
              </div>
            )}
          </div>

          {/* Grand Calculated Cost Callout Box (Rich Forest Green Anchor) */}
          <div className="mt-6 p-5 rounded-2xl bg-gradient-to-r from-emerald-800 via-teal-900 to-emerald-950 text-white border border-emerald-700/80 shadow-md flex items-center justify-between">
            <div>
              <span className="text-[10px] font-extrabold text-emerald-200 uppercase tracking-wider block">
                Total Prescription Cost
              </span>
              <span className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-0.5 block">
                LKR {calculatedTotalCost.toFixed(2)}
              </span>
            </div>
            <div className="bg-white/10 p-3 rounded-xl border border-white/20 shrink-0">
              <Receipt className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

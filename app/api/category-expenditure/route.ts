import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// Standard Varieties from the Department of Ayurveda report form
const FORM_VARIETIES = [
  { code: '01', name: 'Arishtaya', matchKeys: ['arishta', 'arishtaya'] },
  { code: '02', name: 'Asawaya', matchKeys: ['asawa', 'asawaya', 'asavam'] },
  { code: '03', name: 'Chenthooram', matchKeys: ['chenthooram', 'centuram'] },
  { code: '04', name: 'Choornaya', matchKeys: ['choorna', 'choornaya', 'churna'] },
  { code: '05', name: 'Decoction', matchKeys: ['decoction'] },
  { code: '06', name: 'Gugul', matchKeys: ['gugul', 'guggulu'] },
  { code: '07', name: 'Kalkaya', matchKeys: ['kalka', 'kalkaya'] },
  { code: '08', name: 'Kulikai', matchKeys: ['kulikai', 'gulika', 'gulikai'] },
  { code: '09', name: 'Lehaya', matchKeys: ['leha', 'lehaya', 'lehyam'] },
  { code: '10', name: 'Pashpa', matchKeys: ['pashpa', 'bhasma', 'bhasmam'] },
  { code: '11', name: 'Lepa', matchKeys: ['lepa', 'lepam'] },
  { code: '12', name: 'Paste', matchKeys: ['paste'] },
  { code: '13', name: 'Quathaya', matchKeys: ['kwatha', 'quathaya', 'kashayam'] },
  { code: '14', name: 'Rasa', matchKeys: ['rasa', 'rasayanam'] },
  { code: '15', name: 'Syrup', matchKeys: ['syrup'] },
  { code: '16', name: 'Thailaya', matchKeys: ['taila', 'thaila', 'thailaya', 'oil'] },
  { code: '17', name: 'Tooth powder', matchKeys: ['tooth powder', 'toothpowder'] },
  { code: '18', name: 'Watti', matchKeys: ['vati', 'watti', 'vatiya'] },
  { code: '19', name: 'Pethi', matchKeys: ['pethi', 'mathirai'] },
  { code: '21', name: 'Tablet (unani)', matchKeys: ['tablet (unani)', 'unani tablet'] },
  { code: '22', name: 'Pill (unani)', matchKeys: ['pill (unani)', 'unani pill'] },
  { code: '23', name: 'Capsule (unani)', matchKeys: ['capsule (unani)', 'unani capsule'] },
  { code: '24', name: 'Unani (Others)', matchKeys: ['unani (others)', 'unani'] },
]

export async function GET(request: Request) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'monthly'
    const selectedDate = searchParams.get('date')
    const selectedWeekDate = searchParams.get('week_date')
    const selectedMonth = searchParams.get('month')
    const startDateParam = searchParams.get('start_date')
    const endDateParam = searchParams.get('end_date')

    // Determine Start and End dates for period filtering
    let startDate: Date | null = null
    let endDate: Date | null = null

    const now = new Date()

    if (period === 'daily') {
      const d = selectedDate ? new Date(selectedDate) : now
      startDate = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0)
      endDate = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999)
    } else if (period === 'weekly') {
      const d = selectedWeekDate ? new Date(selectedWeekDate) : now
      const dayOfWeek = d.getDay()
      const diffToMonday = d.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)
      const monday = new Date(d.setDate(diffToMonday))

      startDate = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate(), 0, 0, 0, 0)
      const sunday = new Date(startDate)
      sunday.setDate(sunday.getDate() + 6)
      endDate = new Date(sunday.getFullYear(), sunday.getMonth(), sunday.getDate(), 23, 59, 59, 999)
    } else if (period === 'monthly') {
      const mStr = selectedMonth || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
      const [y, m] = mStr.split('-').map(Number)
      startDate = new Date(y, m - 1, 1, 0, 0, 0, 0)
      endDate = new Date(y, m, 0, 23, 59, 59, 999)
    } else if (period === 'date_range' && startDateParam && endDateParam) {
      const s = new Date(startDateParam)
      const e = new Date(endDateParam)
      startDate = new Date(s.getFullYear(), s.getMonth(), s.getDate(), 0, 0, 0, 0)
      endDate = new Date(e.getFullYear(), e.getMonth(), e.getDate(), 23, 59, 59, 999)
    }

    const where: any = { hospital_id: session.hospitalId }
    if (startDate && endDate) {
      where.date = {
        gte: startDate,
        lte: endDate,
      }
    }

    // 1. Fetch all prescriptions in the period
    const prescriptions = await prisma.prescription.findMany({
      where,
      include: {
        drug: true,
      },
    })

    // 2. Aggregate expenditure & quantities by Category
    const categoryTotals: Record<string, { totalCost: number; totalQty: number; units: Record<string, number> }> = {}

    for (const rx of prescriptions) {
      const rawCategory = (rx.drug?.category || 'Unassigned').trim()
      const cost = rx.total_cost || 0
      const qty = rx.total_qty || 0
      const unit = (rx.drug?.size_unit || 'Qty').trim()

      if (!categoryTotals[rawCategory]) {
        categoryTotals[rawCategory] = { totalCost: 0, totalQty: 0, units: {} }
      }

      categoryTotals[rawCategory].totalCost += cost
      categoryTotals[rawCategory].totalQty += qty
      categoryTotals[rawCategory].units[unit] = (categoryTotals[rawCategory].units[unit] || 0) + qty
    }

    // Helper to format quantity string with primary unit
    const formatQtyWithUnit = (data?: { totalCost: number; totalQty: number; units: Record<string, number> }) => {
      if (!data || data.totalQty === 0) return '-'
      // Find top unit
      const topUnit = Object.entries(data.units).sort((a, b) => b[1] - a[1])[0]?.[0] || ''
      const qtyFormatted = Math.round(data.totalQty * 100) / 100
      return `${qtyFormatted}${topUnit}`
    }

    // 3. Map to standard Form Varieties (01 to 24)
    const processedCategories = new Set<string>()
    const varietiesReport = FORM_VARIETIES.map((v) => {
      let matchedCost = 0
      let matchedQty = 0
      const combinedUnits: Record<string, number> = {}

      for (const [catName, data] of Object.entries(categoryTotals)) {
        const catLower = catName.toLowerCase()
        const isMatch = v.matchKeys.some((key) => catLower.includes(key))

        if (isMatch) {
          processedCategories.add(catName)
          matchedCost += data.totalCost
          matchedQty += data.totalQty
          for (const [u, val] of Object.entries(data.units)) {
            combinedUnits[u] = (combinedUnits[u] || 0) + val
          }
        }
      }

      return {
        code: v.code,
        name: `${v.code}.${v.name}`,
        rawName: v.name,
        quantity: formatQtyWithUnit({ totalCost: matchedCost, totalQty: matchedQty, units: combinedUnits }),
        value: Math.round(matchedCost * 100) / 100,
      }
    })

    // Add any remaining custom categories in database that didn't match the standard 24
    let customIndex = 25
    for (const [catName, data] of Object.entries(categoryTotals)) {
      if (!processedCategories.has(catName)) {
        varietiesReport.push({
          code: String(customIndex).padStart(2, '0'),
          name: `${String(customIndex).padStart(2, '0')}.${catName}`,
          rawName: catName,
          quantity: formatQtyWithUnit(data),
          value: Math.round(data.totalCost * 100) / 100,
        })
        customIndex++
      }
    }

    const totalExpenditure = varietiesReport.reduce((sum, item) => sum + item.value, 0)

    // 4. Calculate 1st Visit vs Subsequent Visit Statistics based on Patient ID history
    // Get unique patient_ids in current period
    const periodPatientMap = new Map<string, string>() // patient_id -> gender
    for (const rx of prescriptions) {
      if (rx.patient_id) {
        const pid = rx.patient_id.trim()
        if (!periodPatientMap.has(pid)) {
          periodPatientMap.set(pid, (rx.gender || 'Male').trim())
        }
      }
    }

    const uniquePatientIds = Array.from(periodPatientMap.keys())

    let firstVisitMale = 0
    let firstVisitFemale = 0
    let firstVisitOther = 0

    let subsequentVisitMale = 0
    let subsequentVisitFemale = 0
    let subsequentVisitOther = 0

    if (uniquePatientIds.length > 0) {
      // Find global earliest prescription date for each patient ID in this hospital
      const earliestDates = await prisma.prescription.groupBy({
        by: ['patient_id'],
        where: {
          hospital_id: session.hospitalId,
          patient_id: { in: uniquePatientIds },
        },
        _min: {
          date: true,
        },
      })

      const minDateMap = new Map<string, Date>()
      for (const item of earliestDates) {
        if (item.patient_id && item._min.date) {
          minDateMap.set(item.patient_id.trim(), new Date(item._min.date))
        }
      }

      for (const pid of uniquePatientIds) {
        const gender = periodPatientMap.get(pid) || 'Male'
        const globalMinDate = minDateMap.get(pid)

        // If patient's global min date falls within current period (or if no period bounds specified) -> 1st Visit
        const isFirstVisit = !startDate || !globalMinDate ? true : globalMinDate >= startDate && (!endDate || globalMinDate <= endDate)

        const genderLower = gender.toLowerCase()
        if (isFirstVisit) {
          if (genderLower.startsWith('f')) firstVisitFemale++
          else if (genderLower.startsWith('m')) firstVisitMale++
          else firstVisitOther++
        } else {
          if (genderLower.startsWith('f')) {
            subsequentVisitFemale++
            firstVisitFemale++
          } else if (genderLower.startsWith('m')) {
            subsequentVisitMale++
            firstVisitMale++
          } else {
            subsequentVisitOther++
            firstVisitOther++
          }
        }
      }
    }

    return NextResponse.json({
      period,
      startDate: startDate?.toISOString() || null,
      endDate: endDate?.toISOString() || null,
      varieties: varietiesReport,
      totalExpenditure: Math.round(totalExpenditure * 100) / 100,
      totalPrescriptionsCount: prescriptions.length,
      patientStats: {
        totalUniquePatients: uniquePatientIds.length,
        firstVisitMale,
        firstVisitFemale,
        firstVisitOther,
        totalFirstVisits: firstVisitMale + firstVisitFemale + firstVisitOther,
        subsequentVisitMale,
        subsequentVisitFemale,
        subsequentVisitOther,
        totalSubsequentVisits: subsequentVisitMale + subsequentVisitFemale + subsequentVisitOther,
      },
    })
  } catch (error: any) {
    console.error('Error fetching category expenditure:', error)
    return NextResponse.json({ error: 'Failed to fetch category expenditure report' }, { status: 500 })
  }
}

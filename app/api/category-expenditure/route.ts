import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'

export const dynamic = 'force-dynamic'

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

    // 1. Fetch ALL distinct categories from the hospital's Drug catalog (dynamic, not hardcoded)
    const allDrugCategories = await prisma.drug.findMany({
      where: { hospital_id: session.hospitalId },
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' },
    })

    const catalogCategories = allDrugCategories
      .map((d) => d.category.trim())
      .filter((c) => c.length > 0)
      .sort((a, b) => a.localeCompare(b))

    // 2. Fetch all prescriptions in the period
    const prescriptions = await prisma.prescription.findMany({
      where,
      include: {
        drug: true,
      },
    })

    // 3. Aggregate expenditure & quantities by Category (exact match on drug.category)
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
      const topUnit = Object.entries(data.units).sort((a, b) => b[1] - a[1])[0]?.[0] || ''
      const qtyFormatted = Math.round(data.totalQty * 100) / 100
      return `${qtyFormatted}${topUnit}`
    }

    // 4. Build varieties report from dynamic catalog categories
    const processedCategories = new Set<string>()
    const varietiesReport = catalogCategories.map((catName, index) => {
      const code = String(index + 1).padStart(2, '0')
      const data = categoryTotals[catName]
      processedCategories.add(catName)

      return {
        code,
        name: `${code}. ${catName}`,
        rawName: catName,
        quantity: formatQtyWithUnit(data),
        value: data ? Math.round(data.totalCost * 100) / 100 : 0,
      }
    })

    // Add any prescription categories that exist in data but NOT in the Drug catalog (edge case)
    let extraIndex = catalogCategories.length + 1
    for (const [catName, data] of Object.entries(categoryTotals)) {
      if (!processedCategories.has(catName)) {
        varietiesReport.push({
          code: String(extraIndex).padStart(2, '0'),
          name: `${String(extraIndex).padStart(2, '0')}. ${catName}`,
          rawName: catName,
          quantity: formatQtyWithUnit(data),
          value: Math.round(data.totalCost * 100) / 100,
        })
        extraIndex++
      }
    }

    const totalExpenditure = varietiesReport.reduce((sum, item) => sum + item.value, 0)

    // 5. Calculate 1st Visit vs Subsequent Visit Statistics
    // Build per-patient data: gender + set of distinct dates within the period
    const periodPatientData = new Map<string, { gender: string; distinctDates: Set<string> }>()
    for (const rx of prescriptions) {
      if (rx.patient_id) {
        const pid = rx.patient_id.trim().toLowerCase()
        const dateStr = new Date(rx.date).toISOString().split('T')[0]

        if (!periodPatientData.has(pid)) {
          periodPatientData.set(pid, {
            gender: (rx.gender || 'Male').trim(),
            distinctDates: new Set<string>(),
          })
        }
        periodPatientData.get(pid)!.distinctDates.add(dateStr)
      }
    }

    const uniquePatientIds = Array.from(periodPatientData.keys())

    let firstVisitMale = 0
    let firstVisitFemale = 0
    let firstVisitOther = 0

    let subsequentVisitMale = 0
    let subsequentVisitFemale = 0
    let subsequentVisitOther = 0

    if (uniquePatientIds.length > 0) {
      // Check if patients have ANY prescriptions BEFORE the period start
      let hasDateBeforePeriod = new Set<string>()
      if (startDate) {
        const priorVisits = await prisma.prescription.findMany({
          where: {
            hospital_id: session.hospitalId,
            patient_id: { in: uniquePatientIds },
            date: { lt: startDate },
          },
          select: { patient_id: true },
          distinct: ['patient_id'],
        })
        hasDateBeforePeriod = new Set(priorVisits.map((v) => v.patient_id.trim().toLowerCase()))
      }

      for (const pid of uniquePatientIds) {
        const patientData = periodPatientData.get(pid)!
        const gender = patientData.gender
        const distinctDatesInPeriod = patientData.distinctDates.size

        // A patient is a Subsequent Visit if:
        // 1. They have prior history before this period (hasDateBeforePeriod.has(pid)), OR
        // 2. They visited on multiple distinct dates within this period (distinctDatesInPeriod > 1)
        const isSubsequentVisit = hasDateBeforePeriod.has(pid) || distinctDatesInPeriod > 1

        const genderLower = gender.toLowerCase()

        if (isSubsequentVisit) {
          // Patient has prior history before this period -> Subsequent Visit
          if (genderLower.startsWith('f')) subsequentVisitFemale++
          else if (genderLower.startsWith('m')) subsequentVisitMale++
          else subsequentVisitOther++
        } else {
          // Patient has no prior history before this period -> 1st Visit
          if (genderLower.startsWith('f')) firstVisitFemale++
          else if (genderLower.startsWith('m')) firstVisitMale++
          else firstVisitOther++
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

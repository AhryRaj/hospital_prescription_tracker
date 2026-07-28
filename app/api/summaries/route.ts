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
    const period = searchParams.get('period') || 'daily' // 'daily' | 'weekly' | 'monthly'
    const drugId = searchParams.get('drug_id') // optional drug ID filter

    // Fetch all prescriptions with associated drug information — scoped to hospital
    const whereCondition: any = { hospital_id: session.hospitalId }
    if (drugId && drugId !== 'all') {
      whereCondition.drug_id = Number(drugId)
    }

    const prescriptions = await prisma.prescription.findMany({
      where: whereCondition,
      include: {
        drug: true,
      },
      orderBy: { date: 'desc' },
    })

    // Helper functions for period key grouping
    const getPeriodKey = (dateObj: Date, periodType: string) => {
      const year = dateObj.getFullYear()
      const month = String(dateObj.getMonth() + 1).padStart(2, '0')
      const day = String(dateObj.getDate()).padStart(2, '0')

      if (periodType === 'monthly') {
        return `${year}-${month}`
      }

      if (periodType === 'weekly') {
        // Calculate start of the week (Monday)
        const d = new Date(dateObj)
        const dayOfWeek = d.getDay()
        const diff = d.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)
        const monday = new Date(d.setDate(diff))
        const mYear = monday.getFullYear()
        const mMonth = String(monday.getMonth() + 1).padStart(2, '0')
        const mDay = String(monday.getDate()).padStart(2, '0')
        return `Week of ${mYear}-${mMonth}-${mDay}`
      }

      // Default: daily
      return `${year}-${month}-${day}`
    }

    // Grouping container
    const periodMap = new Map<string, {
      periodKey: string
      totalCost: number
      totalQty: number
      prescriptionCount: number
      drugBreakdown: Map<number, {
        drugId: number
        drugName: string
        category: string
        sizeAmount: number
        sizeUnit: string
        unitPrice: number
        qty: number
        cost: number
        count: number
      }>
    }>()

    let grandTotalCost = 0
    let grandTotalQty = 0
    let grandTotalPrescriptions = prescriptions.length

    for (const item of prescriptions) {
      const pDate = new Date(item.date)
      const pKey = getPeriodKey(pDate, period)

      grandTotalCost += item.total_cost
      grandTotalQty += item.total_qty

      if (!periodMap.has(pKey)) {
        periodMap.set(pKey, {
          periodKey: pKey,
          totalCost: 0,
          totalQty: 0,
          prescriptionCount: 0,
          drugBreakdown: new Map(),
        })
      }

      const entry = periodMap.get(pKey)!
      entry.totalCost += item.total_cost
      entry.totalQty += item.total_qty
      entry.prescriptionCount += 1

      // Track drug breakdown inside period
      const drugIdKey = item.drug_id
      if (!entry.drugBreakdown.has(drugIdKey)) {
        entry.drugBreakdown.set(drugIdKey, {
          drugId: item.drug_id,
          drugName: item.drug.name,
          category: item.drug.category,
          sizeAmount: item.drug.size_amount,
          sizeUnit: item.drug.size_unit,
          unitPrice: item.drug.unit_price,
          qty: 0,
          cost: 0,
          count: 0,
        })
      }

      const dEntry = entry.drugBreakdown.get(drugIdKey)!
      dEntry.qty += item.total_qty
      dEntry.cost += item.total_cost
      dEntry.count += 1
    }

    // Format output data array (sorted descending so newest periods appear first)
    const summaries = Array.from(periodMap.values())
      .map((p) => ({
        periodKey: p.periodKey,
        totalCost: Math.round(p.totalCost * 100) / 100,
        totalQty: Math.round(p.totalQty * 100) / 100,
        prescriptionCount: p.prescriptionCount,
        drugBreakdown: Array.from(p.drugBreakdown.values()).map((d) => ({
          ...d,
          cost: Math.round(d.cost * 100) / 100,
          qty: Math.round(d.qty * 100) / 100,
        })),
      }))
      .sort((a, b) => b.periodKey.localeCompare(a.periodKey))

    return NextResponse.json({
      period,
      grandTotalCost: Math.round(grandTotalCost * 100) / 100,
      grandTotalQty: Math.round(grandTotalQty * 100) / 100,
      grandTotalPrescriptions,
      summaries,
    })
  } catch (error) {
    console.error('Error generating summaries:', error)
    return NextResponse.json({ error: 'Failed to generate summaries' }, { status: 500 })
  }
}

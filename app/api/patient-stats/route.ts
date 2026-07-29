import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const AGE_CATEGORIES = ['0-1', '1+', '5+', '10+', '20+', '40+', '60+']
const SYSTEM_CATEGORIES = [
  'b / o',
  'c / SP 60',
  'e / SM 39',
  'g / O',
  'h / SP 12',
  'i / O',
  'j / SP 41',
  'k / O',
  'l / SK 95',
  'm / SN 49',
  'n / O',
]

export async function GET(request: Request) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'monthly'
    const customDate = searchParams.get('date')
    const customWeekDate = searchParams.get('week_date')
    const customMonth = searchParams.get('month')

    const now = new Date()
    const todayStr = now.toISOString().split('T')[0]
    const currentMonthStr = todayStr.substring(0, 7)

    const where: any = { hospital_id: session.hospitalId }

    if (period === 'daily') {
      const targetDate = customDate || todayStr
      const startDate = new Date(targetDate)
      startDate.setHours(0, 0, 0, 0)
      const endDate = new Date(targetDate)
      endDate.setHours(23, 59, 59, 999)

      where.date = {
        gte: startDate,
        lte: endDate,
      }
    } else if (period === 'weekly') {
      const refDate = customWeekDate ? new Date(customWeekDate) : now
      const dayOfWeek = refDate.getDay()
      const diff = refDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)
      const startDate = new Date(refDate)
      startDate.setDate(diff)
      startDate.setHours(0, 0, 0, 0)

      const endDate = new Date(startDate)
      endDate.setDate(startDate.getDate() + 6)
      endDate.setHours(23, 59, 59, 999)

      where.date = {
        gte: startDate,
        lte: endDate,
      }
    } else if (period === 'monthly') {
      const targetMonth = customMonth || currentMonthStr
      const [year, month] = targetMonth.split('-').map(Number)
      const startDate = new Date(year, month - 1, 1)
      const endDate = new Date(year, month, 0, 23, 59, 59, 999)

      where.date = {
        gte: startDate,
        lte: endDate,
      }
    }

    // Fetch prescriptions for this hospital & date range
    const prescriptions = await prisma.prescription.findMany({
      where,
      orderBy: { date: 'desc' },
    })

    // To avoid double-counting multi-medicine prescriptions for the same patient visit on the same day,
    // we group by unique patient visit key: `${patient_id}|${date.toISOString().split('T')[0]}`
    const visitMap = new Map<string, { gender: string; age_category: string; system_category: string; date: string }>()

    for (const p of prescriptions) {
      const dateStr = new Date(p.date).toISOString().split('T')[0]
      const visitKey = `${p.patient_id.trim().toLowerCase()}|${dateStr}`

      if (!visitMap.has(visitKey)) {
        visitMap.set(visitKey, {
          gender: p.gender || 'Male',
          age_category: p.age_category || '20+',
          system_category: p.system_category || 'g / O',
          date: dateStr,
        })
      }
    }

    const visits = Array.from(visitMap.values())

    // Initialize matrices
    const createEmptyMatrix = () => {
      const matrix: Record<string, Record<string, number>> = {}
      for (const age of AGE_CATEGORIES) {
        matrix[age] = {}
        for (const sys of SYSTEM_CATEGORIES) {
          matrix[age][sys] = 0
        }
      }
      return matrix
    }

    const maleMatrix = createEmptyMatrix()
    const femaleMatrix = createEmptyMatrix()
    const otherMatrix = createEmptyMatrix()
    const combinedMatrix = createEmptyMatrix()

    let totalMale = 0
    let totalFemale = 0
    let totalOther = 0

    // Populate matrix cells
    for (const visit of visits) {
      const g = (visit.gender || 'Male').trim()
      const age = AGE_CATEGORIES.includes(visit.age_category) ? visit.age_category : '20+'
      const sys = SYSTEM_CATEGORIES.includes(visit.system_category) ? visit.system_category : 'g / O'

      combinedMatrix[age][sys] += 1

      if (g.toLowerCase() === 'female') {
        femaleMatrix[age][sys] += 1
        totalFemale += 1
      } else if (g.toLowerCase() === 'other') {
        otherMatrix[age][sys] += 1
        totalOther += 1
      } else {
        maleMatrix[age][sys] += 1
        totalMale += 1
      }
    }

    const totalPatients = visits.length

    return NextResponse.json({
      period,
      totalPatients,
      totalMale,
      totalFemale,
      totalOther,
      ageCategories: AGE_CATEGORIES,
      systemCategories: SYSTEM_CATEGORIES,
      maleMatrix,
      femaleMatrix,
      otherMatrix,
      combinedMatrix,
    })
  } catch (error: any) {
    console.error('Error fetching patient statistics:', error)
    return NextResponse.json({ error: 'Failed to fetch patient statistics' }, { status: 500 })
  }
}

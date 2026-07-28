import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { newDrugsData } from '@/scripts/seedNewDrugs'

export const dynamic = 'force-dynamic'

const getDoseForCategory = (cat: string): number => {
  switch (cat) {
    case 'Arishta':
    case 'Asawa':
    case 'Kwatha':
    case 'Syrup':
    case 'Body Wash':
    case 'Face Wash':
    case 'Shampoo':
    case 'Hand Wash':
    case 'Hand Jel':
    case 'Mouth Wash':
      return 120
    case 'Leha':
    case 'Kalka':
    case 'Choorna':
    case 'Rasayana':
      return 20
    case 'Lepa':
    case 'Balm':
      return 30
    case 'Oils & Honey':
    case 'Thailaya':
      return 60
    case 'Bhasma':
    case 'Senthuram':
    case 'Rasa':
      return 16
    default:
      return 8
  }
}

export async function GET() {
  try {
    const hospitals = await prisma.hospital.findMany()
    const results = []

    for (const hospital of hospitals) {
      const existingDrugs = await prisma.drug.findMany({
        where: { hospital_id: hospital.id },
        select: { name: true, category: true, size_amount: true, size_unit: true },
      })

      const existingSet = new Set(
        existingDrugs.map((d) => `${d.name}|${d.category}|${d.size_amount}|${d.size_unit}`)
      )

      const toInsert = newDrugsData.filter(
        (d) => !existingSet.has(`${d.name}|${d.category}|${d.size_amount}|${d.size_unit}`)
      )

      if (toInsert.length > 0) {
        await prisma.drug.createMany({
          data: toInsert.map((d) => ({
            hospital_id: hospital.id,
            name: d.name,
            category: d.category,
            size_amount: d.size_amount,
            size_unit: d.size_unit,
            unit_price: d.unit_price,
            standard_dose: getDoseForCategory(d.category),
          })),
        })
      }

      const totalCount = await prisma.drug.count({ where: { hospital_id: hospital.id } })
      results.push({
        hospital_id: hospital.id,
        hospital_name: hospital.name,
        added: toInsert.length,
        total_drugs_now: totalCount,
      })
    }

    return NextResponse.json({
      success: true,
      database_host: process.env.DATABASE_URL?.split('@')[1]?.split('/')[0] || 'hidden',
      hospitals: results,
    })
  } catch (error: any) {
    console.error('Seeding error:', error)
    return NextResponse.json({ error: error.message || 'Seeding failed' }, { status: 500 })
  }
}

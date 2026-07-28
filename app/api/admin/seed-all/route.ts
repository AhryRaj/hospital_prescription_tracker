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
      let addedCount = 0

      for (const drug of newDrugsData) {
        const existing = await prisma.drug.findFirst({
          where: {
            hospital_id: hospital.id,
            name: drug.name,
            category: drug.category,
            size_amount: drug.size_amount,
            size_unit: drug.size_unit,
          },
        })

        if (!existing) {
          await prisma.drug.create({
            data: {
              hospital_id: hospital.id,
              name: drug.name,
              category: drug.category,
              size_amount: drug.size_amount,
              size_unit: drug.size_unit,
              unit_price: drug.unit_price,
              standard_dose: getDoseForCategory(drug.category),
            },
          })
          addedCount++
        }
      }

      const totalDrugs = await prisma.drug.count({ where: { hospital_id: hospital.id } })
      results.push({
        hospital_id: hospital.id,
        hospital_name: hospital.name,
        added: addedCount,
        total_drugs_now: totalDrugs,
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

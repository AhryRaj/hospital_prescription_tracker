import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get('patient_id')
    const drugId = searchParams.get('drug_id')

    const where: any = { hospital_id: session.hospitalId }
    if (patientId) {
      where.patient_id = { contains: patientId }
    }
    if (drugId) {
      where.drug_id = Number(drugId)
    }

    const prescriptions = await prisma.prescription.findMany({
      where,
      include: {
        drug: true,
      },
      orderBy: [
        { date: 'desc' },
        { id: 'desc' },
      ],
    })
    return NextResponse.json(prescriptions)
  } catch (error) {
    console.error('Error fetching prescriptions:', error)
    return NextResponse.json({ error: 'Failed to fetch prescriptions' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { patient_id, date, items, drug_id, custom_qty } = body

    if (!patient_id) {
      return NextResponse.json({ error: 'Patient ID is required' }, { status: 400 })
    }

    // Determine payload items: either body.items array OR a single item from body
    const rawItems: Array<{ drug_id: number; custom_qty?: number }> = Array.isArray(items) && items.length > 0
      ? items
      : drug_id
      ? [{ drug_id: Number(drug_id), custom_qty: custom_qty ? Number(custom_qty) : undefined }]
      : []

    if (rawItems.length === 0) {
      return NextResponse.json({ error: 'At least one medicine item is required' }, { status: 400 })
    }

    const pDate = date ? new Date(date) : new Date()

    // Execute in transaction
    const createdPrescriptions = await prisma.$transaction(async (tx) => {
      const results = []
      for (const item of rawItems) {
        const drug = await tx.drug.findFirst({
          where: { id: Number(item.drug_id), hospital_id: session.hospitalId },
        })

        if (!drug) {
          throw new Error(`Drug ID ${item.drug_id} not found in catalog`)
        }

        const total_qty = item.custom_qty && item.custom_qty > 0 ? Number(item.custom_qty) : drug.standard_dose
        const total_cost = (total_qty / drug.size_amount) * drug.unit_price

        const created = await tx.prescription.create({
          data: {
            hospital_id: session.hospitalId,
            patient_id: patient_id.trim(),
            drug_id: drug.id,
            date: pDate,
            total_qty,
            total_cost: Math.round(total_cost * 100) / 100,
          },
          include: {
            drug: true,
          },
        })
        results.push(created)
      }
      return results
    })

    const grandTotalCost = createdPrescriptions.reduce((sum, p) => sum + p.total_cost, 0)

    return NextResponse.json({
      success: true,
      count: createdPrescriptions.length,
      patient_id: patient_id.trim(),
      grandTotalCost: Math.round(grandTotalCost * 100) / 100,
      prescriptions: createdPrescriptions,
    }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating prescription:', error)
    return NextResponse.json({ error: error.message || 'Failed to create prescription' }, { status: 500 })
  }
}

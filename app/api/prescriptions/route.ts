import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get('patient_id')
    const drugId = searchParams.get('drug_id')

    const where: any = {}
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
    const body = await request.json()
    const { patient_id, drug_id, dose, frequency, days, date } = body

    if (!patient_id || !drug_id || !dose || !frequency || !days) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const drug = await prisma.drug.findUnique({
      where: { id: parseInt(drug_id) },
    })

    if (!drug) {
      return NextResponse.json({ error: 'Drug not found' }, { status: 404 })
    }

    const numDose = parseFloat(dose)
    const numFreq = parseInt(frequency)
    const numDays = parseInt(days)

    // 1. Calculate total dosage quantity required for full duration
    // total_qty = dose_per_intake * frequency_times_per_day * duration_days
    const total_qty = numDose * numFreq * numDays

    // 2. Proportional Cost Formula:
    // Package Price = drug.unit_price (e.g. LKR 1500 for 700 ml)
    // Package Size  = drug.size_amount (e.g. 700 ml)
    // Per-unit rate = drug.unit_price / drug.size_amount (e.g. 1500 / 700 = LKR 2.1428 / ml)
    // Total Expenditure = total_qty * (drug.unit_price / drug.size_amount)
    const total_cost = (total_qty / drug.size_amount) * drug.unit_price

    const prescription = await prisma.prescription.create({
      data: {
        patient_id: patient_id.trim(),
        drug_id: parseInt(drug_id),
        date: date ? new Date(date) : new Date(),
        dose: numDose,
        total_qty,
        total_cost: Math.round(total_cost * 100) / 100,
      },
      include: {
        drug: true,
      },
    })

    return NextResponse.json(prescription, { status: 201 })
  } catch (error) {
    console.error('Error creating prescription:', error)
    return NextResponse.json({ error: 'Failed to create prescription' }, { status: 500 })
  }
}

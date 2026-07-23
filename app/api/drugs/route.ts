import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const drugs = await prisma.drug.findMany({
      where: { hospital_id: session.hospitalId },
      orderBy: { name: 'asc' },
    })
    return NextResponse.json(drugs)
  } catch (error) {
    console.error('Error fetching drugs:', error)
    return NextResponse.json({ error: 'Failed to fetch drugs' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, category, size_amount, size_unit, unit_price, standard_dose } = body

    if (!name || !category || !size_amount || !size_unit || !unit_price) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const newDrug = await prisma.drug.create({
      data: {
        hospital_id: session.hospitalId,
        name,
        category,
        size_amount: parseFloat(size_amount),
        size_unit,
        unit_price: parseFloat(unit_price),
        standard_dose: parseFloat(standard_dose || 8),
      },
    })

    return NextResponse.json(newDrug, { status: 201 })
  } catch (error) {
    console.error('Error creating drug:', error)
    return NextResponse.json({ error: 'Failed to create drug' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, name, category, size_amount, size_unit, unit_price, standard_dose } = body

    if (!id || !name || !category || !size_amount || !size_unit || !unit_price) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Verify the drug belongs to this hospital
    const existing = await prisma.drug.findFirst({
      where: { id: Number(id), hospital_id: session.hospitalId },
    })
    if (!existing) {
      return NextResponse.json({ error: 'Drug not found' }, { status: 404 })
    }

    const updatedDrug = await prisma.drug.update({
      where: { id: Number(id) },
      data: {
        name,
        category,
        size_amount: parseFloat(size_amount),
        size_unit,
        unit_price: parseFloat(unit_price),
        standard_dose: parseFloat(standard_dose || 8),
      },
    })

    return NextResponse.json(updatedDrug)
  } catch (error) {
    console.error('Error updating drug:', error)
    return NextResponse.json({ error: 'Failed to update drug' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Drug ID is required' }, { status: 400 })
    }

    const drugId = Number(id)

    // Verify the drug belongs to this hospital
    const existing = await prisma.drug.findFirst({
      where: { id: drugId, hospital_id: session.hospitalId },
    })
    if (!existing) {
      return NextResponse.json({ error: 'Drug not found' }, { status: 404 })
    }

    // Delete associated prescriptions first to prevent foreign key errors
    await prisma.prescription.deleteMany({
      where: { drug_id: drugId, hospital_id: session.hospitalId },
    })

    // Delete the drug
    await prisma.drug.delete({
      where: { id: drugId },
    })

    return NextResponse.json({ success: true, message: 'Drug deleted successfully' })
  } catch (error) {
    console.error('Error deleting drug:', error)
    return NextResponse.json({ error: 'Failed to delete drug' }, { status: 500 })
  }
}

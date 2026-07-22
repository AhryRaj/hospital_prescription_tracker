import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const drugs = await prisma.drug.findMany({
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
    const body = await request.json()
    const { name, category, size_amount, size_unit, unit_price, frequency, days } = body

    if (!name || !category || !size_amount || !size_unit || !unit_price) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const newDrug = await prisma.drug.create({
      data: {
        name,
        category,
        size_amount: parseFloat(size_amount),
        size_unit,
        unit_price: parseFloat(unit_price),
        frequency: parseInt(frequency || 3),
        days: parseInt(days || 5),
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
    const body = await request.json()
    const { id, name, category, size_amount, size_unit, unit_price, frequency, days } = body

    if (!id || !name || !category || !size_amount || !size_unit || !unit_price) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const updatedDrug = await prisma.drug.update({
      where: { id: Number(id) },
      data: {
        name,
        category,
        size_amount: parseFloat(size_amount),
        size_unit,
        unit_price: parseFloat(unit_price),
        frequency: parseInt(frequency || 3),
        days: parseInt(days || 5),
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
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Drug ID is required' }, { status: 400 })
    }

    const drugId = Number(id)

    // Delete associated prescriptions first to prevent foreign key errors
    await prisma.prescription.deleteMany({
      where: { drug_id: drugId },
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

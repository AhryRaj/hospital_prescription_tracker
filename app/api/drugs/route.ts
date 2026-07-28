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
    const singleId = searchParams.get('id')
    const idsParam = searchParams.get('ids')

    let idsToDelete: number[] = []

    if (singleId) {
      idsToDelete = [Number(singleId)]
    } else if (idsParam) {
      idsToDelete = idsParam.split(',').map((id) => Number(id)).filter((n) => !isNaN(n))
    } else {
      try {
        const body = await request.json()
        if (Array.isArray(body?.ids)) {
          idsToDelete = body.ids.map((id: any) => Number(id)).filter((n: number) => !isNaN(n))
        }
      } catch {}
    }

    if (idsToDelete.length === 0) {
      return NextResponse.json({ error: 'No valid drug IDs provided for deletion' }, { status: 400 })
    }

    // Execute in transaction: delete associated prescriptions first, then delete drugs
    const count = await prisma.$transaction(async (tx) => {
      await tx.prescription.deleteMany({
        where: {
          drug_id: { in: idsToDelete },
          hospital_id: session.hospitalId,
        },
      })

      const res = await tx.drug.deleteMany({
        where: {
          id: { in: idsToDelete },
          hospital_id: session.hospitalId,
        },
      })
      return res.count
    })

    return NextResponse.json({ success: true, count, message: `${count} medicines deleted successfully` })
  } catch (error: any) {
    console.error('Error deleting drugs:', error)
    return NextResponse.json({ error: error.message || 'Failed to delete drugs' }, { status: 500 })
  }
}

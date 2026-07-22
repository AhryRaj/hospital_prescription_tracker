import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Clearing existing test prescriptions and re-seeding multi-month data...')

  await prisma.prescription.deleteMany({})

  const drugs = await prisma.drug.findMany()
  if (drugs.length === 0) {
    console.error('No drugs found in database. Seed drugs first.')
    return
  }

  // Generate distinct past dates up to today (2026-07-22)
  const dates = [
    // July 2026 (up to today 2026-07-22)
    '2026-07-22', '2026-07-20', '2026-07-18', 
    '2026-07-15', '2026-07-12', '2026-07-09', '2026-07-07', '2026-07-04', '2026-07-01',
    // June 2026
    '2026-06-28', '2026-06-24', '2026-06-20', '2026-06-16', '2026-06-12', 
    '2026-06-08', '2026-06-04', '2026-06-01',
    // May 2026
    '2026-05-29', '2026-05-25', '2026-05-21', '2026-05-17', '2026-05-12', 
    '2026-05-08', '2026-05-04', '2026-05-01',
    // April 2026
    '2026-04-26', '2026-04-20', '2026-04-14', '2026-04-05'
  ]

  const patients = [
    'PAT-2026-0012', 'PAT-2026-0045', 'PAT-2026-0089', 'PAT-2026-0104',
    'PAT-2026-0133', 'PAT-2026-0158', 'PAT-2026-0190', 'PAT-2026-0211',
    'PAT-2026-0245', 'PAT-2026-0280', 'PAT-2026-0305', 'PAT-2026-0342',
    'PAT-2026-0378', 'PAT-2026-0410', 'PAT-2026-0455', 'PAT-2026-0490'
  ]

  const prescriptionsToCreate = []

  for (const dateStr of dates) {
    // 2-4 prescriptions per date
    const numPrescriptions = Math.floor(Math.random() * 3) + 2

    for (let i = 0; i < numPrescriptions; i++) {
      const drug = drugs[Math.floor(Math.random() * drugs.length)]
      const patient = patients[Math.floor(Math.random() * patients.length)]

      const dose = drug.size_unit === 'ml' ? 15 : drug.size_unit === 'g' ? 25 : 2
      const frequency = drug.frequency || 3
      const days = drug.days || 5

      const total_qty = dose * frequency * days
      const perUnitRate = drug.unit_price / drug.size_amount
      const total_cost = Math.round(perUnitRate * total_qty * 100) / 100

      prescriptionsToCreate.push({
        date: new Date(dateStr),
        patient_id: patient,
        drug_id: drug.id,
        dose,
        total_qty,
        total_cost,
      })
    }
  }

  console.log(`Creating ${prescriptionsToCreate.length} sample prescriptions across ${dates.length} dates (spanning April to August 2026)...`)

  await prisma.prescription.createMany({
    data: prescriptionsToCreate,
  })

  console.log('Successfully seeded multi-month prescription dataset!')
}

main()
  .catch((e) => {
    console.error('Error seeding prescriptions:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

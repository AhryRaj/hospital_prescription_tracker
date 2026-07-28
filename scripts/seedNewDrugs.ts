import { prisma } from '../lib/prisma'

export const newDrugsData = [
  // Chooranam (Category: Choorna)
  { name: 'Amukira Chooranam', category: 'Choorna', size_amount: 1000, size_unit: 'g', unit_price: 1550 },
  { name: 'Amukira Chooranam', category: 'Choorna', size_amount: 500, size_unit: 'g', unit_price: 775 },
  { name: 'Amukira Without Sugar Chooranam', category: 'Choorna', size_amount: 1000, size_unit: 'g', unit_price: 2685 },
  { name: 'Amukira Without Sugar Chooranam', category: 'Choorna', size_amount: 500, size_unit: 'g', unit_price: 1340 },
  { name: 'Asai Chooranam', category: 'Choorna', size_amount: 1000, size_unit: 'g', unit_price: 6305 },
  { name: 'Asai Chooranam', category: 'Choorna', size_amount: 500, size_unit: 'g', unit_price: 3155 },
  { name: 'Adda Chooranam', category: 'Choorna', size_amount: 1000, size_unit: 'g', unit_price: 3450 },
  { name: 'Adda Chooranam', category: 'Choorna', size_amount: 500, size_unit: 'g', unit_price: 1725 },
  { name: 'Ilakuviresanam Chooranam', category: 'Choorna', size_amount: 1000, size_unit: 'g', unit_price: 2820 },
  { name: 'Ilakuviresanam Chooranam', category: 'Choorna', size_amount: 500, size_unit: 'g', unit_price: 1410 },
  { name: 'Thalisathy Chooranam', category: 'Choorna', size_amount: 1000, size_unit: 'g', unit_price: 1305 },
  { name: 'Thalisathy Chooranam', category: 'Choorna', size_amount: 500, size_unit: 'g', unit_price: 650 },
  { name: 'Thiripala Chooranam', category: 'Choorna', size_amount: 1000, size_unit: 'g', unit_price: 1020 },
  { name: 'Thiripala Chooranam', category: 'Choorna', size_amount: 500, size_unit: 'g', unit_price: 510 },
  { name: 'Panchathepakini Chooranam', category: 'Choorna', size_amount: 1000, size_unit: 'g', unit_price: 3240 },
  { name: 'Panchathepakini Chooranam', category: 'Choorna', size_amount: 500, size_unit: 'g', unit_price: 1620 },
  { name: 'Parankipaddai Chooranam', category: 'Choorna', size_amount: 1000, size_unit: 'g', unit_price: 3445 },
  { name: 'Parankipaddai Chooranam', category: 'Choorna', size_amount: 500, size_unit: 'g', unit_price: 1720 },
  { name: 'Baskaralavangam Chooranam', category: 'Choorna', size_amount: 1000, size_unit: 'g', unit_price: 2670 },
  { name: 'Baskaralavangam Chooranam', category: 'Choorna', size_amount: 500, size_unit: 'g', unit_price: 1335 },
  { name: 'Nilapakal Chooranam', category: 'Choorna', size_amount: 1000, size_unit: 'g', unit_price: 2205 },
  { name: 'Nilapakal Chooranam', category: 'Choorna', size_amount: 500, size_unit: 'g', unit_price: 1105 },
  { name: 'Malli Chooranam', category: 'Choorna', size_amount: 1000, size_unit: 'g', unit_price: 2505 },
  { name: 'Malli Chooranam', category: 'Choorna', size_amount: 500, size_unit: 'g', unit_price: 1250 },
  { name: 'Mathumegam Chooranam', category: 'Choorna', size_amount: 1000, size_unit: 'g', unit_price: 3590 },
  { name: 'Mathumegam Chooranam', category: 'Choorna', size_amount: 500, size_unit: 'g', unit_price: 1795 },
  { name: 'Mathulaijodu Chooranam', category: 'Choorna', size_amount: 1000, size_unit: 'g', unit_price: 1760 },
  { name: 'Mathulaijodu Chooranam', category: 'Choorna', size_amount: 500, size_unit: 'g', unit_price: 880 },
  { name: 'Mudakku Chooranam', category: 'Choorna', size_amount: 1000, size_unit: 'g', unit_price: 2780 },
  { name: 'Mudakku Chooranam', category: 'Choorna', size_amount: 500, size_unit: 'g', unit_price: 1390 },
  { name: 'Athimathuram Chooranam', category: 'Choorna', size_amount: 1000, size_unit: 'g', unit_price: 3220 },
  { name: 'Athimathuram Chooranam', category: 'Choorna', size_amount: 500, size_unit: 'g', unit_price: 1605 },
  { name: 'Venthamaraijathi Chooranam', category: 'Choorna', size_amount: 1000, size_unit: 'g', unit_price: 5395 },
  { name: 'Venthamaraijathi Chooranam', category: 'Choorna', size_amount: 500, size_unit: 'g', unit_price: 2695 },
  { name: 'Sugapethi Chooranam', category: 'Choorna', size_amount: 1000, size_unit: 'g', unit_price: 2485 },
  { name: 'Sugapethi Chooranam', category: 'Choorna', size_amount: 500, size_unit: 'g', unit_price: 1240 },
  { name: 'Thalisathy 11 Chooranam', category: 'Choorna', size_amount: 1000, size_unit: 'g', unit_price: 2390 },
  { name: 'Thalisathy 11 Chooranam', category: 'Choorna', size_amount: 500, size_unit: 'g', unit_price: 1195 },

  // Tablets (Category: Tablets)
  { name: 'Araban Tablet', category: 'Tablets', size_amount: 1000, size_unit: 'g', unit_price: 2390 },
  { name: 'Araban Tablet', category: 'Tablets', size_amount: 500, size_unit: 'g', unit_price: 1195 },
  { name: 'Balasangivi Tablet', category: 'Tablets', size_amount: 1000, size_unit: 'g', unit_price: 28870 },
  { name: 'Balasangivi Tablet', category: 'Tablets', size_amount: 50, size_unit: 'g', unit_price: 1465 },
  { name: 'Sinnasivappu Tablet', category: 'Tablets', size_amount: 1000, size_unit: 'g', unit_price: 25480 },
  { name: 'Sinnasivappu Tablet', category: 'Tablets', size_amount: 50, size_unit: 'g', unit_price: 1295 },
  { name: 'VVK Tablet', category: 'Tablets', size_amount: 1000, size_unit: 'g', unit_price: 7960 },
  { name: 'VVK Tablet', category: 'Tablets', size_amount: 50, size_unit: 'g', unit_price: 420 },
  { name: 'VVK Tablet', category: 'Tablets', size_amount: 100, size_unit: 'g', unit_price: 820 },
  { name: 'Suvasakudori Tablet', category: 'Tablets', size_amount: 1000, size_unit: 'g', unit_price: 22350 },
  { name: 'Suvasakudori Tablet', category: 'Tablets', size_amount: 50, size_unit: 'g', unit_price: 1140 },
  { name: 'Palavaju Tablet', category: 'Tablets', size_amount: 1000, size_unit: 'g', unit_price: 5775 },
  { name: 'Palavaju Tablet', category: 'Tablets', size_amount: 50, size_unit: 'g', unit_price: 310 },
  { name: 'Palavaju Tablet', category: 'Tablets', size_amount: 100, size_unit: 'g', unit_price: 600 },
  { name: 'Palavaju With Neervalam Tablet', category: 'Tablets', size_amount: 1000, size_unit: 'g', unit_price: 6890 },
  { name: 'Palavaju With Neervalam Tablet', category: 'Tablets', size_amount: 50, size_unit: 'g', unit_price: 365 },
  { name: 'Palavaju With Neervalam Tablet', category: 'Tablets', size_amount: 100, size_unit: 'g', unit_price: 710 },
  { name: 'Neerkovai Tablet', category: 'Tablets', size_amount: 1000, size_unit: 'g', unit_price: 6040 },
  { name: 'Neerkovai Tablet', category: 'Tablets', size_amount: 50, size_unit: 'g', unit_price: 325 },
  { name: 'Neerkovai Tablet', category: 'Tablets', size_amount: 100, size_unit: 'g', unit_price: 625 },
  { name: 'Urai Tablet', category: 'Tablets', size_amount: 1000, size_unit: 'g', unit_price: 83245 },
  { name: 'Urai Tablet', category: 'Tablets', size_amount: 50, size_unit: 'g', unit_price: 4185 },
  { name: 'Urai Tablet', category: 'Tablets', size_amount: 10, size_unit: 'g', unit_price: 850 },
  { name: 'Punnaiver Tablet', category: 'Tablets', size_amount: 1000, size_unit: 'g', unit_price: 23235 },
  { name: 'Punnaiver Tablet', category: 'Tablets', size_amount: 50, size_unit: 'g', unit_price: 1185 },

  // Lehiam (Category: Leha)
  { name: 'Amukira Lehiam', category: 'Leha', size_amount: 1000, size_unit: 'g', unit_price: 1565 },
  { name: 'Amukira Lehiam', category: 'Leha', size_amount: 500, size_unit: 'g', unit_price: 785 },
  { name: 'Amukira Lehiam', category: 'Leha', size_amount: 400, size_unit: 'g', unit_price: 745 },
  { name: 'Pithasamanam Lehiam', category: 'Leha', size_amount: 1000, size_unit: 'g', unit_price: 1790 },
  { name: 'Pithasamanam Lehiam', category: 'Leha', size_amount: 500, size_unit: 'g', unit_price: 895 },
  { name: 'Pithasamanam Lehiam', category: 'Leha', size_amount: 400, size_unit: 'g', unit_price: 835 },
  { name: 'Nellikai Lehiam', category: 'Leha', size_amount: 1000, size_unit: 'g', unit_price: 1365 },
  { name: 'Nellikai Lehiam', category: 'Leha', size_amount: 500, size_unit: 'g', unit_price: 685 },
  { name: 'Nellikai Lehiam', category: 'Leha', size_amount: 400, size_unit: 'g', unit_price: 665 },

  // Decoction (Category: Kwatha)
  { name: 'Aadathodai Decoction', category: 'Kwatha', size_amount: 1000, size_unit: 'g', unit_price: 2700 },
  { name: 'Aadathodai Decoction', category: 'Kwatha', size_amount: 300, size_unit: 'g', unit_price: 815 },
  { name: 'Aavarai Decoction', category: 'Kwatha', size_amount: 1000, size_unit: 'g', unit_price: 1050 },
  { name: 'Aavarai Decoction', category: 'Kwatha', size_amount: 300, size_unit: 'g', unit_price: 320 },
  { name: 'Chiravilvathy Decoction', category: 'Kwatha', size_amount: 1000, size_unit: 'g', unit_price: 2120 },
  { name: 'Chiravilvathy Decoction', category: 'Kwatha', size_amount: 300, size_unit: 'g', unit_price: 640 },
  { name: 'Thirikadukathi Decoction', category: 'Kwatha', size_amount: 1000, size_unit: 'g', unit_price: 4120 },
  { name: 'Thirikadukathi Decoction', category: 'Kwatha', size_amount: 300, size_unit: 'g', unit_price: 1240 },
  { name: 'Amanakkamver Decoction', category: 'Kwatha', size_amount: 1000, size_unit: 'g', unit_price: 905 },
  { name: 'Amanakkamver Decoction', category: 'Kwatha', size_amount: 300, size_unit: 'g', unit_price: 275 },
  { name: 'Nilavembu Decoction', category: 'Kwatha', size_amount: 1000, size_unit: 'g', unit_price: 3880 },
  { name: 'Nilavembu Decoction', category: 'Kwatha', size_amount: 300, size_unit: 'g', unit_price: 1170 },
  { name: 'Parankipaddai Decoction', category: 'Kwatha', size_amount: 1000, size_unit: 'g', unit_price: 2670 },
  { name: 'Parankipaddai Decoction', category: 'Kwatha', size_amount: 300, size_unit: 'g', unit_price: 805 },
  { name: 'Rasanasaptha Decoction', category: 'Kwatha', size_amount: 1000, size_unit: 'g', unit_price: 1515 },
  { name: 'Rasanasaptha Decoction', category: 'Kwatha', size_amount: 300, size_unit: 'g', unit_price: 460 },
  { name: 'Sarvasura Decoction', category: 'Kwatha', size_amount: 1000, size_unit: 'g', unit_price: 2965 },
  { name: 'Sarvasura Decoction', category: 'Kwatha', size_amount: 300, size_unit: 'g', unit_price: 895 },
  { name: 'Pushkaramoolathi Decoction', category: 'Kwatha', size_amount: 1000, size_unit: 'g', unit_price: 1345 },
  { name: 'Pushkaramoolathi Decoction', category: 'Kwatha', size_amount: 300, size_unit: 'g', unit_price: 410 },

  // Oil (Category: Thailaya)
  { name: 'Sarasapathy Oil', category: 'Thailaya', size_amount: 750, size_unit: 'ml', unit_price: 880 },
  { name: 'Sirangu Oil', category: 'Thailaya', size_amount: 750, size_unit: 'ml', unit_price: 710 },
  { name: 'Pachai Oil', category: 'Thailaya', size_amount: 750, size_unit: 'ml', unit_price: 2310 },
  { name: 'Ponnankani Oil', category: 'Thailaya', size_amount: 750, size_unit: 'ml', unit_price: 955 },
  { name: 'Karpoki Oil', category: 'Thailaya', size_amount: 750, size_unit: 'ml', unit_price: 1700 },
  { name: 'Laguvisamusdi Oil', category: 'Thailaya', size_amount: 750, size_unit: 'ml', unit_price: 1760 },
  { name: 'Pindar Oil', category: 'Thailaya', size_amount: 750, size_unit: 'ml', unit_price: 1785 },
  { name: 'Kiranthi Oil', category: 'Thailaya', size_amount: 750, size_unit: 'ml', unit_price: 2060 },
  { name: 'Vathakesari Oil', category: 'Thailaya', size_amount: 750, size_unit: 'ml', unit_price: 1655 },
  { name: 'Ulunthu Oil', category: 'Thailaya', size_amount: 750, size_unit: 'ml', unit_price: 2680 },
  { name: 'Nasiroga Oil', category: 'Thailaya', size_amount: 750, size_unit: 'ml', unit_price: 2145 },
  { name: 'Karpoorathy Oil', category: 'Thailaya', size_amount: 750, size_unit: 'ml', unit_price: 935 },
  { name: 'Thalankai Oil', category: 'Thailaya', size_amount: 750, size_unit: 'ml', unit_price: 2620 },
  { name: 'Chittamadi Oil', category: 'Thailaya', size_amount: 750, size_unit: 'ml', unit_price: 2335 },
  { name: 'Sukku Oil', category: 'Thailaya', size_amount: 750, size_unit: 'ml', unit_price: 4170 },
  { name: 'Iyankam Ver Oil', category: 'Thailaya', size_amount: 750, size_unit: 'ml', unit_price: 2020 },
  { name: 'Amukira Oil', category: 'Thailaya', size_amount: 750, size_unit: 'ml', unit_price: 2755 },
  { name: 'Arukam Kaddai II Oil', category: 'Thailaya', size_amount: 750, size_unit: 'ml', unit_price: 1865 },
  { name: 'Nakku Pochi Oil', category: 'Thailaya', size_amount: 750, size_unit: 'ml', unit_price: 7755 },
  { name: 'Nakku Pochi Oil', category: 'Thailaya', size_amount: 750, size_unit: 'ml', unit_price: 2830 },
  { name: 'Pirapankilankathi Oil', category: 'Thailaya', size_amount: 750, size_unit: 'ml', unit_price: 4025 },
  { name: 'Pirapankilankathi Oil', category: 'Thailaya', size_amount: 750, size_unit: 'ml', unit_price: 1215 },

  // Syrup (Category: Syrup)
  { name: 'Vashaka Syrup', category: 'Syrup', size_amount: 750, size_unit: 'ml', unit_price: 535 },

  // Pasbam (Category: Bhasma)
  { name: 'Silasathu Pasbam', category: 'Bhasma', size_amount: 1000, size_unit: 'g', unit_price: 8180 },
  { name: 'Silasathu Pasbam', category: 'Bhasma', size_amount: 50, size_unit: 'g', unit_price: 515 },
  { name: 'Silasathu Pasbam', category: 'Bhasma', size_amount: 25, size_unit: 'g', unit_price: 270 },
  { name: 'Kungilijam Pasbam', category: 'Bhasma', size_amount: 1000, size_unit: 'g', unit_price: 9560 },
  { name: 'Kungilijam Pasbam', category: 'Bhasma', size_amount: 50, size_unit: 'g', unit_price: 500 },
  { name: 'Kungilijam Pasbam', category: 'Bhasma', size_amount: 25, size_unit: 'g', unit_price: 260 },
  { name: 'Sangu Pasbam', category: 'Bhasma', size_amount: 1000, size_unit: 'g', unit_price: 9700 },
  { name: 'Sangu Pasbam', category: 'Bhasma', size_amount: 50, size_unit: 'g', unit_price: 505 },
  { name: 'Sangu Pasbam', category: 'Bhasma', size_amount: 25, size_unit: 'g', unit_price: 265 },
  { name: 'Palakarai Pasbam', category: 'Bhasma', size_amount: 1000, size_unit: 'g', unit_price: 9920 },
  { name: 'Palakarai Pasbam', category: 'Bhasma', size_amount: 50, size_unit: 'g', unit_price: 810 },
  { name: 'Palakarai Pasbam', category: 'Bhasma', size_amount: 25, size_unit: 'g', unit_price: 415 },
  { name: 'Thalisathi Vadakam Rasajanam Pasbam', category: 'Bhasma', size_amount: 1000, size_unit: 'g', unit_price: 5075 },
  { name: 'Thalisathi Vadakam Rasajanam Pasbam', category: 'Bhasma', size_amount: 200, size_unit: 'g', unit_price: 275 },
  { name: 'Thalisathi Vadakam Rasajanam Pasbam', category: 'Bhasma', size_amount: 25, size_unit: 'g', unit_price: 150 },

  // Senthuram (Category: Senthuram)
  { name: 'Kanthakarasajanam Senthuram', category: 'Senthuram', size_amount: 1000, size_unit: 'g', unit_price: 3085 },
  { name: 'Kanthakarasajanam Senthuram', category: 'Senthuram', size_amount: 200, size_unit: 'g', unit_price: 640 },
  { name: 'Thipali Rasajanam Senthuram', category: 'Senthuram', size_amount: 1000, size_unit: 'g', unit_price: 7665 },
  { name: 'Thipali Rasajanam Senthuram', category: 'Senthuram', size_amount: 50, size_unit: 'g', unit_price: 1555 },
  { name: 'Poonkavi Senthuram', category: 'Senthuram', size_amount: 1000, size_unit: 'g', unit_price: 1520 },
  { name: 'Poonkavi Senthuram', category: 'Senthuram', size_amount: 50, size_unit: 'g', unit_price: 95 },
  { name: 'Poonkavi Senthuram', category: 'Senthuram', size_amount: 100, size_unit: 'g', unit_price: 175 },
  { name: 'Annapethi Senthuram', category: 'Senthuram', size_amount: 1000, size_unit: 'g', unit_price: 9595 },
  { name: 'Annapethi Senthuram', category: 'Senthuram', size_amount: 500, size_unit: 'g', unit_price: 500 },

  // Paste (Category: Kalka)
  { name: 'Kupilai Paste', category: 'Kalka', size_amount: 1000, size_unit: 'g', unit_price: 2825 },
  { name: 'Kupilai Paste', category: 'Kalka', size_amount: 250, size_unit: 'g', unit_price: 710 },
  { name: 'Kupilai Paste', category: 'Kalka', size_amount: 100, size_unit: 'g', unit_price: 305 },
  { name: 'Jathjathi Kirutham Paste', category: 'Kalka', size_amount: 1000, size_unit: 'g', unit_price: 5740 },
  { name: 'Jathjathi Kirutham Paste', category: 'Kalka', size_amount: 250, size_unit: 'g', unit_price: 1440 },
  { name: 'Jathjathi Kirutham Paste', category: 'Kalka', size_amount: 100, size_unit: 'g', unit_price: 595 },
]

const getDoseForCategory = (cat: string): number => {
  switch (cat) {
    case 'Arishta':
    case 'Asawa':
    case 'Kwatha':
    case 'Syrup':
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

export async function seedNewDrugsToExistingHospitals() {
  console.log('Fetching all registered hospitals...')
  const hospitals = await prisma.hospital.findMany()

  for (const hospital of hospitals) {
    console.log(`Processing hospital ID ${hospital.id} (${hospital.name})...`)
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

    console.log(`✅ Added ${addedCount} new drugs to Hospital ID ${hospital.id}`)
  }
}

if (require.main === module) {
  seedNewDrugsToExistingHospitals()
    .then(() => {
      console.log('🎉 Seeding completed successfully!')
      process.exit(0)
    })
    .catch((err) => {
      console.error('❌ Error seeding new drugs:', err)
      process.exit(1)
    })
}

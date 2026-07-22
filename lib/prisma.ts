import { PrismaClient } from '@prisma/client'

function buildDatabaseUrl(): string {
  const host = process.env.DB_HOST || 'localhost'
  const port = process.env.DB_PORT || '3306'
  const user = process.env.DB_USERNAME || 'root'
  const password = process.env.DB_PASSWORD || ''
  const dbName = process.env.DB_NAME || 'hospital_db'

  // URL-encode password to handle special characters (#, @, %, &, etc.) safely
  const encodedPassword = encodeURIComponent(password)

  // Construct dynamic MySQL connection string if DATABASE_URL is not set or to sync credentials
  if (process.env.DB_HOST || process.env.DB_USERNAME || process.env.DB_PASSWORD) {
    return `mysql://${user}:${encodedPassword}@${host}:${port}/${dbName}`
  }

  return process.env.DATABASE_URL || `mysql://${user}:${encodedPassword}@${host}:${port}/${dbName}`
}

const dbUrl = buildDatabaseUrl()

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { sendEmail, buildVerificationEmail } from '@/lib/email'
import { seedHospitalCatalog } from '@/lib/seedHospitalCatalog'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { hospitalName, name, email, password } = body

    // Validate inputs
    if (!hospitalName || !name || !email || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Auto-generate hospital code from name + random suffix
    const baseCode = hospitalName.trim().toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
    const suffix = crypto.randomBytes(3).toString('hex').toUpperCase()
    const code = `${baseCode}-${suffix}`


    // Check for duplicate email
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    })
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email address is already registered.' },
        { status: 409 }
      )
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 12)

    // Generate email verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex')
    const verificationExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Create hospital + user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const hospital = await tx.hospital.create({
        data: {
          name: hospitalName.trim(),
          code,
        },
      })

      const user = await tx.user.create({
        data: {
          hospital_id: hospital.id,
          email: email.toLowerCase().trim(),
          password_hash,
          name: name.trim(),
          email_verification_token: emailVerificationToken,
          verification_expires_at: verificationExpiresAt,
        },
      })

      return { hospital, user }
    })

    // Seed 261 Ayurvedic drugs for this hospital
    await seedHospitalCatalog(result.hospital.id)

    // Send verification email
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const verificationUrl = `${appUrl}/auth/verify-email?token=${emailVerificationToken}`

    await sendEmail({
      to: email.toLowerCase().trim(),
      subject: '🌿 Verify your AyurMed Account',
      html: buildVerificationEmail(name.trim(), verificationUrl),
    })

    return NextResponse.json(
      {
        message: 'Registration successful! Please check your email to verify your account.',
        hospitalId: result.hospital.id,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Registration failed. Please try again.' },
      { status: 500 }
    )
  }
}

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'
import { sendEmail, buildVerificationEmail } from '@/lib/email'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email address is required' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    })

    if (!user) {
      // Don't reveal if user exists or not
      return NextResponse.json({
        message: 'If an account with that email exists, a new verification email has been sent.',
      })
    }

    if (user.is_email_verified) {
      return NextResponse.json({
        message: 'This email is already verified. You can sign in directly.',
      })
    }

    // Generate new token
    const newToken = crypto.randomBytes(32).toString('hex')
    const newExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        email_verification_token: newToken,
        verification_expires_at: newExpiry,
      },
    })

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const verificationUrl = `${appUrl}/auth/verify-email?token=${newToken}`

    await sendEmail({
      to: email.toLowerCase().trim(),
      subject: '🌿 Verify your AyurMed Account',
      html: buildVerificationEmail(user.name, verificationUrl),
    })

    return NextResponse.json({
      message: 'If an account with that email exists, a new verification email has been sent.',
    })
  } catch (error) {
    console.error('Resend verification error:', error)
    return NextResponse.json(
      { error: 'Failed to resend verification email. Please try again.' },
      { status: 500 }
    )
  }
}

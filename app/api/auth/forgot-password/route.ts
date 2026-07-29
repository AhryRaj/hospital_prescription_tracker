import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail, buildPasswordResetEmail } from '@/lib/email'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Valid email address is required' }, { status: 400 })
    }

    const cleanEmail = email.trim().toLowerCase()

    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    })

    if (!user) {
      // Return success to avoid email enumeration attacks
      return NextResponse.json({
        success: true,
        message: 'If an account exists for this email, a 6-digit reset code has been sent.',
      })
    }

    // Generate 6-digit code and set 15-minute expiration
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString()
    const resetExpiresAt = new Date(Date.now() + 15 * 60 * 1000)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        reset_password_token: resetCode,
        reset_expires_at: resetExpiresAt,
      },
    })

    const emailHtml = buildPasswordResetEmail(user.name, resetCode)
    await sendEmail({
      to: cleanEmail,
      subject: `🌿 ${resetCode} is your AyurMed Password Reset Code`,
      html: emailHtml,
    })

    return NextResponse.json({
      success: true,
      message: 'A 6-digit reset code has been sent to your email address.',
    })
  } catch (error: any) {
    console.error('Error in forgot password route:', error)
    return NextResponse.json({ error: error.message || 'Failed to process request' }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { email, code, newPassword } = await request.json()

    if (!email || !code || !newPassword) {
      return NextResponse.json(
        { error: 'Email, verification code, and new password are required' },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'New password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    const cleanEmail = email.trim().toLowerCase()
    const cleanCode = code.trim()

    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    })

    if (!user || !user.reset_password_token || !user.reset_expires_at) {
      return NextResponse.json(
        { error: 'Invalid or expired password reset code' },
        { status: 400 }
      )
    }

    if (user.reset_password_token !== cleanCode) {
      return NextResponse.json(
        { error: 'Incorrect 6-digit verification code' },
        { status: 400 }
      )
    }

    if (new Date() > new Date(user.reset_expires_at)) {
      return NextResponse.json(
        { error: 'Verification code has expired. Please request a new code.' },
        { status: 400 }
      )
    }

    // Hash new password and clear reset token
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password_hash: hashedPassword,
        reset_password_token: null,
        reset_expires_at: null,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully! You can now log in with your new password.',
    })
  } catch (error: any) {
    console.error('Error in reset password route:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to reset password' },
      { status: 500 }
    )
  }
}

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { signToken, createAuthCookie } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email_verification_token: token },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired verification token' },
        { status: 400 }
      )
    }

    // Check if token has expired
    if (user.verification_expires_at && user.verification_expires_at < new Date()) {
      return NextResponse.json(
        { error: 'Verification token has expired. Please request a new one.' },
        { status: 400 }
      )
    }

    // Mark user as verified and fetch hospital details
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        is_email_verified: true,
        email_verification_token: null,
        verification_expires_at: null,
      },
      include: {
        hospital: true,
      },
    })

    // Create session token so user is automatically logged in without needing to sign in again
    const tokenPayload = {
      userId: updatedUser.id,
      hospitalId: updatedUser.hospital_id,
      email: updatedUser.email,
      name: updatedUser.name,
      hospitalName: updatedUser.hospital.name,
    }

    const sessionJwt = await signToken(tokenPayload)
    const cookieHeader = createAuthCookie(sessionJwt)

    // Return response with Set-Cookie header so browser sets auth_token cookie
    const response = NextResponse.json({
      message: 'Email verified successfully! Entering your dashboard...',
      authenticated: true,
      user: tokenPayload,
    })

    response.headers.set('Set-Cookie', cookieHeader)
    return response
  } catch (error) {
    console.error('Verification error:', error)
    return NextResponse.json(
      { error: 'Verification failed. Please try again.' },
      { status: 500 }
    )
  }
}

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { signToken, createAuthCookie } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: { hospital: true },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Check password
    const isValid = await bcrypt.compare(password, user.password_hash)
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Check email verification
    if (!user.is_email_verified) {
      return NextResponse.json(
        { error: 'Please verify your email address before signing in. Check your inbox for the verification link.' },
        { status: 403 }
      )
    }

    // Sign JWT token
    const token = await signToken({
      userId: user.id,
      hospitalId: user.hospital_id,
      email: user.email,
      name: user.name,
      hospitalName: user.hospital.name,
    })

    const response = NextResponse.json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        hospitalName: user.hospital.name,
      },
    })

    response.headers.set('Set-Cookie', createAuthCookie(token))
    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Login failed. Please try again.' },
      { status: 500 }
    )
  }
}

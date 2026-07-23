'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Sprout, MailCheck, Loader2, RefreshCw } from 'lucide-react'

function VerifyPendingContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''
  const [resending, setResending] = useState(false)
  const [resendMessage, setResendMessage] = useState('')

  const handleResend = async () => {
    if (!email) return
    setResending(true)
    setResendMessage('')

    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()
      setResendMessage(data.message || 'Verification email resent!')
    } catch {
      setResendMessage('Failed to resend. Please try again.')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-slate-50 to-teal-50 p-4">
      <div className="w-full max-w-md text-center">
        {/* Brand Header */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 shadow-lg mb-6">
          <Sprout className="w-9 h-9 text-white" />
        </div>

        {/* Status Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xl p-8 space-y-5">
          <MailCheck className="w-14 h-14 text-emerald-600 mx-auto" />
          <h2 className="text-xl font-extrabold text-slate-900">Check Your Inbox 📬</h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            We&apos;ve sent a verification link to{' '}
            {email && <strong className="text-slate-700">{email}</strong>}.
            <br />
            Click the link in the email to activate your account.
          </p>

          {/* Resend */}
          <div className="pt-2">
            <button
              onClick={handleResend}
              disabled={resending || !email}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              Resend Verification Email
            </button>
          </div>

          {resendMessage && (
            <p className="text-sm text-emerald-700 font-medium">{resendMessage}</p>
          )}

          <hr className="border-slate-100" />

          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 text-sm font-bold text-emerald-700 hover:text-emerald-800 transition-colors"
          >
            ← Back to Sign In
          </Link>
        </div>

        {/* Footer */}
        <p className="text-xs text-slate-400 mt-6">
          AyurMed System — Ayurvedic Hospital Prescription & Expenditure Tracker
        </p>
      </div>
    </div>
  )
}

export default function VerifyPendingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-slate-50 to-teal-50">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    }>
      <VerifyPendingContent />
    </Suspense>
  )
}

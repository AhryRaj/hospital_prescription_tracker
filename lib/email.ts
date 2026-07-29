import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

interface EmailOptions {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  const from = process.env.SMTP_FROM || 'AyurMed System <noreply@ayurvedahospital.lk>'

  try {
    await transporter.sendMail({ from, to, subject, html })
    return { success: true }
  } catch (error) {
    console.error('Email send failed:', error)
    return { success: false, error }
  }
}

export function buildVerificationEmail(name: string, verificationUrl: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
      <div style="max-width:520px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <div style="background:linear-gradient(135deg,#065f46,#047857);padding:32px 24px;text-align:center;">
          <h1 style="color:#fff;font-size:22px;margin:0 0 4px;">🌿 AyurMed System</h1>
          <p style="color:#a7f3d0;font-size:13px;margin:0;">Ayurvedic Hospital Prescription Tracker</p>
        </div>
        <div style="padding:32px 24px;">
          <h2 style="color:#0f172a;font-size:18px;margin:0 0 12px;">Welcome, ${name}! 👋</h2>
          <p style="color:#475569;font-size:14px;line-height:1.6;margin:0 0 24px;">
            Thank you for registering your hospital on the AyurMed Prescription Tracker.
            Click the button below to verify your email address and activate your account.
          </p>
          <div style="text-align:center;margin:0 0 24px;">
            <a href="${verificationUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:16px 36px;background:#059669;color:#ffffff !important;text-decoration:none !important;border-radius:12px;font-size:15px;font-weight:700;letter-spacing:0.5px;-webkit-text-size-adjust:none;box-shadow:0 4px 12px rgba(5,150,105,0.3);">
              ✅ Verify Email Address
            </a>
          </div>
          <p style="color:#94a3b8;font-size:12px;line-height:1.5;margin:0 0 8px;text-align:center;">
            This verification link expires in <strong>24 hours</strong>. If you did not register, you can safely ignore this email.
          </p>
          <hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0;">
          <p style="color:#cbd5e1;font-size:11px;text-align:center;margin:0;">
            AyurMed System — Ayurvedic Hospital Prescription & Expenditure Tracker
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}

export function buildPasswordResetEmail(name: string, code: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
      <div style="max-width:520px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <div style="background:linear-gradient(135deg,#065f46,#047857);padding:32px 24px;text-align:center;">
          <h1 style="color:#fff;font-size:22px;margin:0 0 4px;">🌿 AyurMed System</h1>
          <p style="color:#a7f3d0;font-size:13px;margin:0;">Ayurvedic Hospital Prescription Tracker</p>
        </div>
        <div style="padding:32px 24px;">
          <h2 style="color:#0f172a;font-size:18px;margin:0 0 12px;">Hello ${name},</h2>
          <p style="color:#475569;font-size:14px;line-height:1.6;margin:0 0 20px;">
            We received a request to reset your password. Use the 6-digit verification code below to set a new password:
          </p>
          <div style="text-align:center;margin:24px 0;">
            <div style="display:inline-block;padding:16px 32px;background:#f0fdf4;border:2px dashed #059669;border-radius:12px;font-size:28px;font-weight:900;letter-spacing:6px;color:#065f46;">
              ${code}
            </div>
          </div>
          <p style="color:#94a3b8;font-size:12px;line-height:1.5;margin:0 0 8px;text-align:center;">
            This reset code is valid for <strong>15 minutes</strong>. If you did not request a password reset, you can safely ignore this message.
          </p>
          <hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0;">
          <p style="color:#cbd5e1;font-size:11px;text-align:center;margin:0;">
            Ayurvedic Hospital Prescription Tracker • Confidential Security Code
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Auth pages render without sidebar — they have their own full-screen layout
  return <>{children}</>
}

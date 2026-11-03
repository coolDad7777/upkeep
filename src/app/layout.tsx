import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'CrewCompliant — Compliance Tracking for Electrical Contractors',
    template: '%s | CrewCompliant',
  },
  description: 'Stop losing jobs over expired licenses. Track employee licenses, insurance certificates, and safety certifications for your electrical contracting company.',
  keywords: ['electrical contractor compliance', 'license tracking', 'insurance certificate tracking', 'COI tracking', 'contractor document management'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: 'CrewCompliant',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  )
}

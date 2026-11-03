import Link from 'next/link'
import { Shield } from 'lucide-react'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="h-16 border-b border-gray-200 bg-white flex items-center px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-gray-900">CrewCompliant</span>
        </Link>
      </nav>
      <div className="flex-1 flex items-center justify-center p-4">
        {children}
      </div>
      <footer className="py-4 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} CrewCompliant. {' '}
        <Link href="/privacy" className="hover:text-gray-600">Privacy</Link>
        {' · '}
        <Link href="/terms" className="hover:text-gray-600">Terms</Link>
      </footer>
    </div>
  )
}

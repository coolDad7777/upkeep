import Link from 'next/link'
import { Shield, Lock, Server, Eye } from 'lucide-react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Security & Privacy — CrewCompliant Help',
}

export default function SecurityHelpPage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur z-50">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-700 rounded-lg flex items-center justify-center">
              <Shield className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-sm">CrewCompliant</span>
          </Link>
          <Link href="/help" className="text-sm text-gray-500 hover:text-gray-900">← Help Center</Link>
        </div>
      </nav>

      <article className="py-12 px-4 sm:px-6 max-w-2xl mx-auto">
        <p className="text-sm text-blue-700 font-medium mb-2">Security</p>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Security and privacy</h1>

        <p className="text-lg text-gray-600 mb-8">
          Your data — including sensitive license documents and personal information — is protected
          at every layer. Here&apos;s what we do and what you should know.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          {[
            { icon: <Lock className="w-5 h-5 text-blue-700" />, title: 'Encrypted in transit', desc: 'All data is transmitted over TLS 1.2+ (HTTPS). Plain HTTP is never used.' },
            { icon: <Server className="w-5 h-5 text-green-700" />, title: 'Encrypted at rest', desc: 'All files and database rows are encrypted at rest by Supabase on AWS infrastructure.' },
            { icon: <Shield className="w-5 h-5 text-purple-700" />, title: 'Tenant isolation', desc: 'Row-level security in the database ensures your company can only see its own data.' },
            { icon: <Eye className="w-5 h-5 text-orange-600" />, title: 'Signed download URLs', desc: 'Document download links expire after 5 minutes and are unique per request.' },
          ].map(item => (
            <div key={item.title} className="border border-gray-100 rounded-lg p-4">
              <div className="mb-2">{item.icon}</div>
              <h3 className="font-medium text-gray-900 text-sm mb-1">{item.title}</h3>
              <p className="text-xs text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="prose prose-gray max-w-none space-y-6 text-gray-700">
          <h2 className="text-xl font-semibold text-gray-900">Authentication</h2>
          <p>
            CrewCompliant uses <strong>Supabase Auth</strong> for all authentication. Passwords are hashed
            using bcrypt and are never stored or accessible in plain text — not even by us.
          </p>
          <p>
            You can also log in with a <strong>magic link</strong> (passwordless email login) if you prefer
            not to use a password.
          </p>

          <h2 className="text-xl font-semibold text-gray-900">File storage</h2>
          <p>
            All uploaded files are stored in a <strong>private Supabase Storage bucket</strong> with
            row-level security policies. Files are never publicly accessible by URL. Every download is
            authenticated and generates a signed URL that expires after 5 minutes.
          </p>
          <p>
            Files are stored on AWS S3 infrastructure managed by Supabase, with server-side encryption.
          </p>

          <h2 className="text-xl font-semibold text-gray-900">Who can see your data</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Your team</strong> — Users you add to your account (Owner, Admin, Staff roles) can see your company&apos;s data based on their permissions.</li>
            <li><strong>CrewCompliant staff</strong> — We can access aggregate usage data for support purposes, but we do not routinely access your documents or records.</li>
            <li><strong>Nobody else</strong> — We do not share, sell, or expose your data to any third party for any purpose other than operating the service.</li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-900">Audit logs</h2>
          <p>
            The dashboard activity feed shows the last 20 actions taken in your account (uploads, deletions,
            additions, etc.) so you can track who did what. Full audit logs are available to owners and admins.
          </p>

          <h2 className="text-xl font-semibold text-gray-900">Backups</h2>
          <p>
            Supabase runs daily automated backups of your database. File uploads are stored in object storage
            with versioning. In the event of data loss, we can restore to any point within the last 7 days.
          </p>

          <h2 className="text-xl font-semibold text-gray-900">Reporting a security issue</h2>
          <p>
            If you discover a security vulnerability, please email{' '}
            <a href="mailto:security@crewcompliant.com" className="text-blue-700 hover:underline">
              security@crewcompliant.com
            </a>{' '}
            directly. Please do not report security issues in public forums or GitHub issues.
            We&apos;ll respond within 24 hours and acknowledge responsible disclosures.
          </p>
        </div>

        <div className="mt-10 pt-8 border-t border-gray-100 flex gap-4">
          <Link href="/privacy" className="text-sm text-blue-700 hover:underline">Privacy Policy →</Link>
          <Link href="/terms" className="text-sm text-blue-700 hover:underline">Terms of Service →</Link>
          <Link href="/contact" className="text-sm text-blue-700 hover:underline">Contact security team →</Link>
        </div>
      </article>
    </div>
  )
}

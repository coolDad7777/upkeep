'use client'

import Link from 'next/link'
import { Bell, Calendar, Mail, CheckCircle2, AlertTriangle, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDate, getDaysUntilExpiry, cn } from '@/lib/utils'

interface Props {
  upcoming: Record<string, unknown>[]
  recentLogs: Record<string, unknown>[]
  settings: Record<string, unknown>
  companyId: string
  role: string
}

export function RemindersContent({ upcoming, recentLogs, settings, companyId, role }: Props) {
  const reminderDays: number[] = (settings.reminder_defaults as number[]) || [60, 30, 14, 7]

  const expired = upcoming.filter(d => d.status === 'expired')
  const expiring = upcoming.filter(d => d.status === 'expiring_soon')

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reminders</h1>
          <p className="text-sm text-gray-500 mt-0.5">Upcoming expirations and notification history.</p>
        </div>
        <Link href="/settings">
          <Button variant="outline" size="sm" className="gap-2">
            <Bell className="w-4 h-4" /> Configure reminders
          </Button>
        </Link>
      </div>

      {/* Current reminder schedule */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="w-4 h-4 text-blue-600" /> Your reminder schedule
          </CardTitle>
          <CardDescription>
            Emails are sent automatically on these intervals before a document expires.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {[60, 30, 14, 7, 0, -1, -7].map(day => {
              const active = reminderDays.includes(day)
              const label = day > 0 ? `${day}d before`
                : day === 0 ? 'On expiry'
                : `${Math.abs(day)}d after`
              return (
                <div key={day} className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-medium border',
                  active ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-gray-50 text-gray-400 border-gray-100 line-through'
                )}>
                  {label}
                </div>
              )
            })}
          </div>
          <p className="text-xs text-gray-400 mt-3">
            Reminders go to company admins and to the person's email if on record. <Link href="/settings" className="text-blue-700 hover:underline">Edit in Settings →</Link>
          </p>
        </CardContent>
      </Card>

      {/* Upcoming expirations */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="w-4 h-4 text-orange-600" /> Upcoming expirations (next 60 days)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {upcoming.length === 0 ? (
            <div className="px-6 pb-6 text-center">
              <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-sm text-gray-600">No documents expiring in the next 60 days.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {upcoming.map(doc => {
                const docType = doc.document_type as Record<string, string> | null
                const person = doc.person as Record<string, string> | null
                const vehicle = doc.vehicle as Record<string, string> | null
                const entityName = person
                  ? `${person.first_name} ${person.last_name}`
                  : vehicle
                  ? `${vehicle.make} ${vehicle.model}`
                  : '—'
                const days = getDaysUntilExpiry(doc.expiry_date as string | null)
                const isExpired = (days ?? 0) < 0

                return (
                  <div key={doc.id as string} className="px-6 py-3 flex items-center gap-4">
                    <div className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                      isExpired ? 'bg-red-100' : days !== null && days <= 7 ? 'bg-orange-100' : 'bg-yellow-100'
                    )}>
                      {isExpired
                        ? <AlertTriangle className="w-4 h-4 text-red-600" />
                        : <Clock className="w-4 h-4 text-yellow-600" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{docType?.name}</p>
                      <p className="text-xs text-gray-500">{entityName}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm text-gray-600">{formatDate(doc.expiry_date as string | null)}</p>
                      <p className={cn(
                        'text-xs font-medium',
                        isExpired ? 'text-red-600' : days !== null && days <= 7 ? 'text-orange-600' : 'text-yellow-600'
                      )}>
                        {days === null ? '' : isExpired ? `${Math.abs(days)}d overdue` : days === 0 ? 'Today' : `${days}d left`}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent reminders sent */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Mail className="w-4 h-4 text-blue-600" /> Recently sent reminders
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {recentLogs.length === 0 ? (
            <p className="px-6 pb-6 text-sm text-gray-400">No reminders sent yet. They'll appear here once the system processes expirations.</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentLogs.map(log => {
                const doc = log.document as Record<string, unknown> | null
                const docType = doc?.document_type as Record<string, string> | null
                const person = doc?.person as Record<string, string> | null

                return (
                  <div key={log.id as string} className="px-6 py-3 flex items-center gap-3">
                    <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">
                        {docType?.name || 'Document reminder'} sent to {log.recipient_email as string}
                      </p>
                      <p className="text-xs text-gray-400">
                        {log.days_before as number > 0 ? `${log.days_before} days before` : 'After expiry'} ·{' '}
                        {new Date(log.sent_at as string).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs text-green-700 border-green-200 bg-green-50">Sent</Badge>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

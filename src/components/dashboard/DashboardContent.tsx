'use client'

import Link from 'next/link'
import { AlertTriangle, CheckCircle2, Clock, FileX, Users, Truck, ArrowRight, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn, formatDate, getStatusColor, getStatusLabel } from '@/lib/utils'
import { DocumentStatus } from '@/types'

interface Props {
  stats: {
    total: number
    active: number
    expiring: number
    expired: number
    missing: number
    compliance: number
    people: number
    vehicles: number
  }
  urgentDocs: Record<string, unknown>[]
  recentActivity: Record<string, unknown>[]
}

function StatCard({
  title, value, icon: Icon, color, href, sublabel
}: {
  title: string
  value: number
  icon: React.ElementType
  color: string
  href?: string
  sublabel?: string
}) {
  const content = (
    <Card className={cn('relative overflow-hidden cursor-pointer transition-shadow hover:shadow-md', href && 'hover:border-blue-200')}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
            {sublabel && <p className="text-xs text-gray-400 mt-0.5">{sublabel}</p>}
          </div>
          <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', color)}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return href ? <Link href={href}>{content}</Link> : content
}

function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    active: 'bg-green-500',
    expiring_soon: 'bg-yellow-500',
    expired: 'bg-red-500',
    missing: 'bg-gray-400',
    pending: 'bg-blue-500',
  }
  return <span className={cn('inline-block w-2 h-2 rounded-full flex-shrink-0', colors[status] || 'bg-gray-300')} />
}

function formatActivityAction(action: string, metadata: Record<string, unknown>): string {
  const map: Record<string, string> = {
    'document.uploaded': `Uploaded ${metadata.document_type || 'document'}`,
    'document.deleted': `Deleted ${metadata.document_type || 'document'}`,
    'document.requested': `Requested ${metadata.document_type || 'document'}`,
    'person.created': `Added person: ${metadata.name || ''}`,
    'person.updated': `Updated person: ${metadata.name || ''}`,
    'vehicle.created': `Added vehicle`,
    'company.updated': 'Updated company settings',
  }
  return map[action] || action.replace('.', ': ')
}

export function DashboardContent({ stats, urgentDocs, recentActivity }: Props) {
  const hasIssues = stats.expiring > 0 || stats.expired > 0 || stats.missing > 0
  const isNew = stats.total === 0

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Compliance Dashboard</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          {isNew
            ? 'Get started by adding your first employee and uploading their documents.'
            : 'Your crew\'s current compliance status.'}
        </p>
      </div>

      {/* Empty state */}
      {isNew && (
        <Card className="border-dashed border-2 border-blue-200 bg-blue-50/50">
          <CardContent className="p-8 text-center">
            <div className="text-5xl mb-4">📋</div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Welcome to CrewCompliant</h2>
            <p className="text-gray-600 text-sm mb-6 max-w-md mx-auto">
              Start by adding your crew members and uploading their licenses, insurance, and certifications. You'll get automatic alerts before anything expires.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/people">
                <Button className="bg-blue-700 hover:bg-blue-800 gap-2">
                  <Users className="w-4 h-4" /> Add first employee
                </Button>
              </Link>
              <Link href="/documents">
                <Button variant="outline" className="gap-2">
                  Upload document
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Compliance score */}
      {!isNew && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Overall Compliance</h2>
                <p className="text-xs text-gray-500">Based on document status only — not legal compliance</p>
              </div>
              <div className="text-right">
                <span className={cn(
                  'text-3xl font-bold',
                  stats.compliance >= 90 ? 'text-green-600'
                    : stats.compliance >= 70 ? 'text-yellow-600'
                    : 'text-red-600'
                )}>
                  {stats.compliance}%
                </span>
                <p className="text-xs text-gray-500">{stats.active} of {stats.total} current</p>
              </div>
            </div>
            <Progress
              value={stats.compliance}
              className="h-2.5"
            />
            {stats.compliance < 100 && (
              <p className="text-xs text-gray-500 mt-2">
                {stats.expired} expired · {stats.expiring} expiring soon · {stats.missing} missing
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Expired"
          value={stats.expired}
          icon={AlertTriangle}
          color="bg-red-100 text-red-600"
          href="/documents?status=expired"
          sublabel="Need immediate action"
        />
        <StatCard
          title="Expiring Soon"
          value={stats.expiring}
          icon={Clock}
          color="bg-yellow-100 text-yellow-600"
          href="/documents?status=expiring_soon"
          sublabel="Within 30 days"
        />
        <StatCard
          title="Missing"
          value={stats.missing}
          icon={FileX}
          color="bg-gray-100 text-gray-600"
          href="/documents?status=missing"
          sublabel="No file on record"
        />
        <StatCard
          title="Current"
          value={stats.active}
          icon={CheckCircle2}
          color="bg-green-100 text-green-600"
          href="/documents?status=active"
          sublabel="Valid and on file"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Urgent items */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Items Needing Attention</CardTitle>
              <Link href="/documents" className="text-sm text-blue-700 hover:underline flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {urgentDocs.length === 0 ? (
              <div className="px-6 pb-6 text-center">
                <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-sm text-gray-600 font-medium">All documents are current</p>
                <p className="text-xs text-gray-400">Nice work keeping things up to date.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {urgentDocs.map((doc) => {
                  const person = doc.person as Record<string, string> | null
                  const vehicle = doc.vehicle as Record<string, string> | null
                  const docType = doc.document_type as Record<string, string> | null
                  const entityName = person
                    ? `${person.first_name} ${person.last_name}`
                    : vehicle
                    ? `${vehicle.make} ${vehicle.model} ${vehicle.plate || ''}`
                    : 'Unknown'

                  return (
                    <div key={doc.id as string} className="px-6 py-3 flex items-center gap-3">
                      <StatusDot status={doc.status as string} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {docType?.name || 'Document'}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{entityName}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <Badge
                          variant="outline"
                          className={cn('text-xs', getStatusColor(doc.status as DocumentStatus))}
                        >
                          {getStatusLabel(doc.status as DocumentStatus)}
                        </Badge>
                        {!!doc.expiry_date && (
                          <p className="text-xs text-gray-400 mt-0.5">
                            {formatDate(String(doc.expiry_date))}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick stats + recent activity */}
        <div className="space-y-4">
          {/* Entity counts */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-4">
                <Link href="/people" className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <Users className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-xl font-bold text-gray-900">{stats.people}</p>
                    <p className="text-xs text-gray-500">Active people</p>
                  </div>
                </Link>
                <Link href="/people?type=vehicle" className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <Truck className="w-5 h-5 text-indigo-600" />
                  <div>
                    <p className="text-xl font-bold text-gray-900">{stats.vehicles}</p>
                    <p className="text-xs text-gray-500">Vehicles</p>
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Recent activity */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {recentActivity.length === 0 ? (
                <p className="px-6 pb-4 text-sm text-gray-400">No activity yet.</p>
              ) : (
                <div className="divide-y divide-gray-50">
                  {recentActivity.slice(0, 6).map(log => (
                    <div key={log.id as string} className="px-6 py-2.5 flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-700 truncate">
                          {String(formatActivityAction(String(log.action), (log.metadata as Record<string, unknown>) || {}))}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(log.created_at as string).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Next actions */}
      {hasIssues && (
        <Card className="border-blue-100 bg-blue-50/30">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-900 mb-1">Recommended next actions</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  {stats.expired > 0 && (
                    <li>
                      → <Link href="/documents?status=expired" className="text-blue-700 hover:underline">
                        Renew {stats.expired} expired document{stats.expired > 1 ? 's' : ''}
                      </Link>
                    </li>
                  )}
                  {stats.expiring > 0 && (
                    <li>
                      → <Link href="/documents?status=expiring_soon" className="text-blue-700 hover:underline">
                        Schedule renewal for {stats.expiring} expiring document{stats.expiring > 1 ? 's' : ''}
                      </Link>
                    </li>
                  )}
                  {stats.missing > 0 && (
                    <li>
                      → <Link href="/documents?status=missing" className="text-blue-700 hover:underline">
                        Upload or request {stats.missing} missing document{stats.missing > 1 ? 's' : ''}
                      </Link>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

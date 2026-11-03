'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, Users, FileText, AlertTriangle, CheckCircle2, XCircle, MessageSquare, Search } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn, formatDate } from '@/lib/utils'
import { toast } from 'sonner'

interface Props {
  companies: Record<string, unknown>[]
  stats: Record<string, number>
  tickets: Record<string, unknown>[]
}

const statusColors: Record<string, string> = {
  trialing: 'bg-blue-50 text-blue-700 border-blue-200',
  active: 'bg-green-50 text-green-700 border-green-200',
  past_due: 'bg-orange-50 text-orange-700 border-orange-200',
  canceled: 'bg-red-50 text-red-700 border-red-200',
  paused: 'bg-gray-50 text-gray-600 border-gray-200',
}

export function AdminContent({ companies, stats, tickets }: Props) {
  const [search, setSearch] = useState('')
  const [suspending, setSuspending] = useState<string | null>(null)
  const router = useRouter()

  const filtered = companies.filter(c => {
    const name = String(c.name).toLowerCase()
    return !search || name.includes(search.toLowerCase())
  })

  async function toggleSuspend(companyId: string, currentStatus: boolean) {
    setSuspending(companyId)
    const res = await fetch('/api/admin/suspend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ company_id: companyId, suspend: !currentStatus }),
    })
    setSuspending(null)
    if (res.ok) {
      toast.success(currentStatus ? 'Account unsuspended.' : 'Account suspended.')
      router.refresh()
    } else {
      toast.error('Failed to update account status.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-700 rounded-xl flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">CrewCompliant Admin</h1>
            <p className="text-sm text-gray-500">Internal operations dashboard</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total accounts', value: stats.total, color: 'text-gray-900' },
            { label: 'Trialing', value: stats.trialing, color: 'text-blue-700' },
            { label: 'Active (paying)', value: stats.active, color: 'text-green-700' },
            { label: 'Past due / canceled', value: (stats.past_due || 0) + (stats.canceled || 0), color: 'text-red-700' },
          ].map(stat => (
            <Card key={stat.label}>
              <CardContent className="p-4">
                <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
                <p className={cn('text-2xl font-bold', stat.color)}>{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Company list */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Users className="w-4 h-4" /> Companies ({companies.length})
                  </CardTitle>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search companies..."
                    className="pl-9 text-sm"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
              </CardHeader>
              <div className="divide-y divide-gray-50 max-h-[600px] overflow-y-auto">
                {filtered.map(company => (
                  <div key={String(company.id)} className="px-6 py-3 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-gray-900">{String(company.name)}</span>
                        {!!company.is_suspended && (
                          <Badge variant="outline" className="text-xs bg-red-50 text-red-700">Suspended</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge
                          variant="outline"
                          className={cn('text-xs', statusColors[String(company.subscription_status)] || '')}
                        >
                          {String(company.subscription_status)}
                        </Badge>
                        <span className="text-xs text-gray-400">
                          {String(company.member_count || 0)} users · {String(company.doc_count || 0)} docs
                        </span>
                        {(company.expired_count as number) > 0 && (
                          <span className="text-xs text-red-600">
                            {String(company.expired_count)} expired
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Joined {formatDate(String(company.created_at))}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn('text-xs h-7', company.is_suspended ? 'text-green-700' : 'text-red-600')}
                      onClick={() => toggleSuspend(String(company.id), Boolean(company.is_suspended))}
                      disabled={suspending === String(company.id)}
                    >
                      {company.is_suspended ? 'Unsuspend' : 'Suspend'}
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Support tickets */}
          <div>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" /> Open tickets ({tickets.length})
                </CardTitle>
              </CardHeader>
              <div className="divide-y divide-gray-50 max-h-[400px] overflow-y-auto">
                {tickets.length === 0 ? (
                  <div className="px-6 py-6 text-center">
                    <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No open tickets</p>
                  </div>
                ) : (
                  tickets.map(ticket => (
                    <div key={String(ticket.id)} className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900 truncate">{String(ticket.subject)}</p>
                      <p className="text-xs text-gray-500">{String(ticket.email)}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{formatDate(String(ticket.created_at))}</p>
                    </div>
                  ))
                )}
              </div>
            </Card>

            {/* Quick links */}
            <Card className="mt-4">
              <CardContent className="p-4 space-y-2">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick actions</h3>
                <a href="/api/admin/export" className="block text-sm text-blue-700 hover:underline">
                  Export all company data (CSV)
                </a>
                <a href="https://dashboard.stripe.com" target="_blank" className="block text-sm text-blue-700 hover:underline">
                  Stripe Dashboard ↗
                </a>
                <a href="https://supabase.com/dashboard" target="_blank" className="block text-sm text-blue-700 hover:underline">
                  Supabase Dashboard ↗
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

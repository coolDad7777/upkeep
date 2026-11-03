'use client'

import { useState } from 'react'
import { Download, FileText, Filter, AlertTriangle, CheckCircle2, Clock, FileX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn, formatDate, getStatusColor, getStatusLabel, getDaysUntilExpiry } from '@/lib/utils'
import { DocumentStatus } from '@/types'
import { toast } from 'sonner'

interface Props {
  documents: Record<string, unknown>[]
  companyName: string
  companyId: string
}

export function ReportsContent({ documents, companyName, companyId }: Props) {
  const [filter, setFilter] = useState('all')

  const filtered = documents.filter(doc => {
    if (filter === 'all') return true
    return doc.status === filter
  })

  const summary = {
    total: documents.length,
    active: documents.filter(d => d.status === 'active').length,
    expiring: documents.filter(d => d.status === 'expiring_soon').length,
    expired: documents.filter(d => d.status === 'expired').length,
    missing: documents.filter(d => d.status === 'missing').length,
  }

  function downloadCSV() {
    const headers = ['Document Type', 'Person / Vehicle', 'Type', 'Status', 'Expiration Date', 'Days Until Expiry', 'Last Updated']
    const rows = filtered.map(doc => {
      const docType = doc.document_type as Record<string, string> | null
      const person = doc.person as Record<string, string> | null
      const vehicle = doc.vehicle as Record<string, string> | null
      const entityName = person
        ? `${person.first_name} ${person.last_name}`
        : vehicle
        ? `${vehicle.make} ${vehicle.model}${vehicle.plate ? ` (${vehicle.plate})` : ''}`
        : '—'
      const entityType = person ? (person.type === 'employee' ? 'Employee' : 'Subcontractor') : 'Vehicle'
      const days = getDaysUntilExpiry(doc.expiry_date as string | null)

      return [
        docType?.name || '—',
        entityName,
        entityType,
        getStatusLabel(doc.status as DocumentStatus),
        formatDate(doc.expiry_date as string | null),
        days !== null ? String(days) : '—',
        formatDate(doc.updated_at as string),
      ]
    })

    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n')

    const disclaimer = `"CrewCompliant Compliance Report",\n"Company: ${companyName}",\n"Generated: ${new Date().toLocaleString()}",\n"DISCLAIMER: This report reflects document dates only. It is an administrative tracking tool and does not constitute legal or regulatory compliance certification.",\n\n`

    const blob = new Blob([disclaimer + csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `compliance-report-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Report downloaded.')
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Compliance Report</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Administrative tracking report for {companyName}
          </p>
        </div>
        <Button onClick={downloadCSV} className="gap-2 bg-blue-700 hover:bg-blue-800">
          <Download className="w-4 h-4" /> Download CSV
        </Button>
      </div>

      {/* Disclaimer */}
      <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <p className="text-xs text-amber-800">
          <strong>Administrative tool only.</strong> This report reflects document expiration dates as entered in CrewCompliant. It does not certify legal or regulatory compliance. Always verify requirements with qualified professionals in your jurisdiction.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Expired', count: summary.expired, icon: AlertTriangle, color: 'text-red-600 bg-red-50' },
          { label: 'Expiring Soon', count: summary.expiring, icon: Clock, color: 'text-yellow-600 bg-yellow-50' },
          { label: 'Missing', count: summary.missing, icon: FileX, color: 'text-gray-500 bg-gray-50' },
          { label: 'Current', count: summary.active, icon: CheckCircle2, color: 'text-green-600 bg-green-50' },
        ].map(({ label, count, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center', color)}>
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{count}</p>
                <p className="text-xs text-gray-500">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3 mb-4">
        <Select value={filter} onValueChange={(v) => setFilter(v ?? 'all')}>
          <SelectTrigger className="w-48">
            <Filter className="w-4 h-4 mr-2 text-gray-400" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All documents ({summary.total})</SelectItem>
            <SelectItem value="expired">Expired ({summary.expired})</SelectItem>
            <SelectItem value="expiring_soon">Expiring soon ({summary.expiring})</SelectItem>
            <SelectItem value="missing">Missing ({summary.missing})</SelectItem>
            <SelectItem value="active">Current ({summary.active})</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-gray-500">Showing {filtered.length} of {summary.total}</span>
      </div>

      {/* Report table */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="hidden sm:grid grid-cols-[2fr_2fr_1fr_1fr_1fr] gap-4 px-4 py-3 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wide">
          <div>Document Type</div>
          <div>Person / Vehicle</div>
          <div>Status</div>
          <div>Expiration</div>
          <div>Days Left</div>
        </div>
        <div className="divide-y divide-gray-50">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <FileText className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              No documents match your filter.
            </div>
          ) : (
            filtered.map(doc => {
              const docType = doc.document_type as Record<string, string> | null
              const person = doc.person as Record<string, string> | null
              const vehicle = doc.vehicle as Record<string, string> | null
              const entityName = person
                ? `${person.first_name} ${person.last_name}`
                : vehicle
                ? `${vehicle.make} ${vehicle.model}${vehicle.plate ? ` (${vehicle.plate})` : ''}`
                : '—'
              const entityType = person
                ? (person.type === 'employee' ? 'Employee' : 'Sub')
                : 'Vehicle'
              const days = getDaysUntilExpiry(doc.expiry_date as string | null)

              return (
                <div key={doc.id as string} className="grid grid-cols-1 sm:grid-cols-[2fr_2fr_1fr_1fr_1fr] gap-2 sm:gap-4 px-4 py-3 hover:bg-gray-50">
                  <div className="font-medium text-gray-900 text-sm">
                    {docType?.name || '—'}
                  </div>
                  <div className="text-sm text-gray-600">
                    {entityName}
                    <span className="text-xs text-gray-400 ml-2">({entityType})</span>
                  </div>
                  <div>
                    <Badge
                      variant="outline"
                      className={cn('text-xs', getStatusColor(doc.status as DocumentStatus))}
                    >
                      {getStatusLabel(doc.status as DocumentStatus)}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600">
                    {formatDate(doc.expiry_date as string | null)}
                  </div>
                  <div className={cn(
                    'text-sm font-medium',
                    days === null ? 'text-gray-400'
                      : days < 0 ? 'text-red-600'
                      : days <= 14 ? 'text-yellow-600'
                      : 'text-gray-600'
                  )}>
                    {days === null ? '—'
                      : days < 0 ? `${Math.abs(days)}d overdue`
                      : days === 0 ? 'Today'
                      : `${days}d`}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

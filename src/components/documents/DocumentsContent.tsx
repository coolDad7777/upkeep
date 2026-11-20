'use client'

import { useState, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Plus, Search, Upload, Download, Trash2, Eye, Filter, FileText, AlertTriangle, Clock, CheckCircle2, FileX, RefreshCw, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { UploadDocumentForm } from './UploadDocumentForm'
import { RequestDocumentForm } from './RequestDocumentForm'
import { cn, formatDate, getStatusColor, getStatusLabel, getDaysUntilExpiry } from '@/lib/utils'
import { requestDocumentDownload } from '@/lib/download-document'
import { DocumentStatus } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface Props {
  documents: Record<string, unknown>[]
  documentTypes: Record<string, unknown>[]
  people: Record<string, unknown>[]
  vehicles: Record<string, unknown>[]
  companyId: string
  role: string
  filterStatus?: string
}

const STATUS_OPTIONS = [
  { value: '', label: 'All documents' },
  { value: 'expired', label: 'Expired' },
  { value: 'expiring_soon', label: 'Expiring soon' },
  { value: 'missing', label: 'Missing' },
  { value: 'active', label: 'Current' },
]

export function DocumentsContent({ documents, documentTypes, people, vehicles, companyId, role, filterStatus }: Props) {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState(filterStatus || '')
  const [showUpload, setShowUpload] = useState(false)
  const [showRequest, setShowRequest] = useState(false)
  const router = useRouter()
  const canEdit = ['owner', 'admin', 'staff'].includes(role)

  const filtered = documents.filter(doc => {
    const docType = (doc.document_type as Record<string, string>)?.name?.toLowerCase() || ''
    const person = doc.person as Record<string, string> | null
    const vehicle = doc.vehicle as Record<string, string> | null
    const entityName = person
      ? `${person.first_name} ${person.last_name}`.toLowerCase()
      : vehicle
      ? `${vehicle.make} ${vehicle.model}`.toLowerCase()
      : ''

    const matchSearch = !search || docType.includes(search.toLowerCase()) || entityName.includes(search.toLowerCase())
    const matchStatus = !status || doc.status === status

    return matchSearch && matchStatus
  })

  function ExpiryBadge({ expiryDate, docStatus }: { expiryDate: string | null; docStatus: string }) {
    const days = getDaysUntilExpiry(expiryDate)
    if (docStatus === 'missing') return <span className="text-xs text-gray-400">No document</span>
    if (!expiryDate) return <span className="text-xs text-gray-400">No expiry</span>
    if (days === null) return null

    const label = days < 0
      ? `Expired ${Math.abs(days)}d ago`
      : days === 0
      ? 'Expires today'
      : `${days}d left`

    return (
      <span className={cn(
        'text-xs font-medium',
        days < 0 ? 'text-red-600' : days <= 7 ? 'text-red-500' : days <= 30 ? 'text-yellow-600' : 'text-gray-500'
      )}>
        {label}
      </span>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <p className="text-sm text-gray-500 mt-0.5">{documents.length} documents total</p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowRequest(true)} className="gap-2 hidden sm:flex">
              <Send className="w-4 h-4" /> Request doc
            </Button>
            <Button size="sm" onClick={() => setShowUpload(true)} className="gap-2 bg-blue-700 hover:bg-blue-800">
              <Upload className="w-4 h-4" /> Upload document
            </Button>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search documents..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={status || 'all'} onValueChange={(v) => {
          const newStatus = (v ?? '') === 'all' ? '' : (v ?? '')
          setStatus(newStatus)
          const url = new URL(window.location.href)
          if (newStatus) url.searchParams.set('status', newStatus)
          else url.searchParams.delete('status')
          router.push(url.pathname + url.search)
        }}>
          <SelectTrigger className="w-48">
            <Filter className="w-4 h-4 mr-2 text-gray-400" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map(opt => (
              <SelectItem key={opt.value || 'all'} value={opt.value || 'all'}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Status summary pills */}
      <div className="flex gap-2 flex-wrap mb-4">
        {[
          { s: 'expired', icon: AlertTriangle, label: 'Expired', color: 'text-red-700 bg-red-50 border-red-200' },
          { s: 'expiring_soon', icon: Clock, label: 'Expiring', color: 'text-yellow-700 bg-yellow-50 border-yellow-200' },
          { s: 'missing', icon: FileX, label: 'Missing', color: 'text-gray-600 bg-gray-50 border-gray-200' },
          { s: 'active', icon: CheckCircle2, label: 'Current', color: 'text-green-700 bg-green-50 border-green-200' },
        ].map(({ s, icon: Icon, label, color }) => {
          const count = documents.filter(d => d.status === s).length
          if (count === 0) return null
          return (
            <button
              key={s}
              onClick={() => setStatus(status === s ? '' : s)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all',
                color,
                status === s ? 'ring-2 ring-offset-1 ring-blue-400' : ''
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {count} {label}
            </button>
          )
        })}
      </div>

      {/* Document list */}
      {filtered.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-10 text-center">
            <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 font-medium mb-1">No documents found</p>
            <p className="text-sm text-gray-400 mb-4">
              {documents.length === 0
                ? 'Upload your first document to start tracking compliance.'
                : 'Try adjusting your search or filters.'}
            </p>
            {canEdit && documents.length === 0 && (
              <Button onClick={() => setShowUpload(true)} className="bg-blue-700 hover:bg-blue-800 gap-2">
                <Upload className="w-4 h-4" /> Upload first document
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          {/* Table header */}
          <div className="hidden sm:grid grid-cols-[2fr_2fr_1fr_1fr_1fr_auto] gap-4 px-4 py-2.5 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500 uppercase tracking-wide">
            <div>Document</div>
            <div>Person / Vehicle</div>
            <div>Status</div>
            <div>Expires</div>
            <div>Updated</div>
            <div />
          </div>
          {/* Rows */}
          <div className="divide-y divide-gray-100">
            {filtered.map(doc => {
              const docType = doc.document_type as Record<string, string> | null
              const person = doc.person as Record<string, string> | null
              const vehicle = doc.vehicle as Record<string, string> | null
              const entityName = person
                ? `${person.first_name} ${person.last_name}`
                : vehicle
                ? `${vehicle.make} ${vehicle.model}${vehicle.plate ? ` · ${vehicle.plate}` : ''}`
                : '—'

              return (
                <div key={doc.id as string} className="grid grid-cols-1 sm:grid-cols-[2fr_2fr_1fr_1fr_1fr_auto] gap-2 sm:gap-4 px-4 py-3.5 hover:bg-gray-50 transition-colors">
                  {/* Document name */}
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {docType?.name || 'Document'}
                      </p>
                      {!!doc.file_name && (
                        <p className="text-xs text-gray-400 truncate max-w-40">{String(doc.file_name)}</p>
                      )}
                    </div>
                  </div>

                  {/* Entity */}
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600">{String(entityName)}</span>
                    {person && (
                      <span className="ml-2 text-xs text-gray-400">
                        ({String(person.type) === 'employee' ? 'Employee' : 'Sub'})
                      </span>
                    )}
                  </div>

                  {/* Status */}
                  <div className="flex items-center">
                    <Badge
                      variant="outline"
                      className={cn('text-xs', getStatusColor(String(doc.status) as DocumentStatus))}
                    >
                      {getStatusLabel(String(doc.status) as DocumentStatus)}
                    </Badge>
                  </div>

                  {/* Expiry */}
                  <div className="flex flex-col justify-center">
                    <span className="text-sm text-gray-600">{formatDate(doc.expiry_date as string | null)}</span>
                    <ExpiryBadge expiryDate={doc.expiry_date as string | null} docStatus={String(doc.status)} />
                  </div>

                  {/* Updated */}
                  <div className="flex items-center">
                    <span className="text-xs text-gray-400">{formatDate(String(doc.updated_at))}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-transparent hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                        <span className="sr-only">Actions</span>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                        </svg>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {!!doc.file_path && (
                          <DropdownMenuItem onClick={() => {
                            void requestDocumentDownload(String(doc.id))
                              .then((url) => window.open(url, '_blank', 'noopener,noreferrer'))
                              .catch(() => toast.error('Could not generate download link'))
                          }}>
                            <Download className="w-4 h-4 mr-2" /> Download
                          </DropdownMenuItem>
                        )}
                        {canEdit && (
                          <DropdownMenuItem onClick={() => setShowUpload(true)}>
                            <RefreshCw className="w-4 h-4 mr-2" /> Replace document
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Upload dialog */}
      <Dialog open={showUpload} onOpenChange={setShowUpload}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Upload document</DialogTitle>
            <DialogDescription>Upload a license, certificate, or other compliance document.</DialogDescription>
          </DialogHeader>
          <UploadDocumentForm
            companyId={companyId}
            documentTypes={documentTypes}
            people={people}
            vehicles={vehicles}
            onSuccess={() => {
              setShowUpload(false)
              router.refresh()
            }}
            onCancel={() => setShowUpload(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Request dialog */}
      <Dialog open={showRequest} onOpenChange={setShowRequest}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Request a document</DialogTitle>
            <DialogDescription>Send a secure link asking someone to upload their own document.</DialogDescription>
          </DialogHeader>
          <RequestDocumentForm
            companyId={companyId}
            documentTypes={documentTypes}
            people={people}
            onSuccess={() => {
              setShowRequest(false)
              router.refresh()
            }}
            onCancel={() => setShowRequest(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

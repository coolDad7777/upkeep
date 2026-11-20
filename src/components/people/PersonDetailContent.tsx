'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, User, Mail, Phone, Briefcase, Building2, Edit2, FileText,
  Upload, Send, Download, AlertTriangle, CheckCircle2, Clock, FileX, MoreHorizontal,
  Shield, Calendar
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { UploadDocumentForm } from '@/components/documents/UploadDocumentForm'
import { RequestDocumentForm } from '@/components/documents/RequestDocumentForm'
import { getInitials, cn, formatDate } from '@/lib/utils'
import { requestDocumentDownload } from '@/lib/download-document'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface Props {
  person: Record<string, unknown>
  documents: Record<string, unknown>[]
  documentTypes: Record<string, unknown>[]
  documentRequests: Record<string, unknown>[]
  companyId: string
  role: string
}

const typeLabel: Record<string, string> = {
  employee: 'Employee',
  subcontractor: 'Subcontractor',
  vendor: 'Vendor',
}

const typeColor: Record<string, string> = {
  employee: 'bg-blue-50 text-blue-700 border-blue-100',
  subcontractor: 'bg-purple-50 text-purple-700 border-purple-100',
  vendor: 'bg-gray-50 text-gray-600 border-gray-200',
}

const statusConfig: Record<string, { icon: React.ReactNode; label: string; className: string }> = {
  active: {
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    label: 'Current',
    className: 'text-green-700 bg-green-50 border-green-200',
  },
  expiring_soon: {
    icon: <Clock className="w-3.5 h-3.5" />,
    label: 'Expiring soon',
    className: 'text-yellow-700 bg-yellow-50 border-yellow-200',
  },
  expired: {
    icon: <AlertTriangle className="w-3.5 h-3.5" />,
    label: 'Expired',
    className: 'text-red-700 bg-red-50 border-red-200',
  },
  missing: {
    icon: <FileX className="w-3.5 h-3.5" />,
    label: 'Missing',
    className: 'text-gray-600 bg-gray-50 border-gray-200',
  },
  pending: {
    icon: <Clock className="w-3.5 h-3.5" />,
    label: 'Pending',
    className: 'text-blue-700 bg-blue-50 border-blue-200',
  },
}

function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] || statusConfig.missing
  return (
    <span className={cn('inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border', config.className)}>
      {config.icon}
      {config.label}
    </span>
  )
}

export function PersonDetailContent({ person, documents, documentTypes, documentRequests, companyId, role }: Props) {
  const [showUpload, setShowUpload] = useState(false)
  const [showRequest, setShowRequest] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const canEdit = ['owner', 'admin', 'staff'].includes(role)
  const personId = String(person.id)
  const fullName = `${String(person.first_name)} ${String(person.last_name)}`
  const personType = String(person.type)
  const email = person.email ? String(person.email) : null

  const expiredDocs = documents.filter(d => d.status === 'expired').length
  const expiringDocs = documents.filter(d => d.status === 'expiring_soon').length
  const missingDocs = documents.filter(d => d.status === 'missing').length
  const activeDocs = documents.filter(d => d.status === 'active').length

  async function handleDeactivate() {
    const { error } = await supabase
      .from('people')
      .update({ is_active: !person.is_active })
      .eq('id', personId)
    if (error) {
      toast.error('Failed to update person')
    } else {
      toast.success(person.is_active ? 'Person deactivated' : 'Person reactivated')
      router.refresh()
    }
  }

  async function handleDownload(docId: string) {
    try {
      const url = await requestDocumentDownload(docId)
      window.open(url, '_blank', 'noopener,noreferrer')
    } catch {
      toast.error('Could not generate download link')
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Back link */}
      <Link href="/people" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to People
      </Link>

      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
          <span className="text-lg font-semibold text-blue-700">{getInitials(fullName)}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold text-gray-900">{fullName}</h1>
            <Badge variant="outline" className={cn('text-xs', typeColor[personType] || '')}>
              {typeLabel[personType] || personType}
            </Badge>
            {!person.is_active && (
              <Badge variant="outline" className="text-xs text-gray-400">Inactive</Badge>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
            {!!person.job_title && (
              <span className="flex items-center gap-1 text-sm text-gray-500">
                <Briefcase className="w-3.5 h-3.5" /> {String(person.job_title)}
              </span>
            )}
            {!!person.company_name && (
              <span className="flex items-center gap-1 text-sm text-gray-500">
                <Building2 className="w-3.5 h-3.5" /> {String(person.company_name)}
              </span>
            )}
          </div>
        </div>
        {canEdit && (
          <DropdownMenu>
            <DropdownMenuTrigger className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50">
              <MoreHorizontal className="w-4 h-4 text-gray-500" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleDeactivate}>
                {person.is_active ? 'Deactivate person' : 'Reactivate person'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: contact + stats */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-700">Contact info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {email ? (
                <a href={`mailto:${email}`} className="flex items-center gap-2 text-sm text-blue-700 hover:underline">
                  <Mail className="w-4 h-4 text-gray-400" /> {email}
                </a>
              ) : (
                <span className="flex items-center gap-2 text-sm text-gray-400">
                  <Mail className="w-4 h-4" /> No email
                </span>
              )}
              {!!person.phone && (
                <a href={`tel:${String(person.phone)}`} className="flex items-center gap-2 text-sm text-gray-700 hover:underline">
                  <Phone className="w-4 h-4 text-gray-400" /> {String(person.phone)}
                </a>
              )}
              <span className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="w-4 h-4 text-gray-400" /> Added {formatDate(String(person.created_at))}
              </span>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-700">Document summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {expiredDocs > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 text-red-700"><AlertTriangle className="w-3.5 h-3.5" /> Expired</span>
                  <span className="font-semibold text-red-700">{expiredDocs}</span>
                </div>
              )}
              {expiringDocs > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 text-yellow-700"><Clock className="w-3.5 h-3.5" /> Expiring soon</span>
                  <span className="font-semibold text-yellow-700">{expiringDocs}</span>
                </div>
              )}
              {missingDocs > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 text-gray-500"><FileX className="w-3.5 h-3.5" /> Missing</span>
                  <span className="font-semibold text-gray-600">{missingDocs}</span>
                </div>
              )}
              {activeDocs > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 text-green-700"><CheckCircle2 className="w-3.5 h-3.5" /> Current</span>
                  <span className="font-semibold text-green-700">{activeDocs}</span>
                </div>
              )}
              {documents.length === 0 && (
                <p className="text-sm text-gray-400">No documents yet</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: documents */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-400" /> Documents
            </h2>
            {canEdit && (
              <div className="flex gap-2">
                {email && (
                  <Button variant="outline" size="sm" onClick={() => setShowRequest(true)} className="gap-1.5 text-xs">
                    <Send className="w-3.5 h-3.5" /> Request
                  </Button>
                )}
                <Button size="sm" onClick={() => setShowUpload(true)} className="bg-blue-700 hover:bg-blue-800 gap-1.5 text-xs">
                  <Upload className="w-3.5 h-3.5" /> Upload
                </Button>
              </div>
            )}
          </div>

          {documents.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="p-8 text-center">
                <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500 mb-3">No documents for this person yet.</p>
                {canEdit && (
                  <Button size="sm" onClick={() => setShowUpload(true)} className="bg-blue-700 hover:bg-blue-800 gap-1.5">
                    <Upload className="w-4 h-4" /> Upload first document
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {documents.map(doc => {
                const docType = doc.document_type as Record<string, unknown> | null
                return (
                  <Card key={String(doc.id)} className="hover:shadow-sm transition-shadow">
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm text-gray-900">
                            {docType ? String(docType.name) : 'Document'}
                          </span>
                          <StatusBadge status={String(doc.status)} />
                        </div>
                        <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500">
                          {!!doc.expiry_date && (
                            <span>Expires {formatDate(String(doc.expiry_date))}</span>
                          )}
                          {!!doc.issue_date && (
                            <span>Issued {formatDate(String(doc.issue_date))}</span>
                          )}
                          {!!doc.notes && (
                            <span className="italic truncate max-w-40">{String(doc.notes)}</span>
                          )}
                        </div>
                      </div>
                      {!!doc.file_path && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 flex-shrink-0"
                          onClick={() => handleDownload(String(doc.id))}
                          title="Download"
                        >
                          <Download className="w-4 h-4 text-gray-400" />
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

          {/* Pending requests */}
          {documentRequests.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Send className="w-3.5 h-3.5 text-gray-400" /> Document requests
              </h3>
              <div className="space-y-1.5">
                {documentRequests.map(req => {
                  const reqDocType = req.document_type as Record<string, unknown> | null
                  return (
                    <div key={String(req.id)} className="flex items-center justify-between text-sm p-2.5 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">{reqDocType ? String(reqDocType.name) : 'Document'}</span>
                      <span className={cn('text-xs font-medium', req.status === 'fulfilled' ? 'text-green-700' : 'text-gray-400')}>
                        {String(req.status)}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Upload dialog */}
      <Dialog open={showUpload} onOpenChange={setShowUpload}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Upload document</DialogTitle>
            <DialogDescription>Upload a compliance document for {fullName}.</DialogDescription>
          </DialogHeader>
          <UploadDocumentForm
            companyId={companyId}
            documentTypes={documentTypes}
            people={[person]}
            vehicles={[]}
            preselectedPersonId={personId}
            onSuccess={() => { setShowUpload(false); router.refresh() }}
            onCancel={() => setShowUpload(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Request dialog */}
      {email && (
        <Dialog open={showRequest} onOpenChange={setShowRequest}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Request document</DialogTitle>
              <DialogDescription>Send {fullName} an email asking them to provide a document.</DialogDescription>
            </DialogHeader>
            <RequestDocumentForm
              companyId={companyId}
              documentTypes={documentTypes}
              people={[person]}
              vehicles={[]}
              preselectedPersonId={personId}
              onSuccess={() => { setShowRequest(false); router.refresh() }}
              onCancel={() => setShowRequest(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

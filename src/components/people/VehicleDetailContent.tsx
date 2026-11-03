'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, Truck, Upload, Download, AlertTriangle, CheckCircle2, Clock, FileX,
  MoreHorizontal, Calendar, Hash
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { UploadDocumentForm } from '@/components/documents/UploadDocumentForm'
import { cn, formatDate } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface Props {
  vehicle: Record<string, unknown>
  documents: Record<string, unknown>[]
  documentTypes: Record<string, unknown>[]
  companyId: string
  role: string
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

export function VehicleDetailContent({ vehicle, documents, documentTypes, companyId, role }: Props) {
  const [showUpload, setShowUpload] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const canEdit = ['owner', 'admin', 'staff'].includes(role)
  const vehicleId = String(vehicle.id)
  const vehicleLabel = `${vehicle.year ? String(vehicle.year) + ' ' : ''}${String(vehicle.make)} ${String(vehicle.model)}`

  const expiredDocs = documents.filter(d => d.status === 'expired').length
  const expiringDocs = documents.filter(d => d.status === 'expiring_soon').length
  const missingDocs = documents.filter(d => d.status === 'missing').length
  const activeDocs = documents.filter(d => d.status === 'active').length

  async function handleDeactivate() {
    const { error } = await supabase
      .from('vehicles')
      .update({ is_active: !vehicle.is_active })
      .eq('id', vehicleId)
    if (error) {
      toast.error('Failed to update vehicle')
    } else {
      toast.success(vehicle.is_active ? 'Vehicle deactivated' : 'Vehicle reactivated')
      router.refresh()
    }
  }

  async function handleDownload(docId: string) {
    const res = await fetch(`/api/documents/${docId}/download`)
    if (!res.ok) {
      toast.error('Could not generate download link')
      return
    }
    const { url } = await res.json()
    window.open(url, '_blank')
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Back link */}
      <Link href="/people" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to People & Vehicles
      </Link>

      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
          <Truck className="w-7 h-7 text-indigo-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold text-gray-900">{vehicleLabel}</h1>
            {!vehicle.is_active && (
              <Badge variant="outline" className="text-xs text-gray-400">Inactive</Badge>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
            {!!vehicle.plate && (
              <span className="flex items-center gap-1 text-sm text-gray-500">
                <Hash className="w-3.5 h-3.5" /> Plate: {String(vehicle.plate)}
              </span>
            )}
            {!!vehicle.vin && (
              <span className="text-sm text-gray-400">VIN: {String(vehicle.vin)}</span>
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
                {vehicle.is_active ? 'Deactivate vehicle' : 'Reactivate vehicle'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: info + stats */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-700">Vehicle info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span className="text-gray-500">Make</span>
                <span className="font-medium">{String(vehicle.make)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Model</span>
                <span className="font-medium">{String(vehicle.model)}</span>
              </div>
              {!!vehicle.year && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Year</span>
                  <span className="font-medium">{String(vehicle.year)}</span>
                </div>
              )}
              {!!vehicle.plate && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Plate</span>
                  <span className="font-medium font-mono">{String(vehicle.plate)}</span>
                </div>
              )}
              {!!vehicle.vin && (
                <div className="flex justify-between">
                  <span className="text-gray-500">VIN</span>
                  <span className="font-medium font-mono text-xs">{String(vehicle.vin)}</span>
                </div>
              )}
              <div className="flex items-center gap-2 pt-1 text-gray-400 text-xs">
                <Calendar className="w-3.5 h-3.5" /> Added {formatDate(String(vehicle.created_at))}
              </div>
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
            <h2 className="font-semibold text-gray-900">Documents</h2>
            {canEdit && (
              <Button size="sm" onClick={() => setShowUpload(true)} className="bg-blue-700 hover:bg-blue-800 gap-1.5 text-xs">
                <Upload className="w-3.5 h-3.5" /> Upload
              </Button>
            )}
          </div>

          {documents.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="p-8 text-center">
                <Truck className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500 mb-3">No documents for this vehicle yet.</p>
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
                          {!!doc.expiry_date && <span>Expires {formatDate(String(doc.expiry_date))}</span>}
                          {!!doc.issue_date && <span>Issued {formatDate(String(doc.issue_date))}</span>}
                          {!!doc.notes && <span className="italic truncate max-w-40">{String(doc.notes)}</span>}
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
        </div>
      </div>

      <Dialog open={showUpload} onOpenChange={setShowUpload}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Upload document</DialogTitle>
            <DialogDescription>Upload a compliance document for {vehicleLabel}.</DialogDescription>
          </DialogHeader>
          <UploadDocumentForm
            companyId={companyId}
            documentTypes={documentTypes}
            people={[]}
            vehicles={[vehicle]}
            preselectedVehicleId={vehicleId}
            onSuccess={() => { setShowUpload(false); router.refresh() }}
            onCancel={() => setShowUpload(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

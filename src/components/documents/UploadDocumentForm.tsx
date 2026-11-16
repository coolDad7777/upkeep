'use client'

import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Upload, File, X } from 'lucide-react'
import { toast } from 'sonner'
import { validateFile, formatFileSize } from '@/lib/utils'

const schema = z.object({
  document_type_id: z.string().min(1, 'Document type is required'),
  entity_type: z.enum(['person', 'vehicle']),
  entity_id: z.string().min(1, 'Select a person or vehicle'),
  issue_date: z.string().optional(),
  expiry_date: z.string().optional(),
  notes: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface Props {
  companyId: string
  documentTypes: Record<string, unknown>[]
  people: Record<string, unknown>[]
  vehicles: Record<string, unknown>[]
  onSuccess: () => void
  onCancel: () => void
  preselectedPersonId?: string
  preselectedVehicleId?: string
}

export function UploadDocumentForm({ companyId, documentTypes, people, vehicles, onSuccess, onCancel, preselectedPersonId, preselectedVehicleId }: Props) {
  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      entity_type: preselectedVehicleId ? 'vehicle' : 'person',
      entity_id: preselectedPersonId || preselectedVehicleId || '',
    }
  })

  const entityType = watch('entity_type')
  const docTypeId = watch('document_type_id')

  // Filter document types based on entity type
  const relevantTypes = documentTypes.filter(dt => {
    const appliesTo = dt.applies_to as string[]
    return entityType === 'person' ? appliesTo.includes('person') : appliesTo.includes('vehicle')
  })

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0]
    if (!selected) return
    const validationError = validateFile(selected)
    if (validationError) {
      setFileError(validationError)
      setFile(null)
      return
    }
    setFileError(null)
    setFile(selected)
  }

  async function onSubmit(data: FormData) {
    setError(null)
    setUploading(true)

    let filePath: string | null = null
    let fileName: string | null = null
    let fileSize: number | null = null
    let fileType: string | null = null

    // Upload file to Supabase Storage
    if (file) {
      const ext = file.name.split('.').pop()
      const path = `${companyId}/${data.entity_type}/${data.entity_id}/${data.document_type_id}/${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(path, file, { upsert: false })

      if (uploadError) {
        setError(`Upload failed: ${uploadError.message}`)
        setUploading(false)
        return
      }

      filePath = path
      fileName = file.name
      fileSize = file.size
      fileType = file.type
    }

    const docData = {
      company_id: companyId,
      document_type_id: data.document_type_id,
      person_id: data.entity_type === 'person' ? data.entity_id : null,
      vehicle_id: data.entity_type === 'vehicle' ? data.entity_id : null,
      file_path: filePath,
      file_name: fileName,
      file_size: fileSize,
      file_type: fileType,
      issue_date: data.issue_date || null,
      expiry_date: data.expiry_date || null,
      notes: data.notes || null,
    }

    const { data: inserted, error: dbError } = await supabase
      .from('documents')
      .insert(docData)
      .select('id')
      .single()

    if (dbError || !inserted) {
      setError(dbError?.message || 'Failed to save document.')
      setUploading(false)
      return
    }

    // A renewed upload used to insert a second current row. Lists, the
    // compliance score, and reminder emails all ignore is_superseded, but
    // nothing ever set it, so the expired copy stayed active.
    if (filePath) {
      let previous = supabase
        .from('documents')
        .update({ is_superseded: true })
        .eq('company_id', companyId)
        .eq('document_type_id', data.document_type_id)
        .eq('is_superseded', false)
        .neq('id', inserted.id)

      previous = data.entity_type === 'person'
        ? previous.eq('person_id', data.entity_id)
        : previous.eq('vehicle_id', data.entity_id)

      const { error: supersedeError } = await previous
      if (supersedeError) {
        setError(`Saved the new document, but the previous version is still active: ${supersedeError.message}`)
        setUploading(false)
        return
      }
    }

    setUploading(false)

    toast.success('Document uploaded successfully.')
    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

      {/* Entity type & selection */}
      {!preselectedPersonId && !preselectedVehicleId && (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Assign to</Label>
            <Select value={entityType} onValueChange={v => setValue('entity_type', v as 'person' | 'vehicle')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="person">Person</SelectItem>
                <SelectItem value="vehicle">Vehicle</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>{entityType === 'person' ? 'Person' : 'Vehicle'} *</Label>
            <Select onValueChange={(v: string | null) => setValue('entity_id', v ?? '')}>
              <SelectTrigger>
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                {entityType === 'person'
                  ? people.map(p => (
                    <SelectItem key={String(p.id)} value={String(p.id)}>
                      {String(p.first_name)} {String(p.last_name)}
                    </SelectItem>
                  ))
                  : vehicles.map(v => (
                    <SelectItem key={String(v.id)} value={String(v.id)}>
                      {String(v.make)} {String(v.model)}{v.plate ? ` · ${String(v.plate)}` : ''}
                    </SelectItem>
                  ))
                }
              </SelectContent>
            </Select>
            {errors.entity_id && <p className="text-xs text-red-600">{errors.entity_id.message}</p>}
          </div>
        </div>
      )}

      {/* Document type */}
      <div className="space-y-1.5">
        <Label>Document type *</Label>
        <Select onValueChange={(v: string | null) => setValue('document_type_id', v ?? '')}>
          <SelectTrigger>
            <SelectValue placeholder="Select document type..." />
          </SelectTrigger>
          <SelectContent>
              {relevantTypes.map(dt => (
              <SelectItem key={String(dt.id)} value={String(dt.id)}>
                {String(dt.name)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.document_type_id && <p className="text-xs text-red-600">{errors.document_type_id.message}</p>}
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="issue_date">Issue date</Label>
          <Input id="issue_date" type="date" {...register('issue_date')} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="expiry_date">Expiration date</Label>
          <Input id="expiry_date" type="date" {...register('expiry_date')} />
        </div>
      </div>

      {/* File upload */}
      <div className="space-y-1.5">
        <Label>Document file (PDF, JPG, PNG — max 10 MB)</Label>
        {file ? (
          <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <File className="w-5 h-5 text-blue-600" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
              <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
            </div>
            <button type="button" onClick={() => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = '' }}>
              <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
            </button>
          </div>
        ) : (
          <div
            className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center cursor-pointer hover:border-blue-300 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
            <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG, or WebP up to 10MB</p>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.webp"
          onChange={handleFileChange}
          className="hidden"
        />
        {fileError && <p className="text-xs text-red-600">{fileError}</p>}
        <p className="text-xs text-gray-400">You can save a record without a file — useful for marking a document as missing.</p>
      </div>

      {/* Notes */}
      <div className="space-y-1.5">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" {...register('notes')} placeholder="License number, policy number, etc." rows={2} />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" className="bg-blue-700 hover:bg-blue-800" disabled={isSubmitting || uploading}>
          {(isSubmitting || uploading) ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
          {uploading ? 'Uploading...' : 'Save document'}
        </Button>
      </div>
    </form>
  )
}

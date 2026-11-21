'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle2, Loader2, Upload } from 'lucide-react'
import { validateFile } from '@/lib/utils'

interface Props {
  token: string
}

export function PublicDocumentUpload({ token }: Props) {
  const [file, setFile] = useState<File | null>(null)
  const [issueDate, setIssueDate] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [done, setDone] = useState(false)

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)

    if (!file) {
      setError('Choose a file to upload.')
      return
    }
    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      return
    }

    const body = new FormData()
    body.set('file', file)
    if (issueDate) body.set('issue_date', issueDate)
    if (expiryDate) body.set('expiry_date', expiryDate)

    setUploading(true)
    try {
      const res = await fetch(`/api/request/${token}`, { method: 'POST', body })
      const payload = await res.json().catch(() => null) as { error?: string } | null
      if (!res.ok) {
        setError(payload?.error || 'Upload failed. Please try again.')
        return
      }
      setDone(true)
    } catch {
      setError('Upload failed. Check your connection and try again.')
    } finally {
      setUploading(false)
    }
  }

  if (done) {
    return (
      <div className="text-center py-4">
        <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-3" />
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Document received</h2>
        <p className="text-sm text-gray-600">You can close this page. The document is now on file.</p>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

      <div className="space-y-1.5">
        <Label htmlFor="file">Document file *</Label>
        <Input
          id="file"
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp"
          onChange={(event) => {
            setFile(event.target.files?.[0] ?? null)
            setError(null)
          }}
          required
        />
        <p className="text-xs text-gray-400">PDF, JPG, PNG, or WebP. Maximum 10 MB.</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="issue_date">Issue date</Label>
          <Input id="issue_date" type="date" value={issueDate} onChange={(event) => setIssueDate(event.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="expiry_date">Expiration date</Label>
          <Input id="expiry_date" type="date" value={expiryDate} onChange={(event) => setExpiryDate(event.target.value)} />
        </div>
      </div>

      <Button type="submit" className="w-full bg-blue-700 hover:bg-blue-800 gap-2" disabled={uploading}>
        {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
        {uploading ? 'Uploading...' : 'Upload document'}
      </Button>
    </form>
  )
}

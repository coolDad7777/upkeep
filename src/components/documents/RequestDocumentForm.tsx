'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CheckCircle2, Send } from 'lucide-react'
import { toast } from 'sonner'

const schema = z.object({
  person_id: z.string().min(1, 'Select a person'),
  document_type_id: z.string().min(1, 'Select a document type'),
  message: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface Props {
  companyId: string
  documentTypes: Record<string, unknown>[]
  people: Record<string, unknown>[]
  onSuccess: () => void
  onCancel: () => void
}

export function RequestDocumentForm({ companyId, documentTypes, people, onSuccess, onCancel }: Props) {
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)
  const [recipientName, setRecipientName] = useState('')

  const { handleSubmit, setValue, watch, register, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const personId = watch('person_id')

  // Only people with email addresses can receive requests
  const emailablePeople = people.filter(p => p.email)

  async function onSubmit(data: FormData) {
    setError(null)

    const res = await fetch('/api/documents/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        company_id: companyId,
        person_id: data.person_id,
        document_type_id: data.document_type_id,
        message: data.message || null,
      }),
    })

    if (!res.ok) {
      const body = await res.json()
      setError(body.error || 'Failed to send request.')
      return
    }

    const person = people.find(p => p.id === data.person_id)
    setRecipientName(person ? `${person.first_name} ${person.last_name}` : 'recipient')
    setSent(true)
  }

  if (sent) {
    return (
      <div className="text-center py-6">
        <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-3" />
        <h3 className="font-semibold text-gray-900 mb-2">Request sent</h3>
        <p className="text-sm text-gray-600 mb-4">
          We emailed {recipientName} a secure link to upload their document. The link expires in 7 days.
        </p>
        <div className="flex justify-center gap-3">
          <Button variant="outline" onClick={() => { setSent(false); onCancel() }}>Done</Button>
          <Button className="bg-blue-700 hover:bg-blue-800" onClick={() => { setSent(false) }}>Send another</Button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

      {emailablePeople.length === 0 ? (
        <Alert>
          <AlertDescription>
            No people with email addresses found. <a href="/people" className="text-blue-700 hover:underline">Add email addresses</a> to send document requests.
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <div className="space-y-1.5">
            <Label>Request document from *</Label>
            <Select onValueChange={(v: string | null) => setValue('person_id', v ?? '')}>
              <SelectTrigger>
                <SelectValue placeholder="Select person..." />
              </SelectTrigger>
              <SelectContent>
                {emailablePeople.map(p => (
                  <SelectItem key={String(p.id)} value={String(p.id)}>
                    {String(p.first_name)} {String(p.last_name)} ({String(p.email)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.person_id && <p className="text-xs text-red-600">{errors.person_id.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Document type *</Label>
            <Select onValueChange={(v: string | null) => setValue('document_type_id', v ?? '')}>
              <SelectTrigger>
                <SelectValue placeholder="Select document..." />
              </SelectTrigger>
              <SelectContent>
                {documentTypes.filter(dt => (dt.applies_to as string[]).includes('person')).map(dt => (
                  <SelectItem key={String(dt.id)} value={String(dt.id)}>
                    {String(dt.name)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.document_type_id && <p className="text-xs text-red-600">{errors.document_type_id.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="message">Personal message (optional)</Label>
            <Textarea
              id="message"
              {...register('message')}
              placeholder="Hi, please upload your current journeyman license before your start date."
              rows={3}
            />
          </div>

          <p className="text-xs text-gray-400">
            The recipient will receive an email with a secure link. They can upload a document without creating an account. The link expires in 7 days.
          </p>
        </>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" className="bg-blue-700 hover:bg-blue-800 gap-2" disabled={isSubmitting || emailablePeople.length === 0}>
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4" />}
          Send request
        </Button>
      </div>
    </form>
  )
}

'use client'

import { useState } from 'react'
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
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

const schema = z.object({
  type: z.enum(['employee', 'subcontractor', 'vendor']),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  job_title: z.string().optional(),
  company_name: z.string().optional(),
  notes: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface Props {
  companyId: string
  onSuccess: () => void
  onCancel: () => void
}

export function AddPersonForm({ companyId, onSuccess, onCancel }: Props) {
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'employee' }
  })

  const type = watch('type')

  async function onSubmit(data: FormData) {
    setError(null)
    const { error } = await supabase.from('people').insert({
      company_id: companyId,
      ...data,
      email: data.email || null,
      phone: data.phone || null,
      job_title: data.job_title || null,
      company_name: data.company_name || null,
      notes: data.notes || null,
    })

    if (error) {
      setError(error.message)
      return
    }

    toast.success(`${data.first_name} ${data.last_name} added successfully.`)
    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

      <div className="space-y-1.5">
        <Label>Type</Label>
        <Select value={type} onValueChange={v => setValue('type', v as 'employee' | 'subcontractor' | 'vendor')}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="employee">Employee</SelectItem>
            <SelectItem value="subcontractor">Subcontractor</SelectItem>
            <SelectItem value="vendor">Vendor</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="first_name">First name *</Label>
          <Input id="first_name" {...register('first_name')} placeholder="Mike" />
          {errors.first_name && <p className="text-xs text-red-600">{errors.first_name.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="last_name">Last name *</Label>
          <Input id="last_name" {...register('last_name')} placeholder="Johnson" />
          {errors.last_name && <p className="text-xs text-red-600">{errors.last_name.message}</p>}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email">Email address</Label>
        <Input id="email" type="email" {...register('email')} placeholder="mike@example.com" />
        <p className="text-xs text-gray-400">Used for sending document requests and reminders.</p>
        {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" {...register('phone')} placeholder="(555) 123-4567" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="job_title">Job title</Label>
          <Input id="job_title" {...register('job_title')} placeholder="Master Electrician" />
        </div>
      </div>

      {type !== 'employee' && (
        <div className="space-y-1.5">
          <Label htmlFor="company_name">Company name</Label>
          <Input id="company_name" {...register('company_name')} placeholder="ABC Electric LLC" />
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" {...register('notes')} placeholder="Any additional notes..." rows={2} />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" className="bg-blue-700 hover:bg-blue-800" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          Add person
        </Button>
      </div>
    </form>
  )
}

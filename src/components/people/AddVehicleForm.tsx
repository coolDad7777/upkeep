'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

const schema = z.object({
  make: z.string().min(1, 'Make is required'),
  model: z.string().min(1, 'Model is required'),
  year: z.string().optional(),
  vin: z.string().optional(),
  plate: z.string().optional(),
  notes: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface Props {
  companyId: string
  onSuccess: () => void
  onCancel: () => void
}

export function AddVehicleForm({ companyId, onSuccess, onCancel }: Props) {
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    setError(null)
    const { error } = await supabase.from('vehicles').insert({
      company_id: companyId,
      make: data.make,
      model: data.model,
      year: data.year ? parseInt(data.year) : null,
      vin: data.vin || null,
      plate: data.plate || null,
      notes: data.notes || null,
    })

    if (error) {
      setError(error.message)
      return
    }

    toast.success('Vehicle added successfully.')
    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="year">Year</Label>
          <Input id="year" type="number" {...register('year')} placeholder="2022" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="make">Make *</Label>
          <Input id="make" {...register('make')} placeholder="Ford" />
          {errors.make && <p className="text-xs text-red-600">{errors.make.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="model">Model *</Label>
          <Input id="model" {...register('model')} placeholder="F-150" />
          {errors.model && <p className="text-xs text-red-600">{errors.model.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="plate">License plate</Label>
          <Input id="plate" {...register('plate')} placeholder="ABC-1234" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="vin">VIN (optional)</Label>
          <Input id="vin" {...register('vin')} placeholder="1FTFW1ET5..." />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" {...register('notes')} placeholder="Any notes..." rows={2} />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" className="bg-blue-700 hover:bg-blue-800" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          Add vehicle
        </Button>
      </div>
    </form>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Loader2, Save, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  company: Record<string, unknown>
  profile: { full_name: string; email: string }
  role: string
  userId: string
}

const REMINDER_OPTIONS = [
  { days: 60, label: '60 days before' },
  { days: 30, label: '30 days before' },
  { days: 14, label: '14 days before' },
  { days: 7, label: '7 days before' },
  { days: 0, label: 'On the expiration date' },
  { days: -1, label: '1 day after (expired)' },
  { days: -7, label: '7 days after (expired)' },
]

export function SettingsContent({ company, profile, role, userId }: Props) {
  const [fullName, setFullName] = useState(profile.full_name)
  const [companyName, setCompanyName] = useState(company.name as string || '')
  const [profileLoading, setProfileLoading] = useState(false)
  const [companyLoading, setCompanyLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const settings = company.settings as Record<string, unknown>
  const [reminderDays, setReminderDays] = useState<number[]>(
    (settings?.reminder_defaults as number[]) || [60, 30, 14, 7]
  )

  const isOwnerOrAdmin = ['owner', 'admin'].includes(role)

  async function saveProfile() {
    setProfileLoading(true)
    await supabase.from('user_profiles').upsert({ id: userId, full_name: fullName })
    setProfileLoading(false)
    toast.success('Profile saved.')
    router.refresh()
  }

  async function saveCompany() {
    setCompanyLoading(true)
    const { error } = await supabase
      .from('companies')
      .update({
        name: companyName,
        settings: { ...settings, reminder_defaults: reminderDays },
      })
      .eq('id', company.id as string)

    setCompanyLoading(false)
    if (error) toast.error(error.message)
    else {
      toast.success('Company settings saved.')
      router.refresh()
    }
  }

  async function changePassword() {
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setPasswordLoading(true)
    setError(null)

    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setPasswordLoading(false)

    if (error) setError(error.message)
    else {
      toast.success('Password changed successfully.')
      setNewPassword('')
      setConfirmPassword('')
    }
  }

  function toggleReminderDay(day: number) {
    if (reminderDays.includes(day)) {
      setReminderDays(prev => prev.filter(d => d !== day))
    } else {
      setReminderDays(prev => [...prev, day].sort((a, b) => b - a))
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

      {/* Profile settings */}
      <Card>
        <CardHeader>
          <CardTitle>Your profile</CardTitle>
          <CardDescription>Update your name and password.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Email address</Label>
            <Input value={profile.email} disabled className="bg-gray-50" />
            <p className="text-xs text-gray-400">Email cannot be changed here. Contact support if needed.</p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="name">Full name</Label>
            <Input
              id="name"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="Your full name"
            />
          </div>
          <Button onClick={saveProfile} disabled={profileLoading} className="gap-2">
            {profileLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save profile
          </Button>

          <Separator />

          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Change password</h3>
            {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
            <div className="space-y-1.5">
              <Label htmlFor="new-password">New password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirm-password">Confirm new password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
              />
            </div>
            <Button variant="outline" onClick={changePassword} disabled={passwordLoading || !newPassword}>
              {passwordLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Update password
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Company settings */}
      {isOwnerOrAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Company settings</CardTitle>
            <CardDescription>Update your company name and notification preferences.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="company-name">Company name</Label>
              <Input
                id="company-name"
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                placeholder="Your company name"
              />
            </div>

            <div className="space-y-3">
              <div>
                <Label>Email reminder schedule</Label>
                <p className="text-xs text-gray-400 mt-0.5">
                  Send reminder emails before documents expire. Select which intervals to use.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {REMINDER_OPTIONS.map(opt => (
                  <label
                    key={opt.days}
                    className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                      reminderDays.includes(opt.days)
                        ? 'border-blue-500 bg-blue-50 text-blue-900'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={reminderDays.includes(opt.days)}
                      onChange={() => toggleReminderDay(opt.days)}
                    />
                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                      reminderDays.includes(opt.days) ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                    }`}>
                      {reminderDays.includes(opt.days) && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className="text-sm">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <Button onClick={saveCompany} disabled={companyLoading} className="gap-2 bg-blue-700 hover:bg-blue-800">
              {companyLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save company settings
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Danger zone */}
      <Card className="border-red-100">
        <CardHeader>
          <CardTitle className="text-red-700 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Data & Account
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Export your data</p>
              <p className="text-xs text-gray-500">Download all your company data as a CSV.</p>
            </div>
            <a href="/api/reports/export">
              <Button variant="outline" size="sm">Export data</Button>
            </a>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Delete account</p>
              <p className="text-xs text-gray-500">Permanently delete your account and all data.</p>
            </div>
            <a href="mailto:support@crewcompliant.com?subject=Account deletion request">
              <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                Request deletion
              </Button>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

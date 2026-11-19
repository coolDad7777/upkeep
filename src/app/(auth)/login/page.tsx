'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { safeRedirectPath } from '@/lib/public-paths'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2 } from 'lucide-react'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = safeRedirectPath(searchParams.get('redirectTo'))
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [magicLinkSent, setMagicLinkSent] = useState(false)
  const [magicLoading, setMagicLoading] = useState(false)

  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message === 'Invalid login credentials'
        ? 'Incorrect email or password. Please try again.'
        : error.message)
      setLoading(false)
      return
    }

    router.push(redirectTo)
    router.refresh()
  }

  async function handleMagicLink() {
    if (!email) {
      setError('Enter your email address first.')
      return
    }
    setMagicLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/api/auth/callback?redirectTo=${redirectTo}` }
    })

    setMagicLoading(false)
    if (error) {
      setError(error.message)
    } else {
      setMagicLinkSent(true)
    }
  }

  return (
    <Card className="w-full max-w-md shadow-sm">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-2xl">Welcome back</CardTitle>
        <CardDescription>Sign in to your CrewCompliant account</CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        {magicLinkSent ? (
          <div className="text-center py-4">
            <div className="text-4xl mb-3">📬</div>
            <h3 className="font-semibold text-gray-900 mb-2">Check your email</h3>
            <p className="text-gray-600 text-sm">
              We sent a sign-in link to <strong>{email}</strong>. Click it to log in — no password needed.
            </p>
            <Button variant="ghost" className="mt-4" onClick={() => setMagicLinkSent(false)}>
              Use a different email
            </Button>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Label htmlFor="password">Password</Label>
                <Link href="/reset-password" className="text-xs text-blue-700 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
            <Button type="submit" className="w-full bg-blue-700 hover:bg-blue-800" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Sign in
            </Button>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-400">or</span>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleMagicLink}
              disabled={magicLoading}
            >
              {magicLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Send magic link
            </Button>
            <p className="text-center text-sm text-gray-600">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-blue-700 font-medium hover:underline">
                Start free trial
              </Link>
            </p>
          </form>
        )}
      </CardContent>
    </Card>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <Card className="w-full max-w-md shadow-sm">
        <CardContent className="p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
        </CardContent>
      </Card>
    }>
      <LoginForm />
    </Suspense>
  )
}

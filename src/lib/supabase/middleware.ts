import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import {
  decideAccountAccess,
  getAccountBlockReason,
  isListedPlatformAdmin,
  type CompanyAccess,
} from '@/lib/account-access'

function withSessionCookies(source: NextResponse, target: NextResponse) {
  for (const cookie of source.headers.getSetCookie()) {
    target.headers.append('set-cookie', cookie)
  }
  return target
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  const publicPaths = ['/', '/login', '/signup', '/reset-password', '/magic-link', '/pricing', '/about', '/privacy', '/terms', '/api/billing/webhook', '/api/request']
  const isPublic = publicPaths.some(p => pathname === p || pathname.startsWith(p + '/'))

  if (!user && !isPublic) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(url)
  }

  if (user && (pathname === '/login' || pathname === '/signup')) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // Canceled, paused, suspended, and expired-trial companies keep a session,
  // but the app never consulted those fields. Enforce the stop here so pages
  // and API routes share one gate. Billing stays reachable so they can pay.
  if (user && !isPublic && !isListedPlatformAdmin(process.env.ADMIN_EMAILS, user.email)) {
    const { data: membership, error: membershipError } = await supabase
      .from('company_members')
      .select('companies(subscription_status, trial_ends_at, is_suspended)')
      .eq('user_id', user.id)
      .order('joined_at', { ascending: true })
      .limit(1)
      .maybeSingle()

    if (!membershipError) {
      const companyRelation = membership?.companies as CompanyAccess | CompanyAccess[] | null | undefined
      const company = Array.isArray(companyRelation) ? companyRelation[0] : companyRelation
      const decision = decideAccountAccess(pathname, getAccountBlockReason(company))

      if (decision === 'api_denied') {
        return withSessionCookies(
          supabaseResponse,
          NextResponse.json(
            { error: 'This account cannot access the app until billing is updated.' },
            { status: 402 },
          ),
        )
      }

      if (decision === 'redirect_billing') {
        const url = request.nextUrl.clone()
        url.pathname = '/billing'
        url.search = ''
        return withSessionCookies(supabaseResponse, NextResponse.redirect(url))
      }
    }
  }

  return supabaseResponse
}

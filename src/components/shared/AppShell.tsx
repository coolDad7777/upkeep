'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  LayoutDashboard, Users, FileText, Bell, BarChart2,
  Settings, Shield, LogOut, Menu, X, CreditCard,
  HelpCircle, ChevronDown
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { cn, getInitials } from '@/lib/utils'

interface AppShellProps {
  user: { id: string; email: string; full_name?: string; avatar_url?: string }
  company: Record<string, string>
  role: string
  children: React.ReactNode
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'People', href: '/people', icon: Users },
  { name: 'Documents', href: '/documents', icon: FileText },
  { name: 'Reminders', href: '/reminders', icon: Bell },
  { name: 'Reports', href: '/reports', icon: BarChart2 },
  { name: 'Billing', href: '/billing', icon: CreditCard },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function AppShell({ user, company, role, children }: AppShellProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const supabase = createClient()

  const displayName = user.full_name || user.email.split('@')[0]
  const isTrialing = company.subscription_status === 'trialing'
  const trialEndsAt = company.trial_ends_at
    ? new Date(company.trial_ends_at)
    : null
  const daysLeft = trialEndsAt
    ? Math.max(0, Math.ceil((trialEndsAt.getTime() - Date.now()) / 86400000))
    : null

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={cn(
      'flex flex-col h-full',
      mobile ? 'w-full' : 'w-64'
    )}>
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-gray-100">
        <Link href="/dashboard" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
          <div className="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center flex-shrink-0">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <div className="font-bold text-gray-900 text-sm leading-tight truncate">
              {company.name || 'CrewCompliant'}
            </div>
            <div className="text-xs text-gray-500 leading-tight">CrewCompliant</div>
          </div>
        </Link>
      </div>

      {/* Trial banner */}
      {isTrialing && daysLeft !== null && daysLeft <= 14 && (
        <div className="mx-3 mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-xs font-medium text-amber-800">
            {daysLeft === 0 ? 'Trial expired' : `${daysLeft} day${daysLeft === 1 ? '' : 's'} left in trial`}
          </p>
          <Link href="/billing" className="text-xs text-amber-700 font-medium hover:underline">
            Upgrade now →
          </Link>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navigation.map(item => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-gray-100 space-y-1">
        <Link
          href="/help"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
        >
          <HelpCircle className="w-4 h-4" />
          Help Center
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
            <Avatar className="w-6 h-6 flex-shrink-0">
              <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                {getInitials(displayName)}
              </AvatarFallback>
            </Avatar>
            <span className="truncate flex-1 text-left">{displayName}</span>
            <ChevronDown className="w-3 h-3 flex-shrink-0" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel className="font-normal">
              <div className="text-sm font-medium">{displayName}</div>
              <div className="text-xs text-gray-500 truncate">{user.email}</div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => window.location.href = '/settings'}>
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => window.location.href = '/billing'}>
              Billing
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
              <LogOut className="w-4 h-4 mr-2" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col bg-white border-r border-gray-100 flex-shrink-0">
        <Sidebar />
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-xl">
            <Sidebar mobile />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <header className="md:hidden h-14 bg-white border-b border-gray-100 flex items-center px-4 gap-3 flex-shrink-0">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="text-gray-600 hover:text-gray-900"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-700 rounded flex items-center justify-center">
              <Shield className="w-3 h-3 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-sm">{company.name || 'CrewCompliant'}</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

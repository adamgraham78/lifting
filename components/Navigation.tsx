'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, TrendingUp, Settings, Dumbbell } from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'
import { useAuth } from '@/lib/contexts/auth-context'
import { Button } from '@/components/ui/Button'

export function Navigation() {
  const pathname = usePathname()
  const { user } = useAuth()

  // Hide navigation on auth pages
  const isAuthPage = pathname.startsWith('/auth')

  if (isAuthPage || !user) {
    return null
  }

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/dashboard/progression', label: 'Progression', icon: TrendingUp },
    { href: '/settings', label: 'Settings', icon: Settings },
  ]

  return (
    <nav className="border-b border-border bg-card">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <Dumbbell className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold">Lifting</span>
          </Link>

          <div className="flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive =
                pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/dashboard')

              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? 'default' : 'ghost'}
                    size="sm"
                    className="gap-2"
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden md:inline">{item.label}</span>
                  </Button>
                </Link>
              )
            })}

            <div className="ml-2 border-l border-border pl-2">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

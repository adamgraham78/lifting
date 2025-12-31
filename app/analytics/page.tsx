'use client'

import { Card } from '@/components/ui/Card'
import { TrendingUp, BarChart3, Activity } from 'lucide-react'

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-display text-accent mb-2">Analytics</h1>
          <p className="text-foreground-secondary">
            Track your progress and performance
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="text-center py-8">
            <TrendingUp className="w-12 h-12 mx-auto text-accent mb-4" />
            <div className="text-3xl font-display text-foreground mb-2">24</div>
            <p className="text-foreground-secondary">Total Workouts</p>
          </Card>

          <Card className="text-center py-8">
            <BarChart3 className="w-12 h-12 mx-auto text-accent mb-4" />
            <div className="text-3xl font-display text-foreground mb-2">1,284</div>
            <p className="text-foreground-secondary">Total Sets</p>
          </Card>

          <Card className="text-center py-8">
            <Activity className="w-12 h-12 mx-auto text-accent mb-4" />
            <div className="text-3xl font-display text-foreground mb-2">142</div>
            <p className="text-foreground-secondary">Weekly Volume</p>
          </Card>
        </div>

        <Card className="text-center py-12">
          <p className="text-foreground-secondary text-lg">
            Analytics charts coming soon...
          </p>
          <p className="text-foreground-tertiary text-sm mt-2">
            Volume trends, strength progression, and muscle group analysis
          </p>
        </Card>
      </div>
    </div>
  )
}

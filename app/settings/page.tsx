'use client'

import { Card } from '@/components/ui/Card'
import { Settings, Info } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-display text-accent mb-2">SETTINGS</h1>
          <p className="text-foreground-secondary">
            Manage your training preferences
          </p>
        </div>

        {/* Info Card */}
        <Card className="bg-background-tertiary border-accent">
          <div className="flex items-start space-x-3">
            <Info className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-foreground mb-2">Muscle Priorities Moved to Planner</h3>
              <p className="text-sm text-foreground-secondary mb-2">
                Muscle group priorities are now set per mesocycle in the planner. This allows you to have different priorities for different training programs.
              </p>
              <p className="text-sm text-foreground-secondary">
                When creating a new mesocycle template in the planner, you&apos;ll be able to set muscle priorities that will be used for auto-regulation during that specific program.
              </p>
            </div>
          </div>
        </Card>

        {/* Placeholder for future settings */}
        <div className="mt-8">
          <Card>
            <div className="text-center py-12">
              <Settings className="w-12 h-12 text-foreground-tertiary mx-auto mb-4" />
              <h3 className="text-lg font-bold text-foreground mb-2">
                Additional Settings Coming Soon
              </h3>
              <p className="text-sm text-foreground-secondary">
                Future settings like theme preferences, notifications, and more will appear here.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

'use client'

import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Calendar, Play, Plus } from 'lucide-react'

export default function WorkoutPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-display text-accent mb-2">WORKOUT</h1>
          <p className="text-foreground-secondary">
            Log your training sessions
          </p>
        </div>

        <Card className="text-center py-12">
          <Calendar className="w-16 h-16 mx-auto text-foreground-tertiary mb-4" />
          <h2 className="text-2xl font-bold mb-2 text-foreground">No Active Mesocycle</h2>
          <p className="text-foreground-secondary mb-6">
            Start a training program to begin logging workouts
          </p>
          <Button variant="primary" size="lg">
            <Plus className="w-5 h-5 mr-2" />
            Start New Program
          </Button>
        </Card>

        <div className="mt-8">
          <h3 className="text-xl font-bold text-foreground mb-4">Recent Workouts</h3>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <Card key={i} className="opacity-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-foreground">Upper Body - Week 2 Day 1</h4>
                    <p className="text-sm text-foreground-tertiary">Completed 2 days ago</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-accent">18 sets</div>
                    <div className="text-xs text-foreground-tertiary">62 minutes</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

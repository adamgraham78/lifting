'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Calendar, TrendingUp, Dumbbell, Plus, Target } from 'lucide-react'
import Link from 'next/link'

export default function Home() {
  // TODO: Replace with actual data from Supabase
  const [activeMesocycle, setActiveMesocycle] = useState<any>(null)

  return (
    <main className="min-h-screen p-8 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-display text-accent mb-2">
            DASHBOARD
          </h1>
          <p className="text-xl text-foreground-secondary">
            RP-Style Auto-Regulation Training System
          </p>
        </div>

        {/* Active Mesocycle Status */}
        {!activeMesocycle ? (
          <Card className="mb-8 text-center py-12">
            <Target className="w-16 h-16 mx-auto text-foreground-tertiary mb-4" />
            <h2 className="text-2xl font-bold mb-2 text-foreground">No Active Mesocycle</h2>
            <p className="text-foreground-secondary mb-6">
              Start a new training program to begin tracking your progress
            </p>
            <Button variant="primary" size="lg">
              <Plus className="w-5 h-5 mr-2" />
              Start New Mesocycle
            </Button>
          </Card>
        ) : (
          <Card className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-1">
                  Current Program
                </h2>
                <p className="text-accent text-lg font-medium">
                  Week 3 of 6 - Upper/Lower Split
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-display text-accent">12</div>
                <div className="text-sm text-foreground-secondary">Workouts Completed</div>
              </div>
            </div>
            <div className="h-2 bg-background-tertiary rounded-full overflow-hidden">
              <div className="h-full bg-accent" style={{ width: '50%' }} />
            </div>
          </Card>
        )}

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link href="/workout">
            <Card hover className="text-center py-8">
              <Calendar className="w-12 h-12 mx-auto text-accent mb-4" />
              <h3 className="text-xl font-bold mb-2 text-foreground">Today&apos;s Workout</h3>
              <p className="text-foreground-secondary">
                Start your next training session
              </p>
            </Card>
          </Link>

          <Link href="/exercises">
            <Card hover className="text-center py-8">
              <Dumbbell className="w-12 h-12 mx-auto text-accent mb-4" />
              <h3 className="text-xl font-bold mb-2 text-foreground">Exercise Library</h3>
              <p className="text-foreground-secondary">
                Browse and manage exercises
              </p>
            </Card>
          </Link>

          <Link href="/analytics">
            <Card hover className="text-center py-8">
              <TrendingUp className="w-12 h-12 mx-auto text-accent mb-4" />
              <h3 className="text-xl font-bold mb-2 text-foreground">Progress</h3>
              <p className="text-foreground-secondary">
                View your training analytics
              </p>
            </Card>
          </Link>
        </div>

        {/* Training Philosophy */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <h3 className="text-2xl font-bold mb-2 text-accent font-display">TRACK</h3>
            <p className="text-foreground-secondary">
              Log every set, rep, and weight with precision. Build a comprehensive training history.
            </p>
          </Card>
          <Card>
            <h3 className="text-2xl font-bold mb-2 text-accent font-display">REGULATE</h3>
            <p className="text-foreground-secondary">
              Auto-adjust volume based on feedback. Find your optimal training stimulus.
            </p>
          </Card>
          <Card>
            <h3 className="text-2xl font-bold mb-2 text-accent font-display">GROW</h3>
            <p className="text-foreground-secondary">
              Progressive overload with intelligent recovery. Maximize hypertrophy gains.
            </p>
          </Card>
        </div>
      </div>
    </main>
  )
}

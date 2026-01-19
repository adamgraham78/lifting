'use client'

import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Dumbbell } from 'lucide-react'

export default function ExercisesPage() {
  return (
    <div className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-background to-background/80">
      <div className="max-w-4xl mx-auto">
        <Link href="/dashboard">
          <Button variant="secondary" className="mb-4">
            ← Back to Dashboard
          </Button>
        </Link>

        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Exercise Library</h1>
          <p className="text-muted-foreground">Browse and manage exercises</p>
        </div>

        <Card className="p-8">
          <div className="text-center py-12">
            <Dumbbell className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Coming Soon</h2>
            <p className="text-muted-foreground mb-4">
              The exercise library feature is under development.
            </p>
            <p className="text-sm text-muted-foreground">
              For now, exercises are loaded from your training program CSV.
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}

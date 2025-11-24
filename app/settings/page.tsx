'use client'

import { useState, useEffect } from 'react'
import { MuscleGroup, MuscleGroupPriority } from '@/types'
import { getMuscleGroups, updateMuscleGroupPriority } from '@/lib/services/muscle-groups'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Settings, Info } from 'lucide-react'

export default function SettingsPage() {
  const [muscleGroups, setMuscleGroups] = useState<MuscleGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)

  useEffect(() => {
    loadMuscleGroups()
  }, [])

  const loadMuscleGroups = async () => {
    try {
      const data = await getMuscleGroups()
      setMuscleGroups(data)
    } catch (error) {
      console.error('Failed to load muscle groups:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePriorityChange = async (id: string, priority: MuscleGroupPriority) => {
    setSaving(id)
    try {
      await updateMuscleGroupPriority(id, priority)
      setMuscleGroups(groups =>
        groups.map(g => g.id === id ? { ...g, priority } : g)
      )
    } catch (error) {
      console.error('Failed to update priority:', error)
    } finally {
      setSaving(null)
    }
  }

  const groupedMuscles = {
    high: muscleGroups.filter(mg => mg.priority === 'high'),
    medium: muscleGroups.filter(mg => mg.priority === 'medium'),
    low: muscleGroups.filter(mg => mg.priority === 'low'),
  }

  const PriorityButton = ({
    active,
    onClick,
    children
  }: {
    active: boolean
    onClick: () => void
    children: React.ReactNode
  }) => (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
        active
          ? 'bg-accent text-white'
          : 'bg-background-tertiary text-foreground-secondary hover:bg-background hover:text-foreground'
      }`}
    >
      {children}
    </button>
  )

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-display text-accent mb-2">SETTINGS</h1>
          <p className="text-foreground-secondary">
            Manage your training priorities and preferences
          </p>
        </div>

        {/* Muscle Priority Info */}
        <Card className="mb-6 bg-background-tertiary border-accent">
          <div className="flex items-start space-x-3">
            <Info className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-foreground mb-2">How Muscle Priority Affects Auto-Regulation</h3>
              <ul className="space-y-1 text-sm text-foreground-secondary">
                <li><span className="text-accent font-medium">HIGH:</span> Aggressive volume increases when tolerated, adds sets with good pump or easy workload</li>
                <li><span className="text-accent font-medium">MEDIUM:</span> Conservative increases, only adds volume if clearly under-stimulated</li>
                <li><span className="text-accent font-medium">LOW:</span> Maintenance only, never increases volume, only reduces if needed</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Muscle Groups */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-foreground-secondary">Loading settings...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {muscleGroups.map(muscle => (
              <Card key={muscle.id}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-foreground uppercase">
                      {muscle.name}
                    </h3>
                    <p className="text-sm text-foreground-tertiary">
                      Current priority: <span className="text-accent font-medium uppercase">{muscle.priority}</span>
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <PriorityButton
                      active={muscle.priority === 'high'}
                      onClick={() => handlePriorityChange(muscle.id, 'high')}
                    >
                      HIGH
                    </PriorityButton>
                    <PriorityButton
                      active={muscle.priority === 'medium'}
                      onClick={() => handlePriorityChange(muscle.id, 'medium')}
                    >
                      MEDIUM
                    </PriorityButton>
                    <PriorityButton
                      active={muscle.priority === 'low'}
                      onClick={() => handlePriorityChange(muscle.id, 'low')}
                    >
                      LOW
                    </PriorityButton>
                  </div>
                </div>
                {saving === muscle.id && (
                  <p className="text-xs text-accent mt-2">Saving...</p>
                )}
              </Card>
            ))}
          </div>
        )}

        {/* Priority Summary */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          <Card className="text-center">
            <div className="text-3xl font-display text-accent mb-1">
              {groupedMuscles.high.length}
            </div>
            <div className="text-sm text-foreground-secondary uppercase font-medium">
              High Priority
            </div>
          </Card>
          <Card className="text-center">
            <div className="text-3xl font-display text-foreground mb-1">
              {groupedMuscles.medium.length}
            </div>
            <div className="text-sm text-foreground-secondary uppercase font-medium">
              Medium Priority
            </div>
          </Card>
          <Card className="text-center">
            <div className="text-3xl font-display text-foreground-tertiary mb-1">
              {groupedMuscles.low.length}
            </div>
            <div className="text-sm text-foreground-secondary uppercase font-medium">
              Low Priority
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

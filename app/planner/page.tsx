'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Calendar, Dumbbell, ArrowRight, Zap } from 'lucide-react'
import { useRouter } from 'next/navigation'

// Starter templates
const starterTemplates = [
  {
    id: 'ppl',
    name: 'Push/Pull/Legs',
    description: 'Classic 6-day split for maximum volume and frequency',
    daysPerWeek: 6,
    durationWeeks: 6,
    level: 'Intermediate',
    focus: 'Hypertrophy',
  },
  {
    id: 'upper-lower',
    name: 'Upper/Lower Split',
    description: '4-day split balancing upper and lower body training',
    daysPerWeek: 4,
    durationWeeks: 6,
    level: 'Beginner',
    focus: 'Balanced',
  },
  {
    id: 'full-body',
    name: 'Full Body 3-Day',
    description: 'Time-efficient full body workouts for busy schedules',
    daysPerWeek: 3,
    durationWeeks: 6,
    level: 'Beginner',
    focus: 'Strength',
  },
  {
    id: 'big-arms',
    name: 'Big Arms Specialization',
    description: '5-day arm specialization with maintenance for other muscles',
    daysPerWeek: 5,
    durationWeeks: 6,
    level: 'Advanced',
    focus: 'Arms',
    isSpecialization: true,
  },
]

export default function PlannerPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'template' | 'custom'>('template')
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [customConfig, setCustomConfig] = useState({
    name: '',
    daysPerWeek: 4,
    durationWeeks: 6,
  })

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId)
  }

  const handleStartTemplate = () => {
    if (selectedTemplate) {
      // TODO: Create active mesocycle from template
      alert(`Starting ${starterTemplates.find(t => t.id === selectedTemplate)?.name}! (Template builder coming soon)`)
      // router.push('/workout')
    }
  }

  const handleStartCustom = () => {
    if (customConfig.name.trim()) {
      // TODO: Create custom template
      alert(`Creating custom mesocycle: ${customConfig.name}! (Custom builder coming soon)`)
      // router.push('/planner/build')
    }
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-display text-accent mb-2">MESOCYCLE PLANNER</h1>
          <p className="text-foreground-secondary">
            Create a new training program or choose from starter templates
          </p>
        </div>

        {/* Mode Selection */}
        <div className="flex space-x-4 mb-8">
          <Button
            variant={mode === 'template' ? 'primary' : 'secondary'}
            onClick={() => setMode('template')}
            size="lg"
          >
            <Calendar className="w-5 h-5 mr-2" />
            Use Template
          </Button>
          <Button
            variant={mode === 'custom' ? 'primary' : 'secondary'}
            onClick={() => setMode('custom')}
            size="lg"
          >
            <Dumbbell className="w-5 h-5 mr-2" />
            Custom Program
          </Button>
        </div>

        {/* Template Mode */}
        {mode === 'template' && (
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Choose a Starter Template
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {starterTemplates.map(template => (
                <Card
                  key={template.id}
                  hover
                  onClick={() => handleTemplateSelect(template.id)}
                  className={`cursor-pointer transition-all ${
                    selectedTemplate === template.id
                      ? 'ring-2 ring-accent border-accent'
                      : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-foreground mb-1">
                        {template.name}
                        {template.isSpecialization && (
                          <Zap className="inline-block w-5 h-5 ml-2 text-accent" />
                        )}
                      </h3>
                      <p className="text-sm text-foreground-secondary">
                        {template.description}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-foreground-tertiary">
                    <div>
                      <div className="text-xs text-foreground-tertiary mb-1">
                        Days/Week
                      </div>
                      <div className="text-lg font-bold text-accent">
                        {template.daysPerWeek}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-foreground-tertiary mb-1">
                        Duration
                      </div>
                      <div className="text-lg font-bold text-accent">
                        {template.durationWeeks} weeks
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-foreground-tertiary mb-1">
                        Level
                      </div>
                      <div className="text-sm font-medium text-foreground">
                        {template.level}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-foreground-tertiary mb-1">
                        Focus
                      </div>
                      <div className="text-sm font-medium text-foreground">
                        {template.focus}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {selectedTemplate && (
              <div className="flex justify-end">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleStartTemplate}
                >
                  Start This Program
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Custom Mode */}
        {mode === 'custom' && (
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Create Custom Program
            </h2>
            <Card>
              <div className="space-y-6">
                <Input
                  label="Program Name"
                  placeholder="e.g., Summer Cut Program"
                  value={customConfig.name}
                  onChange={(e) =>
                    setCustomConfig({ ...customConfig, name: e.target.value })
                  }
                />

                <Select
                  label="Training Days Per Week"
                  options={[
                    { value: '3', label: '3 Days' },
                    { value: '4', label: '4 Days' },
                    { value: '5', label: '5 Days' },
                    { value: '6', label: '6 Days' },
                  ]}
                  value={customConfig.daysPerWeek.toString()}
                  onChange={(e) =>
                    setCustomConfig({
                      ...customConfig,
                      daysPerWeek: parseInt(e.target.value),
                    })
                  }
                />

                <Select
                  label="Duration (Weeks)"
                  options={[
                    { value: '4', label: '4 Weeks' },
                    { value: '5', label: '5 Weeks' },
                    { value: '6', label: '6 Weeks' },
                    { value: '7', label: '7 Weeks' },
                    { value: '8', label: '8 Weeks' },
                  ]}
                  value={customConfig.durationWeeks.toString()}
                  onChange={(e) =>
                    setCustomConfig({
                      ...customConfig,
                      durationWeeks: parseInt(e.target.value),
                    })
                  }
                />

                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    variant="secondary"
                    onClick={() => router.push('/')}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleStartCustom}
                    disabled={!customConfig.name.trim()}
                  >
                    Continue to Exercise Selection
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

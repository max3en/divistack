import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Target, TrendingUp, Edit2, Check, X } from 'lucide-react'

interface GoalTrackerProps {
  currentMonthlyDividend: number
  currentAnnualDividend: number
}

export function GoalTracker({ currentMonthlyDividend, currentAnnualDividend }: GoalTrackerProps) {
  const [monthlyGoal, setMonthlyGoal] = useState<number>(500)
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState<string>('500')

  useEffect(() => {
    const saved = localStorage.getItem('divistack-monthly-goal')
    if (saved) {
      const goal = Number(saved)
      setMonthlyGoal(goal)
      setEditValue(String(goal))
    }
  }, [])

  const saveGoal = () => {
    const goal = Number(editValue)
    if (goal > 0) {
      setMonthlyGoal(goal)
      localStorage.setItem('divistack-monthly-goal', String(goal))
      setIsEditing(false)
    }
  }

  const cancelEdit = () => {
    setEditValue(String(monthlyGoal))
    setIsEditing(false)
  }

  const progress = monthlyGoal > 0 ? (currentMonthlyDividend / monthlyGoal) * 100 : 0
  const remaining = Math.max(0, monthlyGoal - currentMonthlyDividend)
  const annualGoal = monthlyGoal * 12
  const annualRemaining = Math.max(0, annualGoal - currentAnnualDividend)

  return (
    <Card className="border-primary/20 h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Dividenden-Ziel
          </CardTitle>
          {!isEditing ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
          ) : (
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={saveGoal}
              >
                <Check className="h-4 w-4 text-green-500" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={cancelEdit}
              >
                <X className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6 flex-1 overflow-auto">
        {/* Ziel-Eingabe */}
        {isEditing ? (
          <div className="space-y-2">
            <Label htmlFor="goal">Monatliches Ziel (€)</Label>
            <Input
              id="goal"
              type="number"
              min="1"
              step="50"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') saveGoal()
                if (e.key === 'Escape') cancelEdit()
              }}
              autoFocus
            />
          </div>
        ) : (
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Monatliches Ziel</p>
            <p className="text-3xl font-bold text-primary">{monthlyGoal.toFixed(0)} €</p>
          </div>
        )}

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Fortschritt</span>
            <span className="font-semibold">
              {progress >= 100 ? '🎉 ' : ''}
              {Math.min(100, progress).toFixed(1)}%
            </span>
          </div>
          <div className="h-4 bg-secondary rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                progress >= 100
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                  : 'bg-gradient-to-r from-primary to-blue-500'
              }`}
              style={{ width: `${Math.min(100, progress)}%` }}
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1 p-3 rounded-lg bg-accent/50">
            <p className="text-xs text-muted-foreground">Aktuell/Monat</p>
            <p className="text-lg font-semibold">{currentMonthlyDividend.toFixed(0)} €</p>
          </div>
          <div className="space-y-1 p-3 rounded-lg bg-accent/50">
            <p className="text-xs text-muted-foreground">Noch benötigt</p>
            <p className="text-lg font-semibold text-orange-500">
              {remaining.toFixed(0)} €
            </p>
          </div>
        </div>

        {/* Jährliche Projektion */}
        <div className="pt-4 border-t space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <TrendingUp className="h-4 w-4" />
            <span>Jährliche Projektion</span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Ziel</p>
              <p className="font-semibold">{annualGoal.toFixed(0)} €</p>
            </div>
            <div>
              <p className="text-muted-foreground">Noch benötigt</p>
              <p className="font-semibold text-orange-500">{annualRemaining.toFixed(0)} €</p>
            </div>
          </div>
        </div>

        {/* Motivationstext */}
        {progress >= 100 ? (
          <div className="text-center p-3 bg-green-500/10 rounded-lg border border-green-500/20">
            <p className="text-sm font-medium text-green-600 dark:text-green-400">
              🎉 Glückwunsch! Ziel erreicht!
            </p>
          </div>
        ) : progress >= 75 ? (
          <div className="text-center p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
              💪 Fast geschafft! Nur noch {remaining.toFixed(0)} € bis zum Ziel!
            </p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}

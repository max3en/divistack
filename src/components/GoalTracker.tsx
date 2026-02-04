import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Target, TrendingUp, Edit2, Check, X, Award } from 'lucide-react'
import { GlassCard } from './ui/GlassCard'
import { cn } from '../lib/cn'

interface GoalTrackerProps {
  currentMonthlyDividend: number
  currentAnnualDividend: number
  isCompact?: boolean
}

export function GoalTracker({ currentMonthlyDividend, currentAnnualDividend, isCompact }: GoalTrackerProps) {
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
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/20">
            <Target className="h-4 w-4 text-primary" />
          </div>
          <h3 className="font-bold text-sm md:text-base text-white tracking-tight">Dividenden-Ziel</h3>
        </div>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 rounded-xl text-muted-foreground hover:text-white hover:bg-white/5 transition-all"
          >
            <Edit2 className="h-4 w-4" />
          </button>
        ) : (
          <div className="flex gap-1">
            <button
              onClick={saveGoal}
              className="p-1.5 rounded-lg text-green-400 hover:bg-green-400/10 transition-all"
            >
              <Check className="h-4 w-4" />
            </button>
            <button
              onClick={cancelEdit}
              className="p-1.5 rounded-lg text-red-400 hover:bg-red-400/10 transition-all"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 space-y-6 overflow-auto no-scrollbar">
        {isEditing ? (
          <div className="space-y-3 bg-white/5 p-4 rounded-2xl border border-white/5">
            <Label htmlFor="goal" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Monatliches Ziel (€)</Label>
            <Input
              id="goal"
              type="number"
              min="1"
              step="50"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="bg-black/20 border-white/10 rounded-xl h-11 focus:border-primary/50 text-white font-bold"
              autoFocus
            />
          </div>
        ) : (
          <div className="flex flex-col items-center py-4 bg-primary/5 rounded-[2rem] border border-primary/10 relative overflow-hidden group">
            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.2em] relative z-10">Zielbetrag</p>
            <p className="text-4xl font-black text-white mt-1 relative z-10">{monthlyGoal.toFixed(0)} €</p>
            <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        )}

        <div className="space-y-3">
          <div className="flex justify-between items-end px-1">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Fortschritt</span>
              <span className="text-sm font-bold text-white">{Math.min(100, progress).toFixed(1)}%</span>
            </div>
            {progress >= 100 && (
              <div className="h-8 w-8 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/30 animate-bounce">
                <Award className="h-4 w-4 text-green-400" />
              </div>
            )}
          </div>
          <div className="h-3 bg-white/5 rounded-full overflow-hidden border border-white/5 p-0.5">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-1000",
                progress >= 100
                  ? 'bg-gradient-to-r from-green-500 to-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.5)]'
                  : 'bg-gradient-to-r from-primary to-primary/50 shadow-[0_0_15px_rgba(var(--primary),0.5)]'
              )}
              style={{ width: `${Math.min(100, progress)}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col items-center">
            <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest mb-1">Status Quo</p>
            <p className="text-sm font-bold text-white">{currentMonthlyDividend.toFixed(0)} €</p>
          </div>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col items-center">
            <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest mb-1">Noch offen</p>
            <p className={cn("text-sm font-bold", remaining > 0 ? "text-orange-400" : "text-green-400")}>
              {remaining.toFixed(0)} €
            </p>
          </div>
        </div>

        {progress < 100 && (
          <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-black uppercase tracking-widest">
              <TrendingUp className="h-3 w-3" />
              <span>Jährliche Projektion</span>
            </div>
            <div className="flex justify-between items-center px-1">
              <p className="text-xs text-muted-foreground font-bold">Ziel: <span className="text-white ml-2">{annualGoal.toFixed(0)} €</span></p>
              <p className="text-xs text-muted-foreground font-bold">Rest: <span className="text-orange-400 ml-2">{Math.max(0, annualRemaining).toFixed(0)} €</span></p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

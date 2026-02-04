import { ReactNode, useState, useEffect, useMemo } from 'react'
import { LayoutDashboard, Wallet, Calendar, Settings, Sun, Moon, TrendingUp, Calculator, Check, Euro, Percent, PieChart, RefreshCw, Database, LogOut } from 'lucide-react'
import { cn } from '../lib/cn'
import { Button } from './ui/button'
import { usePortfolio } from '../context/PortfolioContext'
import { formatDistanceToNow } from 'date-fns'
import { de } from 'date-fns/locale'
import { calculateDashboardStats } from '../lib/calculations'
import { getLastSyncTime, syncStockDatabase } from '../lib/stockDataSync'

interface LayoutProps {
  children: ReactNode
  onNavigate: (view: 'dashboard' | 'portfolio' | 'calendar' | 'drip' | 'savingsplan' | 'settings') => void
  currentView: string
  onLogout?: () => void
}

export function Layout({ children, onNavigate, currentView, onLogout }: LayoutProps) {
  const [isDark, setIsDark] = useState(true)
  const { lastSaved, positions, taxConfig } = usePortfolio()
  const [showSaved, setShowSaved] = useState(false)
  const [lastSync, setLastSync] = useState<Date | null>(null)
  const [isSyncing, setIsSyncing] = useState(false)

  const stats = useMemo(() => {
    if (positions.length === 0) {
      return {
        totalGrossAnnual: 0,
        totalNetAnnual: 0,
        totalWithholdingTax: 0,
        totalCapitalGainsTax: 0,
        averageMonthlyNet: 0,
        freeAllowanceRemaining: taxConfig.freeAllowance,
        totalValue: 0,
        averageYield: 0,
      }
    }
    const dashStats = calculateDashboardStats(positions, taxConfig.freeAllowance)
    // Verwende currentPrice wenn verfügbar, sonst purchasePrice als Fallback
    const totalValue = positions.reduce((sum, p) => {
      const price = p.currentPrice ?? p.purchasePrice
      return sum + (p.quantity * price)
    }, 0)
    const averageYield = totalValue > 0 ? (dashStats.totalGrossAnnual / totalValue) * 100 : 0
    return { ...dashStats, totalValue, averageYield }
  }, [positions, taxConfig])

  useEffect(() => {
    // Check saved preference or system preference
    const saved = localStorage.getItem('divistack-theme')
    if (saved) {
      setIsDark(saved === 'dark')
      document.documentElement.classList.toggle('dark', saved === 'dark')
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setIsDark(prefersDark)
      document.documentElement.classList.toggle('dark', prefersDark)
    }
  }, [])

  useEffect(() => {
    if (lastSaved) {
      setShowSaved(true)
      const timer = setTimeout(() => setShowSaved(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [lastSaved])

  useEffect(() => {
    // Lade letzten Sync-Zeitpunkt
    setLastSync(getLastSyncTime())

    // Aktualisiere alle 60 Sekunden
    const interval = setInterval(() => {
      setLastSync(getLastSyncTime())
    }, 60000)

    return () => clearInterval(interval)
  }, [])

  const handleManualSync = async () => {
    setIsSyncing(true)
    try {
      await syncStockDatabase()
      setLastSync(new Date())
    } catch (error) {
      console.error('Manual sync failed:', error)
    } finally {
      setIsSyncing(false)
    }
  }

  const toggleTheme = () => {
    const newIsDark = !isDark
    setIsDark(newIsDark)
    document.documentElement.classList.toggle('dark', newIsDark)
    localStorage.setItem('divistack-theme', newIsDark ? 'dark' : 'light')
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'portfolio', label: 'Portfolio', icon: Wallet },
    { id: 'calendar', label: 'Kalender', icon: Calendar },
    { id: 'drip', label: 'DRIP', icon: TrendingUp },
    { id: 'savingsplan', label: 'Sparplan', icon: Calculator },
    { id: 'settings', label: 'Einstellungen', icon: Settings },
  ] as const

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header with Navigation Tabs */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between py-4 border-b border-border/50">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                DiviStack
              </h1>
              <p className="text-xs text-muted-foreground">Deine Dividenden im Überblick</p>
            </div>
            <div className="flex items-center gap-3">
              {/* Database Sync Status */}
              <div className="flex items-center gap-2 text-xs">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleManualSync}
                  disabled={isSyncing}
                  title="Datenbank synchronisieren"
                  className="h-8 w-8"
                >
                  <Database className={cn("h-4 w-4", isSyncing && "animate-spin")} />
                </Button>
                {lastSync && (
                  <span className="text-muted-foreground hidden sm:inline">
                    Sync: {formatDistanceToNow(lastSync, { addSuffix: true, locale: de })}
                  </span>
                )}
              </div>

              {/* Auto-Save Indicator */}
              {showSaved && (
                <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-500 animate-in fade-in slide-in-from-right-2">
                  <Check className="h-4 w-4" />
                  <span>Gespeichert</span>
                </div>
              )}
              {lastSaved && !showSaved && (
                <div className="text-xs text-muted-foreground hidden sm:inline">
                  {formatDistanceToNow(lastSaved, { addSuffix: true, locale: de })}
                </div>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                title={isDark ? 'Heller Modus' : 'Dunkler Modus'}
              >
                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              {onLogout && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onLogout}
                  title="Abmelden"
                  className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              )}
            </div>
          </div>

          {/* Quick Stats Banner */}
          <div className="py-3 border-b border-border/30 overflow-x-auto">
            <div className="flex items-center justify-between gap-4 min-w-fit">
              <div className="flex items-center gap-3 sm:gap-6 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Euro className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Monatlich</p>
                    <p className="text-sm font-semibold">{(stats.averageMonthlyNet).toFixed(0)} €</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="h-4 w-4 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Jährlich</p>
                    <p className="text-sm font-semibold">{(stats.totalGrossAnnual).toFixed(0)} €</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 hidden sm:flex">
                  <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                    <Percent className="h-4 w-4 text-green-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Ø Rendite</p>
                    <p className="text-sm font-semibold">{stats.averageYield.toFixed(2)}%</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 hidden md:flex">
                  <div className="h-8 w-8 rounded-full bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                    <PieChart className="h-4 w-4 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Positionen</p>
                    <p className="text-sm font-semibold">{positions.length}</p>
                  </div>
                </div>
              </div>
              <div className="text-xs text-muted-foreground whitespace-nowrap hidden lg:block">
                Portfolio-Wert: {stats.totalValue.toFixed(0)} €
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex gap-1 -mb-px">
            {navItems.map(item => {
              const Icon = item.icon
              const isActive = currentView === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={cn(
                    "flex items-center gap-2 px-6 py-3 text-sm font-medium transition-all relative",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
                  )}
                </button>
              )
            })}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-6 flex-1">
        <main>
          {children}
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t bg-card/30 backdrop-blur-sm mt-auto">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between text-xs">
            <p className="text-muted-foreground">
              © 2026 <span className="font-medium text-foreground">Marc Ross</span> - DiviStack v1.0
            </p>
            <div className="flex items-center gap-4 text-muted-foreground">
              <span>{positions.length} Positionen</span>
              <span>•</span>
              <span>Automatisch gespeichert</span>
              <span>•</span>
              {lastSync && (
                <>
                  <span className="text-blue-600 dark:text-blue-400">
                    DB Sync: {formatDistanceToNow(lastSync, { locale: de })}
                  </span>
                  <span>•</span>
                </>
              )}
              <span className="text-primary">{stats.totalNetAnnual.toFixed(0)} € Netto/Jahr</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

import { ReactNode, useState, useEffect, useMemo } from 'react'
import { LayoutDashboard, Wallet, Calendar, Settings, Sun, Moon, TrendingUp, Calculator, Check, Euro, Percent, PieChart, Database, LogOut, Search, Bell, User } from 'lucide-react'
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
    const totalValue = positions.reduce((sum, p) => {
      const price = p.currentPrice ?? p.purchasePrice
      return sum + (p.quantity * price)
    }, 0)
    const averageYield = totalValue > 0 ? (dashStats.totalGrossAnnual / totalValue) * 100 : 0
    return { ...dashStats, totalValue, averageYield }
  }, [positions, taxConfig])

  useEffect(() => {
    const saved = localStorage.getItem('divistack-theme')
    if (saved) {
      setIsDark(saved === 'dark')
      document.documentElement.classList.toggle('dark', saved === 'dark')
    } else {
      setIsDark(true)
      document.documentElement.classList.add('dark')
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
    setLastSync(getLastSyncTime())
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
    <div className="min-h-screen bg-background text-foreground flex overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-20 lg:w-24 bg-card/30 backdrop-blur-3xl border-r border-white/5 py-8 items-center justify-between z-20">
        <div className="flex flex-col items-center gap-12 w-full">
          {/* Logo */}
          <div className="h-10 w-10 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/30 group cursor-pointer">
            <PieChart className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
          </div>

          {/* Nav Items */}
          <nav className="flex flex-col gap-4 w-full items-center">
            {navItems.map(item => {
              const Icon = item.icon
              const isActive = currentView === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={cn(
                    "relative p-3 rounded-2xl transition-all duration-300 group",
                    isActive
                      ? "bg-primary/20 text-primary shadow-[0_0_20px_rgba(var(--primary),0.2)] border border-primary/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  )}
                  title={item.label}
                >
                  <Icon className="h-6 w-6" />
                  {isActive && (
                    <div className="absolute left-[-16px] top-1/2 -translate-y-1/2 w-1.5 h-6 bg-primary rounded-r-full" />
                  )}
                </button>
              )
            })}
          </nav>
        </div>

        <div className="flex flex-col items-center gap-6">
          <button
            onClick={toggleTheme}
            className="p-3 rounded-2xl text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all"
          >
            {isDark ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
          </button>
          {onLogout && (
            <button
              onClick={onLogout}
              className="p-3 rounded-2xl text-red-500/70 hover:text-red-500 hover:bg-red-500/10 transition-all"
            >
              <LogOut className="h-6 w-6" />
            </button>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Mobile Navigation (Bottom) */}
        <nav className="md:hidden fixed bottom-6 left-6 right-6 h-16 bg-card/80 backdrop-blur-xl border border-white/10 rounded-[2rem] flex items-center justify-around px-4 z-50 shadow-2xl">
          {navItems.slice(0, 5).map(item => {
            const Icon = item.icon
            const isActive = currentView === item.id
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={cn(
                  "p-2 rounded-xl transition-all",
                  isActive ? "text-primary scale-110" : "text-muted-foreground"
                )}
              >
                <Icon className="h-6 w-6" />
              </button>
            )
          })}
        </nav>

        {/* Top Bar */}
        <header className="h-20 md:h-24 flex items-center justify-between px-6 md:px-10 z-10 shrink-0">
          <div className="flex flex-col">
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              Hallo, Marc! 👋
            </h1>
            <p className="text-[10px] md:text-xs text-muted-foreground font-medium uppercase tracking-widest flex items-center gap-2">
              DiviStack • {currentView.toUpperCase()} • <span className="text-primary/70">{stats.totalValue.toFixed(0)} € Portfolio</span>
            </p>
          </div>

          <div className="flex items-center gap-2 md:gap-4 flex-1 max-w-md mx-4 md:mx-10 justify-end md:justify-center">
            <div className="relative group flex-1 hidden sm:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Suchen..."
                className="w-full bg-white/5 border border-white/5 rounded-2xl py-2.5 pl-11 pr-4 text-sm focus:outline-none focus:border-primary/30 focus:bg-white/10 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 h-10 w-10 md:h-12 md:w-12"
              onClick={handleManualSync}
            >
              <Database className={cn("h-5 w-5 text-muted-foreground", isSyncing && "animate-spin text-primary")} />
            </Button>
            <div className="h-10 w-10 md:h-12 md:w-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center relative cursor-pointer hover:bg-white/10 transition-colors">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <div className="absolute top-3 right-3 h-2 w-2 bg-primary rounded-full border-2 border-[#08080a]" />
            </div>
            <div className="flex items-center gap-3 bg-white/5 border border-white/5 p-1 rounded-2xl pr-3 hover:bg-white/10 transition-colors cursor-pointer hidden sm:flex">
              <div className="h-8 w-8 md:h-10 md:w-10 rounded-xl bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center text-white font-bold">
                MR
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white leading-none">Marc Ross</span>
                <span className="text-[10px] text-muted-foreground font-medium">Premium</span>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto px-6 md:px-10 pb-24 md:pb-10 no-scrollbar">
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>

        {/* Background Gradients */}
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />
      </div>

      {/* Save Notification */}
      {showSaved && (
        <div className="fixed top-6 right-6 bg-green-500/20 backdrop-blur-xl border border-green-500/30 text-green-400 px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 z-[100] animate-in fade-in slide-in-from-top-4">
          <Check className="h-4 w-4" />
          <span>Erfolgreich gespeichert</span>
        </div>
      )}
    </div>
  )
}

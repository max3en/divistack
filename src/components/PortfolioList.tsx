import { useState, useMemo, useEffect } from 'react'
import { Plus, Pencil, Trash2, Search, Star, LayoutGrid, LayoutList, Undo2, Redo2, RefreshCw, TrendingUp, TrendingDown, Filter, ChevronRight, MoreHorizontal } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { PositionForm } from './PositionForm'
import { usePortfolio } from '../context/PortfolioContext'
import { Position } from '../lib/types'
import { GlassCard } from './ui/GlassCard'
import { cn } from '../lib/cn'

type ViewMode = 'compact' | 'expanded'

export function PortfolioList() {
  const { positions, deletePosition, refreshPrices } = usePortfolio()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingPosition, setEditingPosition] = useState<Position | undefined>()
  const [searchQuery, setSearchQuery] = useState('')
  const [countryFilter, setCountryFilter] = useState<string>('all')
  const [sectorFilter, setSectorFilter] = useState<string>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('expanded')
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  useEffect(() => {
    try {
      const saved = localStorage.getItem('divistack-favorites')
      if (saved) {
        const favArray = JSON.parse(saved)
        setFavorites(new Set(favArray))
      }
    } catch (error) {
      console.warn('Failed to load favorites:', error)
    }
  }, [])

  const handleRefreshPrices = async () => {
    setIsRefreshing(true)
    await refreshPrices()
    setIsRefreshing(false)
  }

  const toggleFavorite = (id: string) => {
    const newFavorites = new Set(favorites)
    if (newFavorites.has(id)) {
      newFavorites.delete(id)
    } else {
      newFavorites.add(id)
    }
    setFavorites(newFavorites)
    localStorage.setItem('divistack-favorites', JSON.stringify([...newFavorites]))
  }

  const handleEdit = (position: Position) => {
    setEditingPosition(position)
    setShowForm(true)
  }

  const handleClose = () => {
    setShowForm(false)
    setEditingPosition(undefined)
  }

  const handleDelete = (id: string) => {
    if (confirm('Position wirklich löschen?')) {
      deletePosition(id)
    }
  }

  const filteredPositions = useMemo(() => {
    let filtered = [...positions]
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.isin.toLowerCase().includes(query) ||
        p.ticker?.toLowerCase().includes(query)
      )
    }
    if (countryFilter !== 'all') filtered = filtered.filter(p => p.country === countryFilter)
    if (sectorFilter !== 'all') filtered = filtered.filter(p => p.sector === sectorFilter)

    filtered.sort((a, b) => {
      const aFav = favorites.has(a.id) ? 1 : 0
      const bFav = favorites.has(b.id) ? 1 : 0
      return bFav - aFav
    })
    return filtered
  }, [positions, searchQuery, countryFilter, sectorFilter, favorites])

  const countries = useMemo(() => ['all', ...Array.from(new Set(positions.map(p => p.country)))], [positions])
  const sectors = useMemo(() => ['all', ...Array.from(new Set(positions.map(p => p.sector)))], [positions])

  const totalValue = positions.reduce((sum, p) => sum + (p.quantity * (p.currentPrice ?? p.purchasePrice)), 0)

  if (showForm) {
    return <PositionForm editingPosition={editingPosition} onClose={handleClose} />
  }

  return (
    <div className="space-y-8 py-8 animate-in fade-in duration-500">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black tracking-tighter text-white italic uppercase">Portfolio</h2>
          <div className="flex items-center gap-2 mt-1">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-80">
              {totalValue.toLocaleString('de-DE', { minimumFractionDigits: 2 })} € • {filteredPositions.length} Assets
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-white/5 border border-white/10 rounded-2xl p-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewMode('expanded')}
              className={cn("h-9 w-10 rounded-xl transition-all", viewMode === 'expanded' ? "bg-primary text-white shadow-lg" : "text-muted-foreground")}
            >
              <LayoutList className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewMode('compact')}
              className={cn("h-9 w-10 rounded-xl transition-all", viewMode === 'compact' ? "bg-primary text-white shadow-lg" : "text-muted-foreground")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefreshPrices}
            disabled={isRefreshing}
            className="h-11 w-11 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 text-white"
          >
            <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
          </Button>
          <Button onClick={() => setShowForm(true)} className="h-11 px-6 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-[10px] shadow-[0_4px_20px_rgba(var(--primary),0.3)] hover:translate-y-[-2px] transition-all">
            <Plus className="h-4 w-4 mr-2" />
            Asset hinzufügen
          </Button>
        </div>
      </div>

      {/* Control Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Name, ISIN oder Ticker suchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-12 pl-12 bg-white/5 border-white/5 rounded-2xl focus:bg-white/10 transition-all text-white font-medium"
          />
        </div>
        <Select value={countryFilter} onValueChange={setCountryFilter}>
          <SelectTrigger className="h-12 bg-white/5 border-white/5 rounded-2xl text-white font-medium">
            <div className="flex items-center gap-2">
              <Filter className="h-3.5 w-3.5 text-muted-foreground" />
              <SelectValue placeholder="Land" />
            </div>
          </SelectTrigger>
          <SelectContent className="bg-[#1a1a1c] border-white/10 text-white rounded-2xl">
            <SelectItem value="all">Alle Länder</SelectItem>
            {countries.filter(c => c !== 'all').map(country => (
              <SelectItem key={country} value={country}>{country}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sectorFilter} onValueChange={setSectorFilter}>
          <SelectTrigger className="h-12 bg-white/5 border-white/5 rounded-2xl text-white font-medium">
            <div className="flex items-center gap-2">
              <Filter className="h-3.5 w-3.5 text-muted-foreground" />
              <SelectValue placeholder="Sektor" />
            </div>
          </SelectTrigger>
          <SelectContent className="bg-[#1a1a1c] border-white/10 text-white rounded-2xl">
            <SelectItem value="all">Alle Sektoren</SelectItem>
            {sectors.filter(s => s !== 'all').map(sector => (
              <SelectItem key={sector} value={sector}>{sector}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Assets Table */}
      <GlassCard className="overflow-hidden border-white/5 rounded-[2rem]">
        {filteredPositions.length === 0 ? (
          <div className="py-24 text-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 mb-4">
              <Search className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">Keine Positionen gefunden</p>
          </div>
        ) : (
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="p-5 font-black text-[10px] uppercase tracking-widest text-muted-foreground">Asset</th>
                  <th className="p-5 font-black text-[10px] uppercase tracking-widest text-muted-foreground hidden md:table-cell">Details</th>
                  <th className="p-5 font-black text-[10px] uppercase tracking-widest text-muted-foreground text-right">Anzahl</th>
                  {viewMode === 'expanded' && <th className="p-5 font-black text-[10px] uppercase tracking-widest text-muted-foreground text-right">Preis</th>}
                  <th className="p-5 font-black text-[10px] uppercase tracking-widest text-muted-foreground text-right">Wert</th>
                  <th className="p-5 font-black text-[10px] uppercase tracking-widest text-muted-foreground text-right">Dividende</th>
                  <th className="p-5 font-black text-[10px] uppercase tracking-widest text-muted-foreground text-right">Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {filteredPositions.map(position => {
                  const currentPrice = position.currentPrice ?? position.purchasePrice
                  const totalPositionValue = position.quantity * currentPrice
                  const dividendInEUR = position.currency === 'EUR' ? position.dividendPerShare : position.dividendPerShare / position.exchangeRate
                  const paymentsPerYear = { monthly: 12, quarterly: 4, 'semi-annual': 2, annual: 1 }[position.paymentInterval]
                  const annualDividend = dividendInEUR * position.quantity * paymentsPerYear
                  const yoc = (annualDividend / (position.quantity * position.purchasePrice)) * 100
                  const isFavorite = favorites.has(position.id)

                  return (
                    <tr key={position.id} className="group border-b border-white/5 hover:bg-white/[0.03] transition-colors">
                      <td className="p-5">
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => toggleFavorite(position.id)}
                            className={cn("transition-all", isFavorite ? "text-yellow-400" : "text-muted-foreground/30 hover:text-white")}
                          >
                            <Star className={cn("h-4 w-4", isFavorite && "fill-yellow-400")} />
                          </button>
                          <div>
                            <p className="font-bold text-white text-sm leading-tight">{position.name}</p>
                            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-1">{position.ticker || 'N/A'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-5 hidden md:table-cell">
                        <div className="flex flex-col">
                          <span className="text-xs text-white/80 font-medium">{position.country}</span>
                          <span className="text-[10px] text-muted-foreground">{position.sector}</span>
                        </div>
                      </td>
                      <td className="p-5 text-right font-bold text-sm text-white">{position.quantity.toLocaleString()}</td>
                      {viewMode === 'expanded' && (
                        <td className="p-5 text-right">
                          <p className="text-sm font-bold text-white">{currentPrice.toFixed(2)} €</p>
                          <div className="flex items-center justify-end gap-1 mt-0.5">
                            {(() => {
                              const change = ((currentPrice - position.purchasePrice) / position.purchasePrice) * 100
                              return (
                                <span className={cn("text-[10px] font-black", change >= 0 ? "text-green-400" : "text-red-400")}>
                                  {change >= 0 ? '+' : ''}{change.toFixed(1)}%
                                </span>
                              )
                            })()}
                          </div>
                        </td>
                      )}
                      <td className="p-5 text-right">
                        <p className="text-sm font-black text-white">{totalPositionValue.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} €</p>
                      </td>
                      <td className="p-5 text-right">
                        <p className="text-sm font-black text-emerald-400">{annualDividend.toFixed(2)} €</p>
                        <p className="text-[10px] text-muted-foreground font-bold">YoC {yoc.toFixed(1)}%</p>
                      </td>
                      <td className="p-5">
                        <div className="flex justify-end gap-1">
                          <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg text-muted-foreground hover:text-white" onClick={() => handleEdit(position)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg text-muted-foreground hover:text-red-400" onClick={() => handleDelete(position.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>
    </div>
  )
}

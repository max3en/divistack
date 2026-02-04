import { useState, useMemo, useEffect } from 'react'
import { Plus, Pencil, Trash2, Search, Star, LayoutGrid, LayoutList, Undo2, Redo2, RefreshCw, TrendingUp, TrendingDown } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardHeader, CardTitle, CardContent } from './ui/card'
import { Input } from './ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { PositionForm } from './PositionForm'
import { usePortfolio } from '../context/PortfolioContext'
import { Position } from '../lib/types'

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
  const [history, setHistory] = useState<Position[][]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  // Load favorites from localStorage on mount
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

  // Undo/Redo functionality
  const saveToHistory = () => {
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push([...positions])
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1)
      // Note: This would need integration with PortfolioContext to restore state
    }
  }

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1)
      // Note: This would need integration with PortfolioContext to restore state
    }
  }

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
    // Save to localStorage
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
      saveToHistory()
      deletePosition(id)
    }
  }

  // Filter and search logic
  const filteredPositions = useMemo(() => {
    let filtered = [...positions]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.isin.toLowerCase().includes(query) ||
        p.ticker?.toLowerCase().includes(query)
      )
    }

    // Country filter
    if (countryFilter !== 'all') {
      filtered = filtered.filter(p => p.country === countryFilter)
    }

    // Sector filter
    if (sectorFilter !== 'all') {
      filtered = filtered.filter(p => p.sector === sectorFilter)
    }

    // Sort favorites first
    filtered.sort((a, b) => {
      const aFav = favorites.has(a.id) ? 1 : 0
      const bFav = favorites.has(b.id) ? 1 : 0
      return bFav - aFav
    })

    return filtered
  }, [positions, searchQuery, countryFilter, sectorFilter, favorites])

  // Get unique countries and sectors
  const countries = useMemo(() => {
    const unique = new Set(positions.map(p => p.country))
    return ['all', ...Array.from(unique)]
  }, [positions])

  const sectors = useMemo(() => {
    const unique = new Set(positions.map(p => p.sector))
    return ['all', ...Array.from(unique)]
  }, [positions])

  // Verwende currentPrice wenn verfügbar, sonst purchasePrice als Fallback
  const totalValue = positions.reduce((sum, p) => {
    const price = p.currentPrice ?? p.purchasePrice
    return sum + (p.quantity * price)
  }, 0)

  if (showForm) {
    return <PositionForm editingPosition={editingPosition} onClose={handleClose} />
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Portfolio</h2>
          <p className="text-sm text-muted-foreground">
            Gesamtwert: {totalValue.toFixed(2)} € • {filteredPositions.length} von {positions.length} Positionen
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            title="Rückgängig"
          >
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            title="Wiederholen"
          >
            <Redo2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setViewMode(viewMode === 'compact' ? 'expanded' : 'compact')}
            title={viewMode === 'compact' ? 'Erweiterte Ansicht' : 'Kompakte Ansicht'}
          >
            {viewMode === 'compact' ? <LayoutList className="h-4 w-4" /> : <LayoutGrid className="h-4 w-4" />}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefreshPrices}
            disabled={isRefreshing}
            title="Kurse aktualisieren"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Position hinzufügen
          </Button>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex gap-2 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Suche nach Name, ISIN oder Ticker..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={countryFilter} onValueChange={setCountryFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Land" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Länder</SelectItem>
            {countries.filter(c => c !== 'all').map(country => (
              <SelectItem key={country} value={country}>{country}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sectorFilter} onValueChange={setSectorFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Sektor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Sektoren</SelectItem>
            {sectors.filter(s => s !== 'all').map(sector => (
              <SelectItem key={sector} value={sector}>{sector}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {positions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Keine Positionen vorhanden. Füge deine erste Aktie oder ETF hinzu.
          </CardContent>
        </Card>
      ) : filteredPositions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Keine Positionen gefunden. Versuche andere Filter.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-muted/50">
                  <tr>
                    {viewMode === 'expanded' && <th className="text-left p-4 font-medium w-12">Fav</th>}
                    <th className="text-left p-4 font-medium">Name</th>
                    {viewMode === 'expanded' && <th className="text-left p-4 font-medium">ISIN</th>}
                    <th className="text-left p-4 font-medium">Land</th>
                    <th className="text-right p-4 font-medium">Anzahl</th>
                    {viewMode === 'expanded' && <th className="text-right p-4 font-medium">Kaufpreis</th>}
                    {viewMode === 'expanded' && <th className="text-right p-4 font-medium">Akt. Kurs</th>}
                    <th className="text-right p-4 font-medium">Gesamtwert</th>
                    <th className="text-right p-4 font-medium">Dividende/Jahr</th>
                    <th className="text-right p-4 font-medium">YoC</th>
                    <th className="text-right p-4 font-medium">Aktionen</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPositions.map(position => {
                    const currentPrice = position.currentPrice ?? position.purchasePrice
                    const totalPositionValue = position.quantity * currentPrice
                    const dividendInEUR = position.currency === 'EUR'
                      ? position.dividendPerShare
                      : position.dividendPerShare / position.exchangeRate

                    const paymentsPerYear = {
                      monthly: 12,
                      quarterly: 4,
                      'semi-annual': 2,
                      annual: 1,
                    }[position.paymentInterval]

                    const annualDividend = dividendInEUR * position.quantity * paymentsPerYear
                    const yoc = (annualDividend / totalPositionValue) * 100

                    const isFavorite = favorites.has(position.id)

                    return (
                      <tr key={position.id} className={`border-b hover:bg-muted/50 ${isFavorite ? 'bg-primary/5' : ''}`}>
                        {viewMode === 'expanded' && (
                          <td className="p-4">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => toggleFavorite(position.id)}
                              className={isFavorite ? 'text-yellow-500' : 'text-muted-foreground'}
                            >
                              <Star className={`h-4 w-4 ${isFavorite ? 'fill-yellow-500' : ''}`} />
                            </Button>
                          </td>
                        )}
                        <td className="p-4">
                          <div className="font-medium">{position.name}</div>
                          {viewMode === 'expanded' && (
                            <div className="text-xs text-muted-foreground">
                              {position.dividendPerShare} {position.currency} × {paymentsPerYear}/Jahr
                            </div>
                          )}
                        </td>
                        {viewMode === 'expanded' && <td className="p-4 text-sm">{position.isin}</td>}
                        <td className="p-4 text-sm">{position.country}</td>
                        <td className="p-4 text-right">{position.quantity}</td>
                        {viewMode === 'expanded' && <td className="p-4 text-right">{position.purchasePrice.toFixed(2)} €</td>}
                        {viewMode === 'expanded' && (
                          <td className="p-4 text-right">
                            {position.currentPrice ? (
                              <div className="flex items-center justify-end gap-1">
                                <span className="font-medium">
                                  {position.currentPrice.toFixed(2)} {position.currency}
                                </span>
                                {(() => {
                                  const priceInEUR = position.currency === 'EUR' ? position.currentPrice : position.currentPrice / position.exchangeRate
                                  const change = ((priceInEUR - position.purchasePrice) / position.purchasePrice) * 100
                                  return change >= 0 ? (
                                    <TrendingUp className="h-3 w-3 text-green-600" />
                                  ) : (
                                    <TrendingDown className="h-3 w-3 text-red-600" />
                                  )
                                })()}
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-xs">-</span>
                            )}
                          </td>
                        )}
                        <td className="p-4 text-right font-medium">
                          {totalPositionValue.toFixed(2)} €
                        </td>
                        <td className="p-4 text-right text-green-600 font-medium">
                          {annualDividend.toFixed(2)} €
                        </td>
                        <td className="p-4 text-right text-blue-600 font-medium">
                          {yoc.toFixed(2)} %
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2 justify-end">
                            {viewMode === 'compact' && (
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => toggleFavorite(position.id)}
                                className={isFavorite ? 'text-yellow-500' : 'text-muted-foreground'}
                              >
                                <Star className={`h-4 w-4 ${isFavorite ? 'fill-yellow-500' : ''}`} />
                              </Button>
                            )}
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleEdit(position)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleDelete(position.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

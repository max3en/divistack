import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select } from './ui/select'
import { Card, CardHeader, CardTitle, CardContent } from './ui/card'
import { Position, Currency, PaymentInterval, Sector, SECTOR_LABELS } from '../lib/types'
import { usePortfolio } from '../context/PortfolioContext'
import { Plus, Trash2, Search } from 'lucide-react'
import { addMonths, addYears, format } from 'date-fns'
import { StockSearch } from './StockSearch'
import type { StockSearchResult } from '../lib/googleSheetsApi'

interface PositionFormProps {
  editingPosition?: Position
  onClose: () => void
}

const COUNTRIES = [
  { code: 'DE', name: 'Deutschland' },
  { code: 'US', name: 'USA' },
  { code: 'CH', name: 'Schweiz' },
  { code: 'GB', name: 'Großbritannien' },
  { code: 'FR', name: 'Frankreich' },
  { code: 'NL', name: 'Niederlande' },
  { code: 'AT', name: 'Österreich' },
  { code: 'IE', name: 'Irland' },
]

export function PositionForm({ editingPosition, onClose }: PositionFormProps) {
  const { addPosition, updatePosition } = usePortfolio()
  const [formData, setFormData] = useState({
    name: '',
    isin: '',
    quantity: '',
    purchasePrice: '',
    currentPrice: '',
    purchaseDate: '',
    country: 'DE',
    sector: 'other' as Sector,
    dividendPerShare: '',
    currency: 'EUR' as Currency,
    exchangeRate: '1',
    paymentInterval: 'quarterly' as PaymentInterval,
  })
  const [paymentDates, setPaymentDates] = useState<string[]>([''])
  const [showStockSearch, setShowStockSearch] = useState(false)

  useEffect(() => {
    if (editingPosition) {
      setFormData({
        name: editingPosition.name,
        isin: editingPosition.isin,
        quantity: String(editingPosition.quantity),
        purchasePrice: String(editingPosition.purchasePrice),
        currentPrice: editingPosition.currentPrice ? String(editingPosition.currentPrice) : '',
        purchaseDate: editingPosition.purchaseDate,
        country: editingPosition.country,
        sector: editingPosition.sector,
        dividendPerShare: String(editingPosition.dividendPerShare),
        currency: editingPosition.currency,
        exchangeRate: String(editingPosition.exchangeRate),
        paymentInterval: editingPosition.paymentInterval,
      })
      setPaymentDates(editingPosition.paymentDates.length > 0 ? editingPosition.paymentDates : [''])
    }
  }, [editingPosition])

  const handleGenerateDates = () => {
    if (!paymentDates[0]) return

    const startDate = new Date(paymentDates[0])
    const generated: string[] = [paymentDates[0]]

    const paymentsPerYear = {
      monthly: 12,
      quarterly: 4,
      'semi-annual': 2,
      annual: 1,
    }[formData.paymentInterval]

    for (let i = 1; i < paymentsPerYear; i++) {
      let nextDate: Date
      switch (formData.paymentInterval) {
        case 'monthly':
          nextDate = addMonths(startDate, i)
          break
        case 'quarterly':
          nextDate = addMonths(startDate, i * 3)
          break
        case 'semi-annual':
          nextDate = addMonths(startDate, i * 6)
          break
        case 'annual':
          nextDate = addYears(startDate, i)
          break
      }
      generated.push(format(nextDate, 'yyyy-MM-dd'))
    }

    setPaymentDates(generated)
  }

  const handleStockSelect = (stock: StockSearchResult) => {
    setFormData({
      ...formData,
      name: stock.name,
      isin: stock.isin,
      country: stock.country,
      currency: stock.currency,
      sector: stock.sector as Sector,
      purchasePrice: stock.currentPrice ? String(stock.currentPrice) : formData.purchasePrice,
      currentPrice: stock.currentPrice ? String(stock.currentPrice) : formData.currentPrice,
      dividendPerShare: stock.dividend ? String(stock.dividend) : formData.dividendPerShare,
    })
    setShowStockSearch(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const validDates = paymentDates.filter(d => d !== '')

    // Validation: Ensure at least one payment date
    if (validDates.length === 0) {
      console.error('[PositionForm] No valid payment dates provided')
      alert('Bitte geben Sie mindestens einen Zahlungstermin an.')
      return
    }

    const position: Omit<Position, 'id'> = {
      name: formData.name,
      isin: formData.isin,
      quantity: Number(formData.quantity),
      purchasePrice: Number(formData.purchasePrice),
      currentPrice: formData.currentPrice ? Number(formData.currentPrice) : undefined,
      purchaseDate: formData.purchaseDate,
      country: formData.country,
      sector: formData.sector,
      dividendPerShare: Number(formData.dividendPerShare),
      currency: formData.currency,
      exchangeRate: Number(formData.exchangeRate),
      paymentInterval: formData.paymentInterval,
      paymentDates: validDates,
    }

    console.log('[PositionForm] Submitting position:', position)

    // Validation: Check for NaN values
    if (isNaN(position.quantity) || position.quantity <= 0) {
      console.error('[PositionForm] Invalid quantity:', formData.quantity)
      alert('Bitte geben Sie eine gültige Anzahl an.')
      return
    }

    if (isNaN(position.purchasePrice) || position.purchasePrice < 0) {
      console.error('[PositionForm] Invalid purchase price:', formData.purchasePrice)
      alert('Bitte geben Sie einen gültigen Kaufpreis an.')
      return
    }

    if (isNaN(position.dividendPerShare) || position.dividendPerShare < 0) {
      console.error('[PositionForm] Invalid dividend:', formData.dividendPerShare)
      alert('Bitte geben Sie eine gültige Dividende an.')
      return
    }

    if (isNaN(position.exchangeRate) || position.exchangeRate <= 0) {
      console.error('[PositionForm] Invalid exchange rate:', formData.exchangeRate)
      alert('Bitte geben Sie einen gültigen Wechselkurs an.')
      return
    }

    if (editingPosition) {
      console.log('[PositionForm] Updating position:', editingPosition.id)
      updatePosition(editingPosition.id, position)
    } else {
      console.log('[PositionForm] Adding new position')
      addPosition(position)
    }

    onClose()
  }

  const showExchangeRate = formData.currency !== 'EUR'

  return (
    <Card>
      <CardHeader>
        <CardTitle>{editingPosition ? 'Position bearbeiten' : 'Neue Position'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Stock Search Button */}
          {!editingPosition && !showStockSearch && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowStockSearch(true)}
              className="w-full"
            >
              <Search className="h-4 w-4 mr-2" />
              Aktie suchen
            </Button>
          )}

          {/* Stock Search Component */}
          {showStockSearch && (
            <StockSearch
              onSelect={handleStockSelect}
              onClose={() => setShowStockSearch(false)}
            />
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                required
                value={formData.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
                placeholder="z.B. Apple Inc."
              />
            </div>

            <div>
              <Label htmlFor="isin">ISIN *</Label>
              <Input
                id="isin"
                required
                value={formData.isin}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, isin: e.target.value })}
                placeholder="z.B. US0378331005"
              />
            </div>

            <div>
              <Label htmlFor="country">Land *</Label>
              <Select
                id="country"
                required
                value={formData.country}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                  const country = e.target.value
                  // Smart currency selection based on country
                  let currency: Currency = 'EUR'
                  let exchangeRate = '1'

                  if (country === 'US') {
                    currency = 'USD'
                    exchangeRate = '0.91' // Default USD/EUR rate
                  } else if (country === 'CH') {
                    currency = 'CHF'
                    exchangeRate = '1.05' // Default CHF/EUR rate
                  } else if (country === 'GB') {
                    currency = 'GBP'
                    exchangeRate = '1.16' // Default GBP/EUR rate
                  }

                  setFormData({
                    ...formData,
                    country,
                    currency,
                    exchangeRate
                  })
                }}
              >
                {COUNTRIES.map(c => (
                  <option key={c.code} value={c.code}>{c.name}</option>
                ))}
              </Select>
            </div>

            <div>
              <Label htmlFor="sector">Sektor *</Label>
              <Select
                id="sector"
                required
                value={formData.sector}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, sector: e.target.value as Sector })}
              >
                {Object.entries(SECTOR_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </Select>
            </div>

            <div>
              <Label htmlFor="quantity">Anzahl *</Label>
              <Input
                id="quantity"
                type="number"
                required
                min="1"
                step="1"
                value={formData.quantity}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, quantity: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="purchasePrice">Kaufpreis (€) *</Label>
              <Input
                id="purchasePrice"
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.purchasePrice}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, purchasePrice: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="currentPrice">Aktueller Kurs (€)</Label>
              <Input
                id="currentPrice"
                type="number"
                min="0"
                step="0.01"
                value={formData.currentPrice}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, currentPrice: e.target.value })}
                placeholder="Optional - sonst Kaufpreis"
              />
            </div>

            <div>
              <Label htmlFor="purchaseDate">Kaufdatum *</Label>
              <Input
                id="purchaseDate"
                type="date"
                required
                value={formData.purchaseDate}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, purchaseDate: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="currency">Währung *</Label>
              <Select
                id="currency"
                required
                value={formData.currency}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                  const currency = e.target.value as Currency
                  setFormData({
                    ...formData,
                    currency,
                    exchangeRate: currency === 'EUR' ? '1' : formData.exchangeRate
                  })
                }}
              >
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
                <option value="CHF">CHF</option>
                <option value="GBP">GBP</option>
              </Select>
            </div>

            {showExchangeRate && (
              <div>
                <Label htmlFor="exchangeRate">Wechselkurs (1 {formData.currency} = ? EUR) *</Label>
                <Input
                  id="exchangeRate"
                  type="number"
                  required
                  min="0.01"
                  step="0.0001"
                  value={formData.exchangeRate}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, exchangeRate: e.target.value })}
                  placeholder="z.B. 0.91"
                />
              </div>
            )}

            <div>
              <Label htmlFor="dividendPerShare">Dividende pro Aktie *</Label>
              <Input
                id="dividendPerShare"
                type="number"
                required
                min="0"
                step="0.0001"
                value={formData.dividendPerShare}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, dividendPerShare: e.target.value })}
                placeholder={`In ${formData.currency}`}
              />
            </div>

            <div>
              <Label htmlFor="paymentInterval">Zahlungsintervall *</Label>
              <Select
                id="paymentInterval"
                required
                value={formData.paymentInterval}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, paymentInterval: e.target.value as PaymentInterval })}
              >
                <option value="monthly">Monatlich</option>
                <option value="quarterly">Quartalsweise</option>
                <option value="semi-annual">Halbjährlich</option>
                <option value="annual">Jährlich</option>
              </Select>
            </div>

            <div className="col-span-2">
              <div className="flex justify-between items-center mb-2">
                <Label>Zahlungstermine *</Label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleGenerateDates}
                  disabled={!paymentDates[0]}
                >
                  Automatisch generieren
                </Button>
              </div>

              {paymentDates.map((date, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <Input
                    type="date"
                    required={index === 0}
                    value={date}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const updated = [...paymentDates]
                      updated[index] = e.target.value
                      setPaymentDates(updated)
                    }}
                  />
                  {index > 0 && (
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => setPaymentDates(paymentDates.filter((_, i) => i !== index))}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}

              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setPaymentDates([...paymentDates, ''])}
                className="w-full mt-2"
              >
                <Plus className="h-4 w-4 mr-2" />
                Weiteren Termin hinzufügen
              </Button>
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Abbrechen
            </Button>
            <Button type="submit">
              {editingPosition ? 'Speichern' : 'Hinzufügen'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

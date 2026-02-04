import { useState, useEffect, useRef } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Card, CardHeader, CardTitle, CardContent } from './ui/card'
import { usePortfolio } from '../context/PortfolioContext'
import { Settings, Download, Upload, Shield, Calculator } from 'lucide-react'
import { TaxOptimizer } from './TaxOptimizer'
import { VorabpauschaleCalculator } from './VorabpauschaleCalculator'
import { ImportCSV } from './ImportCSV'
import { ExportPortfolio } from './ExportPortfolio'
import { ApiKeySettings } from './ApiKeySettings'
import { cn } from '../lib/cn'
import { useToast } from './ui/Toast'

type TaxTab = 'settings' | 'optimizer' | 'vorabpauschale'

export function TaxSettings() {
  const { positions, taxConfig, updateTaxConfig } = usePortfolio()
  const [freeAllowance, setFreeAllowance] = useState(String(taxConfig.freeAllowance))
  const [activeTab, setActiveTab] = useState<TaxTab>('settings')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const toast = useToast()

  useEffect(() => {
    setFreeAllowance(String(taxConfig.freeAllowance))
  }, [taxConfig])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateTaxConfig({
      ...taxConfig,
      freeAllowance: Number(freeAllowance),
    })
    toast.success('Einstellungen gespeichert')
  }

  const handlePreset = (value: number) => {
    setFreeAllowance(String(value))
  }

  const handleExport = () => {
    const data = {
      positions,
      taxConfig,
      exportDate: new Date().toISOString(),
      version: '1.0',
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `divistack-backup-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string)

        if (!data.positions || !data.taxConfig) {
          toast.error('Ungültiges Backup-Format')
          return
        }

        // Import positions
        localStorage.setItem('divistack-positions', JSON.stringify(data.positions))
        localStorage.setItem('divistack-tax-config', JSON.stringify(data.taxConfig))

        toast.success('Backup erfolgreich importiert!')
        setTimeout(() => window.location.reload(), 1500)
      } catch (error) {
        toast.error('Fehler beim Importieren der Datei')
        console.error(error)
      }
    }
    reader.readAsText(file)

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const tabs = [
    { id: 'settings' as const, label: 'Einstellungen', icon: Settings },
    { id: 'optimizer' as const, label: 'FSA-Optimierer', icon: Shield },
    { id: 'vorabpauschale' as const, label: 'Vorabpauschale', icon: Calculator },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Steuer-Tools</h2>
        <p className="text-sm text-muted-foreground">
          Konfiguration, Optimierung und Berechnungen
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b">
        {tabs.map(tab => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all relative',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
              )}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'settings' && (
        <div className="space-y-6">

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Freistellungsauftrag
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="freeAllowance">Freistellungsauftrag (€)</Label>
                  <Input
                    id="freeAllowance"
                    type="number"
                    required
                    min="0"
                    step="1"
                    value={freeAllowance}
                    onChange={e => setFreeAllowance(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Der jährliche Freibetrag für Kapitalerträge in Deutschland
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handlePreset(1000)}
                  >
                    1.000 € (Single)
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handlePreset(2000)}
                  >
                    2.000 € (Verheiratet)
                  </Button>
                </div>

                <Button type="submit">
                  Speichern
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Backup & Wiederherstellung</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-4">
                  Exportiere deine Daten als JSON-Backup oder importiere ein vorhandenes Backup.
                </p>
                <div className="flex gap-2">
                  <Button onClick={handleExport} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Daten exportieren
                  </Button>
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Daten importieren
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                    className="hidden"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <ApiKeySettings />

          <ImportCSV />

          <ExportPortfolio />

          <Card>
            <CardHeader>
              <CardTitle>Steuer-Informationen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Kapitalertragsteuer (Deutschland)</h4>
                <p className="text-sm text-muted-foreground">
                  25% Abgeltungssteuer + 5,5% Solidaritätszuschlag = <strong>26,375%</strong>
                </p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Quellensteuer nach Land</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex justify-between p-2 bg-muted rounded">
                    <span>Deutschland</span>
                    <span className="font-medium">0%</span>
                  </div>
                  <div className="flex justify-between p-2 bg-muted rounded">
                    <span>USA</span>
                    <span className="font-medium">15%</span>
                  </div>
                  <div className="flex justify-between p-2 bg-muted rounded">
                    <span>Schweiz</span>
                    <span className="font-medium">35%</span>
                  </div>
                  <div className="flex justify-between p-2 bg-muted rounded">
                    <span>Großbritannien</span>
                    <span className="font-medium">0%</span>
                  </div>
                  <div className="flex justify-between p-2 bg-muted rounded">
                    <span>Frankreich</span>
                    <span className="font-medium">12%</span>
                  </div>
                  <div className="flex justify-between p-2 bg-muted rounded">
                    <span>Niederlande</span>
                    <span className="font-medium">15%</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Die Quellensteuer wird von ausländischen Staaten einbehalten und ist teilweise auf die deutsche Kapitalertragsteuer anrechenbar.
                </p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Berechnung</h4>
                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Brutto-Dividende wird ermittelt</li>
                  <li>Quellensteuer wird im Ausland einbehalten</li>
                  <li>Freistellungsauftrag wird berücksichtigt</li>
                  <li>Kapitalertragsteuer (26,375%) wird berechnet</li>
                  <li>Quellensteuer wird angerechnet (max. gezahlter Betrag)</li>
                  <li>Netto-Auszahlung erfolgt</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'optimizer' && <TaxOptimizer />}

      {activeTab === 'vorabpauschale' && <VorabpauschaleCalculator />}
    </div>
  )
}

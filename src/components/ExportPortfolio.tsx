import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Download, FileSpreadsheet, FileText } from 'lucide-react'
import { usePortfolio } from '../context/PortfolioContext'
import { calculateDashboardStats } from '../lib/calculations'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export function ExportPortfolio() {
  const { positions, taxConfig } = usePortfolio()
  const stats = calculateDashboardStats(positions, taxConfig.freeAllowance)

  const exportToExcel = () => {
    const data = positions.map(position => {
      const price = position.currentPrice ?? position.purchasePrice
      const totalValue = position.quantity * price
      const annualDividend = position.quantity * position.dividendPerShare * (
        position.paymentInterval === 'monthly' ? 12 :
        position.paymentInterval === 'quarterly' ? 4 :
        position.paymentInterval === 'semi-annual' ? 2 : 1
      )

      return {
        'Name': position.name,
        'ISIN': position.isin,
        'Ticker': position.ticker || '',
        'Anzahl': position.quantity,
        'Kaufpreis': position.purchasePrice.toFixed(2),
        'Aktueller Kurs': price.toFixed(2),
        'Gesamtwert': totalValue.toFixed(2),
        'Dividende/Aktie': position.dividendPerShare.toFixed(4),
        'Jährliche Dividende': annualDividend.toFixed(2),
        'Land': position.country,
        'Währung': position.currency,
        'Sektor': position.sector,
        'Intervall': position.paymentInterval,
      }
    })

    // Füge Zusammenfassung hinzu
    const summary = [
      {},
      { 'Name': 'ZUSAMMENFASSUNG' },
      { 'Name': 'Gesamte Positionen', 'Anzahl': positions.length },
      { 'Name': 'Portfolio-Wert', 'Gesamtwert': positions.reduce((sum, p) => sum + (p.quantity * (p.currentPrice ?? p.purchasePrice)), 0).toFixed(2) },
      { 'Name': 'Brutto-Dividenden/Jahr', 'Jährliche Dividende': stats.totalGrossAnnual.toFixed(2) },
      { 'Name': 'Netto-Dividenden/Jahr', 'Jährliche Dividende': stats.totalNetAnnual.toFixed(2) },
      { 'Name': 'Ø Monatlich (Netto)', 'Jährliche Dividende': stats.averageMonthlyNet.toFixed(2) },
    ]

    const worksheet = XLSX.utils.json_to_sheet([...data, ...summary])
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Portfolio')

    XLSX.writeFile(workbook, `DiviStack-Portfolio-${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  const exportToPDF = () => {
    const doc = new jsPDF()

    // Titel
    doc.setFontSize(18)
    doc.text('DiviStack Portfolio Report', 14, 20)

    doc.setFontSize(11)
    doc.text(`Erstellt am: ${new Date().toLocaleDateString('de-DE')}`, 14, 30)

    // Zusammenfassung
    doc.setFontSize(14)
    doc.text('Zusammenfassung', 14, 45)

    const summaryData = [
      ['Positionen', positions.length.toString()],
      ['Portfolio-Wert', `${positions.reduce((sum, p) => sum + (p.quantity * (p.currentPrice ?? p.purchasePrice)), 0).toFixed(2)} €`],
      ['Brutto-Dividenden/Jahr', `${stats.totalGrossAnnual.toFixed(2)} €`],
      ['Netto-Dividenden/Jahr', `${stats.totalNetAnnual.toFixed(2)} €`],
      ['Ø Monatlich (Netto)', `${stats.averageMonthlyNet.toFixed(2)} €`],
      ['Durchschnittliche Rendite', `${(stats.totalGrossAnnual / positions.reduce((sum, p) => sum + (p.quantity * (p.currentPrice ?? p.purchasePrice)), 0) * 100).toFixed(2)}%`],
    ]

    autoTable(doc, {
      startY: 50,
      head: [['Kennzahl', 'Wert']],
      body: summaryData,
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129] },
    })

    // Positionen-Tabelle
    doc.setFontSize(14)
    doc.text('Positionen', 14, (doc as any).lastAutoTable.finalY + 15)

    const tableData = positions.map(position => {
      const price = position.currentPrice ?? position.purchasePrice
      const totalValue = position.quantity * price
      const annualDividend = position.quantity * position.dividendPerShare * (
        position.paymentInterval === 'monthly' ? 12 :
        position.paymentInterval === 'quarterly' ? 4 :
        position.paymentInterval === 'semi-annual' ? 2 : 1
      )

      return [
        position.name,
        position.isin,
        position.quantity.toString(),
        `${price.toFixed(2)} €`,
        `${totalValue.toFixed(2)} €`,
        `${annualDividend.toFixed(2)} €`,
      ]
    })

    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 20,
      head: [['Name', 'ISIN', 'Anzahl', 'Kurs', 'Wert', 'Div/Jahr']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129] },
      styles: { fontSize: 8 },
    })

    // Fußzeile
    const pageCount = (doc as any).internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.text(
        `Seite ${i} von ${pageCount} | DiviStack v1.0`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      )
    }

    doc.save(`DiviStack-Portfolio-${new Date().toISOString().split('T')[0]}.pdf`)
  }

  if (positions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Portfolio exportieren
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            Keine Positionen zum Exportieren vorhanden
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Portfolio exportieren
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Exportiere dein Portfolio als Excel-Tabelle oder PDF-Report
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Button
            onClick={exportToExcel}
            variant="outline"
            className="w-full"
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Als Excel exportieren
          </Button>

          <Button
            onClick={exportToPDF}
            variant="outline"
            className="w-full"
          >
            <FileText className="h-4 w-4 mr-2" />
            Als PDF exportieren
          </Button>
        </div>

        <div className="text-xs text-muted-foreground p-3 bg-accent rounded-lg">
          <p className="font-medium mb-1">Export enthält:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Alle Positionen mit Details (Name, ISIN, Anzahl, Preise)</li>
            <li>Berechnete Werte (Gesamtwert, Dividenden)</li>
            <li>Portfolio-Zusammenfassung (KPIs, Statistiken)</li>
            <li>Datum des Exports</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

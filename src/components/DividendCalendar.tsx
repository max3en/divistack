import { useMemo, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from './ui/card'
import { Button } from './ui/button'
import { usePortfolio } from '../context/PortfolioContext'
import { calculateDividendPayments } from '../lib/calculations'
import { format, addMonths, addDays, differenceInDays, isAfter, isBefore } from 'date-fns'
import { de } from 'date-fns/locale'
import { Calendar, Clock, TrendingUp } from 'lucide-react'

type TimeFilter = 'all' | '7days' | '30days' | '90days'

export function DividendCalendar() {
  const { positions, taxConfig } = usePortfolio()
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all')

  const upcomingPayments = useMemo(() => {
    const now = new Date()
    let endDate = addMonths(now, 12)

    // Anpassen des Enddatums basierend auf dem Filter
    if (timeFilter === '7days') endDate = addDays(now, 7)
    else if (timeFilter === '30days') endDate = addDays(now, 30)
    else if (timeFilter === '90days') endDate = addDays(now, 90)

    const allPayments = positions.flatMap(position =>
      calculateDividendPayments(position, now, endDate, taxConfig.freeAllowance)
    )

    return allPayments
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .filter(p => isAfter(new Date(p.date), now))
  }, [positions, taxConfig, timeFilter])

  const nextPayment = upcomingPayments.length > 0 ? upcomingPayments[0] : null
  const daysUntilNext = nextPayment ? differenceInDays(new Date(nextPayment.date), new Date()) : null

  const formatEuro = (value: number) => `${value.toFixed(2)} €`

  const getFilterLabel = (filter: TimeFilter) => {
    switch (filter) {
      case '7days': return 'Nächste 7 Tage'
      case '30days': return 'Nächste 30 Tage'
      case '90days': return 'Nächste 90 Tage'
      default: return 'Nächste 12 Monate'
    }
  }

  if (positions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Dividenden-Kalender</CardTitle>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground py-12">
          Keine Positionen vorhanden. Füge Positionen hinzu, um Zahlungstermine zu sehen.
        </CardContent>
      </Card>
    )
  }

  // Gruppiere nach Monat
  const paymentsByMonth = upcomingPayments.reduce((acc, payment) => {
    const monthKey = format(new Date(payment.date), 'yyyy-MM')
    if (!acc[monthKey]) {
      acc[monthKey] = []
    }
    acc[monthKey].push(payment)
    return acc
  }, {} as Record<string, typeof upcomingPayments>)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">Dividenden-Kalender</h2>
          <p className="text-sm text-muted-foreground">
            {getFilterLabel(timeFilter)}
          </p>
        </div>

        {/* Zeitfilter */}
        <div className="flex gap-2">
          <Button
            variant={timeFilter === '7days' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeFilter('7days')}
          >
            7 Tage
          </Button>
          <Button
            variant={timeFilter === '30days' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeFilter('30days')}
          >
            30 Tage
          </Button>
          <Button
            variant={timeFilter === '90days' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeFilter('90days')}
          >
            90 Tage
          </Button>
          <Button
            variant={timeFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeFilter('all')}
          >
            12 Monate
          </Button>
        </div>
      </div>

      {/* Countdown zur nächsten Zahlung */}
      {nextPayment && daysUntilNext !== null && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Nächste Dividende in</p>
                  <p className="text-2xl font-bold text-primary">
                    {daysUntilNext === 0 ? 'Heute' : daysUntilNext === 1 ? '1 Tag' : `${daysUntilNext} Tagen`}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">{nextPayment.positionName}</p>
                <p className="text-xl font-bold">{formatEuro(nextPayment.netAmount)}</p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(nextPayment.date), 'dd. MMMM yyyy', { locale: de })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Zahlungsliste */}
      {Object.keys(paymentsByMonth).length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Keine anstehenden Dividendenzahlungen im gewählten Zeitraum.
          </CardContent>
        </Card>
      ) : (
        Object.entries(paymentsByMonth).map(([monthKey, payments]) => {
          const monthTotal = payments.reduce((sum, p) => sum + p.netAmount, 0)
          const monthGross = payments.reduce((sum, p) => sum + p.grossAmount, 0)
          const monthDate = new Date(monthKey + '-01')

          return (
            <Card key={monthKey}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Calendar className="h-5 w-5" />
                  <span>{format(monthDate, 'MMMM yyyy', { locale: de })}</span>
                  <span className="ml-auto text-lg font-medium text-primary">
                    {formatEuro(monthTotal)} Netto
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {payments.map((payment, idx) => (
                    <div
                      key={`${payment.positionId}-${idx}`}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{payment.positionName}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(payment.date), 'dd.MM.yyyy', { locale: de })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-green-600">
                          {formatEuro(payment.netAmount)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Brutto: {formatEuro(payment.grossAmount)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        })
      )}
    </div>
  )
}

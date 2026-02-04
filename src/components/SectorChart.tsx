import { useMemo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { Position, SECTOR_LABELS } from '../lib/types'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'

interface SectorChartProps {
  positions: Position[]
}

const COLORS = [
  '#10b981', // green
  '#3b82f6', // blue
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#84cc16', // lime
  '#f97316', // orange
  '#6366f1', // indigo
  '#14b8a6', // teal
]

export function SectorChart({ positions }: SectorChartProps) {
  const sectorData = useMemo(() => {
    const sectorValues: Record<string, number> = {}

    positions.forEach(position => {
      const price = position.currentPrice ?? position.purchasePrice
      const value = position.quantity * price

      if (sectorValues[position.sector]) {
        sectorValues[position.sector] += value
      } else {
        sectorValues[position.sector] = value
      }
    })

    return Object.entries(sectorValues)
      .map(([sector, value]) => ({
        name: SECTOR_LABELS[sector as keyof typeof SECTOR_LABELS] || sector,
        value: Math.round(value),
        percentage: 0, // wird später berechnet
      }))
      .sort((a, b) => b.value - a.value)
  }, [positions])

  const total = sectorData.reduce((sum, item) => sum + item.value, 0)
  const dataWithPercentage = sectorData.map(item => ({
    ...item,
    percentage: total > 0 ? (item.value / total) * 100 : 0,
  }))

  if (positions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sektor-Diversifikation</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Keine Positionen vorhanden
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sektor-Diversifikation</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={dataWithPercentage}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ percentage }) => `${percentage.toFixed(1)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {dataWithPercentage.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => `${value.toFixed(0)} €`}
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>

        {/* Tabelle mit Details */}
        <div className="mt-4 space-y-2">
          {dataWithPercentage.map((item, index) => (
            <div
              key={item.name}
              className="flex items-center justify-between text-sm p-2 rounded hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="font-medium">{item.name}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-muted-foreground">{item.percentage.toFixed(1)}%</span>
                <span className="font-semibold">{item.value.toFixed(0)} €</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

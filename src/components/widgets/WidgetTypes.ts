export type WidgetType =
  | 'gross-annual'
  | 'net-annual'
  | 'monthly-average'
  | 'portfolio-value'
  | 'next-payment'
  | 'monthly-chart'
  | 'sector-pie'
  | 'goal-tracker'
  | 'top-5-positions'
  | 'upcoming-payments'
  | 'yield-overview'
  | 'tax-overview'
  | 'dividend-growth'
  | 'positions-count'
  | 'performance-total'
  | 'winners-losers'

export interface WidgetConfig {
  id: string
  type: WidgetType
  x: number
  y: number
  w: number
  h: number
}

export interface WidgetDefinition {
  type: WidgetType
  title: string
  description: string
  icon: string
  defaultSize: { w: number; h: number }
  minSize: { w: number; h: number }
  category: 'kpi' | 'chart' | 'list' | 'tracker'
}

export const AVAILABLE_WIDGETS: WidgetDefinition[] = [
  {
    type: 'gross-annual',
    title: 'Brutto/Jahr',
    description: 'Jährliche Brutto-Dividenden',
    icon: '💰',
    defaultSize: { w: 3, h: 2 },
    minSize: { w: 2, h: 2 },
    category: 'kpi',
  },
  {
    type: 'net-annual',
    title: 'Netto/Jahr',
    description: 'Jährliche Netto-Dividenden nach Steuern',
    icon: '💵',
    defaultSize: { w: 3, h: 2 },
    minSize: { w: 2, h: 2 },
    category: 'kpi',
  },
  {
    type: 'monthly-average',
    title: 'Ø Monatlich',
    description: 'Durchschnittliche monatliche Dividende',
    icon: '📅',
    defaultSize: { w: 3, h: 2 },
    minSize: { w: 2, h: 2 },
    category: 'kpi',
  },
  {
    type: 'portfolio-value',
    title: 'Portfolio-Wert',
    description: 'Gesamtwert aller Positionen',
    icon: '💼',
    defaultSize: { w: 3, h: 2 },
    minSize: { w: 2, h: 2 },
    category: 'kpi',
  },
  {
    type: 'next-payment',
    title: 'Nächste Zahlung',
    description: 'Nächste anstehende Dividendenzahlung',
    icon: '⏰',
    defaultSize: { w: 3, h: 2 },
    minSize: { w: 2, h: 2 },
    category: 'kpi',
  },
  {
    type: 'positions-count',
    title: 'Positionen',
    description: 'Anzahl der Portfolio-Positionen',
    icon: '📊',
    defaultSize: { w: 3, h: 2 },
    minSize: { w: 2, h: 2 },
    category: 'kpi',
  },
  {
    type: 'monthly-chart',
    title: 'Monatliche Dividenden',
    description: 'Bar Chart der Dividenden pro Monat',
    icon: '📈',
    defaultSize: { w: 4, h: 4 },
    minSize: { w: 4, h: 3 },
    category: 'chart',
  },
  {
    type: 'sector-pie',
    title: 'Sektor-Verteilung',
    description: 'Pie Chart der Sektor-Diversifikation',
    icon: '🥧',
    defaultSize: { w: 4, h: 4 },
    minSize: { w: 4, h: 3 },
    category: 'chart',
  },
  {
    type: 'goal-tracker',
    title: 'Dividenden-Ziel',
    description: 'Fortschritt zum monatlichen Dividenden-Ziel',
    icon: '🎯',
    defaultSize: { w: 4, h: 4 },
    minSize: { w: 4, h: 3 },
    category: 'tracker',
  },
  {
    type: 'top-5-positions',
    title: 'Top 5 Positionen',
    description: 'Die wertvollsten Positionen',
    icon: '🏆',
    defaultSize: { w: 4, h: 4 },
    minSize: { w: 3, h: 3 },
    category: 'list',
  },
  {
    type: 'upcoming-payments',
    title: 'Anstehende Zahlungen',
    description: 'Nächste Dividenden-Termine',
    icon: '📆',
    defaultSize: { w: 4, h: 4 },
    minSize: { w: 3, h: 3 },
    category: 'list',
  },
  {
    type: 'yield-overview',
    title: 'Rendite-Übersicht',
    description: 'Durchschnittsrendite und Yield on Cost',
    icon: '📈',
    defaultSize: { w: 4, h: 3 },
    minSize: { w: 3, h: 2 },
    category: 'kpi',
  },
  {
    type: 'tax-overview',
    title: 'Steuer-Übersicht',
    description: 'Quellensteuer und Kapitalertragssteuer',
    icon: '🧾',
    defaultSize: { w: 4, h: 3 },
    minSize: { w: 3, h: 2 },
    category: 'kpi',
  },
  {
    type: 'dividend-growth',
    title: 'Dividenden-Wachstum',
    description: 'Jahresvergleich der Dividenden',
    icon: '📊',
    defaultSize: { w: 4, h: 4 },
    minSize: { w: 4, h: 3 },
    category: 'chart',
  },
  {
    type: 'performance-total',
    title: 'Gesamt-Performance',
    description: 'Portfolio Gewinn/Verlust inkl. Prozente',
    icon: '🚀',
    defaultSize: { w: 3, h: 2 },
    minSize: { w: 2, h: 2 },
    category: 'kpi',
  },
  {
    type: 'winners-losers',
    title: 'Gewinner & Verlierer',
    description: 'Beste und schlechteste Performer',
    icon: '↕️',
    defaultSize: { w: 4, h: 4 },
    minSize: { w: 4, h: 3 },
    category: 'list',
  },
]

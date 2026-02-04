import { useState, useEffect, useRef, ComponentType } from 'react'
import RGL, { Responsive } from 'react-grid-layout'
const WidthProvider = (RGL as any).WidthProvider || (Responsive as any).WidthProvider
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { Settings, Plus, X, GripVertical } from 'lucide-react'
import { WidgetRenderer } from './widgets/WidgetRenderer'
import { WidgetConfig, AVAILABLE_WIDGETS, WidgetDefinition } from './widgets/WidgetTypes'
import { cn } from '../lib/cn'
import { GlassCard } from './ui/GlassCard'

const GridLayout = WidthProvider(Responsive)

// Lokaler LayoutItem-Typ (react-grid-layout @types sind inkompatibel)
interface LayoutItem {
  i: string
  x: number
  y: number
  w: number
  h: number
}

const DEFAULT_WIDGETS: WidgetConfig[] = [
  { id: '1', type: 'performance-total', x: 0, y: 0, w: 3, h: 2 },
  { id: '2', type: 'net-annual', x: 3, y: 0, w: 3, h: 2 },
  { id: '3', type: 'monthly-average', x: 6, y: 0, w: 3, h: 2 },
  { id: '4', type: 'portfolio-value', x: 9, y: 0, w: 3, h: 2 },
  { id: '5', type: 'monthly-chart', x: 0, y: 2, w: 8, h: 4 },
  { id: '6', type: 'sector-pie', x: 8, y: 2, w: 4, h: 4 },
  { id: '7', type: 'winners-losers', x: 0, y: 6, w: 4, h: 4 },
  { id: '8', type: 'top-5-positions', x: 4, y: 6, w: 4, h: 4 },
  { id: '9', type: 'goal-tracker', x: 8, y: 6, w: 4, h: 4 },
]

export function CustomizableDashboard() {
  const [widgets, setWidgets] = useState<WidgetConfig[]>([])
  const [isEditMode, setIsEditMode] = useState(false)
  const [showAddWidget, setShowAddWidget] = useState(false)
  const [containerWidth, setContainerWidth] = useState(1200)
  const [rowHeight, setRowHeight] = useState(65)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const saved = localStorage.getItem('divistack-dashboard-widgets')
    if (saved) {
      try {
        setWidgets(JSON.parse(saved))
      } catch {
        setWidgets(DEFAULT_WIDGETS)
      }
    } else {
      setWidgets(DEFAULT_WIDGETS)
    }
  }, [])

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth)
      }
    }

    updateWidth()
    window.addEventListener('resize', updateWidth)
    return () => window.removeEventListener('resize', updateWidth)
  }, [])

  useEffect(() => {
    const savedHeight = localStorage.getItem('divistack-dashboard-row-height')
    if (savedHeight) {
      setRowHeight(parseInt(savedHeight))
    }
  }, [])

  const saveWidgets = (newWidgets: WidgetConfig[]) => {
    setWidgets(newWidgets)
    localStorage.setItem('divistack-dashboard-widgets', JSON.stringify(newWidgets))
  }

  const updateRowHeight = (height: number) => {
    setRowHeight(height)
    localStorage.setItem('divistack-dashboard-row-height', height.toString())
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleLayoutChange = (currentLayout: any, allLayouts: any) => {
    if (!isEditMode) return

    // Wir speichern nur das primäre (Desktop) Layout, 
    // die anderen werden von RGL generiert wenn nicht vorhanden.
    // Oder wir speichern alle, aber für Einfachheit bleiben wir bei einem.
    const desktopLayout = allLayouts.lg || currentLayout

    const updatedWidgets = widgets.map(widget => {
      const layoutItem = desktopLayout.find((l: LayoutItem) => l.i === widget.id)
      if (layoutItem) {
        return {
          ...widget,
          x: layoutItem.x,
          y: layoutItem.y,
          w: layoutItem.w,
          h: layoutItem.h,
        }
      }
      return widget
    })

    saveWidgets(updatedWidgets)
  }

  const addWidget = (definition: WidgetDefinition) => {
    const newId = `widget-${Date.now()}`

    // Find position for new widget (bottom of grid)
    const maxY = Math.max(...widgets.map(w => w.y + w.h), 0)

    const newWidget: WidgetConfig = {
      id: newId,
      type: definition.type,
      x: 0,
      y: maxY,
      w: definition.defaultSize.w,
      h: definition.defaultSize.h,
    }

    saveWidgets([...widgets, newWidget])
    setShowAddWidget(false)
  }

  const removeWidget = (id: string) => {
    saveWidgets(widgets.filter(w => w.id !== id))
  }

  const resetToDefault = () => {
    if (confirm('Dashboard auf Standard zurücksetzen? Alle Anpassungen gehen verloren.')) {
      saveWidgets(DEFAULT_WIDGETS)
    }
  }

  const layout = widgets.map(w => ({ i: w.id, x: w.x, y: w.y, w: w.w, h: w.h }))

  // Breakpoints und Spalten für Mobile
  const breakpoints = { lg: 1200, md: 996, sm: 768, xs: 480, xss: 0 }
  const cols = { lg: 12, md: 10, sm: 6, xs: 4, xss: 2 }

  // Automatische Höhenanpassung für Mobile
  const effectiveRowHeight = containerWidth < 768 ? Math.max(rowHeight, 80) : rowHeight

  console.log('CustomizableDashboard render:', { widgets, layout, isEditMode })

  return (
    <div className="space-y-4" ref={containerRef}>
      {/* Header Controls */}
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 py-8">
        <div>
          <h2 className="text-3xl font-black tracking-tighter text-white italic uppercase">
            Übersicht
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-80">
              Live-Portfoliodaten • {isEditMode ? 'Bearbeitungsmodus' : 'Analyse'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isEditMode && (
            <>
              <div className="flex items-center gap-4 bg-white/5 border border-white/10 px-6 py-2 rounded-2xl backdrop-blur-md">
                <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Raster</span>
                <input
                  type="range"
                  min="40"
                  max="120"
                  step="5"
                  value={rowHeight}
                  onChange={(e) => updateRowHeight(parseInt(e.target.value))}
                  className="w-24 md:w-32 accent-primary cursor-pointer"
                />
                <span className="text-[10px] font-black text-primary w-6">{rowHeight}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddWidget(!showAddWidget)}
                className="rounded-2xl font-bold border-white/10 bg-white/5 hover:bg-white/10 text-white h-10 px-6"
              >
                <Plus className="h-4 w-4 mr-2" />
                Widget hinzufügen
              </Button>
            </>
          )}
          <Button
            size="sm"
            onClick={() => {
              setIsEditMode(!isEditMode)
              setShowAddWidget(false)
            }}
            className={cn(
              "rounded-2xl px-8 font-black uppercase tracking-widest text-[10px] h-10 transition-all duration-500",
              isEditMode
                ? "bg-primary text-white shadow-[0_0_30px_rgba(var(--primary),0.4)] hover:shadow-[0_0_40px_rgba(var(--primary),0.6)]"
                : "bg-white/5 border border-white/10 text-white hover:bg-white/10"
            )}
          >
            <Settings className={cn("h-4 w-4 mr-2", isEditMode && "animate-spin")} />
            {isEditMode ? 'Speichern' : 'Anpassen'}
          </Button>
        </div>
      </div>

      {/* Add Widget Panel */}
      {showAddWidget && isEditMode && (
        <GlassCard className="p-8 border-primary/20 shadow-[0_0_40px_rgba(var(--primary),0.1)] mb-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-black text-xl tracking-tight uppercase italic">Widget Bibliothek</h3>
            <Button variant="ghost" size="icon" onClick={() => setShowAddWidget(false)} className="rounded-full">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {AVAILABLE_WIDGETS.map(definition => {
              const isAlreadyAdded = widgets.some(w => w.type === definition.type)
              return (
                <button
                  key={definition.type}
                  onClick={() => !isAlreadyAdded && addWidget(definition)}
                  disabled={isAlreadyAdded}
                  className={cn(
                    'relative group p-5 rounded-2xl border-2 transition-all text-left flex flex-col gap-2',
                    isAlreadyAdded
                      ? 'border-muted/30 bg-muted/10 cursor-not-allowed opacity-50'
                      : 'border-white/5 bg-white/5 hover:border-primary/50 hover:bg-primary/5 cursor-pointer hover:translate-y-[-4px] shadow-sm'
                  )}
                >
                  <div className="text-3xl filter grayscale group-hover:grayscale-0 transition-all mb-1">{definition.icon}</div>
                  <p className="font-black text-xs uppercase tracking-wider">{definition.title}</p>
                  <p className="text-[10px] text-muted-foreground font-medium leading-relaxed line-clamp-2">{definition.description}</p>
                  {isAlreadyAdded && (
                    <div className="absolute top-2 right-2 bg-primary/20 text-primary p-0.5 rounded-full">
                      <Plus className="h-3 w-3 rotate-45" />
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </GlassCard>
      )}

      {/* Grid Layout */}
      <div style={{ minHeight: '600px' }}>
        {/* @ts-ignore - @types/react-grid-layout is outdated */}
        <GridLayout
          className="layout"
          layouts={{ lg: layout, md: layout, sm: layout, xs: layout, xss: layout }}
          breakpoints={breakpoints}
          cols={cols}
          rowHeight={effectiveRowHeight}
          width={containerWidth}
          isDraggable={isEditMode}
          isResizable={isEditMode}
          onLayoutChange={handleLayoutChange}
          draggableHandle=".drag-handle"
          margin={[12, 12]}
        >
          {widgets.map(widget => (
            <div key={widget.id} className="relative">
              {/* Edit Mode Overlay */}
              {isEditMode && (
                <div className="absolute top-2 right-2 z-10 flex gap-1">
                  <button
                    className="drag-handle p-1.5 rounded bg-primary/90 hover:bg-primary text-primary-foreground cursor-move"
                    title="Verschieben"
                  >
                    <GripVertical className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => removeWidget(widget.id)}
                    className="p-1.5 rounded bg-red-500/90 hover:bg-red-500 text-white"
                    title="Entfernen"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* Widget Content */}
              <div className={cn(
                'h-full',
                isEditMode && 'pointer-events-none'
              )}>
                {/* <WidgetRenderer type={widget.type} rowHeight={rowHeight} /> */}
                <div className="w-full h-full bg-white/5 border border-white/10 flex items-center justify-center text-xs text-muted-foreground">
                  DEBUG: {widget.type}
                </div>
              </div>
            </div>
          ))}
        </GridLayout>
      </div>

      {widgets.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              Noch keine Widgets auf dem Dashboard.
            </p>
            <Button onClick={() => {
              setIsEditMode(true)
              setShowAddWidget(true)
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Widgets hinzufügen
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

import * as React from "react"
import { cn } from "../../lib/cn"
import { ChevronDown } from "lucide-react"

export interface SelectProps {
  children: React.ReactNode
  value?: string
  onValueChange?: (value: string) => void
}

const SelectContext = React.createContext<{
  value?: string
  onValueChange?: (value: string) => void
}>({})

const Select = ({ children, value, onValueChange }: SelectProps) => {
  return (
    <SelectContext.Provider value={{ value, onValueChange }}>
      <div className="relative w-full">
        {children}
      </div>
    </SelectContext.Provider>
  )
}

const SelectTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      >
        {children}
        <ChevronDown className="h-4 w-4 opacity-50" />
      </button>
    )
  }
)
SelectTrigger.displayName = "SelectTrigger"

const SelectValue = ({ children, placeholder }: { children?: React.ReactNode, placeholder?: string }) => {
  const { value } = React.useContext(SelectContext)
  return <span className="pointer-events-none">{value === 'all' ? placeholder : value || placeholder}</span>
}

const SelectContent = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  const { value, onValueChange } = React.useContext(SelectContext)

  // For simplicity, we'll render a hidden native select that handles the actual logic
  // or just render the children in a way that works.
  // In this simplified version, let's keep it as is but fix the types.
  return (
    <div className={cn("hidden", className)}>
      {children}
    </div>
  )
}

// In our simple app, we actually want the Select to be a functional native select 
// because we don't have a full portal/dropdown implementation.
// Let's refactor to a more "Hybrid" approach that works for the user's code.

const PremiumSelect = ({ children, value, onValueChange, className }: any) => {
  const items: any[] = []
  React.Children.forEach(children, (child) => {
    if (child.type === SelectContent) {
      React.Children.forEach(child.props.children, (item) => {
        if (item.type === SelectItem) {
          items.push({ value: item.props.value, label: item.props.children })
        }
      })
    }
  })

  return (
    <div className="relative group">
      <select
        value={value}
        onChange={(e) => onValueChange?.(e.target.value)}
        className={cn(
          "appearance-none h-12 w-full bg-white/5 border border-white/5 hover:border-white/10 rounded-2xl px-4 py-2 text-white text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all cursor-pointer",
          className
        )}
      >
        {items.map((item) => (
          <option key={item.value} value={item.value} className="bg-[#1a1a1c] text-white">
            {item.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none group-focus-within:text-primary transition-colors" />
    </div>
  )
}

const SelectItem = ({ value, children }: { value: string, children: React.ReactNode }) => null

export { PremiumSelect as Select, SelectTrigger, SelectValue, SelectContent, SelectItem }

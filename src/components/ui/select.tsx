import * as React from "react"
import { cn } from "../../lib/cn"
import { ChevronDown } from "lucide-react"

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  onValueChange?: (value: string) => void
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, onValueChange, onChange, value, ...props }, ref) => {
    // Collect options if they are passed via modern API
    const items: { value: string; label: React.ReactNode }[] = []

    // Help identify children
    React.Children.forEach(children, (child) => {
      if (!child) return

      // Pattern 1: Legacy <option>
      if ((child as any).type === 'option') {
        items.push({ value: (child as any).props.value, label: (child as any).props.children })
      }

      // Pattern 2: Modern SelectContent -> SelectItem
      if ((child as any).type === SelectContent) {
        React.Children.forEach((child as any).props.children, (item) => {
          if (item && (item as any).type === SelectItem) {
            items.push({ value: (item as any).props.value, label: (item as any).props.children })
          }
        })
      }
    })

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      onChange?.(e)
      onValueChange?.(e.target.value)
    }

    // If it's the modern API, we might just have SelectTrigger and SelectContent as siblings
    const isModernAPI = React.Children.toArray(children).some(
      (child: any) => child?.type === SelectTrigger || child?.type === SelectContent
    )

    return (
      <div className={cn("relative group w-full", isModernAPI ? "" : className)}>
        <select
          ref={ref}
          value={value}
          onChange={handleChange}
          className={cn(
            "appearance-none h-12 w-full bg-white/5 border border-white/5 hover:border-white/10 rounded-2xl px-4 py-2 text-white text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all cursor-pointer",
            isModernAPI ? "absolute inset-0 opacity-0 z-10" : ""
          )}
          {...props}
        >
          {items.length > 0 ? (
            items.map((item) => (
              <option key={item.value} value={item.value} className="bg-[#1a1a1c] text-white">
                {typeof item.label === 'string' ? item.label : String(item.value)}
              </option>
            ))
          ) : (
            children
          )}
        </select>

        {!isModernAPI && (
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none group-focus-within:text-primary transition-colors" />
        )}

        {isModernAPI && children}
      </div>
    )
  }
)
Select.displayName = "Select"

const SelectTrigger = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <div className={cn(
    "flex h-12 w-full items-center justify-between rounded-2xl border border-white/5 bg-white/5 px-4 py-2 text-sm text-white group-hover:border-white/10 transition-all",
    className
  )}>
    {children}
    <ChevronDown className="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
  </div>
)

const SelectValue = ({ placeholder }: { placeholder?: string }) => {
  return <span className="text-white font-medium">{placeholder}</span>
}

const SelectContent = ({ children, className }: { children: React.ReactNode; className?: string }) => null
const SelectItem = ({ value, children, className }: { value: string; children: React.ReactNode; className?: string }) => null

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }

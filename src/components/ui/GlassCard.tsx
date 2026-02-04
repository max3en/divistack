import React from 'react'
import { cn } from '../../lib/cn'

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode
    variant?: 'default' | 'purple' | 'green' | 'yellow'
}

export function GlassCard({ children, className, variant = 'default', ...props }: GlassCardProps) {
    return (
        <div
            className={cn(
                "glass-card relative overflow-hidden rounded-[2rem]",
                variant === 'purple' && "bg-gradient-to-br from-primary/20 via-primary/5 to-transparent border-primary/20",
                variant === 'green' && "bg-gradient-to-br from-green-500/10 via-green-500/5 to-transparent border-green-500/10",
                variant === 'yellow' && "bg-gradient-to-br from-yellow-500/10 via-yellow-500/5 to-transparent border-yellow-500/10",
                className
            )}
            {...props}
        >
            {children}
        </div>
    )
}

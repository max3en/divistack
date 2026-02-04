import React from 'react'
import { cn } from '../../lib/cn'

interface GlassCardProps {
    children: React.ReactNode
    className?: string
    gradient?: boolean
}

export function GlassCard({ children, className, gradient = false }: GlassCardProps) {
    return (
        <div className={cn(
            "relative overflow-hidden rounded-2xl border border-white/10 dark:border-white/5",
            "bg-white/40 dark:bg-black/40 backdrop-blur-xl shadow-xl",
            gradient && "before:absolute before:inset-0 before:bg-gradient-to-br before:from-primary/10 before:to-transparent before:pointer-events-none",
            className
        )}>
            {children}
        </div>
    )
}

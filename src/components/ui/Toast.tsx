import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from 'react'
import { cn } from '../../lib/cn'
import { Check, X, AlertTriangle, Info } from 'lucide-react'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
    id: string
    message: string
    type: ToastType
}

interface ToastContextType {
    toast: (message: string, type?: ToastType) => void
    success: (message: string) => void
    error: (message: string) => void
    warning: (message: string) => void
    info: (message: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

const TOAST_DURATION = 4000

const toastConfig: Record<ToastType, { icon: typeof Check; className: string }> = {
    success: {
        icon: Check,
        className: 'bg-green-500/10 border-green-500/50 text-green-600 dark:text-green-400',
    },
    error: {
        icon: X,
        className: 'bg-red-500/10 border-red-500/50 text-red-600 dark:text-red-400',
    },
    warning: {
        icon: AlertTriangle,
        className: 'bg-yellow-500/10 border-yellow-500/50 text-yellow-600 dark:text-yellow-400',
    },
    info: {
        icon: Info,
        className: 'bg-blue-500/10 border-blue-500/50 text-blue-600 dark:text-blue-400',
    },
}

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([])

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
    }, [])

    const addToast = useCallback((message: string, type: ToastType = 'info') => {
        const id = crypto.randomUUID()
        setToasts((prev) => [...prev, { id, message, type }])

        setTimeout(() => {
            removeToast(id)
        }, TOAST_DURATION)
    }, [removeToast])

    const value: ToastContextType = {
        toast: addToast,
        success: (msg) => addToast(msg, 'success'),
        error: (msg) => addToast(msg, 'error'),
        warning: (msg) => addToast(msg, 'warning'),
        info: (msg) => addToast(msg, 'info'),
    }

    return (
        <ToastContext.Provider value={value}>
            {children}

            {/* Toast Container */}
            <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
                {toasts.map((t) => {
                    const config = toastConfig[t.type]
                    const Icon = config.icon

                    return (
                        <div
                            key={t.id}
                            className={cn(
                                'flex items-center gap-3 px-4 py-3 rounded-lg border backdrop-blur-sm shadow-lg',
                                'animate-in slide-in-from-right-full fade-in duration-300',
                                'pointer-events-auto',
                                config.className
                            )}
                        >
                            <Icon className="h-4 w-4 flex-shrink-0" />
                            <p className="text-sm font-medium">{t.message}</p>
                            <button
                                onClick={() => removeToast(t.id)}
                                className="ml-2 opacity-60 hover:opacity-100 transition-opacity"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </div>
                    )
                })}
            </div>
        </ToastContext.Provider>
    )
}

export function useToast(): ToastContextType {
    const context = useContext(ToastContext)
    if (!context) {
        throw new Error('useToast must be used within ToastProvider')
    }
    return context
}

import { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Lock, User, Wallet, PieChart } from 'lucide-react'
import { useToast } from './ui/Toast'
import { GlassCard } from './ui/GlassCard'

interface LoginPageProps {
    onLogin: () => void
}

export function LoginPage({ onLogin }: LoginPageProps) {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const toast = useToast()

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault()
        // Simple auth for demo/personal use
        if ((username === 'max3en' || username === 'Anika') && (password === 'diamond' || password === 'diamond')) {
            localStorage.setItem('divistack-auth', 'true')
            onLogin()
            toast.success(`Willkommen zurück, ${username}!`)
        } else {
            toast.error('Ungültige Anmeldedaten')
        }
    }

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#08080a] relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="w-full max-w-md p-6 relative z-10">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2rem] bg-primary/10 mb-6 border border-primary/20 shadow-[0_0_40px_rgba(var(--primary),0.2)] animate-pulse">
                        <PieChart className="w-10 h-10 text-primary" />
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic">DiviStack</h1>
                    <p className="text-muted-foreground mt-2 font-medium tracking-wide">Dein Portfolio • Dein Erfolg</p>
                </div>

                <GlassCard className="p-8 border-white/5 shadow-2xl">
                    <div className="mb-8">
                        <h2 className="text-xl font-bold text-white tracking-tight">Login</h2>
                        <p className="text-xs text-muted-foreground mt-1 uppercase tracking-widest font-bold opacity-70">Sicherer Zugang</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="username" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80 ml-1">Benutzername</Label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <Input
                                    id="username"
                                    placeholder="Name eingeben"
                                    className="h-12 pl-12 bg-white/5 border-white/5 rounded-2xl focus:border-primary/30 focus:bg-white/10 transition-all text-white"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80 ml-1">Passwort</Label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    className="h-12 pl-12 bg-white/5 border-white/5 rounded-2xl focus:border-primary/30 focus:bg-white/10 transition-all text-white"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <Button type="submit" className="w-full h-12 text-sm font-black uppercase tracking-widest bg-primary text-white rounded-2xl shadow-[0_0_20px_rgba(var(--primary),0.3)] hover:shadow-[0_0_30px_rgba(var(--primary),0.5)] transition-all transform hover:translate-y-[-2px] active:translate-y-[0px]">
                            Anmelden
                        </Button>
                    </form>
                </GlassCard>

                <p className="text-center text-[10px] text-muted-foreground mt-10 uppercase tracking-[0.3em] font-black opacity-40">
                    &copy; 2026 DiviStack • built by Marc Ross
                </p>
            </div>
        </div>
    )
}

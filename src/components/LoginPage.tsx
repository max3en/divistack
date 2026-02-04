import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Lock, User, Wallet } from 'lucide-react'
import { useToast } from './ui/Toast'

interface LoginPageProps {
    onLogin: () => void
}

export function LoginPage({ onLogin }: LoginPageProps) {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const toast = useToast()

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault()
        if (username === 'max3en' && password === 'diamond') {
            localStorage.setItem('divistack-auth', 'true')
            onLogin()
            toast.success('Willkommen zurück, max3en!')
        } else {
            toast.error('Ungültige Anmeldedaten')
        }
    }

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-background relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="w-full max-w-md p-4 relative z-10">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4 border border-primary/20">
                        <Wallet className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">DiviStack</h1>
                    <p className="text-muted-foreground mt-2">Bitte melde dich an, um fortzufahren</p>
                </div>

                <Card className="border-border/50 bg-background/50 backdrop-blur-xl shadow-2xl">
                    <CardHeader>
                        <CardTitle className="text-xl">Login</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="username">Benutzername</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="username"
                                        placeholder="Dein Name"
                                        className="pl-10"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Passwort</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        className="pl-10"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <Button type="submit" className="w-full h-11 text-base font-medium transition-all hover:scale-[1.02] active:scale-[0.98]">
                                Anmelden
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <p className="text-center text-xs text-muted-foreground mt-8">
                    &copy; {new Date().getFullYear()} DiviStack - Premium Dividend Tracking
                </p>
            </div>
        </div>
    )
}

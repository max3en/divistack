import { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Card, CardHeader, CardTitle, CardContent } from './ui/card'
import { Key, ExternalLink } from 'lucide-react'
import { useToast } from './ui/Toast'
import { getFMPApiKey, setFMPApiKey } from '../lib/stockApi'

export function ApiKeySettings() {
    const [apiKey, setApiKey] = useState(getFMPApiKey() || '')
    const toast = useToast()

    const handleSave = () => {
        setFMPApiKey(apiKey)
        toast.success('API-Key gespeichert! Kurse werden beim nächsten Refresh aktualisiert.')
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    Live-Aktienkurse
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                    Für Live-Aktienkurse benötigst du einen kostenlosen API-Key von Financial Modeling Prep.
                </p>
                <div className="space-y-2">
                    <Label htmlFor="apiKey">FMP API-Key</Label>
                    <Input
                        id="apiKey"
                        type="password"
                        placeholder="Dein API-Key..."
                        value={apiKey}
                        onChange={e => setApiKey(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <Button onClick={handleSave}>
                        Speichern
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => window.open('https://site.financialmodelingprep.com/developer/docs', '_blank')}
                    >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Key holen (kostenlos)
                    </Button>
                </div>
                {apiKey && (
                    <p className="text-xs text-green-600 dark:text-green-400">
                        ✓ API-Key konfiguriert - Kurse werden automatisch aktualisiert
                    </p>
                )}
            </CardContent>
        </Card>
    )
}

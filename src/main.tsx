import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import './styles/grid-layout.css'
import { initAutoSync } from './lib/stockDataSync'
import { LOCAL_STOCKS } from './lib/stockDatabase'
import { ToastProvider } from './components/ui/Toast'

// WICHTIG: Clear Cache wenn LOCAL_STOCKS größer als gecachte Anzahl
const cachedStocks = localStorage.getItem('divistack-synced-stocks')
if (cachedStocks) {
  try {
    const parsed = JSON.parse(cachedStocks)
    if (Array.isArray(parsed) && parsed.length < LOCAL_STOCKS.length) {
      console.log('[App] Cache veraltet! LOCAL_STOCKS:', LOCAL_STOCKS.length, 'cached:', parsed.length)
      console.log('[App] Lösche Cache...')
      localStorage.removeItem('divistack-synced-stocks')
      localStorage.removeItem('divistack-last-sync')
    }
  } catch (e) {
    console.error('[App] Fehler beim Cache-Check:', e)
  }
}

// Starte automatische Synchronisation
// initAutoSync()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ToastProvider>
      <App />
    </ToastProvider>
  </StrictMode>,
)

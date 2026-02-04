import { useState, useEffect } from 'react'
// import { Layout } from './components/Layout'
// import { CustomizableDashboard } from './components/CustomizableDashboard'
// import { PortfolioList } from './components/PortfolioList'
// import { DividendCalendar } from './components/DividendCalendar'
// import { TaxSettings } from './components/TaxSettings'
// import { DRIPSimulator } from './components/DRIPSimulator'
// import { SavingsPlanCalculator } from './components/SavingsPlanCalculator'
import { PortfolioProvider } from './context/PortfolioContext'
import { LoginPage } from './components/LoginPage'

type View = 'dashboard' | 'portfolio' | 'calendar' | 'drip' | 'savingsplan' | 'settings'

export function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard')
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false)
  const [isInitializing, setIsInitializing] = useState(true)

  useEffect(() => {
    const auth = localStorage.getItem('divistack-auth')
    if (auth === 'true') {
      setIsLoggedIn(true)
    }
    setIsInitializing(false)
  }, [])

  if (isInitializing) return null

  if (!isLoggedIn) {
    return <LoginPage onLogin={() => setIsLoggedIn(true)} />
  }

  const handleLogout = () => {
    localStorage.removeItem('divistack-auth')
    setIsLoggedIn(false)
  }

  return (
    <PortfolioProvider>
      {/* <Layout
        currentView={currentView}
        onNavigate={setCurrentView}
        onLogout={handleLogout}
      >
        {currentView === 'dashboard' && <CustomizableDashboard />}
        {currentView === 'portfolio' && <PortfolioList />}
        {currentView === 'calendar' && <DividendCalendar />}
        {currentView === 'drip' && <DRIPSimulator />}
        {currentView === 'savingsplan' && <SavingsPlanCalculator />}
        {currentView === 'settings' && <TaxSettings />}
      </Layout> */}
      <div className="flex items-center justify-center h-screen w-full bg-[#08080a] text-white">
        <h1>App Loaded - PortfolioProvider Active</h1>
      </div>
    </PortfolioProvider>
  )
}

import { useEffect } from 'preact/hooks'
import { SystemBars, SystemBarsStyle } from '@capacitor/core'
import { pathSignal } from './router.tsx'
import { BottomNav } from './components/BottomNav.tsx'
import { ToastStack } from './components/ui.tsx'
import { HomeScreen } from './screens/HomeScreen.tsx'
import { MarketScreen } from './screens/MarketScreen.tsx'
import { PortfolioScreen } from './screens/PortfolioScreen.tsx'
import { JourneyScreen } from './screens/JourneyScreen.tsx'
import { FundScreen } from './screens/FundScreen.tsx'
import { PartnerScreen } from './screens/PartnerScreen.tsx'
import { CommunityScreen } from './screens/CommunityScreen.tsx'
import { WelcomeScreen } from './features/session/WelcomeScreen.tsx'
import { isAuthenticated } from './features/session/session-state.ts'
import { StockSheet } from './features/market/components/StockSheet.tsx'
import { OrderTicket } from './features/trade/OrderTicket.tsx'
import { ContractNote } from './features/trade/ContractNote.tsx'
import { ExplainerSheet } from './features/learn/Explainer.tsx'
import { useScrollHeader } from './hooks/useScrollHeader.ts'
import { isBottomNavHidden } from './state.ts'

const SCREENS: Record<string, () => preact.JSX.Element> = {
  '/': HomeScreen,
  '/market': MarketScreen,
  '/portfolio': PortfolioScreen,
  '/journey': JourneyScreen,
  '/fund': FundScreen,
  '/partner': PartnerScreen,
  '/community': CommunityScreen,
}

/** Screens with a dark hero at the very top (safe-area strip matches it). */
const DARK_TOP = ['/', '/portfolio', '/fund', '/partner']

const setStatusBar = () => {
  try {
    SystemBars.setStyle({ style: SystemBarsStyle.Dark })
  } catch {
    // Outside the native Capacitor shell.
  }
}

const CurrentScreen = () => {
  const Screen = SCREENS[pathSignal.value || '/'] ?? HomeScreen
  return <Screen />
}

const AppShell = () => {
  const currentPath = pathSignal.value || '/'
  useScrollHeader({ currentPath })
  return (
    <>
      <header
        id='safe-area-header'
        class={`fixed top-0 inset-x-0 h-[env(safe-area-inset-top,0px)] z-40 pointer-events-none ${
          DARK_TOP.includes(currentPath) ? 'bg-[#121212]' : 'bg-base-200'
        }`}
      />
      <main
        id='main-viewport'
        class='flex-1 min-h-0 relative overflow-y-auto overflow-x-hidden flex flex-col pb-28'
      >
        <div class='w-full max-w-[520px] mx-auto flex-1 flex flex-col'>
          <CurrentScreen />
        </div>
      </main>
      <BottomNav
        activeTab={currentPath}
        hidden={isBottomNavHidden.value || currentPath === '/partner'}
      />
      <StockSheet />
      <OrderTicket />
      <ContractNote />
      <ExplainerSheet />
    </>
  )
}

export const App = () => {
  useEffect(setStatusBar, [])
  return (
    <div class='h-full w-full flex flex-col bg-base-200 text-base-content overflow-hidden relative'>
      {isAuthenticated.value ? <AppShell /> : <WelcomeScreen />}
      <ToastStack />
    </div>
  )
}

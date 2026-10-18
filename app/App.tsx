import { navigateUrl, pathSignal } from './router.tsx'
import { BottomNav } from './components/BottomNav.tsx'
import { SideNav } from './components/SideNav.tsx'
import { LandingScreen } from './screens/LandingScreen.tsx'
import { shouldShowLanding } from './features/landing/landing-state.ts'
import { HomeScreen } from './screens/HomeScreen.tsx'
import { MarketScreen } from './screens/MarketScreen.tsx'
import { SocialScreen } from './screens/SocialScreen.tsx'
import { ComposeScreen } from './screens/ComposeScreen.tsx'
import { PortfolioScreen } from './screens/PortfolioScreen.tsx'
import { RegisterScreen } from './screens/RegisterScreen.tsx'
import { JourneyScreen } from './screens/JourneyScreen.tsx'
import { FundScreen } from './screens/FundScreen.tsx'
import { PartnerScreen } from './screens/PartnerScreen.tsx'
import { WelcomeScreen } from './features/session/WelcomeScreen.tsx'
import { isAuthenticated } from './features/session/session-state.ts'
import { ToastStack } from './components/ui.tsx'
import { TekkiSheet } from './features/tekki/components/TekkiSheet.tsx'
import { ExplainerSheet } from './features/learn/Explainer.tsx'
import { AskTekkiButton } from './features/tekki/components/TekkiEntryPoints.tsx'
import { useScrollHeader } from './hooks/useScrollHeader.ts'
import { isBottomNavHidden } from './state.ts'

export const App = () => {
  const currentPath = pathSignal.value || '/'
  const isHome = currentPath === '/' || currentPath === '/home'
  const isDarkTop =
    isHome ||
    currentPath === '/portfolio' ||
    currentPath === '/fund' ||
    currentPath === '/partner' ||
    currentPath === '/register' ||
    currentPath === '/login' ||
    currentPath === '/welcome'
  const isAuthFlow = currentPath === '/register' ||
    currentPath === '/login' ||
    currentPath === '/welcome'

  // Coordinate safe area scroll pinning with GSAP ScrollTrigger
  useScrollHeader({ currentPath })

  // Story landing for web visitors (document scroll, no app chrome)
  if (shouldShowLanding(currentPath, isAuthenticated.value)) {
    return (
      <div class='w-full bg-base-200 text-base-content relative font-sans'>
        <LandingScreen />
        <ToastStack />
      </div>
    )
  }

  // If unauthenticated and not on the dedicated register route, show the welcome onboarding screen
  if (!isAuthenticated.value && currentPath !== '/register' && currentPath !== '/login') {
    return (
      <div class='h-full w-full flex flex-col bg-base-200 text-base-content overflow-hidden relative font-sans'>
        <WelcomeScreen />
        <ToastStack />
      </div>
    )
  }

  return (
    <div class='h-full w-full flex bg-base-200 text-base-content overflow-hidden relative font-sans'>
      {/* Pinned Safe Area Top Header: prevents scrolling content from passing into safe area top */}
      <header
        id='safe-area-header'
        class={`fixed top-0 inset-x-0 h-[env(safe-area-inset-top,0px)] z-40 pointer-events-none transition-colors duration-200 ${
          isDarkTop ? 'bg-neutral' : 'bg-base-200'
        }`}
      />

      {/* Desktop navigation rail (lg+); the floating BottomNav covers mobile */}
      <SideNav activeTab={currentPath} hidden={isAuthFlow} />

      {/* Principal Layout: Main scrollable viewport container with bottom padding for floating pill nav */}
      <main
        id='main-viewport'
        class={`flex-1 min-w-0 min-h-0 relative overflow-y-auto overflow-x-hidden flex flex-col ${
          isAuthFlow ? '' : 'pb-28 lg:pb-10'
        }`}
      >
        {currentPath === '/' || currentPath === '/home'
          ? <HomeScreen />
          : currentPath === '/market'
          ? <MarketScreen />
          : currentPath === '/social'
          ? <SocialScreen />
          : currentPath === '/compose'
          ? <ComposeScreen onClose={() => history.back()} />
          : currentPath === '/portfolio'
          ? <PortfolioScreen />
          : currentPath === '/journey'
          ? <JourneyScreen />
          : currentPath === '/fund'
          ? <FundScreen />
          : currentPath === '/partner'
          ? <PartnerScreen />
          : currentPath === '/register' || currentPath === '/login'
          ? <RegisterScreen />
          : currentPath === '/welcome'
          ? <WelcomeScreen />
          : (
            /* Fallback screen */
            <div class='flex-1 flex flex-col items-center justify-center p-4 pt-[calc(env(safe-area-inset-top,0px)+1.5rem)] text-center select-none'>
              <div class='w-14 h-14 rounded-2xl bg-base-100 flex items-center justify-center mb-3 text-primary'>
                <span class='text-xs font-mono font-bold text-primary'>
                  {currentPath.slice(1)}
                </span>
              </div>
              <h1 class='text-base font-semibold text-base-content capitalize tracking-tight'>
                {`${currentPath.slice(1)} Screen`}
              </h1>
            </div>
          )}
      </main>

      {/* Floating Bottom Navigation Tab Bar */}
      <BottomNav
        activeTab={currentPath}
        hidden={isBottomNavHidden.value || currentPath === '/compose' ||
          currentPath === '/partner' ||
          isAuthFlow}
        onTabChange={(tab) => navigateUrl(tab.path)}
      />

      {/* Tekki AI: global entry point and conversation */}
      {currentPath !== '/compose' && currentPath !== '/partner' &&
        !isAuthFlow && <AskTekkiButton />}
      <TekkiSheet />

      {/* Glossary sheet opened by the "?" chips */}
      <ExplainerSheet />

      {/* Toast notifications */}
      <ToastStack />
    </div>
  )
}


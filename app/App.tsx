import { useEffect } from 'preact/hooks'
import { SystemBars, SystemBarsStyle } from '@capacitor/core'
import { navigateUrl, pathSignal } from './router.tsx'
import { BottomNav } from './components/BottomNav.tsx'
import { HomeScreen } from './screens/HomeScreen.tsx'
import { MarketScreen } from './screens/MarketScreen.tsx'
import { SocialScreen } from './screens/SocialScreen.tsx'
import { ComposeScreen } from './screens/ComposeScreen.tsx'
import { useScrollHeader } from './hooks/useScrollHeader.ts'
import { isBottomNavHidden } from './state.ts'

export const App = () => {
  const currentPath = pathSignal.value || '/'
  const isHome = currentPath === '/' || currentPath === '/home'

  // Coordinate safe area scroll pinning with GSAP ScrollTrigger
  useScrollHeader({ currentPath })

  useEffect(() => {
    try {
      SystemBars.setStyle({
        style: SystemBarsStyle.Dark,
      })
    } catch {
      // Ignore when running outside native Capacitor environment
    }
  }, [])

  return (
    <div class='h-full w-full flex flex-col bg-base-200 text-base-content overflow-hidden relative font-sans'>
      {/* Pinned Safe Area Top Header: prevents scrolling content from passing into safe area top */}
      <header
        id='safe-area-header'
        class={`fixed top-0 inset-x-0 h-[env(safe-area-inset-top,0px)] z-40 pointer-events-none transition-colors duration-200 ${
          isHome ? 'bg-neutral' : 'bg-base-200'
        }`}
      />

      {/* Principal Layout: Main scrollable viewport container with bottom padding for floating pill nav */}
      <main
        id='main-viewport'
        class='flex-1 min-h-0 relative overflow-y-auto overflow-x-hidden flex flex-col pb-28'
      >
        {currentPath === '/' || currentPath === '/home'
          ? <HomeScreen />
          : currentPath === '/market'
          ? <MarketScreen />
          : currentPath === '/social'
          ? <SocialScreen />
          : currentPath === '/compose'
          ? <ComposeScreen onClose={() => history.back()} />
          : (
            /* Placeholder Container for other tabs (Market, Social, Portfolio) */
            <div class='flex-1 flex flex-col items-center justify-center p-4 pt-[calc(env(safe-area-inset-top,0px)+1.5rem)] text-center select-none'>
              <div class='w-14 h-14 rounded-2xl bg-base-100 flex items-center justify-center mb-3 text-primary shadow-sm shadow-primary/10'>
                <span class='text-xs font-mono font-bold text-primary'>
                  {currentPath.slice(1)}
                </span>
              </div>
              <h1 class='text-base font-semibold text-base-content capitalize tracking-tight'>
                {`${currentPath.slice(1)} Screen`}
              </h1>
              <p class='text-xs text-base-content/40 mt-1.5 max-w-xs leading-relaxed'>
                {currentPath === '/market' &&
                  'Exploration et cours des 48 actions de la BRVM en direct.'}
                {currentPath === '/social' &&
                  'Social Trading : Suivez et copiez les meilleurs investisseurs.'}
                {currentPath === '/portfolio' &&
                  'Suivi de vos parts réelles, dividendes et calendrier financier.'}
              </p>
            </div>
          )}
      </main>

      {/* Floating Bottom Navigation Tab Bar (from Image 3 / Pill Navigation) */}
      <BottomNav
        activeTab={currentPath}
        hidden={isBottomNavHidden.value || currentPath === '/compose'}
        onTabChange={(tab) => navigateUrl(tab.path)}
      />
    </div>
  )
}

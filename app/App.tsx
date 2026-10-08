import { useEffect, useState } from 'preact/hooks'
import { SystemBars, SystemBarsStyle } from '@capacitor/core'
import { url } from './router.tsx'
import { BottomNav } from './components/BottomNav.tsx'

export const App = () => {
  const [currentPath, setCurrentPath] = useState(url.path || '/')

  useEffect(() => {
    try {
      SystemBars.setStyle({
        style: SystemBarsStyle.Light,
      })
    } catch {
      // Ignore when running outside native Capacitor environment
    }

    const onNavChange = () => {
      setCurrentPath(url.path || '/')
    }

    window.addEventListener('popstate', onNavChange)
    window.addEventListener('hashchange', onNavChange)
    return () => {
      window.removeEventListener('popstate', onNavChange)
      window.removeEventListener('hashchange', onNavChange)
    }
  }, [])

  return (
    <div class="h-full w-full flex flex-col bg-base-200 text-base-content overflow-hidden relative font-sans">
      {/* Principal Layout: Main scrollable viewport container with bottom padding for floating pill nav */}
      <main class="flex-1 min-h-0 relative overflow-y-auto overflow-x-hidden flex flex-col pb-24">
        {/* Route Container Placeholder (uses DaisyUI theme classes & primary accents) */}
        <div class="flex-1 flex flex-col items-center justify-center p-6 text-center select-none">
          <div class="w-14 h-14 rounded-2xl bg-base-100 border border-primary/30 flex items-center justify-center mb-3 text-primary shadow-sm shadow-primary/10">
            <span class="text-xs font-mono font-bold text-primary">
              {currentPath === '/' ? '/' : currentPath.slice(1)}
            </span>
          </div>
          <h1 class="text-base font-semibold text-base-content capitalize tracking-tight">
            {currentPath === '/' ? 'Home Container' : `${currentPath.slice(1)} Container`}
          </h1>
          <p class="text-xs text-base-content/40 mt-1.5 max-w-xs leading-relaxed">
            Disposition principale en place. Prêt pour les composants et écrans de trading.
          </p>
        </div>
      </main>

      {/* Floating Bottom Navigation Tab Bar (from Image 3 / Pill Navigation) */}
      <BottomNav
        activeTab={currentPath}
        onTabChange={(tab) => setCurrentPath(tab.path)}
      />
    </div>
  )
}

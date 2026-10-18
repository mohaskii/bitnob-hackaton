import { useLayoutEffect } from 'preact/hooks'
import { lang } from '../i18n/index.ts'
import { mountLanding } from '../features/landing/landing-motion.ts'
import {
  EditorialApp,
  EditorialBitcoin,
  EditorialFooter,
  EditorialHero,
  EditorialJourney,
  EditorialMeaning,
  EditorialNav,
} from '../features/landing/components/EditorialLanding.tsx'
import { InstallGuide } from '../features/pwa/InstallButton.tsx'
import '../features/landing/editorial.css'

export const LandingScreen = () => {
  useLayoutEffect(mountLanding, [])
  return (
    <div id='landing-root' class='editorial' lang={lang.value} data-theme='light'>
      <EditorialNav />
      <main id='landing-content'>
        <EditorialHero />
        <div class='editorial-cover'>
          <EditorialMeaning />
          <EditorialJourney />
          <EditorialBitcoin />
          <EditorialApp />
          <EditorialFooter />
        </div>
      </main>
      <InstallGuide />
    </div>
  )
}

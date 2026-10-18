import { ArrowDown, ArrowUpRight, Bitcoin, Check, Zap } from 'lucide-preact'
import { BrandMark } from '../../../components/BrandMark.tsx'
import { lang, setLang, t } from '../../../i18n/index.ts'
import { InstallButton } from '../../pwa/InstallButton.tsx'
import {
  landingPending,
  loginFromLanding,
  scrollToSection,
  startFromLanding,
} from '../landing-state.ts'
import { SCREENS } from '../landing-content.ts'
import { PhoneFrame } from './PhoneFrame.tsx'

const previewScreen = (key: keyof typeof t.value.screenAlt) => ({
  ...SCREENS[key],
  alt: t.value.screenAlt[key],
})

const ExploreButton = () => (
  <button
    class='editorial-button editorial-button-yellow'
    onClick={startFromLanding}
    disabled={landingPending.value}
  >
    {landingPending.value ? t.value.pending : t.value.explore}
    <ArrowUpRight size={18} />
  </button>
)
export const EditorialNav = () => (
  <header class='editorial-nav' data-landing-nav>
    <a href='#landing-content' class='editorial-skip'>{t.value.skip}</a>
    <a
      href='#top'
      onClick={(event) => {
        event.preventDefault()
        scrollToSection('top')
      }}
      aria-label='TekkiTrade'
    >
      <BrandMark tone='base' />
    </a>
    <nav class='editorial-links' aria-label={t.value.nav[0]}>
      {['experience', 'bitcoin', 'application'].map((id, index) => (
        <a
          key={id}
          href={`#${id}`}
          onClick={(event) => {
            event.preventDefault()
            scrollToSection(id)
          }}
        >
          {t.value.nav[index]}
        </a>
      ))}
    </nav>
    <div class='editorial-nav-actions'>
      <div
        class='editorial-language'
        role='group'
        aria-label={t.value.language}
      >
        <button
          lang='fr'
          aria-pressed={lang.value === 'fr'}
          onClick={() =>
            setLang('fr')}
        >
          FR
        </button>
        <button
          lang='en'
          aria-pressed={lang.value === 'en'}
          onClick={() =>
            setLang('en')}
        >
          EN
        </button>
      </div>
      <button class='editorial-login' onClick={loginFromLanding}>
        {t.value.login}
        <ArrowUpRight size={15} />
      </button>
    </div>
  </header>
)
export const EditorialHero = () => (
  <section class='editorial-hero' id='top'>
    <div class='editorial-hero-copy' data-intro>
      <p class='editorial-eyebrow'>{t.value.eyebrow}</p>
      <h1>
        {t.value.hero[0]}
        <br />
        <span>{t.value.hero[1]}</span>
      </h1>
      <p class='editorial-intro'>{t.value.intro}</p>
      <div class='editorial-actions'>
        <ExploreButton />
        <InstallButton />
      </div>
      <a
        class='editorial-discover'
        href='#experience'
        onClick={(event) => {
          event.preventDefault()
          scrollToSection('experience')
        }}
      >
        {t.value.discover}
        <ArrowDown size={16} />
      </a>
    </div>
    <div class='editorial-showcase' data-showcase>
      <div class='editorial-orbit' aria-hidden='true' />
      <div class='editorial-phone-side editorial-phone-left'>
        <PhoneFrame screens={[previewScreen('market')]} eager />
      </div>
      <div class='editorial-phone-center'>
        <PhoneFrame screens={[previewScreen('home')]} eager />
      </div>
      <div class='editorial-phone-side editorial-phone-right'>
        <PhoneFrame screens={[previewScreen('portfolio')]} eager />
      </div>
    </div>
    <p class='editorial-caption'>{t.value.preview}</p>
  </section>
)
export const EditorialMeaning = () => (
  <section class='editorial-meaning editorial-section' data-section>
    <p class='editorial-eyebrow' data-enter>{t.value.meaningLabel}</p>
    <h2 data-enter>{t.value.meaning}</h2>
    <p class='editorial-body' data-enter>{t.value.meaningBody}</p>
  </section>
)
export const EditorialJourney = () => (
  <section id='experience' class='editorial-journey'>
    <div class='editorial-section editorial-journey-heading'>
      <p class='editorial-eyebrow' data-enter>{t.value.journeyLabel}</p>
      <h2 data-enter>{t.value.journeyTitle}</h2>
    </div>
    <div class='editorial-chapters'>
      {t.value.chapters.map((chapter, index) => (
        <article
          class={`editorial-chapter editorial-chapter-${index}`}
          key={chapter.number}
          data-chapter
        >
          <div class='editorial-chapter-inner'>
            <div class='editorial-chapter-copy'>
              <p class='editorial-eyebrow'>
                <span>{chapter.number}</span> {chapter.label}
              </p>
              <h3>{chapter.title}</h3>
              <p class='editorial-body'>{chapter.body}</p>
              <p class='editorial-detail'>{chapter.detail}</p>
            </div>
            <div class='editorial-chapter-phone'>
              <PhoneFrame
                screens={[
                  previewScreen(
                    chapter.screen as keyof typeof t.value.screenAlt,
                  ),
                ]}
              />
            </div>
          </div>
        </article>
      ))}
    </div>
  </section>
)
export const EditorialBitcoin = () => (
  <section
    id='bitcoin'
    class='editorial-bitcoin editorial-section'
    data-section
  >
    <div class='editorial-bitcoin-heading' data-enter>
      <div class='editorial-bitcoin-icon'>
        <Bitcoin size={32} strokeWidth={1.6} />
      </div>
      <p class='editorial-eyebrow'>{t.value.bitcoinLabel}</p>
      <h2>
        {t.value.bitcoinTitle.map((line) => (
          <span key={line}>
            {line}
            <br />
          </span>
        ))}
      </h2>
    </div>
    <div class='editorial-bitcoin-copy'>
      <p class='editorial-body' data-enter>{t.value.bitcoinBody}</p>
      <ol class='editorial-flow'>
        {t.value.flow.map((step, index) => (
          <li data-enter key={step}>
            <span>{index === 1 ? <Zap size={18} /> : `0${index + 1}`}</span>
            {step}
          </li>
        ))}
      </ol>
      <div class='editorial-status' data-enter>
        <h3>{t.value.status}</h3>
        <p>{t.value.statusBody}</p>
      </div>
    </div>
  </section>
)
export const EditorialApp = () => (
  <section
    id='application'
    class='editorial-app editorial-section'
    data-section
  >
    <div class='editorial-app-copy'>
      <p class='editorial-eyebrow' data-enter>{t.value.appLabel}</p>
      <h2 data-enter>
        {t.value.appTitle[0]}
        <br />
        <span>{t.value.appTitle[1]}</span>
      </h2>
      <p class='editorial-body' data-enter>{t.value.appBody}</p>
      <ul data-enter>
        {t.value.features.map((feature) => (
          <li key={feature}>
            <Check size={17} />
            {feature}
          </li>
        ))}
      </ul>
      <div class='editorial-actions' data-enter>
        <InstallButton />
        <ExploreButton />
      </div>
      <p class='editorial-detail' data-enter>{t.value.appNote}</p>
    </div>
    <div class='editorial-app-art' data-enter>
      <div class='editorial-app-tile'>
        <img
          src='/icons/icon-512.png'
          width='220'
          height='220'
          alt='TekkiTrade'
        />
      </div>
      <span>TekkiTrade</span>
    </div>
  </section>
)
export const EditorialFooter = () => (
  <footer class='editorial-footer'>
    <div>
      <BrandMark tone='base' />
      <p>{t.value.footer}</p>
    </div>
    <p class='editorial-disclaimer'>{t.value.disclaimer}</p>
    <span>© {new Date().getFullYear()} TekkiTrade</span>
  </footer>
)

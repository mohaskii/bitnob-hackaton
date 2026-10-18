import type { TranslationSchema } from './fr.ts'
export const en: TranslationSchema = {
  exploreError:
    'The app could not open right now. Check your connection and try again. If the problem persists, the server may be unavailable.',
  screenAlt: {
    home: 'TekkiTrade home and practice balance preview, in French',
    market: 'BRVM market: companies, prices and trends, in French',
    stock: 'Company profile and stock information, in French',
    portfolio: 'Practice portfolio and position allocation, in French',
    deposit: 'Bitcoin funding journey preview, in French',
    register: 'Online account creation: email, username, password, in French',
    fractional: 'Fractional Sonatel purchase by amount, fees included, in French',
    transfer: 'Instant, free transfer to another investor, in French',
  },
  nav: ['The experience', 'Bitcoin', 'Get the app'],
  skip: 'Skip to content',
  login: 'Sign in',
  explore: 'Explore TekkiTrade',
  pending: 'Opening…',
  install: 'Install the app',
  installed: 'App installed',
  close: 'Close',
  language: 'Choose language',
  eyebrow: 'YOUR FUTURE. YOUR ROOTS.',
  hero: ['Think further.', 'Invest closer.'],
  intro:
    'West African companies are already part of your life. Take the first step towards understanding their market and preparing to invest.',
  discover: 'Discover the experience',
  preview: 'App previews in French · practice portfolio',
  meaningLabel: 'ONE NAME. ONE AMBITION.',
  meaning: 'Tekki. To succeed, build, move forward.',
  meaningBody:
    'A Wolof word. An ambition that travels with you. In Dakar or across the world, stay connected to the companies in your region.',
  journeyLabel: 'FROM CURIOSITY TO CONFIDENCE',
  journeyTitle: 'Every great plan starts with a first step.',
  chapters: [
    {
      number: '01',
      label: 'UNDERSTAND',
      title: 'A market that feels familiar.',
      body:
        'Discover BRVM companies, explore their share prices and take the time to understand the business behind each stock.',
      detail: 'Companies you recognise. A market to discover.',
      screen: 'stock',
    },
    {
      number: '02',
      label: 'OPEN AN ACCOUNT',
      title: 'One minute online. Zero paperwork.',
      body:
        'An email, a username, a password: your account is ready. Your securities account with the partner SGI opens right after, with no paper forms and no branch visit.',
      detail: 'Prototype: account opening with the partner SGI is simulated.',
      screen: 'register',
    },
    {
      number: '03',
      label: 'PRACTISE',
      title: 'Your first choices. At your pace.',
      body:
        'Place your first orders with 1,000,000 virtual FCFA. Track your positions, gains and losses before risking a single franc.',
      detail: 'Practice mode only uses virtual money.',
      screen: 'portfolio',
    },
    {
      number: '04',
      label: 'INVEST',
      title: 'A slice of Sonatel. From 1,000 FCFA.',
      body:
        'Enter an amount, not a number of shares: TekkiTrade works out your fraction. SGI brokerage, tax, BRVM, DC/BR: every fee is shown before you confirm. One tap, and the order goes to the SGI.',
      detail: 'Prototype: orders sent to the SGI are simulated.',
      screen: 'fractional',
    },
    {
      number: '05',
      label: 'FUND',
      title: 'Your roots travel with you.',
      body:
        'Bitcoin Lightning, USDT or USDC: Bitnob converts your crypto into FCFA to fund your investment, wherever you are.',
      detail: 'Prototype: Mobile Money payouts remain simulated.',
      screen: 'deposit',
    },
    {
      number: '06',
      label: 'SHARE',
      title: 'Between friends, money moves freely.',
      body:
        'Send FCFA to another investor using their username. Instant, with no bank fees: to pay someone back, chip in, or help someone get started.',
      detail: 'Free transfers between TekkiTrade accounts.',
      screen: 'transfer',
    },
  ],
  bitcoinLabel: 'BITCOIN, WITH A PURPOSE',
  bitcoinTitle: ['One invoice.', 'One scan.', 'A first connection.'],
  bitcoinBody:
    'The Lightning journey is designed to receive Bitcoin through a payment invoice. TekkiTrade connects that step to your investment plans.',
  flow: [
    'Choose an amount',
    'Scan the Lightning invoice',
    'Follow the confirmation',
  ],
  status: 'Where does the product stand?',
  statusBody:
    'TekkiTrade is a hackathon prototype. Stock purchases and Mobile Money payouts are simulated. Receiving Bitcoin requires Bitnob configuration. Real investing and dividends require partners.',
  appLabel: 'YOUR SPACE, ALWAYS CLOSE',
  appTitle: ['One app.', 'Your next step.'],
  appBody:
    'Keep TekkiTrade on your home screen. Designed for your phone, with room to breathe on your computer.',
  appNote: 'Install from your browser. No app store needed.',
  features: [
    'Designed for mobile and desktop',
    'Launch straight from your home screen',
    'Updates when you reconnect',
  ],
  footer: 'Understand today. Build tomorrow.',
  disclaimer:
    'Information and practice, not investment advice. Investing involves a risk of losing capital. Financial data and operations require an internet connection.',
  installTitle: 'TekkiTrade, on your home screen.',
  installBody: 'Install from your browser and keep the app one tap away.',
  iosSteps: [
    'Open this page in Safari.',
    'Tap Share, then “Add to Home Screen”.',
    'Confirm with “Add”.',
  ],
  browserSteps: [
    'Open your browser menu.',
    'Choose “Install app” or “Add to Home Screen”, if available.',
    'If the option is missing, try Chrome or Edge. You can also keep using the website.',
  ],
  installError:
    'Installation could not start. Try again from your browser menu.',
  installBusy: 'Installing…',
  installedBody: 'TekkiTrade is already running as an app on this device.',
}

import type { TranslationSchema } from './fr.ts'
export const en: TranslationSchema = {
  screenAlt: {
    home: 'TekkiTrade home and practice balance preview, in French',
    market: 'BRVM market: companies, prices and trends, in French',
    stock: 'Company profile and stock information, in French',
    portfolio: 'Practice portfolio and position allocation, in French',
    deposit: 'Bitcoin funding journey preview, in French',
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
      label: 'PRACTISE',
      title: 'Your first choices. At your pace.',
      body:
        'Explore buying shares with a practice portfolio. See the fees, your positions and how they evolve, all in one clear experience.',
      detail: 'Practice uses virtual money. No real orders are placed.',
      screen: 'portfolio',
    },
    {
      number: '03',
      label: 'CONNECT',
      title: 'Your roots travel with you.',
      body:
        'Explore a funding journey with Bitcoin Lightning and Bitnob. A new way to connect your money with your plans for the region.',
      detail: 'Prototype: Mobile Money payouts remain simulated.',
      screen: 'deposit',
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

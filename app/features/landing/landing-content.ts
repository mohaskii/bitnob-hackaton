/**
 * Landing page copy and data. Pure module: no signals, no DOM.
 * Figures: BRVM press releases (Aug. 2026) and app data (delayed quotes).
 */

export type PhoneScreen = {
  src: string
  alt: string
  /** Color behind the fake status bar: matches the top of the screenshot. */
  statusTone: 'dark' | 'light'
}

export const SCREENS = {
  home: {
    src: '/landing/home.webp',
    alt: 'Accueil TekkiTrade : patrimoine, dépôt, retrait et actualités BRVM',
    statusTone: 'dark',
  },
  market: {
    src: '/landing/market.webp',
    alt: 'Liste des actions BRVM avec cours et tendances',
    statusTone: 'light',
  },
  stock: {
    src: '/landing/stock.webp',
    alt: 'Fiche Sonatel : dernier cours, activité de l’entreprise, volume',
    statusTone: 'light',
  },
  order: {
    src: '/landing/order.webp',
    alt: 'Simulation d’achat avec le détail de chaque frais',
    statusTone: 'light',
  },
  portfolio: {
    src: '/landing/portfolio.webp',
    alt: 'Portefeuille d’entraînement avec positions et historique',
    statusTone: 'dark',
  },
  deposit: {
    src: '/landing/deposit.webp',
    alt: 'Approvisionnement via Bitnob en Lightning, USDT ou USDC',
    statusTone: 'dark',
  },
  social: {
    src: '/landing/social.webp',
    alt: 'Communauté : meilleurs investisseurs et fil d’analyses',
    statusTone: 'light',
  },
} satisfies Record<string, PhoneScreen>

export const HERO_CHIPS = [
  { label: 'SNTS', value: '43 500 FCFA', tone: 'neutral' },
  { label: 'USDT → FCFA', value: 'via Bitnob', tone: 'primary' },
] as const

export const MEANING_TEXT =
  'En wolof, « Tekki » veut dire réussir, s’émanciper, se construire. Pas en partant à l’aventure : ici, chez soi, avec les entreprises qui font déjà notre quotidien.'

export const MEANING_WORDS = MEANING_TEXT.split(' ')

export const STATS = [
  {
    value: 47,
    suffix: '',
    label: 'sociétés cotées',
    note: 'Sonatel, Orange CI, SGBCI, Ecobank, Coris Bank…',
  },
  {
    value: 20000,
    suffix: '+',
    label: 'milliards FCFA',
    note: 'de capitalisation, record franchi en août 2026',
  },
  {
    value: 8,
    suffix: '',
    label: 'pays, une seule bourse',
    note: 'Sénégal, Côte d’Ivoire, Mali, Burkina, Bénin, Togo, Niger, Guinée-Bissau',
  },
] as const

export const BARRIERS = [
  {
    title: 'Une action coûte cher',
    text: 'Une seule action Sonatel : 43 500 FCFA au dernier cours publié. Difficile de se lancer sans savoir.',
  },
  {
    title: 'Le parcours est opaque',
    text: 'SGI, compte-titres, frais BRVM, DC/BR… Personne n’explique les étapes ni ce qu’elles coûtent.',
  },
  {
    title: 'La peur de mal faire',
    text: 'Sans entraînement, la première erreur se paie avec son épargne. Alors on ne commence jamais.',
  },
] as const

export type JourneyStep = {
  kicker: string
  title: string
  story: string
  feature: string
  screen: PhoneScreen
}

export const JOURNEY: JourneyStep[] = [
  {
    kicker: '01 · Comprendre',
    title: 'Awa ouvre le marché, sans jargon.',
    story:
      'Awa a 24 ans, elle vit à Dakar. Elle connaît Sonatel comme opérateur, pas comme action.',
    feature:
      'Les 47 valeurs de la BRVM aux cours différés officiels, chaque terme expliqué au bon moment.',
    screen: SCREENS.stock,
  },
  {
    kicker: '02 · S’entraîner',
    title: 'Elle s’entraîne avec 1 000 000 FCFA fictifs.',
    story:
      'Avant de risquer un franc, elle passe ses premiers ordres en argent fictif.',
    feature:
      'Chaque frais affiché au franc près : courtage SGI, taxe, commission BRVM 0,20 %, DC/BR 0,10 %.',
    screen: SCREENS.order,
  },
  {
    kicker: '03 · Suivre',
    title: 'Elle voit ce que son choix aurait donné.',
    story: 'Positions, prix de revient, gains et pertes : tout est lisible.',
    feature:
      'Un portefeuille d’entraînement valorisé au dernier cours publié par la BRVM.',
    screen: SCREENS.portfolio,
  },
  {
    kicker: '04 · Approvisionner',
    title: 'Son frère à Paris peut l’aider à financer.',
    story:
      'Moussa envoie des USDT ou du Bitcoin depuis la France. Bitnob convertit, la SGI reçoit des FCFA.',
    feature:
      'Lightning, USDT ou USDC via Bitnob, versés en FCFA à la SGI d’Awa avec sa référence.',
    screen: SCREENS.deposit,
  },
  {
    kicker: '05 · Apprendre ensemble',
    title: 'Elle n’investit plus seule.',
    story:
      'Elle suit des investisseurs de la région, lit leurs analyses et partage les siennes.',
    feature:
      'Un fil communautaire autour des valeurs BRVM, avec performances transparentes.',
    screen: SCREENS.social,
  },
]

/** Title split into words for the masked "roll" transition. */
export const titleWords = (title: string) => title.split(' ')

/**
 * Desktop journey track: one viewport of scroll per step change plus a
 * resting tail on the last step. The sticky panel spans one viewport, so the
 * track is (changes + tail + 1) viewports tall.
 */
export const JOURNEY_TAIL = 0.5
export const JOURNEY_TRACK_VH = (JOURNEY.length - 1 + JOURNEY_TAIL + 1) * 100

export const MONEY_FLOW = [
  { title: 'Depuis partout', text: 'Dakar, Abidjan, Paris, Montréal…' },
  { title: 'Lightning · USDT · USDC', text: 'L’investisseur envoie via Bitnob' },
  { title: 'Bitnob convertit', text: 'Cotation en FCFA, frais affichés avant' },
  { title: 'FCFA versés à la SGI', text: 'Avec la référence de l’investisseur' },
  { title: 'Compte-titres crédité', text: 'La SGI confirme, Awa peut acheter' },
] as const

export const TRUST = [
  {
    title: 'Vos titres au DC/BR',
    text: 'Les actions sont inscrites au Dépositaire Central / Banque de Règlement, commun aux 8 pays.',
  },
  {
    title: 'Des SGI agréées',
    text: 'Les ordres réels passent par des SGI agréées par l’AMF-UMOA. TekkiTrade vous guide jusqu’à elles.',
  },
  {
    title: 'Jamais vos fonds',
    text: 'TekkiTrade ne détient pas votre argent : Bitnob verse les FCFA directement à votre SGI.',
  },
] as const

export const DISCLAIMER =
  'TekkiTrade fournit de l’information et de l’entraînement, pas de conseil en investissement. Les ordres réels sont exécutés par des SGI agréées par l’AMF-UMOA. Investir en bourse comporte un risque de perte en capital.'

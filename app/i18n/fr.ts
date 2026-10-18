export const fr = {
  screenAlt: {
    home: 'Accueil TekkiTrade et aperçu du patrimoine fictif',
    market: 'Marché BRVM : entreprises, cours et tendances',
    stock: 'Fiche entreprise et informations sur une action',
    portfolio: 'Portefeuille d’entraînement et répartition des positions',
    deposit: 'Aperçu du parcours de financement Bitcoin',
  },
  nav: ['L’expérience', 'Bitcoin', 'L’application'],
  skip: 'Aller au contenu',
  login: 'Se connecter',
  explore: 'Explorer TekkiTrade',
  pending: 'Ouverture…',
  install: 'Installer l’app',
  installed: 'App installée',
  close: 'Fermer',
  language: 'Choisir la langue',
  eyebrow: 'VOTRE AVENIR. VOS RACINES.',
  hero: ['Voir plus loin.', 'Investir plus près.'],
  intro:
    'Les entreprises d’Afrique de l’Ouest font déjà partie de votre vie. Faites le premier pas pour comprendre leur marché et préparer votre investissement.',
  discover: 'Découvrir l’expérience',
  preview: 'Aperçus de l’application en français · portefeuille d’entraînement',
  meaningLabel: 'UN NOM. UNE AMBITION.',
  meaning: 'Tekki. Réussir, se construire, avancer.',
  meaningBody:
    'Un mot wolof, une ambition qui voyage avec vous. À Dakar ou à l’autre bout du monde, gardez un lien avec les entreprises de votre région.',
  journeyLabel: 'DE LA CURIOSITÉ À LA CONFIANCE',
  journeyTitle: 'Chaque grand projet commence par un premier pas.',
  chapters: [
    {
      number: '01',
      label: 'COMPRENDRE',
      title: 'Un marché qui devient familier.',
      body:
        'Découvrez les entreprises de la BRVM, consultez leurs cours et prenez le temps de comprendre ce qui se cache derrière une action.',
      detail: 'Des entreprises que vous connaissez. Un marché à découvrir.',
      screen: 'stock',
    },
    {
      number: '02',
      label: 'S’ENTRAÎNER',
      title: 'Vos premiers choix. À votre rythme.',
      body:
        'Explorez l’achat d’actions avec un portefeuille fictif. Retrouvez les frais, vos positions et leur évolution dans une expérience claire.',
      detail: 'L’entraînement utilise de l’argent fictif. Aucun ordre réel.',
      screen: 'portfolio',
    },
    {
      number: '03',
      label: 'SE CONNECTER',
      title: 'Vos racines voyagent avec vous.',
      body:
        'Découvrez un parcours de financement avec Bitcoin Lightning et Bitnob. Une nouvelle façon de penser le lien entre votre argent et vos projets dans la région.',
      detail: 'Prototype : le versement Mobile Money reste simulé.',
      screen: 'deposit',
    },
  ],
  bitcoinLabel: 'BITCOIN, AU SERVICE DU PARCOURS',
  bitcoinTitle: ['Une facture.', 'Un scan.', 'Un premier lien.'],
  bitcoinBody:
    'Le parcours Lightning est conçu pour recevoir un paiement Bitcoin à partir d’une facture. TekkiTrade relie cette étape à votre projet d’investissement.',
  flow: [
    'Choisir un montant',
    'Scanner la facture Lightning',
    'Suivre la confirmation',
  ],
  status: 'Où en est le produit ?',
  statusBody:
    'TekkiTrade est un prototype de hackathon. Les achats d’actions et les payouts Mobile Money sont simulés. La réception Bitcoin dépend de la configuration Bitnob. L’investissement réel et les dividendes nécessitent des partenaires.',
  appLabel: 'VOTRE ESPACE, TOUJOURS À PORTÉE DE MAIN',
  appTitle: ['Une app.', 'Votre prochain pas.'],
  appBody:
    'Retrouvez TekkiTrade sur votre écran d’accueil. Une expérience pensée pour le téléphone, avec l’espace qu’il faut sur ordinateur.',
  appNote: 'Installation depuis votre navigateur, sans passer par un store.',
  features: [
    'Pensée pour mobile et ordinateur',
    'Accès direct depuis l’écran d’accueil',
    'Mises à jour à la prochaine connexion',
  ],
  footer: 'Comprendre aujourd’hui. Construire demain.',
  disclaimer:
    'Information et entraînement, sans conseil en investissement. Investir comporte un risque de perte en capital. Une connexion est nécessaire pour les données et opérations financières.',
  installTitle: 'TekkiTrade, sur votre écran d’accueil.',
  installBody:
    'Installez l’application depuis votre navigateur pour la retrouver en un geste.',
  iosSteps: [
    'Ouvrez cette page dans Safari.',
    'Touchez Partager, puis « Sur l’écran d’accueil ».',
    'Confirmez avec « Ajouter ».',
  ],
  browserSteps: [
    'Ouvrez le menu de votre navigateur.',
    'Choisissez « Installer l’application » ou « Ajouter à l’écran d’accueil », si proposé.',
    'Si cette option n’apparaît pas, essayez Chrome ou Edge. Vous pouvez aussi continuer sur le web.',
  ],
  installError:
    'L’installation n’a pas pu démarrer. Vous pouvez réessayer depuis le menu du navigateur.',
  installBusy: 'Installation…',
  installedBody:
    'TekkiTrade est déjà ouvert comme une application sur cet appareil.',
} as const

type Widen<T> = T extends string ? string
  : T extends readonly (infer U)[] ? readonly Widen<U>[]
  : { [K in keyof T]: Widen<T[K]> }
export type TranslationSchema = Widen<typeof fr>

/**
 * Plain-language explanations shown in context, at the moment they help.
 * Pure data: no signals.
 */

export type GlossaryTerm = {
  id: string
  title: string
  short: string
  body: string[]
}

export const GLOSSARY: Record<string, GlossaryTerm> = {
  cours: {
    id: 'cours',
    title: 'Le cours',
    short: 'Le prix d’une action lors de la dernière séance publiée.',
    body: [
      'C’est le prix auquel l’action s’est échangée à la BRVM. TekkiTrade affiche le cours publié par la BRVM, en différé : il peut avoir changé depuis.',
      'Le prix réel de votre ordre sera celui obtenu par votre SGI sur le marché.',
    ],
  },
  variation: {
    id: 'variation',
    title: 'La variation',
    short: 'L’écart en % par rapport à la séance précédente.',
    body: [
      'Une variation de +2 % signifie que le cours a monté de 2 % depuis la clôture précédente. Une variation sur une journée ne dit rien de la qualité d’une entreprise à long terme.',
    ],
  },
  volume: {
    id: 'volume',
    title: 'Le volume',
    short: 'Le nombre de titres échangés pendant la séance.',
    body: [
      'Un volume faible signifie peu d’acheteurs et de vendeurs ce jour-là : votre ordre peut mettre plus de temps à être exécuté, ou à un prix différent.',
    ],
  },
  titresEntiers: {
    id: 'titresEntiers',
    title: 'Pourquoi des titres entiers ?',
    short: 'À la BRVM, on achète des actions entières, pas des fractions.',
    body: [
      'Avec 50 000 FCFA et une action à 18 000 FCFA, vous pouvez acheter 2 titres. Le reste (moins les frais) reste disponible sur votre compte espèces chez la SGI.',
      'Certaines offres parlent d’« investir dès 1 000 FCFA » : cela suppose un montage de détention particulier qui doit être accepté par la SGI et le régulateur.',
    ],
  },
  frais: {
    id: 'frais',
    title: 'Les frais d’un ordre',
    short: 'Courtage SGI + taxe + commissions BRVM et DC/BR.',
    body: [
      'Courtage : la rémunération de votre SGI, fixée dans sa grille tarifaire homologuée par le régulateur (AMF-UMOA).',
      'Taxe sur le courtage : appliquée sur la commission de la SGI.',
      'Commission BRVM (0,20 %) et commission DC/BR (0,10 %) : publiées par la BRVM, payées à l’achat comme à la vente.',
      'S’y ajoutent des droits de garde annuels, prélevés par la SGI pour conserver vos titres.',
    ],
  },
  sgi: {
    id: 'sgi',
    title: 'Une SGI, c’est quoi ?',
    short: 'Le courtier agréé qui ouvre votre compte et passe vos ordres.',
    body: [
      'Seules les Sociétés de Gestion et d’Intermédiation (SGI) agréées peuvent acheter et vendre des actions à la BRVM pour vous.',
      'La SGI ouvre votre compte-titres, conserve vos actions, exécute vos ordres et vous envoie un avis d’opéré après chaque opération.',
    ],
  },
  compteTitres: {
    id: 'compteTitres',
    title: 'Le compte-titres',
    short: 'Le compte, chez la SGI, où sont enregistrées vos actions.',
    body: [
      'Il est associé à un compte espèces : vous l’approvisionnez, puis la SGI débite le montant de vos achats et crédite le produit de vos ventes et vos dividendes.',
    ],
  },
  avisOpere: {
    id: 'avisOpere',
    title: 'L’avis d’opéré',
    short: 'Le relevé envoyé par la SGI après chaque ordre exécuté.',
    body: [
      'Il indique le titre, la quantité, le prix d’exécution, le montant brut, le détail des frais et le montant net débité ou crédité.',
      'Dans TekkiTrade, l’entraînement produit un avis d’opéré simulé pour apprendre à le lire.',
    ],
  },
  differe: {
    id: 'differe',
    title: 'Cours différés',
    short: 'Les cours affichés ne sont pas en temps réel.',
    body: [
      'Les cours proviennent des pages publiques de la BRVM. Pendant la séance, ils sont décalés ; hors séance, ils reflètent la dernière clôture.',
      'Un flux temps réel nécessite un accord de diffusion avec la BRVM.',
    ],
  },
  reglement: {
    id: 'reglement',
    title: 'Règlement à T+2',
    short: 'Titres et argent sont échangés 2 jours ouvrés après l’ordre.',
    body: [
      'Depuis décembre 2025, la BRVM règle les opérations deux jours ouvrés après l’exécution : un achat du lundi est réglé le mercredi.',
    ],
  },
  bitnob: {
    id: 'bitnob',
    title: 'Approvisionner via Bitnob',
    short: 'Envoyez des USDT, USDC ou BTC : la SGI reçoit des FCFA.',
    body: [
      'Bitnob convertit votre envoi et verse des FCFA sur le portefeuille de collecte Mobile Money de votre SGI, avec votre référence pour qu’elle crédite votre compte.',
      'TekkiTrade ne détient jamais vos fonds. Le taux et les frais Bitnob sont affichés avant l’envoi.',
      'Les crypto-actifs ne sont pas une monnaie légale dans l’UEMOA et leur valeur varie : n’envoyez que le montant prévu, au moment du versement.',
    ],
  },
}

import type { BrokerSchedule } from './fees.ts'

/**
 * Partner SGI catalogue.
 *
 * Every entry below is a FICTITIOUS demo partner. Its figures are realistic
 * orders of magnitude, not a real tariff. A pilot replaces an entry with the
 * conditions the SGI has validated (tariff approved by the CREPMF/AMF-UMOA,
 * opening steps, documents, delays) and fills `verifiedAt`.
 */

export type ChecklistItem = {
  id: string
  label: string
  hint: string
  required: boolean
}

export type SgiPartner = {
  id: string
  name: string
  tagline: string
  country: string
  isDemo: boolean
  verifiedAt: string | null
  source: string
  schedule: BrokerSchedule
  minimumDepositFcfa: number
  custodyFeeLabel: string
  openingMode: string
  openingDelayLabel: string
  fundingMethods: string[]
  highlights: string[]
  checklist: ChecklistItem[]
  accentColor: string
  /**
   * Collection wallet receiving XOF payouts from Bitnob. Each transfer
   * carries the investor's reference so the SGI can reconcile automatically.
   */
  bitnobCollection: {
    /** False when Bitnob has no XOF payout corridor to this country. */
    available: boolean
    country: string // ISO alpha-2 (Bitnob XOF corridors: CI, SN, NE)
    channel: string
    accountName: string
    accountNumber: string
    network: string // Bitnob network value for the Mobile Money operator
    maxPerTransferFcfa: number // Bitnob limit: 100 – 2 000 000 XOF
  }
}

const DEMO_SOURCE =
  'Conditions de démonstration. À remplacer par la grille tarifaire et le parcours validés par la SGI pilote.'

const COMMON_CHECKLIST: ChecklistItem[] = [
  {
    id: 'id',
    label: 'Pièce d’identité en cours de validité',
    hint: 'CNI, passeport ou carte consulaire. Photo nette, recto et verso.',
    required: true,
  },
  {
    id: 'address',
    label: 'Justificatif de domicile de moins de 3 mois',
    hint: 'Facture d’eau, d’électricité ou attestation de résidence.',
    required: true,
  },
  {
    id: 'photo',
    label: 'Photo d’identité récente',
    hint: 'Un selfie sur fond clair peut suffire selon la SGI.',
    required: true,
  },
]

export const SGI_PARTNERS: SgiPartner[] = [
  {
    id: 'atlantique',
    name: 'Atlantique Capital',
    tagline: 'Ouverture 100 % en ligne, idéale pour débuter',
    country: 'Côte d’Ivoire',
    isDemo: true,
    verifiedAt: null,
    source: DEMO_SOURCE,
    schedule: {
      brokerageRate: 0.01,
      brokerageMinFcfa: 0,
      taxOnBrokerageRate: 0.18,
    },
    minimumDepositFcfa: 25_000,
    custodyFeeLabel: '0,25 % par an de la valeur du portefeuille',
    openingMode: 'En ligne',
    openingDelayLabel: '2 à 3 jours ouvrés',
    fundingMethods: ['Bitnob (USDT, USDC, BTC)', 'Mobile Money', 'Virement'],
    highlights: [
      'Signature électronique',
      'Conseiller joignable par WhatsApp',
    ],
    checklist: [
      ...COMMON_CHECKLIST,
      {
        id: 'iban',
        label: 'RIB ou numéro Mobile Money à votre nom',
        hint: 'Sert à recevoir vos ventes et dividendes.',
        required: true,
      },
    ],
    accentColor: '#f7e01c',
    bitnobCollection: {
      country: 'CI',
      channel: 'Orange Money marchand (Côte d’Ivoire)',
      accountName: 'ATLANTIQUE CAPITAL COLLECTE',
      accountNumber: '+2250700000001',
      network: 'orange',
      available: true,
      maxPerTransferFcfa: 2_000_000,
    },
  },
  {
    id: 'sahel',
    name: 'Sahel Bourse',
    tagline: 'Frais de courtage plus bas pour les montants élevés',
    country: 'Sénégal',
    isDemo: true,
    verifiedAt: null,
    source: DEMO_SOURCE,
    schedule: {
      brokerageRate: 0.008,
      brokerageMinFcfa: 0,
      taxOnBrokerageRate: 0.18,
    },
    minimumDepositFcfa: 100_000,
    custodyFeeLabel: '0,20 % par an, minimum 5 000 FCFA',
    openingMode: 'En agence ou visio',
    openingDelayLabel: '5 à 7 jours ouvrés',
    fundingMethods: ['Bitnob (USDT, USDC, BTC)', 'Virement', 'Chèque'],
    highlights: ['Rendez-vous de bienvenue', 'Rapports mensuels détaillés'],
    checklist: [
      ...COMMON_CHECKLIST,
      {
        id: 'income',
        label: 'Justificatif de revenus ou d’activité',
        hint: 'Bulletin de salaire, registre de commerce ou attestation.',
        required: true,
      },
      {
        id: 'iban',
        label: 'RIB à votre nom',
        hint: 'Sert à recevoir vos ventes et dividendes.',
        required: true,
      },
    ],
    accentColor: '#4caf50',
    bitnobCollection: {
      country: 'SN',
      channel: 'Wave Business (Sénégal)',
      accountName: 'SAHEL BOURSE COLLECTE',
      accountNumber: '+221770000002',
      network: 'wave',
      available: true,
      maxPerTransferFcfa: 2_000_000,
    },
  },
  {
    id: 'lagune',
    name: 'Lagune Invest',
    tagline: 'Pas de dépôt minimum, financement local par Mobile Money',
    country: 'Bénin',
    isDemo: true,
    verifiedAt: null,
    source: DEMO_SOURCE,
    schedule: {
      brokerageRate: 0.012,
      brokerageMinFcfa: 0,
      taxOnBrokerageRate: 0.18,
    },
    minimumDepositFcfa: 0,
    custodyFeeLabel: '0,30 % par an de la valeur du portefeuille',
    openingMode: 'En ligne',
    openingDelayLabel: '3 à 5 jours ouvrés',
    fundingMethods: ['Mobile Money', 'Virement'],
    highlights: ['Aucun dépôt minimum', 'Application mobile de suivi'],
    checklist: [...COMMON_CHECKLIST],
    accentColor: '#60a5fa',
    bitnobCollection: {
      country: 'BJ',
      channel:
        'Virement bancaire (Bitnob ne verse pas encore en FCFA au Bénin)',
      accountName: 'LAGUNE INVEST COLLECTE',
      accountNumber: '',
      network: '',
      available: false,
      maxPerTransferFcfa: 0,
    },
  },
]

export const DEFAULT_SGI_ID = SGI_PARTNERS[0].id

export const findSgi = (id: string | null | undefined) =>
  SGI_PARTNERS.find((sgi) => sgi.id === id)

export const sgiOrDefault = (id: string | null | undefined) =>
  findSgi(id) ?? SGI_PARTNERS[0]

/** Account-opening statuses, in order. Shared with the partner dashboard. */
export const JOURNEY_STATUSES = [
  'EXPLORING',
  'SGI_SELECTED',
  'SUBMITTED',
  'UNDER_REVIEW',
  'INFO_REQUESTED',
  'ACCOUNT_OPENED',
  'FUNDED',
] as const
export type JourneyStatus = typeof JOURNEY_STATUSES[number]

export const JOURNEY_STATUS_LABELS: Record<JourneyStatus, string> = {
  EXPLORING: 'Découverte',
  SGI_SELECTED: 'SGI choisie',
  SUBMITTED: 'Dossier transmis',
  UNDER_REVIEW: 'En vérification par la SGI',
  INFO_REQUESTED: 'Complément demandé',
  ACCOUNT_OPENED: 'Compte-titres ouvert',
  FUNDED: 'Compte approvisionné',
}

/** Statuses a partner can set from its side once a file is submitted. */
export const PARTNER_STATUSES: JourneyStatus[] = [
  'UNDER_REVIEW',
  'INFO_REQUESTED',
  'ACCOUNT_OPENED',
  'FUNDED',
]

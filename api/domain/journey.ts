import { respond } from '@01edu/api/response'
import { sql, sqlQuery, withTransaction } from '../schema.ts'
import {
  findSgi,
  JOURNEY_STATUS_LABELS,
  JOURNEY_STATUSES,
  type JourneyStatus,
  PARTNER_STATUSES,
  SGI_PARTNERS,
} from './sgi.ts'
import { countPaperOrders } from './paper.ts'

/**
 * Guided path from curiosity to a securities account at a partner SGI.
 * TekkiTrade guides; the SGI owns the account opening and its statuses.
 */

export const EVENT_TYPES = [
  'viewed_stock',
  'opened_explainer',
  'estimated_order',
  'compared_sgi',
] as const
export type EventType =
  | typeof EVENT_TYPES[number]
  | 'paper_order'
  | 'selected_sgi'
  | 'submitted_application'
  | 'account_opened'

export const trackEvent = (
  userId: number,
  type: EventType,
  extra: { symbol?: string; sgiId?: string } = {},
) => {
  sql`
    INSERT INTO journeyEvent (userId, type, symbol, sgiId, createdAt)
    VALUES (${userId}, ${type}, ${extra.symbol ?? null}, ${
    extra.sgiId ?? null
  }, ${Date.now()})
  `.run()
}

const hasEvent = (userId: number, type: EventType) =>
  Boolean(
    sqlQuery<{ n: number }>`
      SELECT COUNT(*) AS n FROM journeyEvent WHERE userId = ${userId} AND type = ${type}
    `.get()?.n,
  )

type JourneyRecord = {
  journeyId: number
  sgiId: string | null
  status: JourneyStatus
  checklist: Record<string, boolean>
  consentAt: number | null
  submittedAt: number | null
  updatedAt: number
}

const readJourney = (userId: number): JourneyRecord => {
  sql`
    INSERT OR IGNORE INTO journey (userId, status, checklistJson, updatedAt)
    VALUES (${userId}, 'EXPLORING', '{}', ${Date.now()})
  `.run()
  const row = sqlQuery<{
    journeyId: number
    sgiId: string | null
    status: JourneyStatus
    checklistJson: string
    consentAt: number | null
    submittedAt: number | null
    updatedAt: number
  }>`
    SELECT journeyId, sgiId, status, checklistJson, consentAt, submittedAt, updatedAt
    FROM journey WHERE userId = ${userId}
  `.get()!
  const { checklistJson, ...rest } = row
  return { ...rest, checklist: JSON.parse(checklistJson) }
}

const logStatus = (journeyId: number, status: JourneyStatus, note?: string) =>
  sql`
    INSERT INTO journeyStatusLog (journeyId, status, note, createdAt)
    VALUES (${journeyId}, ${status}, ${note ?? null}, ${Date.now()})
  `.run()

const statusRank = (status: JourneyStatus) => JOURNEY_STATUSES.indexOf(status)

/** The six steps of the target path, computed from what the user did. */
const computeSteps = (userId: number, journey: JourneyRecord) => {
  const submitted = statusRank(journey.status) >= statusRank('SUBMITTED')
  const steps = [
    {
      id: 'discover',
      title: 'Découvrir un titre',
      description: 'Consultez une fiche : activité, cours daté et source.',
      done: hasEvent(userId, 'viewed_stock'),
      cta: { label: 'Explorer le marché', path: '/market' },
    },
    {
      id: 'understand',
      title: 'Comprendre les coûts',
      description: 'Estimez un achat : frais SGI, BRVM et dépositaire.',
      done: hasEvent(userId, 'estimated_order') ||
        hasEvent(userId, 'opened_explainer'),
      cta: { label: 'Estimer un achat', path: '/market' },
    },
    {
      id: 'practice',
      title: 'S’entraîner sans argent réel',
      description: 'Passez un ordre fictif au dernier cours publié.',
      done: countPaperOrders(userId) > 0,
      cta: { label: 'Passer un ordre fictif', path: '/market' },
    },
    {
      id: 'choose',
      title: 'Choisir une SGI',
      description: 'Comparez frais, minimums, délais et pièces demandées.',
      done: Boolean(journey.sgiId),
      cta: { label: 'Comparer les SGI', path: '/journey' },
    },
    {
      id: 'open',
      title: 'Ouvrir son compte-titres',
      description: 'Préparez vos pièces et suivez votre dossier.',
      done: statusRank(journey.status) >= statusRank('ACCOUNT_OPENED'),
      cta: {
        label: submitted ? 'Suivre mon dossier' : 'Préparer mon dossier',
        path: '/journey',
      },
    },
    {
      id: 'fund',
      title: 'Approvisionner son compte',
      description:
        'Envoyez des fonds depuis n’importe où via Bitnob, reçus en FCFA par la SGI.',
      done: journey.status === 'FUNDED',
      cta: { label: 'Approvisionner', path: '/fund' },
    },
  ]
  const nextIndex = steps.findIndex((step) => !step.done)
  return {
    steps,
    completedCount: steps.filter((step) => step.done).length,
    nextStepId: nextIndex >= 0 ? steps[nextIndex].id : null,
  }
}

export const getJourney = (userId: number) => {
  const journey = readJourney(userId)
  const sgi = findSgi(journey.sgiId)
  const timeline = sqlQuery<
    { status: JourneyStatus; note: string | null; createdAt: number }
  >`
    SELECT status, note, createdAt FROM journeyStatusLog
    WHERE journeyId = ${journey.journeyId} ORDER BY createdAt ASC, logId ASC
  `.all().map((entry) => ({
    ...entry,
    label: JOURNEY_STATUS_LABELS[entry.status],
  }))
  const checklist = (sgi?.checklist ?? []).map((item) => ({
    ...item,
    done: Boolean(journey.checklist[item.id]),
  }))
  return {
    journeyId: journey.journeyId,
    status: journey.status,
    statusLabel: JOURNEY_STATUS_LABELS[journey.status],
    sgiId: journey.sgiId,
    checklist,
    checklistReady: checklist.length > 0 &&
      checklist.every((item) => !item.required || item.done),
    consentAt: journey.consentAt,
    submittedAt: journey.submittedAt,
    timeline,
    ...computeSteps(userId, journey),
  }
}

export const selectSgi = (userId: number, sgiId: string) => {
  const sgi = findSgi(sgiId)
  if (!sgi) throw new respond.NotFoundError({ message: 'SGI inconnue.' })
  const journey = readJourney(userId)
  if (statusRank(journey.status) >= statusRank('SUBMITTED')) {
    throw new respond.BadRequestError({
      message: 'Votre dossier est déjà transmis à une SGI.',
    })
  }
  withTransaction(() => {
    sql`
      UPDATE journey SET sgiId = ${sgiId}, status = 'SGI_SELECTED',
        checklistJson = '{}', updatedAt = ${Date.now()}
      WHERE journeyId = ${journey.journeyId}
    `.run()
    if (journey.sgiId !== sgiId) {
      logStatus(journey.journeyId, 'SGI_SELECTED', sgi.name)
    }
    trackEvent(userId, 'selected_sgi', { sgiId })
  })
  return getJourney(userId)
}

export const setChecklistItem = (
  userId: number,
  itemId: string,
  done: boolean,
) => {
  const journey = readJourney(userId)
  const sgi = findSgi(journey.sgiId)
  if (!sgi?.checklist.some((item) => item.id === itemId)) {
    throw new respond.BadRequestError({
      message: 'Pièce inconnue pour cette SGI.',
    })
  }
  const checklist = { ...journey.checklist, [itemId]: done }
  sql`
    UPDATE journey SET checklistJson = ${
    JSON.stringify(checklist)
  }, updatedAt = ${Date.now()}
    WHERE journeyId = ${journey.journeyId}
  `.run()
  return getJourney(userId)
}

/** Hands the file to the SGI. Requires explicit consent to share data. */
export const submitApplication = (userId: number, consent: boolean) => {
  const view = getJourney(userId)
  if (!view.sgiId) {
    throw new respond.BadRequestError({
      message: 'Choisissez d’abord une SGI.',
    })
  }
  if (!view.checklistReady) {
    throw new respond.BadRequestError({
      message: 'Toutes les pièces obligatoires doivent être prêtes.',
    })
  }
  if (!consent) {
    throw new respond.BadRequestError({
      message: 'Votre accord est nécessaire pour transmettre le dossier.',
    })
  }
  if (statusRank(view.status) >= statusRank('SUBMITTED')) return view
  const now = Date.now()
  withTransaction(() => {
    sql`
      UPDATE journey SET status = 'SUBMITTED', consentAt = ${now},
        submittedAt = ${now}, updatedAt = ${now}
      WHERE journeyId = ${view.journeyId}
    `.run()
    logStatus(
      view.journeyId,
      'SUBMITTED',
      'Transmis à la SGI avec votre accord',
    )
    trackEvent(userId, 'submitted_application', { sgiId: view.sgiId! })
  })
  return getJourney(userId)
}

/* -------------------------------------------------------------------------- */
/* Partner side                                                               */
/* -------------------------------------------------------------------------- */

const countDistinctUsers = (type: EventType, sgiId?: string) =>
  sqlQuery<{ n: number }>`
    SELECT COUNT(DISTINCT userId) AS n FROM journeyEvent
    WHERE type = ${type} AND (${sgiId ?? null} IS NULL OR sgiId = ${
    sgiId ?? null
  })
  `.get()!.n

/** Funnel and applications for one SGI. Applicants are pseudonymised. */
export const getPartnerOverview = (sgiId: string) => {
  const sgi = findSgi(sgiId)
  if (!sgi) throw new respond.NotFoundError({ message: 'SGI inconnue.' })
  const visitors =
    sqlQuery<{ n: number }>`SELECT COUNT(*) AS n FROM user`.get()!.n
  const funnel = [
    { id: 'visitors', label: 'Utilisateurs TekkiTrade', value: visitors },
    {
      id: 'viewed',
      label: 'Ont consulté une fiche titre',
      value: countDistinctUsers('viewed_stock'),
    },
    {
      id: 'practiced',
      label: 'Se sont entraînés',
      value: countDistinctUsers('paper_order'),
    },
    {
      id: 'selected',
      label: `Ont choisi ${sgi.name}`,
      value: countDistinctUsers('selected_sgi', sgiId),
    },
    {
      id: 'submitted',
      label: 'Dossiers transmis',
      value: countDistinctUsers('submitted_application', sgiId),
    },
    {
      id: 'opened',
      label: 'Comptes ouverts',
      value: countDistinctUsers('account_opened', sgiId),
    },
  ]
  const applications = sqlQuery<{
    journeyId: number
    userId: number
    status: JourneyStatus
    submittedAt: number | null
    updatedAt: number
    checklistJson: string
  }>`
    SELECT journeyId, userId, status, submittedAt, updatedAt, checklistJson
    FROM journey WHERE sgiId = ${sgiId}
    ORDER BY updatedAt DESC LIMIT 100
  `.all().map((row) => {
    const checklist = JSON.parse(row.checklistJson) as Record<string, boolean>
    return {
      journeyId: row.journeyId,
      applicant: `Prospect #${String(row.userId).padStart(4, '0')}`,
      status: row.status,
      statusLabel: JOURNEY_STATUS_LABELS[row.status],
      submittedAt: row.submittedAt,
      updatedAt: row.updatedAt,
      documentsReady: sgi.checklist.filter((item) => checklist[item.id]).length,
      documentsTotal: sgi.checklist.length,
    }
  })
  return {
    sgi: { id: sgi.id, name: sgi.name, isDemo: sgi.isDemo },
    funnel,
    applications,
    partnerStatuses: PARTNER_STATUSES.map((status) => ({
      status,
      label: JOURNEY_STATUS_LABELS[status],
    })),
  }
}

/**
 * Status update from the SGI. In a pilot this is called by the partner's API
 * or back-office; in the demo it is triggered from the partner dashboard.
 */
export const applyPartnerStatus = (
  sgiId: string,
  journeyId: number,
  status: JourneyStatus,
  note?: string,
) => {
  if (!PARTNER_STATUSES.includes(status)) {
    throw new respond.BadRequestError({ message: 'Statut non autorisé.' })
  }
  const row = sqlQuery<
    { userId: number; status: JourneyStatus; sgiId: string | null }
  >`
    SELECT userId, status, sgiId FROM journey WHERE journeyId = ${journeyId}
  `.get()
  if (!row || row.sgiId !== sgiId) {
    throw new respond.NotFoundError({
      message: 'Dossier introuvable pour cette SGI.',
    })
  }
  if (statusRank(row.status) < statusRank('SUBMITTED')) {
    throw new respond.BadRequestError({
      message: 'Ce dossier n’a pas encore été transmis.',
    })
  }
  withTransaction(() => {
    sql`
      UPDATE journey SET status = ${status}, updatedAt = ${Date.now()}
      WHERE journeyId = ${journeyId}
    `.run()
    logStatus(journeyId, status, note)
    if (status === 'ACCOUNT_OPENED') {
      trackEvent(row.userId, 'account_opened', { sgiId })
    }
  })
  return getPartnerOverview(sgiId)
}

export const listSgiPartners = () => SGI_PARTNERS

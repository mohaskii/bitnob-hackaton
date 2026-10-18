import { useEffect } from 'preact/hooks'
import { ArrowLeft, RefreshCw } from 'lucide-preact'
import { Pill, SectionTitle } from '../components/ui.tsx'
import { dateTime, fcfa } from '../lib/format.ts'
import { navigateUrl } from '../router.tsx'
import {
  confirmFundingCredit,
  loadPartner,
  overview,
  partnerError,
  partnerFundings,
  partnerSgiId,
  setApplicationStatus,
  setPartnerSgi,
} from '../features/partner/partner-state.ts'

const SGI_OPTIONS = [
  { id: 'atlantique', name: 'Atlantique Capital' },
  { id: 'sahel', name: 'Sahel Bourse' },
  { id: 'lagune', name: 'Lagune Invest' },
]

/** Funding statuses worded from the SGI's point of view. */
const PARTNER_FUNDING_LABELS: Record<string, string> = {
  AWAITING_DEPOSIT: 'Annoncé',
  DEPOSIT_CONFIRMED: 'En conversion',
  PAYOUT_PROCESSING: 'Versement en cours',
  DELIVERED_TO_SGI: 'Reçu · à créditer',
  CREDITED: 'Crédité au client',
  FAILED: 'Échoué',
  EXPIRED: 'Expiré',
}

const startPartner = () => {
  void loadPartner()
  const interval = setInterval(() => void loadPartner(), 8000)
  return () => clearInterval(interval)
}

const PartnerHeader = () => (
  <section class='tk-hero rounded-b-[2.25rem] px-5 pt-[calc(env(safe-area-inset-top,0px)+1rem)] pb-5 flex flex-col gap-4'>
    <div class='flex items-center justify-between'>
      <button
        type='button'
        onClick={() => navigateUrl('/')}
        class='flex items-center gap-1 text-[13px] font-bold text-white/70 cursor-pointer'
      >
        <ArrowLeft size={16} /> Retour
      </button>
      <Pill tone='dark'>Démo partenaire</Pill>
    </div>
    <div>
      <h1 class='text-[26px] font-black tracking-tight'>Espace SGI</h1>
      <p class='text-[13px] text-white/60'>
        Ce que voit la SGI : prospects mieux informés, dossiers, fonds reçus via
        Bitnob.
      </p>
    </div>
    <div class='flex gap-2 overflow-x-auto no-scrollbar'>
      {SGI_OPTIONS.map((sgi) => (
        <button
          key={sgi.id}
          type='button'
          onClick={() => setPartnerSgi(sgi.id)}
          class={`px-3.5 py-1.5 rounded-full text-[12px] font-bold whitespace-nowrap cursor-pointer ${
            partnerSgiId.value === sgi.id
              ? 'bg-primary text-primary-content'
              : 'bg-white/10 text-white/70'
          }`}
        >
          {sgi.name}
        </button>
      ))}
    </div>
  </section>
)

const Funnel = () => {
  const funnel = overview.value?.funnel ?? []
  const max = Math.max(1, ...funnel.map((step) => step.value))
  return (
    <section class='flex flex-col gap-3'>
      <SectionTitle
        title='Entonnoir d’acquisition'
        action={
          <button
            type='button'
            onClick={() => void loadPartner()}
            class='text-base-content/40 cursor-pointer'
          >
            <RefreshCw size={15} />
          </button>
        }
      />
      <div class='bg-base-100 rounded-3xl p-4 flex flex-col gap-3'>
        {funnel.map((step) => (
          <div key={step.id}>
            <div class='flex justify-between text-[12.5px] font-semibold mb-1'>
              <span class='text-base-content/70'>{step.label}</span>
              <span class='font-black tk-mono'>{step.value}</span>
            </div>
            <div class='h-2.5 rounded-full bg-base-200 overflow-hidden'>
              <div
                class='h-full rounded-full bg-primary transition-[width] duration-500'
                style={{ width: `${(step.value / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
        <p class='text-[11px] text-base-content/45'>
          Données agrégées, sans information personnelle. Les dossiers sont
          pseudonymisés.
        </p>
      </div>
    </section>
  )
}

const Applications = () => {
  const data = overview.value
  const apps = (data?.applications ?? []).filter((a) => a.submittedAt)
  return (
    <section class='flex flex-col gap-3'>
      <SectionTitle title='Dossiers d’ouverture' />
      {apps.length === 0 && (
        <p class='bg-base-100 rounded-2xl p-4 text-[13px] text-base-content/55'>
          Aucun dossier transmis pour l’instant.
        </p>
      )}
      {apps.map((app) => (
        <div
          key={app.journeyId}
          class='bg-base-100 rounded-3xl p-4 flex flex-col gap-3'
        >
          <div class='flex items-start justify-between gap-2'>
            <div>
              <p class='text-[14px] font-extrabold'>{app.applicant}</p>
              <p class='text-[11.5px] text-base-content/50'>
                Transmis le {dateTime(app.submittedAt)} · pièces{' '}
                {app.documentsReady}/
                {app.documentsTotal}
              </p>
            </div>
            <Pill tone={app.status === 'FUNDED' ? 'success' : 'primary'}>
              {app.statusLabel}
            </Pill>
          </div>
          <div class='flex gap-1.5 flex-wrap'>
            {(data?.partnerStatuses ?? []).filter((s) => s.status !== 'FUNDED')
              .map((s) => (
                <button
                  key={s.status}
                  type='button'
                  disabled={app.status === s.status || app.status === 'FUNDED'}
                  onClick={() =>
                    void setApplicationStatus(app.journeyId, s.status)}
                  class='px-2.5 py-1.5 rounded-xl bg-base-200 text-[11.5px] font-bold cursor-pointer disabled:opacity-35'
                >
                  {s.label}
                </button>
              ))}
          </div>
        </div>
      ))}
    </section>
  )
}

const IncomingFunds = () => (
  <section class='flex flex-col gap-3'>
    <SectionTitle title='Fonds reçus via Bitnob' />
    {partnerFundings.value.length === 0 && (
      <p class='bg-base-100 rounded-2xl p-4 text-[13px] text-base-content/55'>
        Aucun versement. Chaque versement arrive en FCFA avec la référence du
        client.
      </p>
    )}
    {partnerFundings.value.map((f) => (
      <div
        key={f.fundingId}
        class='bg-base-100 rounded-3xl p-4 flex flex-col gap-2.5'
      >
        <div class='flex items-center justify-between gap-2'>
          <p class='text-[20px] font-black tk-mono whitespace-nowrap'>
            {fcfa(f.amountFcfa)}
          </p>
          <Pill
            tone={f.status === 'CREDITED'
              ? 'success'
              : f.status === 'DELIVERED_TO_SGI'
              ? 'primary'
              : 'neutral'}
          >
            {PARTNER_FUNDING_LABELS[f.status] ?? f.statusLabel}
          </Pill>
        </div>
        <div class='text-[11.5px] text-base-content/55 leading-relaxed'>
          <p>
            {f.applicant} · réf.{' '}
            <span class='font-bold tk-mono'>{f.reference}</span>
          </p>
          <p>
            Envoyé en {f.asset} via Bitnob · {dateTime(f.createdAt)} · {f.mode}
          </p>
        </div>
        {f.status === 'DELIVERED_TO_SGI' && (
          <button
            type='button'
            onClick={() => void confirmFundingCredit(f.fundingId)}
            class='h-11 rounded-2xl bg-neutral text-neutral-content text-[13px] font-bold cursor-pointer'
          >
            Confirmer le crédit sur le compte client
          </button>
        )}
      </div>
    ))}
  </section>
)

/** PartnerScreen: demo stand-in for the SGI back-office. */
export const PartnerScreen = () => {
  useEffect(startPartner, [])
  return (
    <div class='flex-1 flex flex-col w-full pb-6'>
      <PartnerHeader />
      <div class='px-4 pt-5 flex flex-col gap-6'>
        {partnerError.value && (
          <p class='text-error text-[13px]'>{partnerError.value}</p>
        )}
        <Funnel />
        <IncomingFunds />
        <Applications />
      </div>
    </div>
  )
}

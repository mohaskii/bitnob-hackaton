import {
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  FileCheck2,
  Send,
} from 'lucide-preact'
import { navigateUrl } from '../../router.tsx'
import {
  DemoPartnerTag,
  Pill,
  PrimaryButton,
  SectionTitle,
} from '../../components/ui.tsx'
import { ExplainChip } from '../learn/Explainer.tsx'
import { dateTime, fcfa } from '../../lib/format.ts'
import {
  cheapestSgiId,
  chooseSgi,
  COMPARE_AMOUNT_FCFA,
  comparison,
  consentChecked,
  isAccountOpen,
  journey,
  selectedSgi,
  setConsent,
  type SgiPartner,
  startChangeSgi,
  submitFile,
  submitting,
  toggleChecklistItem,
} from './journey-state.ts'

const pctLabel = (rate: number) =>
  `${(rate * 100).toLocaleString('fr-FR', { maximumFractionDigits: 2 })} %`

const SgiFacts = ({ sgi, fees }: { sgi: SgiPartner; fees: number }) => (
  <dl class='grid grid-cols-2 gap-x-3 gap-y-2.5 text-[12px]'>
    <div>
      <dt class='text-base-content/50 font-semibold'>
        Frais sur {fcfa(COMPARE_AMOUNT_FCFA)}
      </dt>
      <dd class='font-black tk-mono text-[14px]'>{fcfa(fees)}</dd>
    </div>
    <div>
      <dt class='text-base-content/50 font-semibold'>Courtage</dt>
      <dd class='font-bold'>
        {pctLabel(sgi.schedule.brokerageRate)} · min.{' '}
        {fcfa(sgi.schedule.brokerageMinFcfa)}
      </dd>
    </div>
    <div>
      <dt class='text-base-content/50 font-semibold'>Dépôt minimum</dt>
      <dd class='font-bold'>
        {sgi.minimumDepositFcfa ? fcfa(sgi.minimumDepositFcfa) : 'Aucun'}
      </dd>
    </div>
    <div>
      <dt class='text-base-content/50 font-semibold'>Ouverture</dt>
      <dd class='font-bold'>{sgi.openingMode} · {sgi.openingDelayLabel}</dd>
    </div>
    <div>
      <dt class='text-base-content/50 font-semibold'>Droits de garde</dt>
      <dd class='font-bold'>{sgi.custodyFeeLabel}</dd>
    </div>
    <div>
      <dt class='text-base-content/50 font-semibold'>Pièces à fournir</dt>
      <dd class='font-bold'>{sgi.checklist.length} documents</dd>
    </div>
  </dl>
)

const SgiCard = ({ sgi, fees }: { sgi: SgiPartner; fees: number }) => (
  <div class='bg-base-100 rounded-3xl p-4 flex flex-col gap-3.5'>
    <div class='flex items-start justify-between gap-3'>
      <div class='flex items-center gap-3 min-w-0'>
        <span
          class='w-11 h-11 rounded-2xl flex items-center justify-center font-black text-[15px] flex-shrink-0'
          style={{ background: sgi.accentColor, color: '#1a1a1a' }}
        >
          {sgi.name.slice(0, 1)}
        </span>
        <div class='min-w-0'>
          <p class='text-[15px] font-extrabold'>{sgi.name}</p>
          <p class='text-[12px] text-base-content/55'>{sgi.country}</p>
        </div>
      </div>
      <div class='flex flex-col items-end gap-1'>
        {cheapestSgiId.value === sgi.id && (
          <Pill tone='success'>Frais les plus bas</Pill>
        )}
        <DemoPartnerTag />
      </div>
    </div>
    <p class='text-[13px] font-semibold'>{sgi.tagline}</p>
    <SgiFacts sgi={sgi} fees={fees} />
    <div class='flex items-center gap-2 bg-base-200 rounded-xl px-3 py-2 text-[11.5px] font-semibold'>
      <Send size={13} class='flex-shrink-0' />
      {sgi.bitnobCollection.available
        ? `Approvisionnement Bitnob vers ${sgi.bitnobCollection.channel}`
        : 'Pas d’approvisionnement Bitnob : corridor FCFA non ouvert au Bénin'}
    </div>
    <PrimaryButton
      tone={journey.value?.sgiId === sgi.id ? 'ghost' : 'dark'}
      onClick={() => void chooseSgi(sgi.id)}
    >
      {journey.value?.sgiId === sgi.id ? 'SGI choisie' : `Choisir ${sgi.name}`}
    </PrimaryButton>
  </div>
)

export const SgiComparison = () => (
  <section class='flex flex-col gap-3'>
    <SectionTitle
      title='Comparer les SGI'
      action={<ExplainChip term='sgi'>C’est quoi ?</ExplainChip>}
    />
    <p class='text-[12.5px] text-base-content/60'>
      Frais calculés pour un achat de {fcfa(COMPARE_AMOUNT_FCFA)}{' '}
      : courtage, taxe, commissions BRVM et DC/BR.
    </p>
    {comparison.value.map(({ sgi, totalFeesFcfa }) => (
      <SgiCard key={sgi.id} sgi={sgi} fees={totalFeesFcfa} />
    ))}
    <p class='text-[11px] text-base-content/45'>
      {comparison.value[0]?.sgi.source}{' '}
      Vérifiez l’agrément d’une SGI sur le site de l’AMF-UMOA.
    </p>
  </section>
)

export const SelectedSgiBanner = () => {
  const sgi = selectedSgi.value
  if (!sgi) return null
  return (
    <div class='bg-neutral text-neutral-content rounded-3xl p-4 flex items-center gap-3'>
      <span
        class='w-11 h-11 rounded-2xl flex items-center justify-center font-black flex-shrink-0'
        style={{ background: sgi.accentColor, color: '#1a1a1a' }}
      >
        {sgi.name.slice(0, 1)}
      </span>
      <div class='min-w-0 flex-1'>
        <p class='text-[11px] text-white/50 font-semibold'>Votre SGI</p>
        <p class='text-[15px] font-extrabold'>{sgi.name}</p>
        <p class='text-[11.5px] text-white/55'>
          {sgi.openingMode} · {sgi.openingDelayLabel}
        </p>
      </div>
      {journey.value &&
        ['EXPLORING', 'SGI_SELECTED'].includes(journey.value.status) && (
        <button
          type='button'
          onClick={startChangeSgi}
          class='text-[12px] font-bold text-primary cursor-pointer'
        >
          Changer
        </button>
      )}
    </div>
  )
}

export const DocumentChecklist = () => (
  <section class='flex flex-col gap-3'>
    <SectionTitle
      title='Préparer vos pièces'
      action={<ExplainChip term='compteTitres' />}
    />
    <div class='bg-base-100 rounded-3xl p-2'>
      {(journey.value?.checklist ?? []).map((item) => (
        <button
          key={item.id}
          type='button'
          onClick={() => void toggleChecklistItem(item.id, !item.done)}
          class='w-full flex items-start gap-3 px-2.5 py-3 rounded-2xl text-left hover:bg-base-200 cursor-pointer'
        >
          <span
            class={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
              item.done
                ? 'bg-success text-success-content'
                : 'border-2 border-base-300'
            }`}
          >
            {item.done && <Check size={15} strokeWidth={3} />}
          </span>
          <span class='min-w-0'>
            <span class='block text-[13.5px] font-bold'>{item.label}</span>
            <span class='block text-[12px] text-base-content/55 mt-0.5'>
              {item.hint}
            </span>
          </span>
        </button>
      ))}
    </div>
    <p class='text-[11.5px] text-base-content/50 px-1'>
      Cochez ce que vous avez sous la main. Vous transmettrez les documents
      directement à la SGI, selon sa procédure.
    </p>
  </section>
)

export const SubmitPanel = () => (
  <section class='bg-base-100 rounded-3xl p-4 flex flex-col gap-3'>
    <label class='flex items-start gap-3 cursor-pointer'>
      <input
        type='checkbox'
        checked={consentChecked.value}
        onChange={(e) => setConsent((e.target as HTMLInputElement).checked)}
        class='checkbox checkbox-sm mt-0.5'
      />
      <span class='text-[12.5px] text-base-content/75 leading-relaxed'>
        J’accepte que TekkiTrade transmette ma demande d’ouverture et mes
        coordonnées à{' '}
        {selectedSgi.value?.name}, qui reste seule responsable de l’ouverture du
        compte et des vérifications d’identité.
      </span>
    </label>
    <PrimaryButton
      onClick={() => void submitFile()}
      disabled={!journey.value?.checklistReady || !consentChecked.value}
      pending={submitting.value}
    >
      <FileCheck2 size={18} /> Transmettre mon dossier
    </PrimaryButton>
    {!journey.value?.checklistReady && (
      <p class='text-[11.5px] text-base-content/50 text-center'>
        Toutes les pièces obligatoires doivent être prêtes.
      </p>
    )}
  </section>
)

export const StatusTimeline = () => (
  <section class='flex flex-col gap-3'>
    <SectionTitle title='Suivi de votre dossier' />
    <div class='bg-base-100 rounded-3xl p-4 flex flex-col'>
      {(journey.value?.timeline ?? []).map((entry, index, all) => {
        const last = index === all.length - 1
        return (
          <div key={`${entry.status}-${entry.createdAt}`} class='flex gap-3'>
            <div class='flex flex-col items-center'>
              <span
                class={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                  last
                    ? 'bg-primary text-primary-content tk-pulse'
                    : 'bg-success/15 text-success'
                }`}
              >
                {last ? <Clock size={14} /> : <CheckCircle2 size={15} />}
              </span>
              {!last && <span class='w-0.5 flex-1 bg-base-300 my-1' />}
            </div>
            <div class={last ? '' : 'pb-4'}>
              <p class='text-[13.5px] font-bold'>{entry.label}</p>
              <p class='text-[11.5px] text-base-content/50'>
                {dateTime(entry.createdAt)}
                {entry.note ? ` · ${entry.note}` : ''}
              </p>
            </div>
          </div>
        )
      })}
    </div>
    <p class='text-[11.5px] text-base-content/50 px-1'>
      Les statuts sont communiqués par la SGI. Dans cette démo, ils sont mis à
      jour depuis l’espace SGI.
    </p>
    {journey.value?.status === 'INFO_REQUESTED' && (
      <p class='text-[12.5px] font-semibold bg-warning/20 rounded-2xl px-3.5 py-3'>
        La SGI demande un complément. Elle vous contacte directement par email
        ou téléphone.
      </p>
    )}
  </section>
)

export const FundCallToAction = () =>
  isAccountOpen.value
    ? (
      <button
        type='button'
        onClick={() => navigateUrl('/fund')}
        class='tk-hero rounded-3xl p-4 flex items-center gap-3 text-left cursor-pointer active:scale-[0.99] transition-transform'
      >
        <span class='w-11 h-11 rounded-2xl bg-primary text-primary-content flex items-center justify-center flex-shrink-0'>
          <Send size={19} />
        </span>
        <span class='flex-1'>
          <span class='block text-[15px] font-extrabold'>
            {journey.value?.status === 'FUNDED'
              ? 'Compte approvisionné'
              : 'Compte ouvert : approvisionnez-le'}
          </span>
          <span class='block text-[12px] text-white/60'>
            USDT, USDC ou Bitcoin depuis n’importe où, reçus en FCFA par la SGI.
          </span>
        </span>
        <ArrowRight size={18} />
      </button>
    )
    : null

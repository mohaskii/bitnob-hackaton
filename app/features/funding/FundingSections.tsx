import { AlertTriangle, Check, Copy, Lock, Zap } from 'lucide-preact'
import { navigateUrl } from '../../router.tsx'
import {
  AmountRow,
  InlineError,
  Pill,
  PrimaryButton,
  SectionTitle,
  Spinner,
} from '../../components/ui.tsx'
import { ExplainChip } from '../learn/Explainer.tsx'
import { dateTime, dec, fcfa } from '../../lib/format.ts'
import {
  isAccountOpen,
  journey,
  selectedSgi,
} from '../journey/journey-state.ts'
import {
  actionPending,
  activeFunding,
  AMOUNT_PRESETS,
  amountFcfa,
  asset,
  copied,
  copyInstruction,
  createFunding,
  creating,
  depositQrSvg,
  FUNDING_PIPELINE,
  type FundingAsset,
  fundingMode,
  pastFundings,
  pipelineIndex,
  quote,
  quoteError,
  quoting,
  SENDER_COUNTRY_OPTIONS,
  senderCountry,
  senderName,
  setAmount,
  setAsset,
  setSenderCountry,
  setSenderName,
  simulateDeposit,
} from './funding-state.ts'

const ASSETS: { id: FundingAsset; label: string; sub: string }[] = [
  { id: 'USDC', label: 'USDC', sub: 'Stablecoin' },
  { id: 'USDT', label: 'USDT', sub: 'Stablecoin' },
  { id: 'BTC', label: 'Bitcoin', sub: 'Lightning' },
]

export const FundingPipeline = () => (
  <div class='flex flex-col gap-0'>
    {FUNDING_PIPELINE.map((step, index) => {
      const current = pipelineIndex.value
      const done = current > index
      const active = current === index
      return (
        <div key={step.status} class='flex gap-3'>
          <div class='flex flex-col items-center'>
            <span
              class={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black flex-shrink-0 ${
                done
                  ? 'bg-primary text-primary-content'
                  : active
                  ? 'bg-white text-neutral tk-pulse'
                  : 'bg-white/10 text-white/50'
              }`}
            >
              {done ? <Check size={14} strokeWidth={3} /> : index + 1}
            </span>
            {index < FUNDING_PIPELINE.length - 1 && (
              <span
                class={`w-0.5 h-5 ${done ? 'bg-primary' : 'bg-white/15'}`}
              />
            )}
          </div>
          <div class='pt-0.5'>
            <p
              class={`text-[13px] font-bold ${
                active || done ? 'text-white' : 'text-white/55'
              }`}
            >
              {step.title}
            </p>
            <p class='text-[11px] text-white/45'>{step.detail}</p>
          </div>
        </div>
      )
    })}
  </div>
)

const AccountGate = () => {
  if (isAccountOpen.value) return null
  const hasSgi = Boolean(journey.value?.sgiId)
  return (
    <div class='bg-base-100 rounded-3xl p-4 flex items-start gap-3'>
      <span class='w-10 h-10 rounded-xl bg-base-200 flex items-center justify-center flex-shrink-0'>
        <Lock size={17} />
      </span>
      <div class='flex-1 flex flex-col gap-2'>
        <p class='text-[13.5px] font-bold'>
          {hasSgi
            ? 'En attente de l’ouverture de votre compte'
            : 'Choisissez d’abord une SGI'}
        </p>
        <p class='text-[12.5px] text-base-content/60'>
          Les fonds sont versés à la SGI sur votre compte-titres : il doit être
          ouvert avant le premier envoi. Vous pouvez déjà simuler le coût
          ci-dessous.
        </p>
        <button
          type='button'
          onClick={() => navigateUrl('/journey')}
          class='self-start text-[12.5px] font-bold underline cursor-pointer'
        >
          {hasSgi ? 'Suivre mon dossier' : 'Comparer les SGI'}
        </button>
      </div>
    </div>
  )
}

const AssetPicker = () => (
  <div class='grid grid-cols-3 gap-2'>
    {ASSETS.map((a) => (
      <button
        key={a.id}
        type='button'
        onClick={() => setAsset(a.id)}
        class={`rounded-2xl py-2.5 flex flex-col items-center cursor-pointer transition-colors ${
          asset.value === a.id
            ? 'bg-neutral text-neutral-content'
            : 'bg-base-100'
        }`}
      >
        <span class='text-[14px] font-extrabold flex items-center gap-1'>
          {a.id === 'BTC' && <Zap size={13} />} {a.label}
        </span>
        <span
          class={`text-[10.5px] ${
            asset.value === a.id ? 'text-white/55' : 'text-base-content/45'
          }`}
        >
          {a.sub}
        </span>
      </button>
    ))}
  </div>
)

const AmountInput = () => (
  <div class='flex flex-col gap-2.5'>
    <div class='bg-base-100 rounded-2xl px-4 py-3'>
      <p class='text-[11px] font-bold text-base-content/50'>
        Montant à recevoir par la SGI
      </p>
      <div class='flex items-baseline gap-2'>
        <input
          type='number'
          inputMode='numeric'
          value={amountFcfa.value || ''}
          onInput={(e) =>
            setAmount(Number((e.target as HTMLInputElement).value))}
          class='flex-1 min-w-0 bg-transparent text-[28px] font-black tk-mono focus:outline-none'
        />
        <span class='text-[13px] font-bold text-base-content/45'>FCFA</span>
      </div>
    </div>
    <div class='flex gap-2 overflow-x-auto no-scrollbar'>
      {AMOUNT_PRESETS.map((value) => (
        <button
          key={value}
          type='button'
          onClick={() => setAmount(value)}
          class={`px-3 py-1.5 rounded-full text-[12px] font-bold whitespace-nowrap cursor-pointer ${
            amountFcfa.value === value
              ? 'bg-neutral text-neutral-content'
              : 'bg-base-100'
          }`}
        >
          {value.toLocaleString('fr-FR')}
        </button>
      ))}
    </div>
  </div>
)

const QuoteCard = () => {
  const q = quote.value
  if (!q) return <InlineError message={quoteError.value} />
  return (
    <div class='bg-base-100 rounded-3xl px-4 py-3'>
      <div class='flex items-center justify-between'>
        <p class='text-[11px] font-bold text-base-content/50 uppercase tracking-wide'>
          Vous envoyez
        </p>
        {quoting.value && <Spinner size={14} />}
      </div>
      <p class='text-[30px] font-black tk-mono leading-tight'>
        {q.cryptoAmount} <span class='text-[16px]'>{q.asset}</span>
      </p>
      <p class='text-[11.5px] text-base-content/50'>Réseau {q.network}</p>
      <div class='border-t border-base-200 mt-3'>
        <AmountRow
          label='Taux Bitnob'
          hint={q.mode === 'simulation'
            ? 'Taux indicatif (simulation)'
            : 'Cotation Bitnob'}
          value={`1 ${q.asset} = ${dec(q.rate)} FCFA`}
        />
        <AmountRow label='Frais Bitnob' value={fcfa(q.feesFcfa)} />
        <AmountRow
          label={`Reçu par ${q.sgi.name}`}
          hint={q.sgi.channel}
          value={fcfa(q.settlementAmountFcfa)}
          strong
        />
      </div>
      <p class='text-[11px] text-base-content/45 pb-1'>
        Cotation valable jusqu’à{' '}
        {dateTime(q.expiresAt)}. Le montant final est recalculé à la réception
        de votre envoi.
      </p>
      {q.belowSgiMinimum && (
        <p class='text-[12px] font-semibold bg-warning/20 rounded-xl px-3 py-2 mt-1 flex gap-2'>
          <AlertTriangle size={15} class='flex-shrink-0' />
          {q.sgi.name} demande un dépôt minimum de{' '}
          {fcfa(q.sgiMinimumDepositFcfa)} à l’ouverture.
        </p>
      )}
    </div>
  )
}

const SenderFields = () => (
  <div class='bg-base-100 rounded-2xl p-3 flex flex-col gap-2'>
    <p class='text-[11px] font-bold text-base-content/50 px-1'>
      Expéditeur (exigé par Bitnob pour les versements en FCFA)
    </p>
    <input
      type='text'
      value={senderName.value}
      onInput={(e) => setSenderName((e.target as HTMLInputElement).value)}
      placeholder='Nom complet'
      class='h-11 px-3 rounded-xl bg-base-200 text-[13.5px] focus:outline-none focus:ring-2 focus:ring-primary'
    />
    <select
      value={senderCountry.value}
      onChange={(e) => setSenderCountry((e.target as HTMLSelectElement).value)}
      class='h-11 px-3 rounded-xl bg-base-200 text-[13.5px] focus:outline-none'
    >
      {SENDER_COUNTRY_OPTIONS.map(([code, label]) => (
        <option key={code} value={code}>Pays de résidence : {label}</option>
      ))}
    </select>
  </div>
)

const CorridorUnavailable = () => (
  <div class='bg-base-100 rounded-3xl p-4 flex flex-col gap-2'>
    <p class='text-[13.5px] font-bold'>
      {selectedSgi.value?.name} se finance par virement ou Mobile Money local
    </p>
    <p class='text-[12.5px] text-base-content/60'>
      Bitnob ne verse pas encore de FCFA vers ce pays (corridors ouverts : Côte
      d’Ivoire, Sénégal, Niger). Pour financer depuis l’étranger via Bitnob,
      choisissez une SGI en Côte d’Ivoire ou au Sénégal.
    </p>
  </div>
)

export const FundingCalculator = () => {
  if (activeFunding.value) return null
  if (!journey.value?.sgiId) return <AccountGate />
  if (selectedSgi.value && !selectedSgi.value.bitnobCollection.available) {
    return <CorridorUnavailable />
  }
  return (
    <section class='flex flex-col gap-3'>
      <AccountGate />
      <SectionTitle
        title='Calculer mon envoi'
        action={<ExplainChip term='bitnob'>Comment ça marche ?</ExplainChip>}
      />
      <AmountInput />
      <AssetPicker />
      <QuoteCard />
      <SenderFields />
      <PrimaryButton
        onClick={() => void createFunding()}
        disabled={!isAccountOpen.value || !quote.value ||
          senderName.value.trim().length < 3}
        pending={creating.value}
      >
        Obtenir mon instruction de paiement
      </PrimaryButton>
    </section>
  )
}

const ReferenceBlock = () => (
  <div class='bg-neutral text-neutral-content rounded-2xl px-4 py-3'>
    <p class='text-[11px] text-white/50 font-semibold'>
      Votre référence de versement
    </p>
    <p class='text-[18px] font-black tracking-wider tk-mono'>
      {activeFunding.value?.reference}
    </p>
    <p class='text-[11px] text-white/50'>
      Transmise par Bitnob à {activeFunding.value?.sgiName}{' '}
      pour créditer votre compte.
    </p>
  </div>
)

const DepositInstruction = () => {
  const f = activeFunding.value!
  return (
    <div class='bg-base-100 rounded-3xl p-4 flex flex-col items-center gap-3'>
      <p class='text-[13px] font-semibold text-center'>
        Envoyez exactement{' '}
        <span class='font-black'>
          {f.asset === 'BTC'
            ? `${dec(Number(f.cryptoAmount) * 1e8)} sats`
            : `${f.cryptoAmount} ${f.asset}`}
        </span>{' '}
        sur le réseau {f.depositNetwork}
      </p>
      {depositQrSvg.value && (
        <div
          class='w-48 h-48 bg-white rounded-2xl p-2'
          dangerouslySetInnerHTML={{ __html: depositQrSvg.value }}
        />
      )}
      <button
        type='button'
        onClick={() => void copyInstruction()}
        class='w-full bg-base-200 rounded-xl px-3 py-2.5 flex items-center gap-2 cursor-pointer'
      >
        <span class='flex-1 min-w-0 text-[11.5px] font-mono truncate text-left'>
          {f.depositInstruction}
        </span>
        {copied.value
          ? <Check size={15} class='text-success' />
          : <Copy size={15} />}
      </button>
      {f.mode === 'simulation' && (
        <p class='text-[11px] text-base-content/50 text-center'>
          Mode simulation : cette facture n’est pas payable. Utilisez le bouton
          ci-dessous.
        </p>
      )}
    </div>
  )
}

const ActiveControls = () => {
  const f = activeFunding.value!
  if (f.status !== 'AWAITING_DEPOSIT') {
    return (
      <p class='text-[12.5px] font-semibold bg-base-100 rounded-2xl px-4 py-3'>
        {f.status === 'DELIVERED_TO_SGI'
          ? `${
            fcfa(f.amountFcfa)
          } versés à ${f.sgiName}. Elle confirme le crédit sur votre compte espèces.`
          : f.statusLabel}
      </p>
    )
  }
  return f.mode === 'simulation'
    ? (
      <PrimaryButton
        tone='dark'
        onClick={() => void simulateDeposit(f.fundingId)}
        pending={actionPending.value}
      >
        Simuler la réception de mon envoi
      </PrimaryButton>
    )
    : (
      <p class='text-[12px] text-base-content/55 text-center flex items-center justify-center gap-2'>
        <Spinner size={13} />{' '}
        Vérification automatique auprès de Bitnob toutes les 10 s
      </p>
    )
}

export const ActiveFunding = () => {
  if (!activeFunding.value) return null
  return (
    <section class='flex flex-col gap-3'>
      <SectionTitle
        title='Versement en cours'
        action={<Pill tone='primary'>{activeFunding.value.statusLabel}</Pill>}
      />
      <ReferenceBlock />
      {activeFunding.value.status === 'AWAITING_DEPOSIT' && (
        <DepositInstruction />
      )}
      <ActiveControls />
    </section>
  )
}

export const FundingHistory = () => {
  const items = pastFundings.value
  if (items.length === 0) return null
  return (
    <section class='flex flex-col gap-3'>
      <SectionTitle title='Historique' />
      <div class='bg-base-100 rounded-3xl p-2'>
        {items.map((f) => (
          <div
            key={f.fundingId}
            class='flex items-center justify-between gap-3 px-2.5 py-2.5'
          >
            <div class='min-w-0'>
              <p class='text-[13.5px] font-bold'>
                {fcfa(f.amountFcfa)} → {f.sgiName}
              </p>
              <p class='text-[11.5px] text-base-content/50 truncate'>
                {f.cryptoAmount} {f.asset} · {f.reference} ·{' '}
                {dateTime(f.createdAt)}
              </p>
            </div>
            <Pill
              tone={f.status === 'CREDITED'
                ? 'success'
                : f.status === 'FAILED'
                ? 'error'
                : 'neutral'}
            >
              {f.statusLabel}
            </Pill>
          </div>
        ))}
      </div>
    </section>
  )
}

export const FundingDisclosure = () => (
  <p class='text-[11px] text-base-content/45 leading-relaxed'>
    TekkiTrade ne détient jamais vos fonds : Bitnob reçoit votre envoi, le
    convertit et verse des FCFA sur le portefeuille de collecte de la SGI. Mode
    actuel : {fundingMode.value === 'simulation'
      ? 'simulation, aucun transfert réel'
      : `Bitnob ${fundingMode.value}`}. La mise en service réelle suppose
    l’accord de la SGI, la vérification d’identité par Bitnob et la conformité
    aux règles de la BCEAO. {selectedSgi.value
      ? `Plafond par versement vers ${selectedSgi.value.name} : ${
        fcfa(selectedSgi.value.bitnobCollection.maxPerTransferFcfa)
      }.`
      : ''}
  </p>
)

import { CheckCircle2, ShieldCheck, Zap } from 'lucide-preact'
import { navigateUrl } from '../../router.tsx'
import {
  AmountRow,
  PrimaryButton,
  Sheet,
} from '../../components/ui.tsx'
import { ExplainChip, TipCard } from '../learn/Explainer.tsx'
import { dateTime, fcfa, signedFcfa } from '../../lib/format.ts'
import { closeFill, lastFill } from './trade-state.ts'
import { closeStock } from '../market/market-state.ts'

const NoteHeader = () => {
  const fill = lastFill.value!
  const isLive = Boolean(fill.sgiOrderReference)
  const isFractional = Boolean(fill.isFractional)

  return (
    <div class='bg-neutral text-neutral-content rounded-3xl p-5 flex flex-col items-center text-center gap-2'>
      <span class='w-14 h-14 rounded-full bg-primary text-primary-content flex items-center justify-center'>
        <CheckCircle2 size={28} />
      </span>
      <div class='flex items-center gap-1.5 mt-1'>
        <span class='text-[12px] font-bold px-2 py-0.5 rounded-full bg-base-100/20 text-neutral-content'>
          {isLive ? 'Exécution SGI Directe' : 'Simulation'}
        </span>
        {isFractional && (
          <span class='text-[12px] font-bold px-2 py-0.5 rounded-full bg-primary text-primary-content flex items-center gap-1'>
            <Zap size={11} />
            <span>Fractionné</span>
          </span>
        )}
      </div>
      <p class='text-[22px] font-black leading-tight'>
        {fill.quantity} {fill.symbol} à {fcfa(fill.priceFcfa)}
      </p>
      <p class='text-[12px] text-neutral-content/65'>
        {isLive ? `Réf SGI : ${fill.sgiOrderReference}` : `Ordre n°${fill.orderId}`} · {dateTime(fill.createdAt)}
      </p>
    </div>
  )
}

const NoteLines = () => {
  const fill = lastFill.value!
  const isLive = Boolean(fill.sgiOrderReference)

  return (
    <div class='bg-base-100 rounded-3xl px-4 py-2 flex flex-col gap-1'>
      <div class='flex items-center justify-between pt-1.5 pb-1'>
        <ExplainChip term='avisOpere'>Votre avis d’opéré</ExplainChip>
        <span class='text-[11px] font-semibold text-base-content/50'>
          {fill.sgiName}
        </span>
      </div>
      <AmountRow label='Titre' value={`${fill.symbol} · ${fill.name}`} />
      <AmountRow
        label='Quantité exécutée'
        value={`${fill.quantity} ${fill.isFractional ? 'part d’action' : 'titre(s)'}`}
      />
      <AmountRow
        label='Cours d’exécution'
        value={fcfa(fill.priceFcfa)}
      />
      <AmountRow label='Montant brut' value={fcfa(fill.grossFcfa)} />
      {fill.fees.lines.map((line) => (
        <AmountRow
          key={line.id}
          label={line.label}
          hint={line.rateLabel}
          value={fcfa(line.amountFcfa)}
        />
      ))}
      <div class='pt-1'>
        <AmountRow
          label={fill.side === 'BUY'
            ? 'Montant net débité'
            : 'Montant net crédité'}
          value={fcfa(fill.netFcfa)}
          strong
        />
        {fill.realizedPnlFcfa !== null && (
          <AmountRow
            label='Plus ou moins-value réalisée'
            value={signedFcfa(fill.realizedPnlFcfa)}
          />
        )}
        <AmountRow
          label={isLive ? 'Solde espèces disponible' : 'Solde fictif disponible'}
          value={fcfa(fill.cashAfterFcfa)}
        />
        {fill.settlementDate && (
          <AmountRow
            label='Règlement DC/BR (T+2)'
            value={fill.settlementDate}
          />
        )}
      </div>
    </div>
  )
}

const goToPortfolio = () => {
  closeFill()
  closeStock()
  navigateUrl('/portfolio')
}

const goToJourney = () => {
  closeFill()
  closeStock()
  navigateUrl('/journey')
}

/** Contract note supporting both live SGI execution and paper mode. */
export const ContractNote = () => (
  <Sheet
    open={lastFill.value !== null}
    onClose={closeFill}
    title={<p class='text-base font-extrabold'>Avis d’opéré</p>}
  >
    {lastFill.value && (
      <>
        <NoteHeader />
        <NoteLines />
        <TipCard term='reglement' />
        <PrimaryButton onClick={goToPortfolio}>
          Voir mon portefeuille
        </PrimaryButton>
        {!lastFill.value.sgiOrderReference && (
          <PrimaryButton tone='ghost' onClick={goToJourney}>
            Prêt pour le réel ? Choisir une SGI
          </PrimaryButton>
        )}
      </>
    )}
  </Sheet>
)

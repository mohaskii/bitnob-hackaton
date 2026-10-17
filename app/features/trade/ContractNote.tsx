import { CheckCircle2 } from 'lucide-preact'
import { navigateUrl } from '../../router.tsx'
import {
  AmountRow,
  PrimaryButton,
  Sheet,
  SimulatedTag,
} from '../../components/ui.tsx'
import { ExplainChip, TipCard } from '../learn/Explainer.tsx'
import { dateTime, fcfa, signedFcfa } from '../../lib/format.ts'
import { closeFill, lastFill } from './trade-state.ts'
import { closeStock } from '../market/market-state.ts'

const NoteHeader = () => {
  const fill = lastFill.value!
  return (
    <div class='tk-hero rounded-3xl p-5 flex flex-col items-center text-center gap-2'>
      <span class='w-14 h-14 rounded-full bg-primary text-primary-content flex items-center justify-center tk-pulse'>
        <CheckCircle2 size={28} />
      </span>
      <p class='text-[13px] font-semibold text-white/60 mt-1'>
        {fill.side === 'BUY' ? 'Achat' : 'Vente'} exécuté (simulation)
      </p>
      <p class='text-[22px] font-black'>
        {fill.quantity} {fill.symbol} à {fcfa(fill.priceFcfa)}
      </p>
      <p class='text-[12px] text-white/50'>
        Ordre n°{fill.orderId} · {dateTime(fill.createdAt)} · {fill.sgiName}
      </p>
    </div>
  )
}

const NoteLines = () => {
  const fill = lastFill.value!
  return (
    <div class='bg-base-100 rounded-3xl px-4 py-2'>
      <div class='flex items-center justify-between pt-1.5 pb-1'>
        <ExplainChip term='avisOpere'>Votre avis d’opéré</ExplainChip>
        <SimulatedTag />
      </div>
      <AmountRow label='Titre' value={`${fill.symbol} · ${fill.name}`} />
      <AmountRow label='Quantité' value={`${fill.quantity}`} />
      <AmountRow
        label='Cours d’exécution'
        hint={`Dernier cours publié le ${dateTime(fill.quoteTime)}`}
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
      <div class='mt-2 pt-1'>
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
          label='Solde fictif disponible'
          value={fcfa(fill.cashAfterFcfa)}
        />
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

/** Simulated contract note: teaches how to read the real one. */
export const ContractNote = () => (
  <Sheet
    open={lastFill.value !== null}
    onClose={closeFill}
    title={<p class='text-base font-extrabold'>Ordre exécuté</p>}
  >
    {lastFill.value && (
      <>
        <NoteHeader />
        <NoteLines />
        <TipCard term='reglement' />
        <PrimaryButton onClick={goToPortfolio}>
          Voir mon portefeuille
        </PrimaryButton>
        <PrimaryButton tone='ghost' onClick={goToJourney}>
          Prêt pour le réel ? Choisir une SGI
        </PrimaryButton>
      </>
    )}
  </Sheet>
)

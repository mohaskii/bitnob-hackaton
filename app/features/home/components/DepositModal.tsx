import { useState } from 'preact/hooks'
import { AlertCircle, Check, Copy, QrCode, X, Zap } from 'lucide-preact'
import qrcode from 'qrcode-generator'
import {
  balanceFcfa,
  balanceUsdt,
  closeDepositModal,
  isDepositModalOpen,
} from '../home-state.ts'
import { api, errorMessage } from '../../../lib/api.ts'
import { showToast } from '../../../state.ts'

type FundingAsset = 'USDT' | 'USDC' | 'BTC'

export const DepositModal = () => {
  const isOpen = isDepositModalOpen.value
  if (!isOpen) return null

  const [amount, setAmount] = useState<number>(50000)
  const [asset, setAsset] = useState<FundingAsset>('USDT')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [instruction, setInstruction] = useState<string | null>(null)
  const [fundingId, setFundingId] = useState<number | null>(null)
  const [quoteDetails, setQuoteDetails] = useState<{
    cryptoAmount: string
    rate: number
    feesFcfa: number
  } | null>(null)
  const [copied, setCopied] = useState(false)

  const handleGenerate = async () => {
    setPending(true)
    setError(null)
    try {
      const q = await api.post<{
        quoteId: string
        cryptoAmount: string
        rate: number
        feesFcfa: number
      }>('/funding/quote', { asset, amountFcfa: amount })
      setQuoteDetails(q)

      const f = await api.post<{
        fundingId: number
        depositInstruction: string
      }>('/funding', {
        asset,
        amountFcfa: amount,
        senderName: 'Investisseur TekkiTrade',
        senderCountry: 'SN',
      })
      setFundingId(f.fundingId)
      setInstruction(f.depositInstruction)
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setPending(false)
    }
  }

  const handleCopy = () => {
    if (!instruction) return
    navigator.clipboard.writeText(instruction)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    showToast('Adresse copiée dans le presse-papier', 'success')
  }

  const handleSimulateSuccess = async () => {
    if (!fundingId) return
    setPending(true)
    try {
      await api.post('/funding/simulate-deposit', { fundingId })
      balanceFcfa.value += amount
      balanceUsdt.value = Number((balanceFcfa.value / 600).toFixed(2))
      showToast(
        `Dépôt de ${new Intl.NumberFormat('fr-FR').format(amount)} FCFA crédité !`,
        'success',
      )
      closeDepositModal()
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setPending(false)
    }
  }

  const renderQr = () => {
    if (!instruction) return null
    try {
      const qr = qrcode(0, 'M')
      qr.addData(asset === 'BTC' ? instruction.toUpperCase() : instruction)
      qr.make()
      const svg = qr.createSvgTag({ cellSize: 4, margin: 2, scalable: true })
      return (
        <div
          class='w-48 h-48 bg-white rounded-2xl p-2 mx-auto flex items-center justify-center shadow-inner [&>svg]:w-full [&>svg]:h-full'
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      )
    } catch {
      return (
        <div class='w-48 h-48 bg-base-200 rounded-2xl flex items-center justify-center text-xs text-base-content/50'>
          Code QR
        </div>
      )
    }
  }

  return (
    <div
      class='fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs select-none'
      onClick={(e) => {
        if (e.target === e.currentTarget) closeDepositModal()
      }}
    >
      <div class='w-full sm:max-w-md bg-base-100 rounded-t-3xl sm:rounded-3xl p-5 pb-[max(1.25rem,calc(env(safe-area-inset-bottom,0px)+1rem))] flex flex-col gap-4 shadow-2xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom duration-200'>
        <div class='flex items-center justify-between pb-2 border-b border-base-200'>
          <div class='flex items-center gap-2'>
            <div class='w-8 h-8 rounded-full bg-primary/20 text-primary-content flex items-center justify-center font-bold'>
              <Zap size={16} />
            </div>
            <div>
              <h3 class='text-sm font-extrabold text-base-content tracking-tight'>
                Approvisionnement via Bitnob
              </h3>
              <p class='text-[11px] text-base-content/50'>
                Lightning Network & Stablecoins
              </p>
            </div>
          </div>
          <button
            type='button'
            onClick={closeDepositModal}
            class='w-7 h-7 rounded-full flex items-center justify-center text-base-content/60 hover:text-base-content hover:bg-base-200 cursor-pointer'
          >
            <X size={16} />
          </button>
        </div>

        {error && (
          <div class='p-3 bg-error/10 text-error rounded-xl text-xs flex items-center gap-2'>
            <AlertCircle size={16} class='flex-shrink-0' />
            <span>{error}</span>
          </div>
        )}

        {!instruction
          ? (
            <>
              <div class='flex flex-col gap-1.5'>
                <label class='text-xs font-semibold text-base-content/70'>
                  Montant à créditer (FCFA)
                </label>
                <div class='relative'>
                  <input
                    type='number'
                    value={amount}
                    onInput={(e) =>
                      setAmount(Number((e.target as HTMLInputElement).value))}
                    class='w-full bg-base-200 rounded-xl px-4 py-3 text-base font-extrabold text-base-content focus:outline-none focus:ring-2 focus:ring-primary/40'
                  />
                  <span class='absolute right-4 top-3.5 text-xs font-bold text-base-content/50'>
                    FCFA
                  </span>
                </div>
                <div class='flex gap-1.5 pt-1'>
                  {[10000, 25000, 50000, 100000].map((amt) => (
                    <button
                      key={amt}
                      type='button'
                      onClick={() => setAmount(amt)}
                      class={`flex-1 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-colors ${
                        amount === amt
                          ? 'bg-primary text-primary-content'
                          : 'bg-base-200 text-base-content/70 hover:bg-base-300'
                      }`}
                    >
                      {new Intl.NumberFormat('fr-FR').format(amt)}
                    </button>
                  ))}
                </div>
              </div>

              <div class='flex flex-col gap-1.5'>
                <label class='text-xs font-semibold text-base-content/70'>
                  Moyen de paiement Bitnob
                </label>
                <div class='grid grid-cols-3 gap-2'>
                  {[
                    { id: 'BTC', label: 'Lightning', sub: 'Instant · 0 frais' },
                    { id: 'USDT', label: 'USDT', sub: 'Polygon / ETH' },
                    { id: 'USDC', label: 'USDC', sub: 'Ethereum' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type='button'
                      onClick={() => setAsset(opt.id as FundingAsset)}
                      class={`p-3 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition-all border ${
                        asset === opt.id
                          ? 'border-primary bg-primary/10 text-primary-content'
                          : 'border-base-200 bg-base-200/50 text-base-content/70 hover:bg-base-200'
                      }`}
                    >
                      <span class='text-xs font-black'>{opt.label}</span>
                      <span class='text-[10px] text-base-content/50 mt-0.5'>
                        {opt.sub}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type='button'
                disabled={pending || amount < 100}
                onClick={handleGenerate}
                class='w-full py-3.5 bg-primary text-primary-content font-bold rounded-2xl text-xs flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-transform disabled:opacity-50'
              >
                {pending
                  ? 'Génération de la facture Bitnob...'
                  : `Payer ${new Intl.NumberFormat('fr-FR').format(amount)} FCFA via Bitnob`}
              </button>
            </>
          )
          : (
            <div class='flex flex-col gap-3.5'>
              {quoteDetails && (
                <div class='bg-base-200 rounded-2xl p-3 flex justify-between text-xs font-semibold'>
                  <div>
                    <span class='text-base-content/50 block text-[10.5px]'>
                      À envoyer
                    </span>
                    <span class='font-black text-primary text-sm'>
                      {quoteDetails.cryptoAmount} {asset}
                    </span>
                  </div>
                  <div class='text-right'>
                    <span class='text-base-content/50 block text-[10.5px]'>
                      Taux appliqué
                    </span>
                    <span class='font-bold'>
                      1 {asset} = {quoteDetails.rate.toFixed(1)} FCFA
                    </span>
                  </div>
                </div>
              )}

              {renderQr()}

              <div class='flex flex-col gap-1'>
                <span class='text-[11px] font-semibold text-base-content/60'>
                  {asset === 'BTC'
                    ? 'Facture Lightning (BOLT11)'
                    : `Adresse de versement ${asset}`}
                </span>
                <div class='flex items-center gap-2 bg-base-200 rounded-xl p-2'>
                  <span class='text-[11px] font-mono truncate flex-1 text-base-content/80 select-all'>
                    {instruction}
                  </span>
                  <button
                    type='button'
                    onClick={handleCopy}
                    class='btn btn-xs btn-primary rounded-lg font-bold flex items-center gap-1 cursor-pointer'
                  >
                    {copied ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copied ? 'Copié' : 'Copier'}</span>
                  </button>
                </div>
              </div>

              <div class='pt-2 flex flex-col gap-2'>
                <button
                  type='button'
                  onClick={handleSimulateSuccess}
                  disabled={pending}
                  class='w-full py-2.5 bg-success text-success-content font-bold rounded-xl text-xs cursor-pointer active:scale-98 transition-transform'
                >
                  {pending
                    ? 'Validation...'
                    : 'Simuler réception du dépôt (Mode Sandbox/Test)'}
                </button>
                <button
                  type='button'
                  onClick={() => {
                    setInstruction(null)
                    setQuoteDetails(null)
                  }}
                  class='w-full py-2 text-xs font-semibold text-base-content/60 hover:text-base-content cursor-pointer'
                >
                  Modifier le montant ou la devise
                </button>
              </div>
            </div>
          )}
      </div>
    </div>
  )
}

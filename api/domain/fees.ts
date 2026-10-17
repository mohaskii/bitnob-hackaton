/**
 * BRVM transaction cost model. Pure functions, no I/O.
 *
 * Exchange-level fees are published by the BRVM ("What are applicable fees"):
 * 0.20 % BRVM commission + 0.10 % DC/BR commission, paid by both buyer and
 * seller. Brokerage and the tax on it are set by each SGI in a tariff approved
 * by the CREPMF/AMF-UMOA, so they come from the partner's schedule.
 */

export const BRVM_FEE_SOURCE =
  'https://www.brvm.org/en/what-are-applicable-fees'
export const BRVM_COMMISSION_RATE = 0.002
export const DCBR_COMMISSION_RATE = 0.001

export type BrokerSchedule = {
  brokerageRate: number
  brokerageMinFcfa: number
  taxOnBrokerageRate: number
}

export type FeeLine = {
  id: 'brokerage' | 'tax' | 'brvm' | 'dcbr'
  label: string
  rateLabel: string
  amountFcfa: number
  payee: string
}

export type FeeBreakdown = {
  lines: FeeLine[]
  totalFcfa: number
}

const roundFcfa = (value: number) => Math.round(value)
const pct = (rate: number) =>
  `${(rate * 100).toLocaleString('fr-FR', { maximumFractionDigits: 2 })} %`

/** Fees for one side (buy or sell) of a trade with the given gross amount. */
export const computeFees = (
  grossFcfa: number,
  schedule: BrokerSchedule,
): FeeBreakdown => {
  if (grossFcfa <= 0) return { lines: [], totalFcfa: 0 }
  const brokerage = roundFcfa(
    Math.max(grossFcfa * schedule.brokerageRate, schedule.brokerageMinFcfa),
  )
  const tax = roundFcfa(brokerage * schedule.taxOnBrokerageRate)
  const brvm = roundFcfa(grossFcfa * BRVM_COMMISSION_RATE)
  const dcbr = roundFcfa(grossFcfa * DCBR_COMMISSION_RATE)
  const lines: FeeLine[] = [
    {
      id: 'brokerage',
      label: 'Courtage SGI',
      rateLabel: schedule.brokerageMinFcfa > 0
        ? `${pct(schedule.brokerageRate)} (min. ${
          schedule.brokerageMinFcfa.toLocaleString('fr-FR')
        } FCFA)`
        : pct(schedule.brokerageRate),
      amountFcfa: brokerage,
      payee: 'SGI',
    },
    {
      id: 'tax',
      label: 'Taxe sur le courtage',
      rateLabel: pct(schedule.taxOnBrokerageRate),
      amountFcfa: tax,
      payee: 'État',
    },
    {
      id: 'brvm',
      label: 'Commission BRVM',
      rateLabel: pct(BRVM_COMMISSION_RATE),
      amountFcfa: brvm,
      payee: 'BRVM',
    },
    {
      id: 'dcbr',
      label: 'Commission DC/BR',
      rateLabel: pct(DCBR_COMMISSION_RATE),
      amountFcfa: dcbr,
      payee: 'Dépositaire central',
    },
  ]
  return {
    lines,
    totalFcfa: lines.reduce((sum, line) => sum + line.amountFcfa, 0),
  }
}

export type TradeEstimate = {
  side: 'BUY' | 'SELL'
  quantity: number
  priceFcfa: number
  grossFcfa: number
  fees: FeeBreakdown
  /** Cash out for a buy, cash in for a sell. */
  netFcfa: number
  effectiveCostPercent: number
}

export const estimateTrade = (
  side: 'BUY' | 'SELL',
  quantity: number,
  priceFcfa: number,
  schedule: BrokerSchedule,
): TradeEstimate => {
  const grossFcfa = roundFcfa(quantity * priceFcfa)
  const fees = computeFees(grossFcfa, schedule)
  const netFcfa = side === 'BUY'
    ? grossFcfa + fees.totalFcfa
    : grossFcfa - fees.totalFcfa
  return {
    side,
    quantity,
    priceFcfa,
    grossFcfa,
    fees,
    netFcfa,
    effectiveCostPercent: grossFcfa > 0
      ? Number(((fees.totalFcfa / grossFcfa) * 100).toFixed(2))
      : 0,
  }
}

/**
 * Largest whole number of shares a budget can buy, fees included.
 * BRVM shares are not fractional: the leftover stays in cash.
 */
export const maxSharesForBudget = (
  budgetFcfa: number,
  priceFcfa: number,
  schedule: BrokerSchedule,
) => {
  if (priceFcfa <= 0 || budgetFcfa <= 0) return 0
  let quantity = Math.floor(budgetFcfa / priceFcfa)
  while (
    quantity > 0 &&
    estimateTrade('BUY', quantity, priceFcfa, schedule).netFcfa > budgetFcfa
  ) quantity--
  return quantity
}

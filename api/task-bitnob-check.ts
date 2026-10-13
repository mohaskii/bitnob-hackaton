import { bitnob } from './bitnob/client.ts'
import {
  BITNOB_BASE_URL,
  BITNOB_CLIENT_ID,
  BITNOB_WEBHOOK_SECRET,
} from './lib/env.ts'

/**
 * Verifies the Bitnob configuration without printing any secret:
 * mode, credentials (whoami) and an XOF payout quote for each SGI corridor.
 */

const mask = (value: string) =>
  value ? `${value.slice(0, 4)}…(${value.length})` : '(vide)'

console.log(`Mode Bitnob     : ${bitnob.mode}`)
console.log(`URL             : ${BITNOB_BASE_URL}`)
console.log(`Client ID       : ${mask(BITNOB_CLIENT_ID)}`)
console.log(`Webhook secret  : ${BITNOB_WEBHOOK_SECRET ? 'défini' : '(vide)'}`)

if (bitnob.mode === 'simulation') {
  console.log('\nIdentifiants absents : mode simulation, aucun appel réel.')
  Deno.exit(0)
}

try {
  const me = await bitnob.whoami()
  console.log('\n✔ Signature et identifiants acceptés par Bitnob (whoami).')
  console.log(`  Clés renvoyées : ${Object.keys(me).join(', ')}`)
} catch (error) {
  console.error(
    `\n✘ whoami refusé : ${error instanceof Error ? error.message : error}`,
  )
  console.error(
    '  Vérifiez Client ID / Secret (sandbox) et la variante de signature.',
  )
  Deno.exit(1)
}

for (
  const [country, asset] of [['CI', 'USDC'], ['SN', 'USDT'], ['NE', 'USDC'], [
    'CI',
    'BTC',
  ]] as const
) {
  try {
    const quote = await bitnob.quotePayout({
      asset,
      settlementAmountFcfa: 50_000,
      country,
      reference: `CHECK-${country}-${Date.now()}`,
    })
    console.log(
      `✔ Cotation ${country} : ${quote.cryptoAmount} ${asset} → 50 000 FCFA (taux ${quote.rate}, frais ${quote.feesFcfa})`,
    )
  } catch (error) {
    console.error(
      `✘ Cotation ${country} : ${
        error instanceof Error ? error.message : error
      }`,
    )
  }
}

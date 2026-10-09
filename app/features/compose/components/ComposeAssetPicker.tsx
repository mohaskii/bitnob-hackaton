import {
  composeSelectedSymbol,
  composeSentiment,
  composeShowAssetPicker,
} from '../compose-state.ts'
import { ComposeSymbolChips } from './ComposeSymbolChips.tsx'
import { ComposeSentimentSelector } from './ComposeSentimentSelector.tsx'

/**
 * ComposeAssetPicker:
 * Thin orchestrator for symbol and sentiment tagging (Rule 5: Decomposition Discipline).
 */
export const ComposeAssetPicker = () => {
  const show = composeShowAssetPicker.value
  const selectedSymbol = composeSelectedSymbol.value
  const sentiment = composeSentiment.value

  if (!show && !selectedSymbol && !sentiment) {
    return null
  }

  return (
    <div class='mt-auto pt-3 pb-1 border-t border-base-200 flex flex-col gap-3 animate-in fade-in duration-150'>
      <ComposeSymbolChips />
      <ComposeSentimentSelector />
    </div>
  )
}

import { computed, signal } from '@preact/signals'
import { api } from '../../lib/api.ts'
import { GLOSSARY } from './glossary.ts'

export const openTermId = signal<string | null>(null)

export const openTerm = computed(() =>
  openTermId.value ? GLOSSARY[openTermId.value] ?? null : null
)

export const explain = (termId: string) => {
  openTermId.value = termId
  void api.post('/events', { type: 'opened_explainer' }).catch(() => {})
}

export const closeExplainer = () => {
  openTermId.value = null
}

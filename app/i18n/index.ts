import { computed, signal } from '@preact/signals'
import { fr } from './fr.ts'
import { en } from './en.ts'
import type { TranslationSchema } from './fr.ts'
export type Language = 'fr' | 'en'
const readLanguage = (): Language => {
  const query = new URL(location.href).searchParams.get('lang')
  if (query === 'en' || query === 'fr') return query
  try {
    return localStorage.getItem('tekki.language') === 'en' ? 'en' : 'fr'
  } catch {
    return 'fr'
  }
}
export const lang = signal<Language>(readLanguage())
export const t = computed<TranslationSchema>(() =>
  lang.value === 'en' ? en : fr
)
export const setLang = (value: Language) => {
  lang.value = value
  try {
    localStorage.setItem('tekki.language', value)
  } catch { /* Private browsing. */ }
  const url = new URL(location.href)
  url.searchParams.set('lang', value)
  history.replaceState(history.state, '', url)
}

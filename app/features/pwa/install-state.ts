import { computed, signal } from '@preact/signals'
import { t } from '../../i18n/index.ts'
interface InstallPrompt extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}
const standalone = matchMedia('(display-mode: standalone)')
export const installed = signal(
  standalone.matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true,
)
const promptEvent = signal<InstallPrompt | null>(null)
export const installBusy = signal(false)
export const installFailed = signal(false)
export const installGuide = signal(false)
const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
export const installSteps = computed(() =>
  ios ? t.value.iosSteps : t.value.browserSteps
)
export const installLabel = computed(() =>
  installed.value
    ? t.value.installed
    : installBusy.value
    ? t.value.installBusy
    : t.value.install
)
addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault()
  promptEvent.value = event as InstallPrompt
})
addEventListener('appinstalled', () => {
  installed.value = true
  promptEvent.value = null
  closeInstallGuide()
})
standalone.addEventListener('change', (event) => {
  installed.value = event.matches
})
export const closeInstallGuide = () => {
  const dialog = document.getElementById('pwa-install-dialog')
  if (!dialog || matchMedia('(prefers-reduced-motion: reduce)').matches) {
    installGuide.value = false
    return
  }
  if (dialog.dataset.closing) return
  dialog.dataset.closing = 'true'
  dialog.animate([{ opacity: 1, transform: 'translateY(0)' }, {
    opacity: 0,
    transform: 'translateY(12px)',
  }], { duration: 180, easing: 'ease-in', fill: 'forwards' }).finished.finally(
    () => {
      installGuide.value = false
    },
  )
}
export const requestInstall = async () => {
  if (installBusy.value) return
  installFailed.value = false
  const prompt = promptEvent.value
  if (installed.value || !prompt) {
    installGuide.value = true
    return
  }
  installBusy.value = true
  promptEvent.value = null
  try {
    await prompt.prompt()
    await prompt.userChoice
  } catch {
    installFailed.value = true
    installGuide.value = true
  } finally {
    installBusy.value = false
  }
}
export const mountInstallDialog = () => {
  const dialog = document.getElementById('pwa-install-dialog') as
    | HTMLDialogElement
    | null
  if (!dialog) return
  const previous = document.activeElement as HTMLElement | null
  dialog.showModal()
  return () => {
    dialog.close()
    previous?.focus({ preventScroll: true })
  }
}

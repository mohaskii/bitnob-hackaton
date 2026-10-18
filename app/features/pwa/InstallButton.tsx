import { useLayoutEffect } from 'preact/hooks'
import { ArrowDownToLine, Check, X } from 'lucide-preact'
import { t } from '../../i18n/index.ts'
import {
  closeInstallGuide,
  installBusy,
  installed,
  installFailed,
  installGuide,
  installLabel,
  installSteps,
  mountInstallDialog,
  requestInstall,
} from './install-state.ts'
export const InstallButton = ({ compact = false }: { compact?: boolean }) => (
  <button
    type='button'
    class={`editorial-button ${compact ? 'editorial-button-small' : ''}`}
    onClick={requestInstall}
    disabled={installBusy.value}
  >
    {installed.value ? <Check size={17} /> : <ArrowDownToLine size={17} />}
    {installLabel.value}
  </button>
)
const InstallDialog = () => {
  useLayoutEffect(mountInstallDialog, [])
  return (
    <dialog
      id='pwa-install-dialog'
      class='install-dialog'
      aria-labelledby='install-title'
      aria-describedby='install-description'
      onCancel={(event) => {
        event.preventDefault()
        closeInstallGuide()
      }}
      onClick={(event) =>
        event.target === event.currentTarget && closeInstallGuide()}
      data-lenis-prevent
    >
      <div class='install-dialog-content'>
        <button
          class='install-close'
          onClick={closeInstallGuide}
          aria-label={t.value.close}
        >
          <X size={20} />
        </button>
        <img
          src='/icons/icon-192.png'
          width='64'
          height='64'
          alt=''
          class='install-icon'
        />
        <h2 id='install-title'>{t.value.installTitle}</h2>
        <p id='install-description'>
          {installed.value ? t.value.installedBody : t.value.installBody}
        </p>
        {!installed.value && (
          <ol>
            {installSteps.value.map((step) => <li key={step}>{step}</li>)}
          </ol>
        )}
        {installFailed.value && <p role='alert'>{t.value.installError}</p>}
        <button class='editorial-button' onClick={closeInstallGuide}>
          {t.value.close}
        </button>
      </div>
    </dialog>
  )
}
export const InstallGuide = () => installGuide.value ? <InstallDialog /> : null

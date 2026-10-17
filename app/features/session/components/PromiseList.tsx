import { Building2, GraduationCap, Send, ShieldCheck } from 'lucide-preact'

const PROMISES = [
  {
    icon: GraduationCap,
    title: 'Comprendre avant d’investir',
    text: 'Cours BRVM sourcés, frais détaillés, mots expliqués au bon moment.',
  },
  {
    icon: ShieldCheck,
    title: 'S’entraîner sans risque',
    text: '1 000 000 FCFA fictifs, aux vrais cours différés de la BRVM.',
  },
  {
    icon: Building2,
    title: 'Ouvrir son compte chez une SGI',
    text: 'Comparez, préparez vos pièces et suivez votre dossier.',
  },
  {
    icon: Send,
    title: 'Approvisionner depuis partout',
    text: 'USDT, USDC ou Bitcoin via Bitnob : votre SGI reçoit des FCFA.',
  },
]

export const PromiseList = () => (
  <div class='flex flex-col gap-3'>
    {PROMISES.map(({ icon: Icon, title, text }) => (
      <div
        key={title}
        class='flex items-start gap-3 bg-base-100 rounded-2xl p-3.5'
      >

        <span class='w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0'>
          <Icon size={19} />
        </span>
        <span>
          <span class='block text-[14px] font-bold'>{title}</span>
          <span class='block text-[12.5px] text-base-content/60 mt-0.5'>
            {text}
          </span>
        </span>
      </div>
    ))}
  </div>
)

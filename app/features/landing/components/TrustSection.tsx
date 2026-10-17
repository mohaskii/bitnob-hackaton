import { Building2, Landmark, ShieldCheck } from 'lucide-preact'
import { TRUST } from '../landing-content.ts'

const ICONS = [Landmark, Building2, ShieldCheck]

/** Chapter 5 — why it is safe: DC/BR, licensed SGIs, no custody. */
export const TrustSection = () => (
  <section class='mx-auto max-w-6xl px-5 lg:px-8 py-24 lg:py-36 flex flex-col gap-10 lg:gap-14'>
    <div data-reveal class='max-w-3xl'>
      <p class='text-[12px] font-bold uppercase tracking-wider text-base-content/45 mb-4'>
        La confiance
      </p>
      <h2 class='text-[32px] lg:text-[48px] leading-[1.05] font-black tracking-tight'>
        Les vraies règles du marché. <span class='text-base-content/40'>Expliquées, pas cachées.</span>
      </h2>
    </div>
    <div class='grid gap-4 md:grid-cols-3'>
      {TRUST.map((item, i) => {
        const Icon = ICONS[i]
        return (
          <div key={item.title} data-reveal class='bg-base-100 rounded-[1.75rem] p-6 lg:p-8 flex flex-col gap-3'>
            <span class='w-11 h-11 rounded-2xl bg-primary/25 flex items-center justify-center'>
              <Icon size={21} />
            </span>
            <p class='text-[18px] font-extrabold'>{item.title}</p>
            <p class='text-[14px] text-base-content/60 leading-relaxed'>{item.text}</p>
          </div>
        )
      })}
    </div>
  </section>
)

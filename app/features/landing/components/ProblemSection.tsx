import { BARRIERS, STATS } from '../landing-content.ts'
import { StatCard } from './StatCard.tsx'

/** Chapter 2 — a record market, still far from everyday savers. */
export const ProblemSection = () => (
  <section class='mx-auto max-w-6xl px-5 lg:px-8 pb-24 lg:pb-36 flex flex-col gap-10 lg:gap-14'>
    <div data-reveal class='max-w-3xl'>
      <p class='text-[12px] font-bold uppercase tracking-wider text-base-content/45 mb-4'>
        Le constat
      </p>
      <h2 class='text-[32px] lg:text-[48px] leading-[1.05] font-black tracking-tight'>
        Une bourse record. <span class='text-base-content/40'>Et pourtant, si loin de nous.</span>
      </h2>
    </div>

    <div class='grid gap-4 md:grid-cols-3'>
      {STATS.map((stat) => <StatCard key={stat.label} {...stat} />)}
    </div>

    <div class='grid gap-4 md:grid-cols-3'>
      {BARRIERS.map((barrier, i) => (
        <div key={barrier.title} data-reveal class='bg-neutral text-neutral-content rounded-[1.75rem] p-6 lg:p-8 flex flex-col gap-3'>
          <span class='w-9 h-9 rounded-full bg-primary text-primary-content flex items-center justify-center text-[14px] font-black'>
            {i + 1}
          </span>
          <p class='text-[18px] font-extrabold'>{barrier.title}</p>
          <p class='text-[14px] text-white/60 leading-relaxed'>{barrier.text}</p>
        </div>
      ))}
    </div>
  </section>
)

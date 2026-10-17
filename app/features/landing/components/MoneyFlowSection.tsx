import { MONEY_FLOW } from '../landing-content.ts'

/**
 * Chapter 4 — the money path powered by Bitnob. The dark card rises into
 * place (`data-rise`), nodes pop in and the `data-flow-link` connectors draw
 * themselves (horizontal on desktop, vertical on mobile). Triggers measure
 * the untransformed <section>, the card inside is what moves.
 */
export const MoneyFlowSection = () => (
  <section data-flow class='mt-6'>
    <div data-rise class='tk-hero rounded-[2.5rem] lg:rounded-[3.5rem] will-change-transform'>
      <div class='mx-auto max-w-6xl px-5 lg:px-8 py-20 lg:py-32 flex flex-col gap-12 lg:gap-16'>
        <div data-reveal class='max-w-3xl'>
          <p class='text-[12px] font-bold uppercase tracking-wider text-primary mb-4'>
            Propulsé par Bitnob
          </p>
          <h2 class='text-[32px] lg:text-[48px] leading-[1.05] font-black tracking-tight text-white'>
            De Paris à Dakar, l’argent arrive en FCFA chez la SGI.
          </h2>
        </div>

        <ol class='flex flex-col lg:flex-row lg:items-stretch'>
          {MONEY_FLOW.map((node, i) => (
            <li key={node.title} class='flex flex-col lg:flex-row lg:flex-1 lg:items-stretch'>
              <div data-flow-node class='flex-1 bg-white/5 rounded-[1.5rem] p-5 flex flex-col gap-2 lg:min-h-[150px]'>
                <span class='w-8 h-8 rounded-full bg-primary text-primary-content flex items-center justify-center text-[13px] font-black'>
                  {i + 1}
                </span>
                <p class='text-[16px] font-extrabold text-white'>{node.title}</p>
                <p class='text-[13px] text-white/55 leading-relaxed'>{node.text}</p>
              </div>
              {i < MONEY_FLOW.length - 1 && (
                <span class='self-center flex items-center justify-center h-8 w-1.5 lg:h-1.5 lg:w-6'>
                  <span data-flow-link class='block h-full w-full rounded-full bg-primary' />
                </span>
              )}
            </li>
          ))}
        </ol>

        <p data-reveal class='self-start rounded-full bg-white/10 px-5 py-3 text-[14px] font-semibold text-white/80'>
          TekkiTrade ne détient jamais vos fonds : Bitnob verse directement à la SGI.
        </p>
      </div>
    </div>
  </section>
)

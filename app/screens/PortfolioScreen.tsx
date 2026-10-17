import { useEffect } from 'preact/hooks'
import { loadPortfolio } from '../features/orders/order-state.ts'
import {
  AccountCard,
  OrdersSection,
  PortfolioError,
  PortfolioHeader,
  PositionsSection,
  TekkiPortfolioCard,
  TransactionsSection,
} from '../features/orders/components/PortfolioSections.tsx'

const startPortfolio = () => {
  void loadPortfolio()
  const interval = setInterval(() => void loadPortfolio(), 5_000)
  return () => clearInterval(interval)
}

/** PortfolioScreen: the SGI's view of the account, made readable. */
export const PortfolioScreen = () => {
  useEffect(startPortfolio, [])
  return (
    <div class='flex-1 flex flex-col w-full pt-[calc(env(safe-area-inset-top,0px)+0.75rem)] px-4 pb-6 gap-4'>
      <PortfolioHeader />
      <PortfolioError />
      <AccountCard />
      <TekkiPortfolioCard />
      <PositionsSection />
      <OrdersSection />
      <TransactionsSection />
    </div>
  )
}

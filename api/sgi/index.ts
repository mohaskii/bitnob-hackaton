import { ENV } from '@01edu/api/env'
import { MockSGIProvider } from './mock.ts'
import type { SGIProvider } from './provider.ts'

/**
 * The SGI used by TekkiTrade. Only this file changes when a partner SGI is
 * integrated: `SGI_PROVIDER=partner` would return `new PartnerSGIProvider()`.
 */
const SGI_PROVIDER = ENV('SGI_PROVIDER', 'mock')

const createProvider = (): SGIProvider => {
  switch (SGI_PROVIDER) {
    case 'mock':
      return new MockSGIProvider()
    default:
      throw new Error(`SGI_PROVIDER inconnu : ${SGI_PROVIDER}`)
  }
}

export const sgi: SGIProvider = createProvider()

export * from './provider.ts'

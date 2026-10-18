import { makeRouter, route } from '@01edu/api/router'
import { respond } from '@01edu/api/response'
import { BOOL, LIST, NUM, OBJ, optional, STR } from '@01edu/api/validator'
import { sql, sqlQuery } from './schema.ts'
import { log } from './lib/log.ts'
import { APP_ENV } from './lib/env.ts'
import {
  createSessionToken,
  hashPassword,
  newSalt,
  timingSafeEqual,
  withUserSession,
} from './lib/auth.ts'
import { bitnob } from './bitnob/client.ts'
import { handleBitnobWebhook } from './bitnob/webhook.ts'
import {
  getLatestBulletin,
  getMarketView,
  getQuote,
  getQuoteHistory,
  getStoredPrices,
} from './market-data.ts'
import { companyFor } from './domain/companies.ts'
import {
  BRVM_COMMISSION_RATE,
  BRVM_FEE_SOURCE,
  DCBR_COMMISSION_RATE,
  estimateTrade,
  fractionalSharesForBudget,
  maxSharesForBudget,
} from './domain/fees.ts'
import {
  DEFAULT_SGI_ID,
  findSgi,
  JOURNEY_STATUSES,
  SGI_PARTNERS,
} from './domain/sgi.ts'
import {
  ensurePaperAccount,
  executePaperOrder,
  getPaperPortfolio,
  listPaperOrders,
  resetPaperAccount,
} from './domain/paper.ts'
import {
  executeLiveOrder,
  getLivePortfolio,
  listLiveOrders,
} from './domain/live_trading.ts'
import {
  executeTransfer,
  listUserTransfers,
  searchRecipients,
} from './domain/transfers.ts'
import {
  applyPartnerStatus,
  EVENT_TYPES,
  getJourney,
  getPartnerOverview,
  selectSgi,
  setChecklistItem,
  submitApplication,
  trackEvent,
} from './domain/journey.ts'
import {
  confirmCredited,
  createFunding,
  FUNDING_ASSETS,
  listFundings,
  listSgiFundings,
  quoteFunding,
  refreshFunding,
  SENDER_COUNTRIES,
  simulateDeposit,
} from './domain/funding.ts'
import {
  addComment,
  createPostWithTrade,
  getTrendingAssets,
  listComments,
  togglePostLike,
} from './domain/social.ts'

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const readUser = (userId: number) => {
  const user = sqlQuery<{
    userId: number
    email: string
    login: string
    isGuest: number
  }>`
    SELECT userId, email, login, isGuest FROM user WHERE userId = ${userId}
  `.get()
  if (!user) {
    throw new respond.UnauthorizedError({ message: 'Compte introuvable.' })
  }
  return user
}

/** The SGI whose tariff applies to estimates: the chosen one, else default. */
const activeSgiId = (userId: number) =>
  getJourney(userId).sgiId ?? DEFAULT_SGI_ID

const createAccount = async (input: {
  email: string
  login: string
  password: string
  isGuest: boolean
}) => {
  const salt = newSalt()
  const hash = await hashPassword(input.password, salt)
  const user = sql`
    INSERT INTO user (email, login, passwordHash, passwordSalt, isGuest, createdAt)
    VALUES (${input.email}, ${input.login}, ${hash}, ${salt}, ${
    input.isGuest ? 1 : 0
  }, ${Date.now()})
    RETURNING userId
  `.get() as { userId: number }
  ensurePaperAccount(user.userId)
  return user.userId
}

const sessionPayload = async (userId: number) => ({
  token: await createSessionToken(userId),
  user: readUser(userId),
})

const DATA_NOTICE = {
  quotes:
    'Cours BRVM différés, récupérés sur les pages publiques de brvm.org. Ils ne constituent pas un flux temps réel.',
  orders:
    'Les ordres sont simulés avec de l’argent fictif. Aucun ordre n’est transmis au marché.',
  sgi:
    'Les SGI affichées sont des partenaires de démonstration. Seules les SGI agréées peuvent négocier à la BRVM.',
  advice:
    'TekkiTrade fournit de l’information et de l’entraînement, pas de conseil en investissement.',
}

/**
 * The partner dashboard is a demo stand-in for the SGI back-office. It is
 * disabled in production until a real partner authentication exists.
 */
const partnerDemoOnly = () => {
  if (APP_ENV === 'prod') {
    throw new respond.ForbiddenError({
      message: 'Espace partenaire désactivé.',
    })
  }
}

/* -------------------------------------------------------------------------- */
/* Routes                                                                     */
/* -------------------------------------------------------------------------- */

const defs = {
  /* ------------------------------ Config ------------------------------- */

  'GET/api/config': route({
    fn: () =>
      respond.OK({
        bitnobMode: bitnob.mode,
        notices: DATA_NOTICE,
        fees: {
          brvmRate: BRVM_COMMISSION_RATE,
          dcbrRate: DCBR_COMMISSION_RATE,
          source: BRVM_FEE_SOURCE,
        },
      }),
    description:
      'Runtime mode (Bitnob simulation/sandbox/live) and disclosures',
  }),

  /* ------------------------------- Auth -------------------------------- */

  'POST/api/auth/guest': route({
    fn: async () => {
      const suffix = crypto.randomUUID().slice(0, 6)
      const userId = await createAccount({
        email: `invite-${suffix}@guest.tekkitrade.local`,
        login: `invite_${suffix}`,
        password: crypto.randomUUID(),
        isGuest: true,
      })
      return respond.OK(await sessionPayload(userId))
    },
    description:
      'Create a fresh guest account (replayable demo, no personal data)',
  }),

  'POST/api/auth/register': route({
    fn: async (_ctx, { email, login, password }) => {
      const normalizedEmail = email.trim().toLowerCase()
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(normalizedEmail)) {
        throw new respond.BadRequestError({
          message: 'Email invalide.',
          input: 'email',
        })
      }
      if (password.length < 8) {
        throw new respond.BadRequestError({
          message: 'Le mot de passe doit contenir au moins 8 caractères.',
          input: 'password',
        })
      }
      const taken = sqlQuery<{ n: number }>`
        SELECT COUNT(*) AS n FROM user WHERE email = ${normalizedEmail} OR login = ${login}
      `.get()!.n
      if (taken) {
        throw new respond.BadRequestError({
          message: 'Cet email ou ce pseudo est déjà utilisé.',
          input: 'email',
        })
      }
      const userId = await createAccount({
        email: normalizedEmail,
        login: login.trim(),
        password,
        isGuest: false,
      })
      return respond.OK(await sessionPayload(userId))
    },
    input: OBJ({
      email: STR('Email address'),
      login: STR('Public handle'),
      password: STR('Password, 8 characters minimum'),
    }),
    description:
      'Register with a salted PBKDF2 password and get a signed session',
  }),

  'POST/api/auth/login': route({
    fn: async (_ctx, { email, password }) => {
      const user = sqlQuery<{
        userId: number
        passwordHash: Uint8Array
        passwordSalt: Uint8Array
      }>`
        SELECT userId, passwordHash, passwordSalt FROM user
        WHERE email = ${email.trim().toLowerCase()} AND isGuest = 0
      `.get()
      const candidate = await hashPassword(
        password,
        user?.passwordSalt ?? newSalt(),
      )
      if (!user || !timingSafeEqual(candidate, user.passwordHash)) {
        throw new respond.UnauthorizedError({
          message: 'Email ou mot de passe incorrect.',
        })
      }
      return respond.OK(await sessionPayload(user.userId))
    },
    input: OBJ({ email: STR('Email'), password: STR('Password') }),
    description: 'Verify credentials and return a signed session token',
  }),

  'POST/api/auth/logout': route({
    authorize: withUserSession,
    fn: () => respond.OK({ ok: true, message: 'Déconnexion réussie.' }),
    description: 'Terminate user session and acknowledge logout',
  }),

  /* --------------------------- Home summary ---------------------------- */

  'GET/api/me': route({
    authorize: withUserSession,
    fn: (ctx) => {
      const { userId } = ctx.session
      const user = readUser(userId)
      const portfolio = getPaperPortfolio(userId, getStoredPrices())
      const livePortfolio = user.isGuest === 0 ? getLivePortfolio(userId, getStoredPrices()) : null
      const journey = getJourney(userId)
      const fundings = listFundings(userId)
      return respond.OK({
        user,
        paper: {
          totalValueFcfa: portfolio.totalValueFcfa,
          totalPnlFcfa: portfolio.totalPnlFcfa,
          totalPnlPercent: portfolio.totalPnlPercent,
          cashFcfa: portfolio.cashFcfa,
          positionsCount: portfolio.positions.length,
        },
        live: livePortfolio
          ? {
            accountNumber: livePortfolio.accountNumber,
            sgiId: livePortfolio.sgiId,
            totalValueFcfa: livePortfolio.totalValueFcfa,
            cashFcfa: livePortfolio.cashFcfa,
            totalPnlFcfa: livePortfolio.totalPnlFcfa,
            totalPnlPercent: livePortfolio.totalPnlPercent,
            positionsCount: livePortfolio.positions.length,
          }
          : null,
        funding: {
          mode: bitnob.mode,
          creditedFcfa: fundings
            .filter((f) => f.status === 'CREDITED')
            .reduce((sum, f) => sum + f.amountFcfa, 0),
          latest: fundings[0] ?? null,
        },
        journey,
        sgi: findSgi(journey.sgiId) ?? null,
      })
    },
    description:
      'Home screen summary: practice portfolio, journey, account funding',
  }),

  /* ------------------------------ Market ------------------------------- */

  'GET/api/market/stocks': route({
    fn: async () => {
      const [view, bulletin] = await Promise.all([
        getMarketView(),
        getLatestBulletin(),
      ])
      const history = getQuoteHistory(30)
      const { snapshot } = view
      return respond.OK({
        stocks: snapshot.quotes
          .map((quote) => {
            const company = companyFor(quote.symbol, quote.name)
            return {
              symbol: quote.symbol,
              name: company.name,
              sector: company.sector,
              country: company.country,
              activity: company.activity,
              priceFcfa: quote.priceFcfa,
              changePercent: quote.changePercent,
              volume: quote.volume,
              previousPriceFcfa: quote.previousPriceFcfa,
              openingPriceFcfa: quote.openingPriceFcfa,
              closingPriceFcfa: quote.closingPriceFcfa,
              history: history.get(quote.symbol) ?? [],
            }
          })
          .sort((a, b) => a.symbol.localeCompare(b.symbol)),
        topFive: snapshot.topFive,
        flopFive: snapshot.flopFive,
        indices: snapshot.indices,
        marketActivity: snapshot.marketActivity,
        fetchedAt: snapshot.fetchedAt,
        sourcePageTime: snapshot.sourcePageTime,
        sessionStatus: snapshot.sessionStatus,
        stale: view.stale,
        staleReason: view.staleReason,
        sourceUrl: 'https://www.brvm.org/fr/flux-differe',
        detailsUrl: 'https://www.brvm.org/en/cours-actions/0',
        latestBulletin: bulletin ?? { title: '', date: '', url: '' },
      })
    },
    description:
      'Delayed BRVM quotes (cached 60 s, last snapshot served if brvm.org is down)',
  }),

  /* --------------------------- SGI & fees ------------------------------ */

  'GET/api/sgi': route({
    fn: () => respond.OK({ partners: SGI_PARTNERS }),
    description:
      'Partner SGI catalogue (demo partners until a pilot validates)',
  }),

  'POST/api/estimate': route({
    authorize: withUserSession,
    fn: async (ctx, { symbol, side, quantity, budgetFcfa, sgiId, fractional }) => {
      const quote = await getQuote(symbol)
      if (!quote) {
        throw new respond.NotFoundError({
          message: `Titre ${symbol} introuvable.`,
        })
      }
      const sgi = findSgi(sgiId) ?? findSgi(activeSgiId(ctx.session.userId))!
      let qty = 0
      let leftoverFcfa = 0

      if (quantity != null) {
        qty = quantity
      } else if (budgetFcfa != null) {
        if (fractional) {
          const calc = fractionalSharesForBudget(budgetFcfa, quote.priceFcfa, sgi.schedule)
          qty = calc.quantity
          leftoverFcfa = calc.leftoverFcfa
        } else {
          qty = maxSharesForBudget(budgetFcfa, quote.priceFcfa, sgi.schedule)
        }
      }

      const estimate = estimateTrade(side, qty, quote.priceFcfa, sgi.schedule)
      trackEvent(ctx.session.userId, 'estimated_order', { symbol })
      return respond.OK({
        ...estimate,
        symbol,
        quoteTime: quote.quoteTime,
        stale: quote.stale,
        sgi: { id: sgi.id, name: sgi.name, isDemo: sgi.isDemo },
        isFractional: !Number.isInteger(qty),
        leftoverFcfa: budgetFcfa != null && side === 'BUY'
          ? (leftoverFcfa > 0 ? leftoverFcfa : Math.max(0, Math.round(budgetFcfa - estimate.netFcfa)))
          : 0,
        minimumDepositFcfa: sgi.minimumDepositFcfa,
      })
    },
    input: OBJ({
      symbol: STR('BRVM ticker'),
      side: LIST(['BUY', 'SELL'] as const),
      quantity: optional(NUM('Shares quantity (whole or fractional)')),
      budgetFcfa: optional(
        NUM('Budget: returns whole or fractional shares, fees included'),
      ),
      sgiId: optional(STR('SGI tariff to apply')),
      fractional: optional(BOOL('Allow fractional shares')),
    }),
    description:
      'Estimate a trade: gross, itemised fees, net, whole or fractional shares for a budget',
  }),

  /* ------------------------- Practice trading -------------------------- */

  'GET/api/paper/portfolio': route({
    authorize: withUserSession,
    fn: (ctx) =>
      respond.OK({
        ...getPaperPortfolio(ctx.session.userId, getStoredPrices()),
        orders: listPaperOrders(ctx.session.userId),
      }),
    description:
      'Practice portfolio valued at delayed prices, with order history',
  }),

  'POST/api/paper/orders': route({
    authorize: withUserSession,
    fn: async (ctx, { symbol, side, quantity }) => {
      const { userId } = ctx.session
      const quote = await getQuote(symbol)
      if (!quote) {
        throw new respond.NotFoundError({
          message: `Titre ${symbol} introuvable.`,
        })
      }
      const fill = executePaperOrder({
        userId,
        symbol,
        name: companyFor(symbol, quote.name).name,
        side,
        quantity,
        priceFcfa: quote.priceFcfa,
        quoteTime: quote.quoteTime,
        sgiId: activeSgiId(userId),
      })
      trackEvent(userId, 'paper_order', { symbol })
      log.info('[Paper] simulated fill', {
        orderId: fill.orderId,
        symbol,
        side,
      })
      return respond.OK(fill)
    },
    input: OBJ({
      symbol: STR('BRVM ticker'),
      side: LIST(['BUY', 'SELL'] as const),
      quantity: NUM('Whole shares'),
    }),
    description:
      'Simulated order at the latest delayed price, returns a contract note',
  }),

  'POST/api/paper/reset': route({
    authorize: withUserSession,
    fn: (ctx) => {
      resetPaperAccount(ctx.session.userId)
      return respond.OK(
        getPaperPortfolio(ctx.session.userId, getStoredPrices()),
      )
    },
    description: 'Reset the practice account to its starting fictitious cash',
  }),

  /* --------------------------- Live SGI trading ------------------------ */

  'GET/api/trade/live/portfolio': route({
    authorize: withUserSession,
    fn: (ctx) =>
      respond.OK({
        ...getLivePortfolio(ctx.session.userId, getStoredPrices()),
        orders: listLiveOrders(ctx.session.userId),
      }),
    description:
      'Live institutional portfolio with fractional holdings and SGI order routing history',
  }),

  'POST/api/trade/live/orders': route({
    authorize: withUserSession,
    fn: async (ctx, { symbol, side, quantity, budgetFcfa }) => {
      const { userId } = ctx.session
      const quote = await getQuote(symbol)
      if (!quote) {
        throw new respond.NotFoundError({
          message: `Titre ${symbol} introuvable.`,
        })
      }
      const sgi = findSgi(activeSgiId(userId))!
      let finalQuantity = quantity
      if (finalQuantity == null && budgetFcfa != null) {
        const calc = fractionalSharesForBudget(budgetFcfa, quote.priceFcfa, sgi.schedule)
        finalQuantity = calc.quantity
      }
      if (finalQuantity == null || finalQuantity <= 0) {
        throw new respond.BadRequestError({
          message: 'Veuillez spécifier une quantité ou un budget valide.',
        })
      }
      const fill = executeLiveOrder({
        userId,
        symbol,
        name: companyFor(symbol, quote.name).name,
        side,
        quantity: finalQuantity,
        priceFcfa: quote.priceFcfa,
        quoteTime: quote.quoteTime,
        sgiId: sgi.id,
      })
      trackEvent(userId, 'live_order', { symbol })
      log.info('[Live SGI] Order filled directly via SGI OMS', {
        orderId: fill.orderId,
        sgiRef: fill.sgiOrderReference,
        symbol,
        side,
        quantity: fill.quantity,
        isFractional: fill.isFractional,
      })
      return respond.OK(fill)
    },
    input: OBJ({
      symbol: STR('BRVM ticker'),
      side: LIST(['BUY', 'SELL'] as const),
      quantity: optional(NUM('Shares quantity (whole or fractional)')),
      budgetFcfa: optional(NUM('Budget amount to allocate to fractional shares')),
    }),
    description:
      'Execute real stock purchase routed to SGI OMS with fractional share support',
  }),

  'GET/api/trade/live/orders': route({
    authorize: withUserSession,
    fn: (ctx) => respond.OK({ orders: listLiveOrders(ctx.session.userId) }),
    description: 'List direct SGI executed orders for user',
  }),

  'POST/api/sgi/webhook': route({
    fn: (_ctx, payload) => {
      log.info('[SGI Webhook] Received execution callback from SGI OMS', payload)
      return respond.OK({ received: true })
    },
    input: OBJ({
      sgiOrderReference: STR('Order reference'),
      status: STR('Status'),
    }),
    description: 'Webhook callback from partner SGI for asynchronous execution reports',
  }),

  /* --------------------------- P2P Transfers --------------------------- */

  'POST/api/transfers': route({
    authorize: withUserSession,
    fn: (ctx, { recipient, amountFcfa, note }) => {
      const receipt = executeTransfer({
        senderUserId: ctx.session.userId,
        recipientIdentifier: recipient,
        amountFcfa,
        note,
      })
      return respond.OK(receipt)
    },
    input: OBJ({
      recipient: STR('Recipient handle, email or account number'),
      amountFcfa: NUM('Amount to transfer in FCFA'),
      note: optional(STR('Transfer note/memo')),
    }),
    description: 'Send instant P2P transfer to another TekkiTrade account',
  }),

  'GET/api/transfers': route({
    authorize: withUserSession,
    fn: (ctx) => respond.OK({ transfers: listUserTransfers(ctx.session.userId) }),
    description: 'List user transfer history (sent and received)',
  }),

  'POST/api/users/lookup': route({
    authorize: withUserSession,
    fn: (ctx, { query }) =>
      respond.OK({ users: searchRecipients(query, ctx.session.userId) }),
    input: OBJ({ query: STR('Search query') }),
    description: 'Search TekkiTrade users for transfer recipient',
  }),

  /* ------------------------------ Journey ------------------------------ */

  'GET/api/journey': route({
    authorize: withUserSession,
    fn: (ctx) => respond.OK(getJourney(ctx.session.userId)),
    description: 'Guided path steps, chosen SGI, checklist and status timeline',
  }),

  'POST/api/journey/sgi': route({
    authorize: withUserSession,
    fn: (ctx, { sgiId }) => respond.OK(selectSgi(ctx.session.userId, sgiId)),
    input: OBJ({ sgiId: STR('Partner SGI id') }),
    description: 'Choose the partner SGI',
  }),

  'POST/api/journey/checklist': route({
    authorize: withUserSession,
    fn: (ctx, { itemId, done }) =>
      respond.OK(setChecklistItem(ctx.session.userId, itemId, done)),
    input: OBJ({ itemId: STR(), done: BOOL() }),
    description: 'Mark a required document as ready',
  }),

  'POST/api/journey/submit': route({
    authorize: withUserSession,
    fn: (ctx, { consent }) =>
      respond.OK(submitApplication(ctx.session.userId, consent)),
    input: OBJ({
      consent: BOOL('Explicit consent to share the file with the SGI'),
    }),
    description: 'Hand the account-opening file to the SGI (consent required)',
  }),

  'POST/api/events': route({
    authorize: withUserSession,
    fn: (ctx, { type, symbol, sgiId }) => {
      trackEvent(ctx.session.userId, type, {
        symbol: symbol ?? undefined,
        sgiId: sgiId ?? undefined,
      })
      return respond.OK({ ok: true })
    },
    input: OBJ({
      type: LIST(EVENT_TYPES),
      symbol: optional(STR()),
      sgiId: optional(STR()),
    }),
    description: 'Product analytics event (no personal data)',
  }),

  /* -------------------------- Partner (SGI) ---------------------------- */

  'GET/api/partner/overview': route({
    authorize: partnerDemoOnly,
    fn: (_ctx, { sgiId }) => respond.OK(getPartnerOverview(sgiId)),
    input: OBJ({ sgiId: STR() }),
    description:
      'Partner dashboard: funnel and pseudonymised applications (demo, no auth)',
  }),

  'POST/api/partner/status': route({
    authorize: partnerDemoOnly,
    fn: (_ctx, { sgiId, journeyId, status, note }) =>
      respond.OK(
        applyPartnerStatus(sgiId, journeyId, status, note ?? undefined),
      ),
    input: OBJ({
      sgiId: STR(),
      journeyId: NUM(),
      status: LIST(JOURNEY_STATUSES),
      note: optional(STR()),
    }),
    description:
      'Status update from the SGI side (replaced by partner API in a pilot)',
  }),

  /* ------------------ Account funding via Bitnob ---------------------- */

  'GET/api/funding': route({
    authorize: withUserSession,
    fn: (ctx) =>
      respond.OK({
        mode: bitnob.mode,
        assets: FUNDING_ASSETS,
        senderCountries: SENDER_COUNTRIES,
        fundings: listFundings(ctx.session.userId),
      }),
    description: 'Funding requests of the user and supported assets',
  }),

  'POST/api/funding/quote': route({
    authorize: withUserSession,
    fn: async (ctx, { asset, amountFcfa }) =>
      respond.OK(await quoteFunding(ctx.session.userId, asset, amountFcfa)),
    input: OBJ({
      asset: LIST(['USDT', 'USDC', 'BTC'] as const),
      amountFcfa: NUM('XOF to deliver to the SGI'),
    }),
    description: 'Bitnob payout quote: crypto to send, rate, fees, corridor',
  }),

  'POST/api/funding': route({
    authorize: withUserSession,
    fn: async (ctx, { asset, amountFcfa, senderName, senderCountry }) =>
      respond.OK(
        await createFunding(ctx.session.userId, asset, amountFcfa, {
          name: senderName,
          country: senderCountry,
        }),
      ),
    input: OBJ({
      asset: LIST(['USDT', 'USDC', 'BTC'] as const),
      amountFcfa: NUM('XOF to deliver to the SGI'),
      senderName: STR('Full name of the sender (required by Bitnob)'),
      senderCountry: STR('ISO alpha-2 country of residence of the sender'),
    }),
    description:
      'Create a funding: deposit instruction + XOF payout to the SGI',
  }),

  'POST/api/funding/refresh': route({
    authorize: withUserSession,
    fn: async (ctx, { fundingId }) =>
      respond.OK(await refreshFunding(ctx.session.userId, fundingId)),
    input: OBJ({ fundingId: NUM() }),
    description: 'Poll Bitnob for deposit and payout status (sandbox/live)',
  }),

  'POST/api/funding/simulate-deposit': route({
    authorize: withUserSession,
    fn: async (ctx, { fundingId }) =>
      respond.OK(await simulateDeposit(ctx.session.userId, fundingId)),
    input: OBJ({ fundingId: NUM() }),
    description: 'Simulation mode only: act as if the crypto deposit arrived',
  }),

  'GET/api/partner/fundings': route({
    authorize: partnerDemoOnly,
    fn: (_ctx, { sgiId }) => respond.OK({ fundings: listSgiFundings(sgiId) }),
    input: OBJ({ sgiId: STR() }),
    description: 'Partner: incoming XOF payouts from Bitnob, by reference',
  }),

  'POST/api/partner/fundings/credit': route({
    authorize: partnerDemoOnly,
    fn: (_ctx, { sgiId, fundingId }) =>
      respond.OK({ fundings: confirmCredited(sgiId, fundingId) }),
    input: OBJ({ sgiId: STR(), fundingId: NUM() }),
    description: 'Partner: confirm the investor cash account was credited',
  }),

  'POST/api/bitnob/webhook': route({
    fn: async (ctx) => {
      const rawBody = await ctx.req.text()
      // Header names only (never values), to confirm Bitnob's signature header.
      log.info('[Bitnob Webhook] received', {
        headers: [...ctx.req.headers.keys()].join(','),
      })
      const signature = ctx.req.headers.get('x-bitnob-signature') ??
        ctx.req.headers.get('x-signature')
      return respond.OK(await handleBitnobWebhook(rawBody, signature))
    },
    description: 'Verified, idempotent Bitnob webhook',
  }),

  /* ------------------- Community & Social Trading ------------------- */

  'GET/api/community': route({
    authorize: withUserSession,
    fn: (ctx) => {
      const currentUserId = ctx.session.userId
      const likedPostIds = new Set<number>()
      if (currentUserId) {
        const userLikes = sqlQuery<{ postId: number }>`
          SELECT postId FROM socialLike WHERE userId = ${currentUserId}
        `.all()
        for (const l of userLikes) likedPostIds.add(l.postId)
      }

      const prices = getStoredPrices()
      const posts = sqlQuery<{
        postId: number
        authorName: string
        authorHandle: string
        avatarUrl: string
        isExample: number
        content: string
        symbol: string | null
        sentiment: string | null
        tradeAction: string | null
        tradePriceFcfa: number | null
        tradeChangePercent: number | null
        likesCount: number
        commentsCount: number
        createdAt: number
      }>`SELECT postId, authorName, authorHandle, avatarUrl, isExample, content,
          symbol, sentiment, tradeAction, tradePriceFcfa, tradeChangePercent,
          likesCount, commentsCount, createdAt
        FROM socialPost ORDER BY createdAt DESC LIMIT 50`.all().map((p) => {
        const quote = p.symbol ? prices.get(p.symbol) : undefined
        return {
          ...p,
          id: String(p.postId),
          isExample: p.isExample === 1,
          isLiked: likedPostIds.has(p.postId),
          trade: p.symbol
            ? {
              symbol: p.symbol,
              action: p.tradeAction ??
                (p.sentiment === 'bearish' ? 'VENTE' : 'ACHAT'),
              priceFcfa: p.tradePriceFcfa ?? quote?.priceFcfa ?? 0,
              changePercent: p.tradeChangePercent ?? quote?.changePercent ?? 0,
            }
            : undefined,
        }
      })

      const trending = getTrendingAssets()

      return respond.OK({ posts, trending })
    },
    description: 'Community post feed and dynamic trending assets',
  }),

  'GET/api/community/trending': route({
    fn: () => respond.OK({ trending: getTrendingAssets() }),
    description:
      'Dynamic trending assets aggregated from community discussions and live BRVM quotes',
  }),

  'POST/api/community/posts': route({
    authorize: withUserSession,
    fn: (ctx, { content, symbol, sentiment, tradeAction }) => {
      const user = readUser(ctx.session.userId)
      if (user.isGuest) {
        throw new respond.ForbiddenError({
          message: 'Vous devez créer un compte vérifié pour publier dans la communauté.',
        })
      }
      const res = createPostWithTrade(
        ctx.session.userId,
        { name: user.login, handle: user.login },
        { content, symbol, sentiment, tradeAction },
      )
      return respond.OK(res)
    },
    input: OBJ({
      content: STR(),
      symbol: optional(STR()),
      sentiment: optional(LIST(['bullish', 'bearish'] as const)),
      tradeAction: optional(LIST(['ACHAT', 'VENTE'] as const)),
    }),
    description: 'Publish a community note with optional live trade attachment',
  }),

  'POST/api/community/posts/like': route({
    authorize: withUserSession,
    fn: (ctx, { postId }) => {
      const user = readUser(ctx.session.userId)
      if (user.isGuest) {
        throw new respond.ForbiddenError({
          message: 'Vous devez créer un compte vérifié pour aimer une publication.',
        })
      }
      return respond.OK(togglePostLike(ctx.session.userId, Number(postId)))
    },
    input: OBJ({ postId: STR() }),
    description: 'Toggle like on a community post',
  }),

  'GET/api/community/posts/comments': route({
    fn: (_ctx, { postId }) => {
      return respond.OK({ comments: listComments(Number(postId)) })
    },
    input: OBJ({ postId: STR() }),
    description: 'List comments for a post',
  }),

  'POST/api/community/posts/comments': route({
    authorize: withUserSession,
    fn: (ctx, { postId, content }) => {
      const user = readUser(ctx.session.userId)
      if (user.isGuest) {
        throw new respond.ForbiddenError({
          message: 'Vous devez créer un compte vérifié pour commenter.',
        })
      }
      return respond.OK(
        addComment(
          Number(postId),
          ctx.session.userId,
          { name: user.login, handle: user.login },
          content,
        ),
      )
    },
    input: OBJ({ postId: STR(), content: STR() }),
    description: 'Add a comment to a community post',
  }),
} as const

export type RouteDefinitions = typeof defs
export const routeHandler = makeRouter(defs, {
  log,
  sensitiveKeys: ['password', 'phone', 'recipientName'],
})

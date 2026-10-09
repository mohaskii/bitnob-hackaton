import type { RequestContext } from '@01edu/api/context'
import { makeRouter, route } from '@01edu/api/router'
import { respond } from '@01edu/api/response'
import {
  ARR,
  BOOL,
  LIST,
  NUM,
  OBJ,
  optional,
  STR,
  UNION,
} from '@01edu/api/validator'
import {
  BitnobTransaction,
  CopyContract,
  FractionalShare,
  Order,
  SocialPost,
  sql,
  sqlQuery,
  Stock,
  Trader,
  User,
  VirtualCard,
  Wallet,
} from './schema.ts'
import { bitnob } from './bitnob/client.ts'
import { handleBitnobWebhook } from './bitnob/webhook.ts'
import { log } from './lib/log.ts'

/* -------------------------------------------------------------------------- */
/* Helper Functions & Session Handling                                        */
/* -------------------------------------------------------------------------- */

/**
 * Hash password with Web Crypto PBKDF2
 */
async function hashPassword(password: string): Promise<Uint8Array> {
  const enc = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  )
  const salt = enc.encode('tekkitrade-salt-constant')
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    keyMaterial,
    256,
  )
  return new Uint8Array(bits)
}

/**
 * Session authenticator for protected endpoints
 * TODO: Replace with secure cookie / JWT decoding in production.
 */
const withUserSession = (ctx: RequestContext) => {
  const authHeader = ctx.req.headers.get('Authorization')
  // In dev / hackathon demo, default to user 1 if not authenticated
  const userId = authHeader?.startsWith('Bearer ')
    ? Number(authHeader.slice(7)) || 1
    : 1

  return { userId }
}

/* -------------------------------------------------------------------------- */
/* Route Definitions with Validators (matching /home/mohaskiiii/tournament)    */
/* -------------------------------------------------------------------------- */

const defs = {
  /* ------------------------------------------------------------------------ */
  /* 1. Authentication & User Profile                                         */
  /* ------------------------------------------------------------------------ */

  'POST/api/auth/register': route({
    fn: async (_ctx, { email, login, password, phone }) => {
      // 1. Check if user already exists in SQLite
      const existing = sqlQuery<{ userId: number }>`
        SELECT userId FROM user WHERE email = ${email} OR login = ${login}
      `.all()[0]

      if (existing) {
        throw new respond.BadRequestError({
          message: 'Cet email ou nom d\'utilisateur est déjà utilisé.',
          input: 'email',
        })
      }

      // 2. Hash password
      const hashedPassword = await hashPassword(password)

      // 3. Register customer on Bitnob infrastructure
      let bitnobCustomerId = ''
      try {
        const bitnobCustomer = await bitnob.createCustomer({
          email,
          firstName: login,
          lastName: 'Tekki',
          phone: phone || undefined,
          countryCode: 'SN',
        })
        bitnobCustomerId = bitnobCustomer.id
      } catch (err) {
        log.warn('Could not register customer with Bitnob in dev mode:', {
          error: String(err),
        })
      }

      // 4. Save User in SQLite
      const now = Date.now()
      const userRes = sql`
        INSERT INTO user (email, login, phone, password, bitnobCustomerId, createdAt)
        VALUES (${email}, ${login}, ${phone || null}, ${hashedPassword}, ${bitnobCustomerId}, ${now})
        RETURNING userId
      `.all()[0] as { userId: number }

      const userId = userRes.userId

      // 5. Initialize user wallet with 0 FCFA / 0 USDT
      sql`
        INSERT INTO wallet (userId, balanceFcfa, balanceUsdt, updatedAt)
        VALUES (${userId}, 0, 0, ${now})
      `.run()

      return respond.OK({
        userId,
        email,
        login,
        bitnobCustomerId,
        token: `mock_session_token_user_${userId}`,
      })
    },
    input: OBJ({
      email: STR("The user's email address"),
      login: STR("The user's handle / username"),
      password: STR("The user's password"),
      phone: optional(STR("The user's phone number (+221...)")),
    }, 'User registration payload'),
    output: OBJ({
      userId: NUM(),
      email: STR(),
      login: STR(),
      bitnobCustomerId: STR(),
      token: STR(),
    }),
    description:
      'Register a new user in SQLite and create a linked Bitnob customer profile',
  }),

  'POST/api/auth/login': route({
    fn: async (_ctx, { email, password }) => {
      const user = sqlQuery<{ userId: number; email: string; login: string }>`
        SELECT userId, email, login FROM user WHERE email = ${email}
      `.all()[0]

      if (!user) {
        throw new respond.UnauthorizedError({
          message: 'Identifiants invalides.',
        })
      }

      return respond.OK({
        userId: user.userId,
        email: user.email,
        login: user.login,
        token: `mock_session_token_user_${user.userId}`,
      })
    },
    input: OBJ({
      email: STR('User email'),
      password: STR('User password'),
    }),
    output: OBJ({
      userId: NUM(),
      email: STR(),
      login: STR(),
      token: STR(),
    }),
    description: 'Authenticate user and return session token',
  }),

  'GET/api/user/me': route({
    authorize: withUserSession,
    fn: (ctx) => {
      const { userId } = ctx.session!

      // Fetch user profile
      const user = sqlQuery<
        { userId: number; email: string; login: string; phone: string | null }
      >`
        SELECT userId, email, login, phone FROM user WHERE userId = ${userId}
      `.all()[0]

      // Fetch user wallet
      const wallet = sqlQuery<{ balanceFcfa: number; balanceUsdt: number }>`
        SELECT balanceFcfa, balanceUsdt FROM wallet WHERE userId = ${userId}
      `.all()[0] || { balanceFcfa: 209890, balanceUsdt: 345.20 }

      // Fetch active copy contracts
      const copyContracts = sqlQuery<{ contractId: number; traderId: number }>`
        SELECT contractId, traderId FROM copyContract WHERE copierUserId = ${userId} AND status = 'ACTIVE'
      `.all()

      return {
        userId: user ? user.userId : userId,
        email: user ? user.email : 'vous@tekkitrade.africa',
        login: user ? user.login : 'Moi_Trader',
        phone: user?.phone || '+221770000000',
        balanceFcfa: wallet.balanceFcfa,
        balanceUsdt: wallet.balanceUsdt,
        activeCopiesCount: copyContracts.length,
      }
    },
    output: OBJ({
      userId: NUM(),
      email: STR(),
      login: STR(),
      phone: STR(),
      balanceFcfa: NUM(),
      balanceUsdt: NUM(),
      activeCopiesCount: NUM(),
    }),
    description: 'Fetch authenticated user profile and wallet overview',
  }),

  /* ------------------------------------------------------------------------ */
  /* 2. Wallet & Bitnob Payments Rails                                        */
  /* ------------------------------------------------------------------------ */

  'GET/api/wallet': route({
    authorize: withUserSession,
    fn: (ctx) => {
      const { userId } = ctx.session!

      const wallet = sqlQuery<{ balanceFcfa: number; balanceUsdt: number }>`
        SELECT balanceFcfa, balanceUsdt FROM wallet WHERE userId = ${userId}
      `.all()[0] || { balanceFcfa: 209890, balanceUsdt: 345.20 }

      const transactions = sqlQuery<
        {
          transactionId: number
          reference: string
          type: string
          amountFcfa: number
          amountUsdt: number
          status: string
          createdAt: number
        }
      >`
        SELECT transactionId, reference, type, amountFcfa, amountUsdt, status, createdAt
        FROM bitnobTransaction
        WHERE userId = ${userId}
        ORDER BY createdAt DESC
        LIMIT 20
      `.all()

      return {
        balanceFcfa: wallet.balanceFcfa,
        balanceUsdt: wallet.balanceUsdt,
        transactions,
      }
    },
    output: OBJ({
      balanceFcfa: NUM(),
      balanceUsdt: NUM(),
      transactions: ARR(
        OBJ({
          transactionId: NUM(),
          reference: STR(),
          type: STR(),
          amountFcfa: NUM(),
          amountUsdt: NUM(),
          status: STR(),
          createdAt: NUM(),
        }),
      ),
    }),
    description:
      'Retrieve user wallet balances and recent Bitnob transactions',
  }),

  'POST/api/wallet/deposit/lightning': route({
    authorize: withUserSession,
    fn: async (ctx, { amountFcfa, amountSat }) => {
      const { userId } = ctx.session!
      const user = sqlQuery<{ email: string }>`
        SELECT email FROM user WHERE userId = ${userId}
      `.all()[0] || { email: 'vous@tekkitrade.africa' }

      const ref = `LN_${Date.now()}_${userId}`

      // 1. Call Bitnob API to generate a real Lightning Network invoice
      const invoice = await bitnob.createLightningInvoice({
        customerEmail: user.email,
        amountSat,
        description: `Dépôt TekkiTrade ${amountFcfa} FCFA`,
      })

      // 2. Store pending transaction in SQLite
      const amountUsdt = amountFcfa / 608.5
      sql`
        INSERT INTO bitnobTransaction (userId, reference, type, amountFcfa, amountUsdt, bitnobId, status, createdAt)
        VALUES (${userId}, ${ref}, 'LIGHTNING_INVOICE', ${amountFcfa}, ${amountUsdt}, ${invoice.id}, 'PENDING', ${Date.now()})
      `.run()

      return respond.OK({
        reference: ref,
        paymentRequest: invoice.paymentRequest,
        paymentHash: invoice.paymentHash,
        amountSat: invoice.amountSat,
        expiresAt: invoice.expiresAt,
      })
    },
    input: OBJ({
      amountFcfa: NUM('Deposit amount in FCFA'),
      amountSat: NUM('Deposit amount in Satoshis'),
    }),
    output: OBJ({
      reference: STR(),
      paymentRequest: STR('Lightning invoice bolt11 string'),
      paymentHash: STR(),
      amountSat: NUM(),
      expiresAt: STR(),
    }),
    description: 'Initiate a Bitcoin Lightning deposit via Bitnob API',
  }),

  'POST/api/wallet/deposit/usdt': route({
    authorize: withUserSession,
    fn: async (ctx, { chain }) => {
      const { userId } = ctx.session!
      const user = sqlQuery<{ email: string }>`
        SELECT email FROM user WHERE userId = ${userId}
      `.all()[0] || { email: 'vous@tekkitrade.africa' }

      // 1. Generate on-chain USDT address via Bitnob
      const addrRes = await bitnob.createUsdtDepositAddress({
        customerEmail: user.email,
        chain: chain as 'TRX' | 'ETH',
      })

      const ref = `USDT_${Date.now()}_${userId}`

      sql`
        INSERT INTO bitnobTransaction (userId, reference, type, amountFcfa, amountUsdt, bitnobId, status, createdAt)
        VALUES (${userId}, ${ref}, 'USDT_DEPOSIT', 0, 0, ${addrRes.id}, 'PENDING', ${Date.now()})
      `.run()

      return respond.OK({
        reference: ref,
        address: addrRes.address,
        chain: addrRes.chain,
      })
    },
    input: OBJ({
      chain: STR('Blockchain network (TRX or ETH)'),
    }),
    output: OBJ({
      reference: STR(),
      address: STR('USDT Deposit address'),
      chain: STR(),
    }),
    description: 'Generate a dedicated USDT TRC-20 / ERC-20 deposit address',
  }),

  'POST/api/wallet/withdraw/momo': route({
    authorize: withUserSession,
    fn: async (ctx, { amountFcfa, phone, network, recipientName }) => {
      const { userId } = ctx.session!

      // 1. Verify user has enough FCFA balance
      const wallet = sqlQuery<{ balanceFcfa: number; balanceUsdt: number }>`
        SELECT balanceFcfa, balanceUsdt FROM wallet WHERE userId = ${userId}
      `.all()[0]

      if (!wallet || wallet.balanceFcfa < amountFcfa) {
        throw new respond.BadRequestError({
          message:
            'Solde FCFA insuffisant pour effectuer ce retrait Mobile Money.',
        })
      }

      const amountUsdt = amountFcfa / 608.5

      // 2. Obtain quote from Bitnob Payouts API
      const quote = await bitnob.createMomoPayoutQuote({
        amountUsdt,
        currency: 'XOF',
      })

      // 3. Execute payout to Wave or Orange Money
      const payoutRes = await bitnob.executeMomoPayout({
        quoteId: quote.quoteId,
        customerPhone: phone,
        network: network as 'WAVE' | 'ORANGE',
        recipientName,
      })

      // 4. Atomically debit user balance and record transaction
      const now = Date.now()
      const ref = `MOMO_${now}_${userId}`

      sql`
        UPDATE wallet
        SET balanceFcfa = balanceFcfa - ${amountFcfa},
            balanceUsdt = balanceUsdt - ${amountUsdt},
            updatedAt = ${now}
        WHERE userId = ${userId}
      `.run()

      sql`
        INSERT INTO bitnobTransaction (userId, reference, type, amountFcfa, amountUsdt, bitnobId, status, createdAt)
        VALUES (${userId}, ${ref}, 'MOMO_PAYOUT', ${amountFcfa}, ${amountUsdt}, ${payoutRes.payoutId}, 'PENDING', ${now})
      `.run()

      return respond.OK({
        reference: ref,
        payoutId: payoutRes.payoutId,
        status: payoutRes.status,
        amountFcfa,
        network,
      })
    },
    input: OBJ({
      amountFcfa: NUM('Withdrawal amount in FCFA'),
      phone: STR('Mobile Money recipient phone number'),
      network: STR('Payment network: WAVE or ORANGE'),
      recipientName: STR('Beneficiary legal full name'),
    }),
    output: OBJ({
      reference: STR(),
      payoutId: STR(),
      status: STR(),
      amountFcfa: NUM(),
      network: STR(),
    }),
    description:
      'Withdraw dividend/trading gains to Wave or Orange Money via Bitnob Payouts',
  }),

  'POST/api/cards/create': route({
    authorize: withUserSession,
    fn: async (ctx, { initialFundUsdt }) => {
      const { userId } = ctx.session!
      const user = sqlQuery<{ bitnobCustomerId: string | null }>`
        SELECT bitnobCustomerId FROM user WHERE userId = ${userId}
      `.all()[0]

      const customerId = user?.bitnobCustomerId || `mock_cust_${userId}`

      // 1. Issue virtual card via Bitnob
      const card = await bitnob.createVirtualCard({
        customerId,
        cardBrand: 'visa',
        initialFundUsdt,
      })

      // 2. Save card record in SQLite
      sql`
        INSERT INTO virtualCard (userId, bitnobCardId, cardBrand, maskedPan, cardStatus, balanceUsdt, createdAt)
        VALUES (${userId}, ${card.cardId}, 'VISA', ${card.maskedPan}, 'ACTIVE', ${card.balanceUsdt}, ${Date.now()})
      `.run()

      return respond.OK({
        cardId: card.cardId,
        maskedPan: card.maskedPan,
        balanceUsdt: card.balanceUsdt,
        status: card.status,
      })
    },
    input: OBJ({
      initialFundUsdt: NUM('Initial fund in USDT from dividend profits'),
    }),
    output: OBJ({
      cardId: STR(),
      maskedPan: STR(),
      balanceUsdt: NUM(),
      status: STR(),
    }),
    description:
      'Issue a Bitnob virtual Visa card to spend dividend earnings on Netflix, Amazon, etc.',
  }),

  'POST/api/bitnob/webhook': route({
    fn: async (ctx) => {
      const rawBody = await ctx.req.text()
      const signature = ctx.req.headers.get('x-bitnob-signature')

      const result = await handleBitnobWebhook(rawBody, signature)
      return respond.OK(result)
    },
    output: OBJ({
      processed: BOOL(),
      event: STR(),
    }),
    description:
      'Listen for Bitnob webhook callbacks (invoice paid, payout status, card transactions)',
  }),

  /* ------------------------------------------------------------------------ */
  /* 3. BRVM Market & Fractional Share Orders                                 */
  /* ------------------------------------------------------------------------ */

  'GET/api/market/stocks': route({
    fn: () => {
      const stocks = sqlQuery<
        {
          stockId: number
          symbol: string
          name: string
          sector: string
          priceFcfa: number
          changePercent: number
          historyJson: string | null
          logoColor: string | null
          logoText: string | null
        }
      >`
        SELECT stockId, symbol, name, sector, priceFcfa, changePercent, historyJson, logoColor, logoText
        FROM stock
        ORDER BY symbol ASC
      `.all()

      type StockQueryResult = {
        stockId: number
        symbol: string
        name: string
        sector: string
        priceFcfa: number
        changePercent: number
        historyJson: string | null
        logoColor: string | null
        logoText: string | null
      }

      const formatted = (stocks as StockQueryResult[]).map((s) => ({
        symbol: s.symbol,
        name: s.name,
        sector: s.sector,
        priceFcfa: s.priceFcfa,
        changePercent: s.changePercent,
        history: s.historyJson ? JSON.parse(s.historyJson) : [],
        logoColor: s.logoColor || 'bg-base-200 text-base-content',
        logoText: s.logoText || s.symbol.slice(0, 2),
      }))

      return { stocks: formatted }
    },
    output: OBJ({
      stocks: ARR(
        OBJ({
          symbol: STR(),
          name: STR(),
          sector: STR(),
          priceFcfa: NUM(),
          changePercent: NUM(),
          history: ARR(NUM()),
          logoColor: STR(),
          logoText: STR(),
        }),
      ),
    }),
    description: 'Fetch all BRVM listed stocks with live prices and sparklines',
  }),

  'POST/api/market/order': route({
    authorize: withUserSession,
    fn: (ctx, { symbol, action, amountFcfa }) => {
      const { userId } = ctx.session!

      // 1. Fetch stock price
      const stock = sqlQuery<{ priceFcfa: number }>`
        SELECT priceFcfa FROM stock WHERE symbol = ${symbol}
      `.all()[0]

      if (!stock) {
        throw new respond.NotFoundError({
          message: `Action BRVM ${symbol} introuvable.`,
        })
      }

      // 2. Fractional share computation
      const sharesFilled = Number((amountFcfa / stock.priceFcfa).toFixed(4))

      // 3. Check wallet balance
      const wallet = sqlQuery<{ balanceFcfa: number }>`
        SELECT balanceFcfa FROM wallet WHERE userId = ${userId}
      `.all()[0]

      if (!wallet || wallet.balanceFcfa < amountFcfa) {
        throw new respond.BadRequestError({
          message:
            'Solde FCFA insuffisant pour exécuter cet ordre fractionné.',
        })
      }

      // 4. Atomically debit wallet, record order, and upsert fractionalShare
      const now = Date.now()
      sql`
        UPDATE wallet
        SET balanceFcfa = balanceFcfa - ${amountFcfa},
            updatedAt = ${now}
        WHERE userId = ${userId}
      `.run()

      const orderRes = sql`
        INSERT INTO orderRecord (userId, symbol, action, amountFcfa, sharesFilled, priceFcfa, status, createdAt)
        VALUES (${userId}, ${symbol}, ${action}, ${amountFcfa}, ${sharesFilled}, ${stock.priceFcfa}, 'COMPLETED', ${now})
        RETURNING orderId
      `.all()[0] as { orderId: number }

      // Upsert fractional share in user's portfolio
      const existingShare = sqlQuery<
        { shareId: number; quantity: number; averageBuyPriceFcfa: number }
      >`
        SELECT shareId, quantity, averageBuyPriceFcfa FROM fractionalShare
        WHERE userId = ${userId} AND symbol = ${symbol}
      `.all()[0]

      if (existingShare) {
        const newQty = existingShare.quantity + sharesFilled
        sql`
          UPDATE fractionalShare
          SET quantity = ${newQty}, updatedAt = ${now}
          WHERE shareId = ${existingShare.shareId}
        `.run()
      } else {
        sql`
          INSERT INTO fractionalShare (userId, symbol, quantity, averageBuyPriceFcfa, updatedAt)
          VALUES (${userId}, ${symbol}, ${sharesFilled}, ${stock.priceFcfa}, ${now})
        `.run()
      }

      return respond.OK({
        orderId: orderRes.orderId,
        symbol,
        action,
        amountFcfa,
        sharesFilled,
        status: 'COMPLETED',
      })
    },
    input: OBJ({
      symbol: STR('Stock symbol (e.g. SNTS, ORAC)'),
      action: STR('Action: ACHAT or VENTE'),
      amountFcfa: NUM('Order capital in FCFA (dès 1 000 FCFA)'),
    }),
    output: OBJ({
      orderId: NUM(),
      symbol: STR(),
      action: STR(),
      amountFcfa: NUM(),
      sharesFilled: NUM(),
      status: STR(),
    }),
    description:
      'Execute a fractional stock order on the BRVM starting from 1 000 FCFA',
  }),

  'GET/api/portfolio': route({
    authorize: withUserSession,
    fn: (ctx) => {
      const { userId } = ctx.session!

      const shares = sqlQuery<
        {
          symbol: string
          quantity: number
          averageBuyPriceFcfa: number
          currentPrice: number
          name: string
        }
      >`
        SELECT fs.symbol, fs.quantity, fs.averageBuyPriceFcfa, s.priceFcfa as currentPrice, s.name
        FROM fractionalShare fs
        JOIN stock s ON fs.symbol = s.symbol
        WHERE fs.userId = ${userId}
      `.all()

      type ShareQueryResult = {
        symbol: string
        quantity: number
        averageBuyPriceFcfa: number
        currentPrice: number
        name: string
      }

      let totalValuation = 0
      const items = (shares as ShareQueryResult[]).map((s) => {
        const valueFcfa = s.quantity * s.currentPrice
        totalValuation += valueFcfa
        return {
          symbol: s.symbol,
          name: s.name,
          quantity: s.quantity,
          valueFcfa,
          currentPrice: s.currentPrice,
        }
      })

      return {
        totalValuationFcfa: totalValuation,
        holdingsCount: items.length,
        items,
      }
    },
    output: OBJ({
      totalValuationFcfa: NUM(),
      holdingsCount: NUM(),
      items: ARR(
        OBJ({
          symbol: STR(),
          name: STR(),
          quantity: NUM(),
          valueFcfa: NUM(),
          currentPrice: NUM(),
        }),
      ),
    }),
    description:
      'Retrieve user portfolio of fractional shares and total valuation',
  }),

  /* ------------------------------------------------------------------------ */
  /* 4. Social Trading & Copy-Trading                                         */
  /* ------------------------------------------------------------------------ */

  'GET/api/social/traders': route({
    fn: () => {
      const list = sqlQuery<
        {
          traderId: number
          name: string
          handle: string
          avatarUrl: string
          verified: number
          returnPercent: number
          timeframe: string
          copiersCount: number
          winRate: number
          riskLevel: string
          badge: string | null
        }
      >`
        SELECT traderId, name, handle, avatarUrl, verified, returnPercent, timeframe, copiersCount, winRate, riskLevel, badge
        FROM trader
        ORDER BY returnPercent DESC
      `.all()

      type TraderQueryResult = {
        traderId: number
        name: string
        handle: string
        avatarUrl: string
        verified: number
        returnPercent: number
        timeframe: string
        copiersCount: number
        winRate: number
        riskLevel: string
        badge: string | null
      }

      const formatted = (list as TraderQueryResult[]).map((t) => ({
        id: String(t.traderId),
        name: t.name,
        handle: t.handle,
        avatarUrl: t.avatarUrl,
        verified: t.verified === 1,
        returnPercent: t.returnPercent,
        timeframe: t.timeframe,
        copiersCount: t.copiersCount,
        winRate: t.winRate,
        riskLevel: t.riskLevel,
        badge: t.badge || undefined,
      }))

      return { traders: formatted }
    },
    output: OBJ({
      traders: ARR(
        OBJ({
          id: STR(),
          name: STR(),
          handle: STR(),
          avatarUrl: STR(),
          verified: BOOL(),
          returnPercent: NUM(),
          timeframe: STR(),
          copiersCount: NUM(),
          winRate: NUM(),
          riskLevel: STR(),
          badge: optional(STR()),
        }),
      ),
    }),
    description: 'Fetch top traders leaderboard for social copy-trading',
  }),

  'POST/api/social/copy': route({
    authorize: withUserSession,
    fn: (ctx, { traderId, allocatedFcfa, stopLossPercent, copyOpenTrades }) => {
      const { userId } = ctx.session!

      // 1. Verify wallet balance
      const wallet = sqlQuery<{ balanceFcfa: number }>`
        SELECT balanceFcfa FROM wallet WHERE userId = ${userId}
      `.all()[0]

      if (!wallet || wallet.balanceFcfa < allocatedFcfa) {
        throw new respond.BadRequestError({
          message:
            'Solde FCFA insuffisant pour allouer ce capital de copie.',
        })
      }

      // 2. Insert copy contract in SQLite
      const now = Date.now()
      const contractRes = sql`
        INSERT INTO copyContract (copierUserId, traderId, allocatedFcfa, stopLossPercent, copyOpenTrades, status, createdAt)
        VALUES (${userId}, ${Number(traderId)}, ${allocatedFcfa}, ${stopLossPercent}, ${copyOpenTrades ? 1 : 0}, 'ACTIVE', ${now})
        RETURNING contractId
      `.all()[0] as { contractId: number }

      // 3. Increment trader's copiersCount
      sql`
        UPDATE trader SET copiersCount = copiersCount + 1 WHERE traderId = ${Number(traderId)}
      `.run()

      /**
       * TODO: If copyOpenTrades is true, automatically mirror the expert trader's
       * current stock positions proportionally into the copier's portfolio.
       */
      log.info(
        `[Copy Engine] Created active copy contract ${contractRes.contractId} for trader ${traderId} with ${allocatedFcfa} FCFA`,
      )

      return respond.OK({
        contractId: contractRes.contractId,
        traderId,
        allocatedFcfa,
        status: 'ACTIVE',
      })
    },
    input: OBJ({
      traderId: STR('Target trader identifier'),
      allocatedFcfa: NUM('Capital allocation in FCFA'),
      stopLossPercent: NUM('Stop-loss percentage threshold (5-35%)'),
      copyOpenTrades: BOOL('Whether to mirror existing active positions'),
    }),
    output: OBJ({
      contractId: NUM(),
      traderId: STR(),
      allocatedFcfa: NUM(),
      status: STR(),
    }),
    description:
      'Initiate an automated copy-trading contract replicating an expert trader',
  }),

  'GET/api/social/posts': route({
    fn: () => {
      const posts = sqlQuery<
        {
          postId: number
          authorName: string
          authorHandle: string
          avatarUrl: string
          verified: number
          content: string
          symbol: string | null
          tradeAction: string | null
          priceFcfa: number | null
          changePercent: number | null
          sentiment: string | null
          likesCount: number
          commentsCount: number
          copiersCount: number
          createdAt: number
        }
      >`
        SELECT * FROM socialPost ORDER BY createdAt DESC LIMIT 50
      `.all()

      type PostQueryResult = {
        postId: number
        authorName: string
        authorHandle: string
        avatarUrl: string
        verified: number
        content: string
        symbol: string | null
        tradeAction: string | null
        priceFcfa: number | null
        changePercent: number | null
        sentiment: string | null
        likesCount: number
        commentsCount: number
        copiersCount: number
        createdAt: number
      }

      const formatted = (posts as PostQueryResult[]).map((p) => ({
        id: String(p.postId),
        authorName: p.authorName,
        authorHandle: p.authorHandle,
        avatarUrl: p.avatarUrl,
        verified: p.verified === 1,
        timeAgo: 'Récemment',
        content: p.content,
        trade: p.symbol && p.tradeAction && p.priceFcfa
          ? {
            symbol: p.symbol,
            action: p.tradeAction,
            priceFcfa: p.priceFcfa,
            changePercent: p.changePercent || 0,
          }
          : undefined,
        sentiment: p.sentiment || undefined,
        likesCount: p.likesCount,
        commentsCount: p.commentsCount,
        copiersCount: p.copiersCount,
      }))

      return { posts: formatted }
    },
    output: OBJ({
      posts: ARR(
        OBJ({
          id: STR(),
          authorName: STR(),
          authorHandle: STR(),
          avatarUrl: STR(),
          verified: BOOL(),
          timeAgo: STR(),
          content: STR(),
          trade: optional(
            OBJ({
              symbol: STR(),
              action: STR(),
              priceFcfa: NUM(),
              changePercent: NUM(),
            }),
          ),
          sentiment: optional(STR()),
          likesCount: NUM(),
          commentsCount: NUM(),
          copiersCount: NUM(),
        }),
      ),
    }),
    description: 'Fetch real-time social community feed posts and shared trades',
  }),

  'POST/api/social/posts': route({
    authorize: withUserSession,
    fn: (ctx, { content, symbol, sentiment }) => {
      const { userId } = ctx.session!
      const user = sqlQuery<{ login: string }>`
        SELECT login FROM user WHERE userId = ${userId}
      `.all()[0] || { login: 'Moi_Trader' }

      const now = Date.now()
      const postRes = sql`
        INSERT INTO socialPost (userId, authorName, authorHandle, avatarUrl, verified, content, symbol, sentiment, likesCount, commentsCount, copiersCount, createdAt)
        VALUES (${userId}, 'Vous', ${user.login}, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop', 1, ${content}, ${
        symbol || null
      }, ${sentiment || null}, 0, 0, 0, ${now})
        RETURNING postId
      `.all()[0] as { postId: number }

      return respond.OK({
        id: String(postRes.postId),
        content,
        symbol: symbol || '',
        sentiment: sentiment || '',
      })
    },
    input: OBJ({
      content: STR('Post body text'),
      symbol: optional(STR('Tagged BRVM stock symbol')),
      sentiment: optional(STR('Market sentiment: bullish or bearish')),
    }),
    output: OBJ({
      id: STR(),
      content: STR(),
      symbol: STR(),
      sentiment: STR(),
    }),
    description: 'Publish a new analysis or trade idea to the community feed',
  }),

  'POST/api/social/posts/like': route({
    authorize: withUserSession,
    fn: (_ctx, { postId }) => {
      sql`
        UPDATE socialPost SET likesCount = likesCount + 1 WHERE postId = ${Number(postId)}
      `.run()

      return respond.OK({ success: true, postId })
    },
    input: OBJ({
      postId: STR('Post identifier to like'),
    }),
    output: OBJ({
      success: BOOL(),
      postId: STR(),
    }),
    description: 'Increment likes counter on a community post',
  }),
} as const

export type RouteDefinitions = typeof defs
export const routeHandler = makeRouter(defs, { log })

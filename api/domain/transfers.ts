import { respond } from '@01edu/api/response'
import { sql, sqlQuery, withTransaction } from '../schema.ts'
import { ensureLiveAccount, readLiveAccount } from './live_trading.ts'
import { log } from '../lib/log.ts'

export type TransferReceipt = {
  transferId: number
  reference: string
  amountFcfa: number
  sender: {
    userId: number
    login: string
    sgiAccountNumber: string
  }
  recipient: {
    userId: number
    login: string
    sgiAccountNumber: string
  }
  note?: string
  status: 'COMPLETED'
  createdAt: number
}

export type TransferHistoryItem = {
  transferId: number
  reference: string
  amountFcfa: number
  direction: 'SENT' | 'RECEIVED'
  counterparty: {
    userId: number
    login: string
    sgiAccountNumber?: string
  }
  note?: string
  status: string
  createdAt: number
}

export const lookupRecipient = (rawQuery: string, currentUserId: number) => {
  const clean = rawQuery.trim().replace(/^@/, '').toLowerCase()
  if (!clean) return null

  // Lookup by login, email, or SGI account number
  const candidate = sqlQuery<{
    userId: number
    login: string
    email: string
    isGuest: number
    sgiAccountNumber?: string
  }>`
    SELECT u.userId, u.login, u.email, u.isGuest, lta.sgiAccountNumber
    FROM user u
    LEFT JOIN liveTradingAccount lta ON lta.userId = u.userId
    WHERE (LOWER(u.login) = ${clean} OR LOWER(u.email) = ${clean} OR LOWER(lta.sgiAccountNumber) = ${clean})
      AND u.isGuest = 0
    LIMIT 1
  `.get()

  if (!candidate || candidate.userId === currentUserId) return null
  return {
    userId: candidate.userId,
    login: candidate.login,
    email: candidate.email,
    sgiAccountNumber: candidate.sgiAccountNumber ?? `SGI-ACC-${candidate.userId.toString().padStart(5, '0')}`,
  }
}

export const searchRecipients = (rawQuery: string, currentUserId: number) => {
  const clean = rawQuery.trim().replace(/^@/, '').toLowerCase()
  if (!clean) return []

  const like = `%${clean}%`
  const rows = sqlQuery<{
    userId: number
    login: string
    email: string
    sgiAccountNumber?: string
  }>`
    SELECT u.userId, u.login, u.email, lta.sgiAccountNumber
    FROM user u
    LEFT JOIN liveTradingAccount lta ON lta.userId = u.userId
    WHERE (LOWER(u.login) LIKE ${like} OR LOWER(u.email) LIKE ${like} OR LOWER(lta.sgiAccountNumber) LIKE ${like})
      AND u.isGuest = 0
      AND u.userId != ${currentUserId}
    LIMIT 8
  `.all()

  return rows.map((r) => ({
    userId: r.userId,
    login: r.login,
    email: r.email,
    sgiAccountNumber: r.sgiAccountNumber ?? `SGI-ACC-${r.userId.toString().padStart(5, '0')}`,
  }))
}

export const executeTransfer = (input: {
  senderUserId: number
  recipientIdentifier: string
  amountFcfa: number
  note?: string | null
}): TransferReceipt => {
  const { senderUserId, recipientIdentifier, amountFcfa, note } = input

  // Validate sender
  const senderUser = sqlQuery<{ userId: number; login: string; isGuest: number }>`
    SELECT userId, login, isGuest FROM user WHERE userId = ${senderUserId}
  `.get()

  if (!senderUser || senderUser.isGuest === 1) {
    throw new respond.ForbiddenError({
      message: 'Les transferts de fonds sont réservés aux comptes TekkiTrade enregistrés.',
    })
  }

  if (typeof amountFcfa !== 'number' || amountFcfa < 500) {
    throw new respond.BadRequestError({
      message: 'Le montant minimum de transfert est de 500 FCFA.',
    })
  }

  // Lookup recipient
  const recipient = lookupRecipient(recipientIdentifier, senderUserId)
  if (!recipient) {
    throw new respond.NotFoundError({
      message: `Compte destinataire "${recipientIdentifier}" introuvable sur TekkiTrade.`,
    })
  }

  // Ensure accounts are provisioned
  ensureLiveAccount(senderUserId)
  ensureLiveAccount(recipient.userId)

  return withTransaction(() => {
    const senderAccount = readLiveAccount(senderUserId)
    const recipientAccount = readLiveAccount(recipient.userId)

    if (senderAccount.cashFcfa < amountFcfa) {
      throw new respond.BadRequestError({
        message: `Solde insuffisant : disponible ${senderAccount.cashFcfa.toLocaleString('fr-FR')} FCFA, requis ${amountFcfa.toLocaleString('fr-FR')} FCFA.`,
      })
    }

    const now = Date.now()
    const reference = `TRF-${now.toString(36).toUpperCase()}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`

    // Debit sender
    const newSenderCash = senderAccount.cashFcfa - amountFcfa
    sql`
      UPDATE liveTradingAccount SET
        cashFcfa = ${newSenderCash},
        updatedAt = ${now}
      WHERE accountId = ${senderAccount.accountId}
    `.run()

    // Credit recipient
    const newRecipientCash = recipientAccount.cashFcfa + amountFcfa
    sql`
      UPDATE liveTradingAccount SET
        cashFcfa = ${newRecipientCash},
        updatedAt = ${now}
      WHERE accountId = ${recipientAccount.accountId}
    `.run()

    // Record transfer
    const inserted = sql`
      INSERT INTO accountTransfer
        (senderUserId, recipientUserId, amountFcfa, note, reference, status, createdAt)
      VALUES
        (${senderUserId}, ${recipient.userId}, ${amountFcfa}, ${note ?? null}, ${reference}, 'COMPLETED', ${now})
      RETURNING transferId
    `.get() as { transferId: number }

    log.info('[P2P Transfer] Internal TekkiTrade transfer executed', {
      transferId: inserted.transferId,
      reference,
      from: senderUser.login,
      to: recipient.login,
      amountFcfa,
    })

    return {
      transferId: inserted.transferId,
      reference,
      amountFcfa,
      sender: {
        userId: senderUserId,
        login: senderUser.login,
        sgiAccountNumber: senderAccount.sgiAccountNumber,
      },
      recipient: {
        userId: recipient.userId,
        login: recipient.login,
        sgiAccountNumber: recipientAccount.sgiAccountNumber,
      },
      note: note ?? undefined,
      status: 'COMPLETED',
      createdAt: now,
    }
  })
}

export const listUserTransfers = (userId: number): TransferHistoryItem[] => {
  const rows = sqlQuery<{
    transferId: number
    senderUserId: number
    recipientUserId: number
    amountFcfa: number
    note?: string
    reference: string
    status: string
    createdAt: number
    senderLogin: string
    senderSgiAccount?: string
    recipientLogin: string
    recipientSgiAccount?: string
  }>`
    SELECT t.transferId, t.senderUserId, t.recipientUserId, t.amountFcfa, t.note,
           t.reference, t.status, t.createdAt,
           s.login AS senderLogin, sa.sgiAccountNumber AS senderSgiAccount,
           r.login AS recipientLogin, ra.sgiAccountNumber AS recipientSgiAccount
    FROM accountTransfer t
    JOIN user s ON s.userId = t.senderUserId
    LEFT JOIN liveTradingAccount sa ON sa.userId = t.senderUserId
    JOIN user r ON r.userId = t.recipientUserId
    LEFT JOIN liveTradingAccount ra ON ra.userId = t.recipientUserId
    WHERE t.senderUserId = ${userId} OR t.recipientUserId = ${userId}
    ORDER BY t.createdAt DESC LIMIT 50
  `.all()

  return rows.map((r) => {
    const isSender = r.senderUserId === userId
    return {
      transferId: r.transferId,
      reference: r.reference,
      amountFcfa: r.amountFcfa,
      direction: isSender ? 'SENT' : 'RECEIVED',
      counterparty: {
        userId: isSender ? r.recipientUserId : r.senderUserId,
        login: isSender ? r.recipientLogin : r.senderLogin,
        sgiAccountNumber: isSender ? r.recipientSgiAccount : r.senderSgiAccount,
      },
      note: r.note ?? undefined,
      status: r.status,
      createdAt: r.createdAt,
    }
  })
}

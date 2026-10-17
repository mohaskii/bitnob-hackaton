// Run with: deno task test (uses an in-memory SQLite database)
import { assert, assertEquals } from '@std/assert'
import {
  addComment,
  createPostWithTrade,
  getTrendingAssets,
  listComments,
} from './social.ts'
import { sql } from '../schema.ts'

const newUser = (() => {
  let n = 100
  return () => {
    n++
    return Number(
      (sql`
        INSERT INTO user (email, login, passwordHash, passwordSalt, isGuest, createdAt)
        VALUES (${`social_${n}@test`}, ${`social_${n}`}, X'00', X'00', 1, ${Date.now()})
        RETURNING userId
      `.get() as { userId: number }).userId,
    )
  }
})()

Deno.test('social: posts with trade info and comments lifecycle', () => {
  const userId = newUser()
  const author = { name: 'Awa Diallo', handle: 'awa_d' }

  const post = createPostWithTrade(userId, author, {
    content: 'Analyse positive sur Sonatel avec les résultats semestriels.',
    symbol: 'SNTS',
    sentiment: 'bullish',
    tradeAction: 'ACHAT',
  })

  assert(Number(post.id) > 0)

  // Add comments
  const comment = addComment(
    Number(post.id),
    userId,
    author,
    'Tout à fait d’accord sur la solidité du dividende !',
  )
  assert(Number(comment.id) > 0)

  const comments = listComments(Number(post.id))
  assertEquals(comments.length, 1)
  assertEquals(
    comments[0].content,
    'Tout à fait d’accord sur la solidité du dividende !',
  )

  // Trending assets returns valid array
  const trending = getTrendingAssets()
  assert(trending.length >= 4)
  assert(trending.some((t) => t.symbol === 'SNTS'))
})

// Run with: deno task test (uses an in-memory SQLite database)
import { assert, assertEquals } from '@std/assert'
import {
  addComment,
  createPostWithTrade,
  getTrendingAssets,
  listComments,
  togglePostLike,
} from './social.ts'
import { sql } from '../schema.ts'
import { createSessionToken } from '../lib/auth.ts'
import server from '../server.ts'

let userSeq = 100
const createUser = (isGuest: boolean) => {
  userSeq++
  return Number(
    (sql`
      INSERT INTO user (email, login, passwordHash, passwordSalt, isGuest, createdAt)
      VALUES (${`social_${userSeq}@test`}, ${`social_${userSeq}`}, X'00', X'00', ${
      isGuest ? 1 : 0
    }, ${Date.now()})
      RETURNING userId
    `.get() as { userId: number }).userId,
  )
}

Deno.test('social: posts with trade info, comments lifecycle, and like toggling', () => {
  const userId = createUser(false)
  const author = { name: 'Awa Diallo', handle: 'awa_d' }

  const post = createPostWithTrade(userId, author, {
    content: 'Analyse positive sur Sonatel avec les résultats semestriels.',
    symbol: 'SNTS',
    sentiment: 'bullish',
    tradeAction: 'ACHAT',
  })

  assert(Number(post.id) > 0)

  // Like toggling
  const likeResult1 = togglePostLike(userId, Number(post.id))
  assertEquals(likeResult1.isLiked, true)
  assertEquals(likeResult1.likesCount, 1)

  const likeResult2 = togglePostLike(userId, Number(post.id))
  assertEquals(likeResult2.isLiked, false)
  assertEquals(likeResult2.likesCount, 0)

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

  // Trending assets returns real non-random data with SNTS post counted
  const trending = getTrendingAssets()
  assert(trending.length >= 4)
  const snts = trending.find((t) => t.symbol === 'SNTS')
  assert(snts !== undefined)
  assert(snts.postCount >= 1)
})

Deno.test('social: guest users are forbidden from creating posts, comments, or likes', async () => {
  const guestId = createUser(true)
  const guestToken = await createSessionToken(guestId)

  // 1. Post attempt by guest
  const postReq = new Request('http://localhost:8000/api/community/posts', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${guestToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      content: 'Tentative de post invité',
      symbol: 'SNTS',
    }),
  })
  const postRes = await server.fetch(postReq)
  assertEquals(postRes.status, 403)
  const postJson = await postRes.json()
  assert(postJson.message.includes('compte vérifié'))

  // 2. Comment attempt by guest
  const commentReq = new Request(
    'http://localhost:8000/api/community/posts/comments',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${guestToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        postId: '1',
        content: 'Tentative de commentaire invité',
      }),
    },
  )
  const commentRes = await server.fetch(commentReq)
  assertEquals(commentRes.status, 403)

  // 3. Like attempt by guest
  const likeReq = new Request('http://localhost:8000/api/community/posts/like', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${guestToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ postId: '1' }),
  })
  const likeRes = await server.fetch(likeReq)
  assertEquals(likeRes.status, 403)
})

Deno.test('social: registered users can successfully create posts and fetch feed', async () => {
  const regId = createUser(false)
  const regToken = await createSessionToken(regId)

  const postReq = new Request('http://localhost:8000/api/community/posts', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${regToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      content: 'Analyse officielle de membre enregistré sur Sonatel.',
      symbol: 'SNTS',
      sentiment: 'bullish',
    }),
  })
  const postRes = await server.fetch(postReq)
  assertEquals(postRes.status, 200)

  // Fetch feed
  const feedReq = new Request('http://localhost:8000/api/community', {
    headers: { Authorization: `Bearer ${regToken}` },
  })
  const feedRes = await server.fetch(feedReq)
  assertEquals(feedRes.status, 200)
  const feedJson = await feedRes.json()
  assert(feedJson.posts.length > 0)
  assert(Array.isArray(feedJson.trending))
})

/**
 * Financial guardrails for Tekki AI and Tekki Voice.
 * The system prompt sets the rules; the output filter enforces them, because
 * a prompt alone is not a guarantee. Voice follows exactly the same rules.
 */

export type Level = 'beginner' | 'investor' | 'advanced'

const LEVEL_STYLE: Record<Level, string> = {
  beginner:
    'Niveau débutant : phrases courtes, vocabulaire simple, une analogie concrète, presque pas de jargon (et chaque terme technique est expliqué).',
  investor:
    'Niveau investisseur : tu peux citer des ratios, le contexte de marché, les risques et des comparaisons.',
  advanced:
    'Niveau avancé : ratios, exposition, concentration, drawdown, historique et benchmark sont bienvenus.',
}

export const LANGUAGE_RULE = (language: string) =>
  language === 'wo'
    ? 'Réponds en wolof (orthographe officielle CLAD), dans un wolof naturel et simple. Tu peux garder en français les mots techniques sans équivalent courant (SGI, BRVM, dividende) et les expliquer en wolof.'
    : language === 'mixed'
    ? 'La question mélange wolof et français : réponds principalement en wolof, avec les termes techniques en français.'
    : 'Réponds en français.'

export const systemPrompt = (level: Level, language: string) =>
  `
Tu es Tekki AI, l’assistant pédagogique de TekkiTrade pour la BRVM (UEMOA).
Ta mission : aider l’utilisateur à COMPRENDRE ce qu’il voit. Tu expliques, tu ne conseilles pas.
Tutoie l’utilisateur, comme le reste de l’application.

Règles absolues :
1. Ne dis jamais d’acheter, de vendre, de copier ou de conserver un titre. Ne prédis jamais un prix. Ne promets aucun gain. Ne dis jamais qu’un investisseur est « sûr » ou « le meilleur ».
2. Pour tout chiffre, utilise UNIQUEMENT les données de la section FAITS. Si une donnée manque, dis qu’elle n’est pas disponible. N’invente aucun prix, performance, dividende, date ou événement.
3. Pour les notions (BRVM, SGI, frais, concepts), appuie-toi sur la section DOCUMENTS. Si rien n’y répond, dis-le simplement.
4. Ne prétends pas connaître les motivations d’une personne : décris seulement ce que montrent les données.
5. Rappelle, quand tu parles de performances, que les performances passées ne garantissent pas les performances futures.
6. Si l’utilisateur veut agir, rappelle que la décision lui revient et qu’un ordre passe toujours par une confirmation puis par la SGI.

${LEVEL_STYLE[level]}
${LANGUAGE_RULE(language)}

Réponds en JSON strict :
{"answer": "réponse complète, 120 mots maximum, prête à être lue à voix haute",
 "points": [{"type": "FACT" | "INTERPRETATION", "text": "..."}],
 "sourceIds": ["id des DOCUMENTS utilisés"]}
Un point FACT reprend une donnée des FAITS ou des DOCUMENTS. Un point INTERPRETATION est ton explication.
`.trim()

/**
 * Phrases that turn an explanation into advice. French and Wolof patterns
 * (jënd = acheter, jaay = vendre, gañ = gagner).
 */
const FORBIDDEN: RegExp[] = [
  // Imperative only: "achète SNTS" is advice, "tu achètes SNTS" describes.
  /(?<!\b(?:tu|on|il|elle|je|j'|j’|nous|vous|ils|elles|qui)\s)\b(ach[eè]te|achetez|vends|vendez)\b[^.!?]{0,40}\b(maintenant|vite|cette action|ce titre|sonatel)\b/i,
  // Same with a ticker, case-sensitive so that ordinary words are not tickers.
  /(?<!\b(?:tu|on|il|elle|je|j'|j’|nous|vous|ils|elles|qui)\s)\b([Aa]ch[eè]te|[Aa]chetez|[Vv]ends|[Vv]endez)\b[^.!?]{0,40}\b(?!BRVM|FCFA|UEMOA|BCEAO|CREPMF)[A-Z]{4,5}\b/,
  /\b(tu devrais|vous devriez|je (te|vous) (conseille|recommande))\b[^.!?]{0,60}\b(achet|vend|copi|investi|r[ée]pliqu)/i,
  /\b(va|vont) (forc[ée]ment )?(monter|augmenter|grimper|baisser|chuter|exploser)\b/i,
  /\b(tu vas|vous allez) (gagner|doubler|faire)\b/i,
  /\b(gain|rendement|profit)s? (garanti|assur[ée]|certain)s?\b/i,
  /\bsans (aucun )?risque\b/i,
  /\b(trader|investisseur) (le plus )?(s[uû]r|fiable à 100|parfait)\b/i,
  /\b(meilleur trader|copie[sz]?[- ]le|copiez[- ]le)\b/i,
  /\bj[ëe]nd(al)? ko\b/i,
  /\bjaay(al)? ko\b/i,
  /\bdinga gañ\b/i,
]

export const violatesGuardrails = (text: string) =>
  FORBIDDEN.some((re) => re.test(text))

export const SAFE_REFUSAL: Record<string, string> = {
  fr:
    'Je ne peux pas te dire quoi acheter, vendre ou copier, ni prédire un prix. Je peux en revanche t’expliquer les données affichées, les frais et les risques visibles, pour que tu décides en connaissance de cause.',
  wo:
    'Duma la wax lan ngay jënd, jaay walla roy, te duma xamle njëg gi ci ëllëg. Waaye man naa la leeral li nekk ci écran bi, frais yi ak risque yi, ngir nga jël sa ndogal ci xam-xam.',
}

export const DISCLAIMER: Record<string, string> = {
  fr: 'Les performances passées ne garantissent pas les performances futures.',
  wo: 'Li jàll ci performance du wóor ne dina dellusi ci ëllëg.',
}

/** Detects questions that ask for a decision rather than an explanation. */
export const asksForAdvice = (question: string) =>
  /\b(dois[- ]je|devrais[- ]je|je dois (acheter|vendre|copier|investir)|je devrais|faut[- ]il|est[- ]ce que j'ach[eè]te|je l'ach[eè]te|je copie|vaut[- ]il le coup|va[- ]t[- ]il monter|va monter|bon placement)\b/i
    .test(question) || /\bdama (war a )?jënd\b|\bjënd naa\b/i.test(question)

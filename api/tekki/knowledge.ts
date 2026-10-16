/**
 * Tekki knowledge base: short, sourced passages used for retrieval (RAG).
 * Each chunk cites where it comes from so answers can show their sources.
 * Pure data + a deterministic keyword retriever. No network, no LLM.
 */

export type KnowledgeChunk = {
  id: string
  source: string
  sourceUrl?: string
  title: string
  publishedAt?: string
  /** Extra search terms (synonyms, French/Wolof variants). */
  keywords: string[]
  text: string
}

const BRVM_INVEST = 'https://www.brvm.org/fr/comment-investir-la-brvm'
const BRVM_FEES = 'https://www.brvm.org/en/what-are-applicable-fees'
const BRVM_FLOW = 'https://www.brvm.org/fr/flux-differe'
const BITNOB_DOCS = 'https://bitnob.dev/'
const TEKKI = 'TekkiTrade — fiche pédagogique'

export const KNOWLEDGE: KnowledgeChunk[] = [
  {
    id: 'brvm-what',
    source: 'BRVM — Comment investir à la BRVM',
    sourceUrl: BRVM_INVEST,
    title: 'La BRVM',
    keywords: ['brvm', 'bourse', 'regionale', 'uemoa', 'abidjan', 'marche'],
    text:
      'La BRVM (Bourse Régionale des Valeurs Mobilières) est la bourse commune aux huit pays de l’UEMOA : Bénin, Burkina Faso, Côte d’Ivoire, Guinée-Bissau, Mali, Niger, Sénégal et Togo. Son siège est à Abidjan. On y échange des actions et des obligations de sociétés et d’États de la région.',
  },
  {
    id: 'sgi-role',
    source: 'BRVM — Comment investir à la BRVM',
    sourceUrl: BRVM_INVEST,
    title: 'Le rôle d’une SGI',
    keywords: [
      'sgi',
      'courtier',
      'intermediaire',
      'gestion',
      'ouvrir',
      'compte',
      'broker',
    ],
    text:
      'Une SGI (Société de Gestion et d’Intermédiation) est le courtier agréé qui permet d’acheter et de vendre des titres à la BRVM. Un particulier ne peut pas passer d’ordre directement en bourse : il ouvre un compte-titres chez une SGI, qui transmet ses ordres, conserve ses titres et lui envoie un avis d’opéré après chaque opération.',
  },
  {
    id: 'amf-umoa',
    source: 'BRVM — textes publiés par l’AMF-UMOA',
    sourceUrl: 'https://www.brvm.org/fr/node/315',
    title: 'Le régulateur : AMF-UMOA',
    keywords: [
      'amf',
      'umoa',
      'crepmf',
      'regulateur',
      'agrement',
      'autorite',
      'tarif',
    ],
    text:
      'L’AMF-UMOA (anciennement CREPMF) est l’autorité qui régule le marché financier régional. Elle agrée les SGI et homologue leurs grilles tarifaires. Avant d’ouvrir un compte, on peut vérifier qu’une SGI figure bien parmi les acteurs agréés.',
  },
  {
    id: 'action',
    source: TEKKI,
    title: 'Une action',
    keywords: ['action', 'titre', 'part', 'actionnaire', 'societe'],
    text:
      'Une action représente une petite part du capital d’une entreprise. L’actionnaire peut recevoir une partie des bénéfices (dividende) et voit la valeur de son action monter ou baisser selon l’offre et la demande. À la BRVM, on achète des actions entières : avec un budget fixe, le nombre de titres dépend du cours et des frais.',
  },
  {
    id: 'dividende',
    source: TEKKI,
    title: 'Le dividende',
    keywords: ['dividende', 'benefice', 'distribution', 'coupon', 'revenu'],
    text:
      'Le dividende est la part des bénéfices qu’une entreprise décide de verser à ses actionnaires, en général une fois par an après son assemblée générale. Il n’est jamais garanti : il dépend des résultats et de la décision de l’entreprise.',
  },
  {
    id: 'rendement-dividende',
    source: TEKKI,
    title: 'Le rendement du dividende',
    keywords: ['rendement', 'dividende', 'yield', 'pourcentage'],
    text:
      'Le rendement du dividende compare le dividende annuel au cours de l’action : dividende par action ÷ cours × 100. Exemple : un dividende de 1 000 FCFA pour un cours de 20 000 FCFA donne un rendement de 5 %. Un rendement élevé peut venir d’un cours qui a baissé, il faut donc regarder la raison.',
  },
  {
    id: 'cours-variation',
    source: 'BRVM — Flux différé',
    sourceUrl: BRVM_FLOW,
    title: 'Le cours et la variation',
    keywords: [
      'cours',
      'prix',
      'variation',
      'monte',
      'baisse',
      'pourquoi',
      'evolution',
    ],
    text:
      'Le cours est le prix auquel l’action s’est échangée lors de la dernière séance. La variation est l’écart en pourcentage avec la séance précédente. Le prix bouge selon l’offre et la demande : résultats de l’entreprise, dividendes, actualité économique, liquidité du titre. Les cours publiés gratuitement par la BRVM sont différés.',
  },
  {
    id: 'frais',
    source: 'BRVM — Frais applicables',
    sourceUrl: BRVM_FEES,
    title: 'Les frais d’un ordre',
    keywords: [
      'frais',
      'commission',
      'courtage',
      'cout',
      'dcbr',
      'taxe',
      'garde',
    ],
    text:
      'Chaque achat ou vente supporte une commission BRVM de 0,20 % et une commission du dépositaire central (DC/BR) de 0,10 %, payées par l’acheteur comme par le vendeur. S’y ajoutent le courtage de la SGI (fixé dans sa grille tarifaire homologuée), la taxe sur ce courtage et des droits de garde annuels.',
  },
  {
    id: 'ordres',
    source: TEKKI,
    title: 'Ordre au marché et ordre à cours limité',
    keywords: [
      'ordre',
      'limite',
      'marche',
      'cours',
      'limité',
      'execution',
      'prix',
    ],
    text:
      'Un ordre au marché est exécuté au meilleur prix disponible, sans garantie de prix. Un ordre à cours limité fixe un prix maximum à l’achat (ou minimum à la vente) : il protège du prix mais peut ne pas être exécuté, ou seulement en partie. Sur des titres peu échangés, l’ordre à cours limité est souvent plus prudent.',
  },
  {
    id: 'reglement',
    source: 'Daba Finance — la BRVM passe à T+2',
    sourceUrl:
      'https://www.dabafinance.com/fr/nouvelles/brvm-passer---t2-r-glement-en-d-cembre',
    title: 'Le règlement à T+2',
    publishedAt: '2025-12-04',
    keywords: ['reglement', 'livraison', 't+2', 'delai', 'jours'],
    text:
      'Depuis décembre 2025, la BRVM règle les opérations deux jours ouvrés après l’exécution (T+2) : un achat exécuté le lundi est réglé le mercredi, date à laquelle titres et argent sont échangés.',
  },
  {
    id: 'indices',
    source: 'BRVM — Flux différé',
    sourceUrl: BRVM_FLOW,
    title: 'Les indices BRVM',
    keywords: [
      'indice',
      'composite',
      'brvm-c',
      'brvm-30',
      'prestige',
      'benchmark',
    ],
    text:
      'Le BRVM Composite mesure l’évolution de l’ensemble des actions cotées. Le BRVM-30 suit les 30 valeurs les plus actives et le BRVM Prestige un groupe de grandes sociétés. Ces indices servent de point de comparaison (benchmark) pour juger une performance.',
  },
  {
    id: 'per',
    source: TEKKI,
    title: 'Le PER',
    keywords: ['per', 'ratio', 'cours', 'benefice', 'valorisation', 'cher'],
    text:
      'Le PER (Price Earnings Ratio) divise le cours de l’action par le bénéfice par action. Un PER de 10 signifie que l’on paie 10 fois le bénéfice annuel. Il permet de comparer des entreprises d’un même secteur, mais ne dit pas à lui seul si une action est chère ou bon marché.',
  },
  {
    id: 'diversification',
    source: TEKKI,
    title: 'Diversification et concentration',
    keywords: [
      'diversifier',
      'diversification',
      'concentration',
      'concentre',
      'secteur',
      'exposition',
      'risque',
    ],
    text:
      'Un portefeuille concentré dépend fortement de quelques titres ou d’un seul secteur : si ce secteur traverse une mauvaise période, tout le portefeuille en souffre. Diversifier, c’est répartir sur plusieurs entreprises et secteurs pour que l’impact d’un problème isolé soit plus limité. Cela réduit un type de risque, pas tous les risques.',
  },
  {
    id: 'drawdown',
    source: TEKKI,
    title: 'Le drawdown',
    keywords: ['drawdown', 'perte', 'maximale', 'baisse', 'repli'],
    text:
      'Le drawdown maximal est la plus forte baisse subie depuis un point haut avant de revenir à ce niveau. Un drawdown de -6 % signifie qu’à un moment, la valeur a perdu 6 % par rapport à son meilleur niveau précédent. Il donne une idée des moments difficiles d’une stratégie.',
  },
  {
    id: 'win-rate',
    source: TEKKI,
    title: 'Le taux de trades gagnants',
    keywords: ['win', 'rate', 'gagnant', 'reussite', 'positif', 'trades'],
    text:
      'Le taux de trades gagnants (win rate) est la part des positions clôturées avec un gain. Il doit se lire avec le gain moyen et la perte moyenne : on peut gagner souvent de petites sommes et perdre rarement de grosses sommes, ou l’inverse.',
  },
  {
    id: 'past-performance',
    source: TEKKI,
    title: 'Performances passées',
    keywords: [
      'performance',
      'passee',
      'futur',
      'garantie',
      'copier',
      'repliquer',
      'trader',
    ],
    text:
      'Les performances passées ne garantissent pas les performances futures. Une bonne période peut venir d’un secteur porteur, d’un petit nombre d’opérations ou du hasard. Avant de reproduire l’opération d’un autre investisseur, il faut comprendre sa stratégie, son horizon et l’effet sur son propre portefeuille.',
  },
  {
    id: 'fractions',
    source: TEKKI,
    title: 'Investir un petit montant',
    keywords: ['fraction', 'fractionne', 'petit', 'montant', '1000', 'entiere'],
    text:
      'À la BRVM, les SGI négocient des actions entières. Investir une fraction d’action suppose un montage proposé par un partenaire réglementé. Dans TekkiTrade, l’investissement fractionné est affiché comme simulé tant qu’une SGI ne l’a pas validé.',
  },
  {
    id: 'bitnob-rails',
    source: 'Bitnob — documentation développeurs',
    sourceUrl: BITNOB_DOCS,
    title: 'Déposer et retirer avec Bitnob',
    keywords: [
      'bitnob',
      'depot',
      'deposer',
      'retrait',
      'usdc',
      'usdt',
      'bitcoin',
      'lightning',
      'mobile',
      'money',
      'xaalis',
      'yonnee',
    ],
    text:
      'Bitnob fournit les rails de paiement : il reçoit des stablecoins (USDC, USDT) ou du Bitcoin via Lightning, peut les convertir, et verse des FCFA en Mobile Money (Côte d’Ivoire, Sénégal, Niger). Bitnob ne passe pas d’ordre en bourse : l’exécution reste le rôle de la SGI.',
  },
  {
    id: 'tekki-role',
    source: TEKKI,
    title: 'Ce que fait TekkiTrade',
    keywords: [
      'tekkitrade',
      'tekki',
      'role',
      'application',
      'replication',
      'copier',
    ],
    text:
      'TekkiTrade n’est ni une bourse ni une SGI. Il rend l’investissement plus simple à comprendre, transmet l’intention de l’utilisateur à une SGI partenaire et affiche le suivi. Aucun ordre n’est passé sans la confirmation explicite de l’utilisateur. Tekki AI explique, il ne conseille pas.',
  },
]

/* -------------------------------------------------------------------------- */
/* Retrieval                                                                  */
/* -------------------------------------------------------------------------- */

const STOPWORDS = new Set(
  'le la les un une des de du d l et ou en au aux a est c ce cet cette ces que qui quoi pour par sur dans avec mon ma mes ton ta tes son sa ses il elle on je tu nous vous ils elles me te se ne pas plus est-ce comment pourquoi quel quelle quels quelles explique moi'
    .split(' '),
)

const fold = (value: string) =>
  value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

export const tokenize = (value: string) =>
  fold(value)
    .split(/[^a-z0-9+\-]+/)
    .filter((token) => token.length > 1 && !STOPWORDS.has(token))

/** Keyword retrieval: title and keywords weigh more than body text. */
export const retrieve = (query: string, limit = 3): KnowledgeChunk[] => {
  const terms = new Set(tokenize(query))
  if (terms.size === 0) return []
  return KNOWLEDGE
    .map((chunk) => {
      const title = tokenize(chunk.title)
      const keywords = chunk.keywords.flatMap(tokenize)
      const body = tokenize(chunk.text)
      let score = 0
      for (const term of terms) {
        if (
          keywords.some((k) =>
            k === term || (term.length > 4 && k.startsWith(term))
          )
        ) score += 3
        if (title.includes(term)) score += 2
        score += body.filter((b) => b === term).length * 0.5
      }
      return { chunk, score }
    })
    .filter(({ score }) => score >= 2)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ chunk }) => chunk)
}

export const KNOWLEDGE_VERSION = `kb-${KNOWLEDGE.length}-2026-10-16`

# Démo TekkiTrade — scénario de bout en bout (≈ 6 min)

Fil rouge : **Awa vit à Paris. Elle veut investir dans Sonatel sur la BRVM, mais
n'y connaît rien.** On la suit de la découverte jusqu'à de vrais FCFA versés à
sa SGI via Bitnob.

Ce qui est réel pendant la démo :

- les cours BRVM (différés, brvm.org) ;
- les réponses de Tekki (Gemini) et sa voix wolof (Oolel-Voices) ;
- **la transaction Bitnob** : cotation, adresse de dépôt, puis versement en FCFA
  (sandbox) vers le Mobile Money de la SGI, avec un identifiant de versement et
  le statut renvoyés par Bitnob.

Ce qui est simulé, et qu'on le dit :

- le portefeuille d'entraînement (1 000 000 FCFA fictifs) ;
- les SGI (partenaires de démonstration) ;
- l'arrivée de la crypto (on utilise le solde de test du portefeuille Bitnob
  sandbox, Bitnob n'ayant pas de simulateur de dépôt). Tout ce qui suit est
  exécuté par Bitnob.

---

## Avant de monter sur scène (J-0, 30 min avant)

1. **IP du lieu dans Bitnob** : tableau de bord Bitnob → clés API → liste d'IP
   autorisées → ajouter l'IP publique du réseau du hackathon. Vérifier :
   `deno task bitnob:check` doit afficher « ✔ Signature et identifiants acceptés
   ».
2. **Solde de test Bitnob** : chaque versement de 5 000 FCFA coûte ≈ 8,4 USDC de
   test. Avoir au moins 20 USDC (une répétition + la démo).
3. **Lancer** (3 terminaux) : `deno task server`, `deno task dev`, et pour la
   voix wolof `tools/oolel/.venv/Scripts/python.exe tools/oolel/server.py`
   (attendre `[oolel] ready`).
4. Fermer Lively Wallpaper et les lanceurs de jeux (GPU), PC branché, Windows en
   « Meilleures performances ».
5. Ouvrir dans Chrome : `http://localhost:5173` (micro autorisé) et, dans un 2ᵉ
   onglet, le tableau de bord Bitnob sandbox (Transactions).
6. Vérifier le quota Gemini (une question test à Tekki).
7. Repartir d'une base propre : arrêter le serveur, `deno task db:reset`,
   relancer `deno task server` (efface les comptes et versements de test de la
   répétition, réinstalle les profils d'exemple).
8. Dans le navigateur de démo, se déconnecter (ou vider le stockage du site)
   pour revoir la landing.

---

## Le scénario

### 1. Le problème (30 s) — Landing

- Ouvrir le lien (non connecté) : la landing explique le constat.
- **Commencer sans compte**, puis **S'inscrire** : créer le compte « Awa ».

### 2. Comprendre (1 min 30) — Marché + Tekki

- **Market** : 48 actions, cours réels publiés par la BRVM.
- Ouvrir **SNTS (Sonatel)** : cours, volume, entreprise. Toucher un **?**.
- Carte « Une question sur SNTS ? » : passer en **WO**, **maintenir le micro**
  et demander : « Lan mooy Sonatel, te lu tax njëgu aksiyoŋ bi wàcc tey ? » (si
  le micro échoue : taper la question).
- Tekki répond en wolof et **lit la réponse** (enchaîner pendant la lecture).
- Montrer « Données et sources » : chiffres issus des données, jamais de
  conseil.

### 3. Approvisionner via Bitnob (1 min 30) — la vraie transaction

- À dire : « TekkiTrade transmet les demandes aux SGI par API ; la SGI valide
  l'ouverture dans ses outils. Pour la démo, le compte est déjà validé. »
- **Portfolio** → **Portefeuille Réel SGI** : **0 FCFA** → **Approvisionner mon
  compte via Bitnob**.
- **5 000 FCFA**, **USDC** (pas USDT ni BTC) → cotation Bitnob en direct.
- Expéditrice « Awa Diop », France → **Obtenir mon instruction de paiement** :
  vraie adresse de dépôt et référence `TKT-…`.
- À dire : « Bitnob n'a pas de simulateur de dépôt en sandbox ; on utilise le
  solde de test, tout ce qui suit est exécuté par Bitnob. »
- **Utiliser le solde de test Bitnob** → ~15 s → « Crédité sur votre compte
  espèces », avec « Transaction Bitnob 01a1… ».
- **Preuve** : onglet Bitnob → Transactions : ligne `TKT-…-P`, ~−8,5 USDC,
  **Successful**.

### 4. Investir (1 min)

- **Portfolio** → Réel : **5 000 FCFA**.
- **Market** → **ETIT** (~65 FCFA) → **Acheter ETIT** → **5 000** → frais ~1,5 %
  détaillés → **Acheter** → avis d'opéré (référence SGI).
- **Portfolio** → Réel → **Comprendre mon portefeuille** : Tekki explique la
  concentration et les frais payés.

### 5. Conclusion (30 s)

- TekkiTrade ne détient jamais les fonds : Bitnob reçoit, convertit, verse ; la
  SGI exécute les ordres.
- Tekki rend la bourse compréhensible, en wolof et en français.
- À dire si on demande : les SGI et l'exécution sont des partenaires de
  démonstration ; les fractions d'action dépendent de l'accord de la SGI et du
  régulateur (la BRVM cote des titres entiers).

---

## Si quelque chose casse

| Problème                              | Réponse                                                                                                |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Bitnob refuse (401/403)               | IP du lieu pas autorisée : l'ajouter, relancer `deno task bitnob:check`                                |
| « Insufficient funds »                | Solde de test épuisé : recharger le portefeuille sandbox                                               |
| « Quota Gemini atteint »              | Activer la facturation Gemini ; à défaut Tekki répond depuis sa base documentaire                      |
| La voix wolof tarde                   | Oolel génère ~1 phrase / 5 s : la lecture démarre dès la première phrase. Sinon Gemini prend le relais |
| Les profils Social sont Fatou/Moussa… | Normal : profils intégrés, Tekki sait aussi les analyser                                               |

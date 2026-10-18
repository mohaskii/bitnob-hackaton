# Tester TekkiTrade à la main

Durée : ~15 min. Sur téléphone (Chrome) ou ordinateur, avec le lien public
(`https://tekkitrade-….gobrev.dev`) ou en local (`http://localhost:5173`).

Ce qui est réel : cours BRVM (différés), Tekki (Gemini) et sa voix wolof, et
**les versements Bitnob (sandbox)**. Ce qui est simulé : les SGI (partenaires de
démonstration) et l'exécution des ordres par la SGI.

## 1. Créer un compte

1. Ouvrir le lien → **Commencer sans compte** (session invitée).
2. Accueil → **menu** (en haut à droite) → **Créer mon compte pour investir**.
3. Email, pseudo, mot de passe (8 caractères min.) → **Créer mon compte**.

> Le mode invité permet de visiter, mais les ordres réels exigent un compte.

## 2. Comprendre une action avec Tekki

1. Onglet **Market** → rechercher `SNTS` → ouvrir **Sonatel**.
2. Toucher un **?** (ex. « Dernier cours ») : une explication s'ouvre.
3. Dans la carte noire « Une question sur SNTS ? », toucher une question. Tekki
   répond avec les chiffres de la fiche. Ouvrir **Données et sources**.
4. Passer en **WO** (en haut de la conversation), puis :
   - écrire `Lan mooy Sonatel ?`, ou
   - **maintenir le micro**, parler en wolof, relâcher (autoriser le micro).
5. Tekki répond en wolof ; **Écouter la réponse** lit la note vocale.

✔ Attendu : réponses chiffrées, jamais de conseil (« achète / vends »).

## 3. Le compte SGI est déjà ouvert

Hypothèse de la démo : TekkiTrade transmet les demandes aux SGI par API, et la
SGI valide l'ouverture dans ses propres outils. Un compte inscrit démarre donc
avec un compte-titres **déjà validé** chez Atlantique Capital, vide (0 FCFA).

> Le parcours complet existe quand même : `/journey` (dossier d'ouverture) et
> `/partner` (vue SGI), si on veut le montrer.

## 4. Approvisionner via Bitnob (vraie transaction sandbox)

1. Onglet **Portfolio** → **Portefeuille Réel SGI** → **Approvisionner mon
   compte via Bitnob**.
2. Montant **5 000**, actif **USDC** (pas USDT ni BTC : portefeuilles de test
   vides). Pas d'étape SGI : le compte est déjà ouvert. Lire la cotation Bitnob
   (taux, frais, montant reçu par la SGI).
3. Nom de l'expéditeur, pays → **Obtenir mon instruction de paiement** : adresse
   de dépôt et référence `TKT-…`.
4. **Utiliser le solde de test Bitnob**. Attendre ~15 s.

✔ Attendu : « 5 000 FCFA versés à Atlantique Capital » et « Transaction Bitnob
01a1… ».

## 5. Le compte est crédité automatiquement

Dès que Bitnob confirme le versement, la SGI (connectée par API) crédite le
compte : **Portfolio** → **Portefeuille Réel SGI** : **5 000 FCFA**, gain 0 %.

## 6. Investir cet argent

1. **Market** → `ETIT` (Ecobank, ~65 FCFA) → **Acheter ETIT**.
2. Montant **5 000** → vérifier le détail des frais (~1,5 %) → **Acheter**.
3. Avis d'opéré : quantité, cours, frais, référence SGI.
4. **Portfolio** → Réel : position ETIT → **Comprendre mon portefeuille** :
   Tekki décrit ce compte (concentration, frais payés).

## 7. Le reste de l'app

- **Social** : sur un post qui cite un titre, **Comprendre avec Tekki** ;
  commenter, aimer.
- **Transferts** entre comptes TekkiTrade : bouton **Transfer** de l'accueil (le
  compte réel doit avoir du solde).
- **Portfolio** → **Entraînement** : portefeuille fictif de 1 000 000 FCFA.

## 8. Vérifier la preuve chez Bitnob

Tableau de bord Bitnob (sandbox) → **Transactions** : nouvelle ligne `TKT-…-P`,
Payout, ~−8,5 USDC, **Successful**.

## Si ça bloque

| Symptôme                            | Cause probable / action                                                            |
| ----------------------------------- | ---------------------------------------------------------------------------------- |
| « IP address not whitelisted »      | Ajouter l'IP du serveur dans la clé API Bitnob                                     |
| « Insufficient funds » au versement | Solde de test USDC épuisé : « Approvisionner le portefeuille de test » chez Bitnob |
| « Choisissez d'abord une SGI »      | Faire l'étape 3 (lien **Comparer les SGI**)                                        |
| « Versement en cours » ne bouge pas | Statut vérifié toutes les 10 s : patienter                                         |
| Achat refusé, solde insuffisant     | Faire créditer le compte (étape 6) ou baisser le montant                           |
| Ordre refusé en invité              | Normal : créer un compte (étape 1)                                                 |
| La voix wolof tarde                 | Lecture phrase par phrase ; Gemini prend le relais si Oolel est indisponible       |

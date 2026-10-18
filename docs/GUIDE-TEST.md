# Tester TekkiTrade à la main

Durée : ~15 min. Sur téléphone (Chrome) ou ordinateur, avec le lien public
(`https://tekkitrade-….gobrev.dev`) ou en local (`http://localhost:5173`).

Ce qui est réel : cours BRVM (différés), Tekki (Gemini) et sa voix wolof, et
**les versements Bitnob (sandbox)**. Ce qui est simulé : les SGI (partenaires de
démonstration) et l'exécution des ordres par la SGI.

## 1. Créer un compte

1. Ouvrir le lien → **Commencer sans compte** (session invitée).
2. Sur l'accueil, en haut : **S'inscrire** (ou ouvrir `/register`).
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

## 3. Ouvrir un compte chez une SGI

1. Onglet **Portfolio** → **Portefeuille Réel SGI** : **0 FCFA**.
2. **Approvisionner mon compte via Bitnob** → « Choisissez d'abord une SGI » →
   **Comparer les SGI**.
3. Comparer les frais → **Choisir Atlantique Capital**.
4. Cocher les 4 pièces (calmement), cocher l'accord → **Transmettre mon
   dossier**.

✔ Attendu : « Dossier transmis », suivi du dossier affiché.

## 4. Jouer le rôle de la SGI

1. Ouvrir `/partner` (ex. `https://tekkitrade-….gobrev.dev/partner`).
2. Sur le dossier le plus récent : **En vérification par la SGI**, puis
   **Compte-titres ouvert**.

## 5. Approvisionner via Bitnob (vraie transaction sandbox)

1. Onglet **Portfolio** → **Portefeuille Réel SGI** → **Approvisionner mon
   compte via Bitnob**.
2. Montant **5 000**, actif **USDC** (pas USDT ni BTC : portefeuilles de test
   vides). Lire la cotation Bitnob (taux, frais, montant reçu par la SGI).
3. Nom de l'expéditeur, pays → **Obtenir mon instruction de paiement** : adresse
   de dépôt et référence `TKT-…`.
4. **Utiliser le solde de test Bitnob**. Attendre ~15 s.

✔ Attendu : « 5 000 FCFA versés à Atlantique Capital » et « Transaction Bitnob
01a1… ».

## 6. La SGI crédite le compte

1. Retour sur `/partner` → **Fonds reçus via Bitnob** → **Confirmer le crédit
   sur le compte client**.
2. **Portfolio** → **Portefeuille Réel SGI** : **5 000 FCFA**, gain 0 %.

## 7. Investir cet argent

1. **Market** → `ETIT` (Ecobank, ~65 FCFA) → **Acheter ETIT**.
2. Montant **5 000** → vérifier le détail des frais (~1,5 %) → **Acheter**.
3. Avis d'opéré : quantité, cours, frais, référence SGI.
4. **Portfolio** → Réel : position ETIT → **Comprendre mon portefeuille** :
   Tekki décrit ce compte (concentration, frais payés).

## 8. Le reste de l'app

- **Social** : sur un post qui cite un titre, **Comprendre avec Tekki** ;
  commenter, aimer.
- **Transferts** entre comptes TekkiTrade : bouton **Transfer** de l'accueil (le
  compte réel doit avoir du solde).
- **Portfolio** → **Entraînement** : portefeuille fictif de 1 000 000 FCFA.

## 9. Vérifier la preuve chez Bitnob

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

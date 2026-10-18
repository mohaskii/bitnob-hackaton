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

- Ouvrir `http://localhost:5173` (non connecté) : la landing explique le
  constat.
- « Commencer » → **Commencer sans compte**.

### 2. Comprendre (1 min 30) — Marché + Tekki

- **Market** : 48 actions, cours réels publiés par la BRVM.
- Ouvrir **SNTS (Sonatel)** : cours, volume, entreprise.
- Dans la carte noire « Une question sur SNTS ? », **maintenir le micro** et
  demander en wolof : « Lan mooy Sonatel, te lu tax njëgu aksiyoŋ bi wàcc tey ?
  »
- Tekki transcrit, répond en wolof, **lit la réponse à voix haute** (note vocale
  réécoutable).
- Montrer « Données et sources » : chaque chiffre vient des données, Tekki ne
  conseille jamais.

### 3. S'entraîner (45 s) — Ticket d'ordre

- « Estimer un achat et s'entraîner » : budget 50 000 FCFA → nombre de titres
  entiers, frais détaillés (courtage, taxe, BRVM, DC/BR).
- **Passer l'ordre fictif** → avis d'opéré.
- **Portfolio** → « Comprendre mon portefeuille » : Tekki explique la
  concentration (100 % SNTS).

### 4. Ouvrir son compte chez une SGI (1 min) — Parcours

- Depuis la fiche : « Pour acheter pour de vrai : choisir une SGI » (ou
  `/journey`).
- Comparer les 3 SGI (frais calculés), **Choisir Atlantique Capital**.
- Cocher les pièces, donner son accord, **Transmettre mon dossier**.
- Basculer sur **l'espace SGI** (`/partner`) : entonnoir, dossier pseudonymisé →
  **Compte-titres ouvert**.

### 5. La vraie transaction Bitnob (1 min 30) — Approvisionner

- Aller sur `/fund` (pastille **BITNOB · SANDBOX**).
- Montant **5 000 FCFA**, actif **USDC** → cotation Bitnob en direct (taux,
  frais, montant reçu par la SGI).
- Nom de l'expéditrice : « Awa … », pays : France → **Obtenir mon instruction de
  paiement**. Bitnob génère une **vraie adresse de dépôt** et la référence
  `TKT-…`.
- **Utiliser le solde de test Bitnob** → la carte passe à « Versement en cours
  », puis « Versé à la SGI ».
- **Preuve** : onglet Bitnob → Transactions : le versement apparaît (montant en
  FCFA, Orange Money Côte d'Ivoire, référence `TKT-…-P`, statut SUCCESS).
- Retour sur `/partner` : « Fonds reçus via Bitnob » → la SGI **confirme le
  crédit**.

### 6. Conclusion (30 s)

- TekkiTrade ne détient jamais les fonds : Bitnob reçoit, convertit, verse ; la
  SGI exécute les ordres.
- Tekki rend la bourse compréhensible, en wolof et en français.

---

## Si quelque chose casse

| Problème                              | Réponse                                                                                                |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Bitnob refuse (401/403)               | IP du lieu pas autorisée : l'ajouter, relancer `deno task bitnob:check`                                |
| « Insufficient funds »                | Solde de test épuisé : recharger le portefeuille sandbox                                               |
| « Quota Gemini atteint »              | Activer la facturation Gemini ; à défaut Tekki répond depuis sa base documentaire                      |
| La voix wolof tarde                   | Oolel génère ~1 phrase / 5 s : la lecture démarre dès la première phrase. Sinon Gemini prend le relais |
| Les profils Social sont Fatou/Moussa… | Normal : profils intégrés, Tekki sait aussi les analyser                                               |

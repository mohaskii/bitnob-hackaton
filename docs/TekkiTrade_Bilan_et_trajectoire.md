# TekkiTrade : bilan et trajectoire

D’où nous partons, où nous allons et pourquoi. Ce qui est fait, ce qui reste, nos forces et nos faiblesses.

Mis à jour le 13 octobre 2026, avant le hackathon Code & Chain Dakar (17–18 octobre 2026, organisé avec Bitnob).

> **En une phrase** TekkiTrade accompagne les débutants de la découverte de la BRVM jusqu’à un compte-titres ouvert **et approvisionné** chez une SGI agréée. TekkiTrade guide, la SGI exécute, Bitnob transporte l’argent depuis n’importe où et la SGI reçoit des FCFA.

---

## 1. D’où nous partons (état au 9 octobre 2026)

### La promesse initiale

Le premier pitch (voir `TEKKI_SPEC_FR.md`, désormais marqué « historique ») reposait sur trois piliers :

- **Actions fractionnées dès 1 000 FCFA** sur les valeurs BRVM ;
- **Copy trading automatique** de « traders vérifiés », avec taux de réussite et performances ;
- **Bitnob comme portefeuille et carte Visa** pour « dépenser ses dividendes ».

### Ce que faisait réellement le code

| Domaine | Constat |
| --- | --- |
| Données affichées | Solde (209 890 FCFA), traders « vérifiés », performances, actualités (dont un dividende Sonatel) et sentiment de marché **codés en dur** dans le front. Seule la page Marché lisait de vrais cours BRVM. |
| Ordres | La route d’ordre n’était appelée par aucun écran. Une **vente fonctionnait comme un achat** : elle débitait le solde et ajoutait des titres. Aucune transaction SQL. |
| Copy trading | Un contrat était enregistré, mais aucun ordre n’était reproduit ni aucun capital réservé. |
| Comptes | La connexion **ne vérifiait pas le mot de passe**. Le jeton de session était simplement `mock_session_token_user_<id>`. |
| Bitnob | Toute erreur de l’API **retombait silencieusement sur une réponse simulée** : un retrait Mobile Money refusé aurait été affiché comme réussi et le solde débité. Le webhook acceptait les appels sans signature. Le client utilisait l’ancienne API (URL et authentification obsolètes). |
| Marché | Chaque affichage et chaque ordre interrogeaient brvm.org, sans cache ni secours. Un ticker était mal attribué (CABC présenté comme Coris Bank). |
| Dépôt | `.env` et la base SQLite étaient suivis par git. `ROADMAP.md` décrivait un autre projet (live-commerce). |

### Pourquoi ce n’était pas tenable

- **Juridiquement** : seules les SGI agréées peuvent négocier à la BRVM. Les fractions, la copie d’ordres réels et une carte financée par des dividendes supposent des montages qu’aucune SGI ni aucun régulateur n’avait validés.
- **Commercialement** : la catégorie « application pour investir à la BRVM » est déjà occupée (application BRVM, applications de SGI, Daba, Famaya). Un simulateur et un affichage de cours ne différencient pas.
- **Face à un jury** : des chiffres inventés et des badges « vérifié » se repèrent vite et ruinent la crédibilité. Le règlement du hackathon exige en plus un **usage significatif de l’API Bitnob**, qui n’existait qu’en simulation.

---

## 2. Où nous allons

### Positionnement

Un **parcours mobile d’acquisition et d’accompagnement pour les SGI** : aider une personne curieuse à comprendre, s’entraîner, choisir une SGI, ouvrir son compte et **l’approvisionner**, avec un suivi compréhensible à chaque étape.

| Acteur | Rôle |
| --- | --- |
| TekkiTrade | Guide : données sourcées, explications au bon moment, entraînement, préparation du dossier, suivi. |
| SGI partenaire | Exécute : ouverture du compte, vérifications d’identité, ordres réels, conservation des titres. |
| Bitnob | Transporte l’argent : stablecoins ou Bitcoin en entrée, FCFA versés sur le portefeuille de collecte de la SGI. |

### Le parcours en 6 étapes

1. **Découvrir un titre** : fiche en langage simple, cours daté, source BRVM.
2. **Comprendre les coûts** : titres entiers, courtage, taxe, commissions BRVM (0,20 %) et DC/BR (0,10 %).
3. **S’entraîner** : 1 000 000 FCFA fictifs aux vrais cours différés, avec un avis d’opéré simulé.
4. **Choisir une SGI** : frais, minimum, délai, pièces, moyens de financement.
5. **Ouvrir son compte** : pièces, consentement explicite, dossier transmis, statuts communiqués par la SGI.
6. **Approvisionner** : via Bitnob depuis n’importe où, la SGI reçoit des FCFA avec la référence du client.

> **Pitch** TekkiTrade rend l’accès à la BRVM compréhensible et simple à parcourir. Nous aidons les SGI à accompagner les débutants, de la découverte jusqu’au compte-titres approvisionné : données sourcées, entraînement sans argent réel, suivi transparent, et un financement depuis n’importe où grâce à Bitnob, reçu en FCFA par la SGI.

---

## 3. Pourquoi ce virage

### Bitnob au centre : l’approvisionnement du compte

Après l’ouverture du compte, il faut l’approvisionner. C’est là que beaucoup d’investisseurs abandonnent, surtout dans la diaspora : virement international, change, délais, et rapprochement manuel par la SGI.

- **Le précédent** : en 2019, les Diaspora Bonds de BHS exigeaient un bulletin scanné et un versement par espèces, chèque ou virement. Seules 238 obligations ont été échangées.
- **Le potentiel** : environ 2 522 milliards de FCFA par an de transferts de la diaspora vers le Sénégal et environ 1 060 milliards vers la Côte d’Ivoire (rapport FIDA 2026).
- **Le contexte réglementaire bancaire** : en mars 2026, la BCEAO a ouvert aux non-résidents de l’UEMOA les comptes en FCFA dans les banques de l’Union.
- **Ce que Bitnob sait faire** : recevoir des stablecoins et du Bitcoin (Lightning), convertir, puis verser des FCFA en Mobile Money. Ce n’est pas une promesse marketing : nous l’avons vérifié en sandbox (section 4).

| Pour l’investisseur | Pour la SGI | Pour Bitnob |
| --- | --- | --- |
| Financer depuis n’importe où, coût affiché avant l’envoi, suivi de chaque étape. | De nouveaux clients, y compris non-résidents, des fonds reçus en FCFA déjà rapprochés par référence, et un entonnoir mesurable. | Un usage concret de ses rails stablecoin → FCFA sur un marché d’épargne. |

### Les principes que nous nous imposons

- **Aucune donnée inventée** : les cours viennent de la BRVM, avec date et source. Les SGI de démonstration, l’argent fictif et les profils d’exemple sont étiquetés partout.
- **TekkiTrade ne détient jamais les fonds.** En août 2026, l’UEMOA n’a pas encore de régime spécifique pour les crypto-actifs et la BCEAO appelle à la prudence. Une mise en service réelle passe donc par l’accord de la SGI, la vérification d’identité par Bitnob et une analyse juridique.
- **Ce que nous ne promettons pas sans validation** : fractions d’action, copy trading réel, ouverture instantanée, frais nuls, disponibilité identique chez toutes les SGI.

---

## 4. Ce qui a été fait (refonte du 13 octobre 2026)

| Domaine | Réalisé | Vérifié comment |
| --- | --- | --- |
| Données de marché | 48 cours BRVM, indices, bulletin officiel. Cache de 60 s, dernier relevé servi si brvm.org tombe, historique quotidien. Fiches entreprises en langage simple pour 47 sociétés. | Récupération réelle des cours ; l’app affiche la source et l’heure de publication. |
| Frais | Barème BRVM publié, courtage et taxe de la SGI choisie, calcul en titres entiers. | Tests automatiques. Exemple : 50 000 FCFA sur SNTS donnent 1 titre, 1 315 FCFA de frais, 3 685 FCFA de reste. |
| Entraînement | Achat et vente distincts, prix de revient unitaire, plus-values, avis d’opéré simulé, transactions SQL atomiques. | Tests (vente au-delà du détenu, fraction et solde insuffisant refusés, sans effet de bord). |
| Parcours SGI | Comparaison de 3 SGI de démonstration, pièces à préparer, consentement, statuts, espace SGI avec entonnoir et dossiers pseudonymisés. | Parcours complet joué dans l’app (6/6 étapes). |
| **Bitnob (sandbox réelle)** | Requêtes signées HMAC sur l’API actuelle. Cotations stablecoin → FCFA. Adresses de dépôt. Factures Lightning. Conversion BTC → USDT via Bitnob Trading. Versements Mobile Money vers la SGI. Détection automatique des dépôts sans webhook. Webhook vérifié et idempotent. | Identifiants acceptés ; cotation réelle de 597,9 FCFA par USDT ; **dépôt réel de 20 USDC reçu** ; **versements réels de 100 FCFA vers la Côte d’Ivoire, statut `SUCCESS`**. |
| Sécurité | Mot de passe vérifié (PBKDF2 avec sel par utilisateur), sessions signées, webhook refusé sans signature hors simulation, aucun repli silencieux vers la simulation, secrets et base hors git. | Tests (jetons falsifiés rejetés, dépôt rejoué crédité une seule fois). |
| Interface | 7 écrans mobiles (Accueil, Marché, Pratique, Compte, Financer, Espace SGI, Communauté), fiche titre, ticket d’ordre, QR code de paiement, explications contextuelles. | Parcours joué en mobile dans le navigateur. |
| Nettoyage | Suppression des faux traders, du copy trading, des fausses actus, du faux solde et de la carte Visa. README, ROADMAP et ce document réécrits. | — |

**Ce que la sandbox nous a appris, et que le code applique :**

- Les versements en FCFA ne sont ouverts qu’en **Côte d’Ivoire, au Sénégal et au Niger**, uniquement en Mobile Money, de 100 à 2 000 000 FCFA. Le Bénin n’est pas couvert : la SGI de démonstration béninoise est affichée « financement par virement ».
- Bitnob exige le **nom et le pays de l’expéditeur** : l’écran Financer les demande.
- Pas de cotation directe BTC → FCFA : les BTC passent par **Bitnob Trading** (conversion en USDT), ce qui protège aussi l’investisseur de la volatilité.
- Pas de réseau TRON : les stablecoins arrivent sur **Ethereum** (testnet Sepolia en sandbox), un réseau configurable.

---

## 5. Nos forces

1. **Un problème réel et chiffré** : financer un compte-titres depuis la diaspora. C’est un usage de Bitnob naturel, pas plaqué.
2. **Une intégration Bitnob prouvée en sandbox**, de bout en bout jusqu’au versement réussi, avec quatre briques Bitnob qui ont chacune une raison d’être : paiements, stablecoins, Lightning et Trading.
3. **Une crédibilité rare** : vraies données BRVM sourcées, rôles clairs (guide, SGI, Bitnob), limites assumées, et rien d’inventé.
4. **Un parcours complet et démontrable** : de la découverte au compte approvisionné, côté investisseur et côté SGI.
5. **Une base technique solide** : logique métier testée, transactions atomiques, sécurité de base, architecture prête à brancher l’API d’une SGI.
6. **Une interface soignée**, pensée mobile, avec de la pédagogie au moment de l’action.

## 6. Nos faiblesses et risques

| Faiblesse | Impact | Parade |
| --- | --- | --- |
| Aucune SGI réelle, aucun entretien utilisateur | Le jury peut douter de la demande et de l’adoption. | Entretiens avec la diaspora et des débutants cette semaine, un contact SGI, et citer ces retours dans le pitch. |
| Modèle économique non formalisé | Question certaine du jury. | Proposition : la SGI paie par compte ouvert et approvisionné, plus une marge éventuelle sur l’approvisionnement en accord avec Bitnob. |
| Bout en bout réel incomplet | Dépôt sur une adresse générée par l’app, paiement Lightning testnet et ordre Bitnob Trading pas encore testés en réel. | Tester avant le 17, et privilégier USDC pour la démo en direct. |
| Sandbox Bitnob imparfaite | Le solde affiché est parfois à 0 alors que le registre est juste ; l’en-tête de signature du webhook n’est pas confirmé. | Ne pas montrer le solde du dashboard ; s’appuyer sur la détection par les transactions ; signaler le bug à Bitnob. |
| Lecture HTML des pages BRVM | Une refonte du site BRVM casse la récupération. | Dernier relevé servi en secours ; à terme, accord de diffusion officiel. |
| Espace SGI sans authentification | Acceptable en démo uniquement. | Désactivé en production ; authentification et rôles avant un pilote. |
| Cadre crypto de l’UEMOA non défini | Frein réglementaire à une mise en service réelle. | TekkiTrade ne détient jamais les fonds ; analyse juridique et accord SGI et Bitnob avant tout lancement. |
| Communauté peu développée | Faible valeur ajoutée aujourd’hui. | Secondaire, et assumée comme « apprendre en observant ». |
| Projet commencé avant l’événement | Le règlement demande un développement pendant le hackathon. | Le présenter en toute transparence. |

---

## 7. Ce qui reste à faire

### Avant le hackathon (d’ici le 16 octobre)

- [ ] **Approvisionnement réel depuis l’app** : envoyer des USDC de test (Sepolia) à une adresse générée par l’app, puis vérifier la détection, le versement à la SGI et le crédit.
- [ ] **Webhook** : tunnel HTTPS vers l’API, URL déclarée chez Bitnob, et confirmation de l’en-tête de signature au premier appel.
- [ ] **Tester Bitnob Trading** en réel (ordre BTC → USDT), ou retirer Bitcoin de la démo en direct.
- [ ] **Preuves de demande** : 10 à 15 entretiens courts et une prise de contact avec une SGI.
- [ ] **Pitch de 3 minutes et deck** : histoire, chiffres, démo en direct, « ce qui est réel, ce qui est simulé », modèle économique.
- [ ] **Dépôt prêt à montrer** : licence MIT, schéma d’architecture, GIF de démo, version déployée en ligne. Rendre le dépôt public le jour J.
- [ ] **Vidéo de secours** de la démo, au cas où le réseau ou la sandbox lâche.

### Le jour J

- [ ] Ajouter l’IP du réseau de l’événement à la liste blanche de la clé Bitnob.
- [ ] Rencontrer les ingénieurs Bitnob pendant les permanences de mentorat.
- [ ] Adapter le discours au thème annoncé le premier jour.

### Avant un pilote réel (P0)

- [ ] Une SGI pilote : grille tarifaire homologuée, pièces, délais, portefeuille de collecte Mobile Money.
- [ ] Analyse juridique : rôle de TekkiTrade, règles de la BCEAO sur les paiements et les crypto-actifs, vérification d’identité Bitnob, données personnelles.
- [ ] Accord avec Bitnob : volumes, plafonds, frais.

### Pendant le pilote (P1)

- [ ] Brancher l’API ou le back-office de la SGI (statuts de dossier, confirmation du crédit) à la place de l’espace SGI de démonstration.
- [ ] Authentification de l’espace partenaire, journaux d’accès, sauvegardes, supervision.
- [ ] Flux de cours officiel (accord de diffusion BRVM) à la place de la lecture HTML.
- [ ] Notifications : statut du dossier, fonds reçus.

### Plus tard, sous réserve de validation (P2)

- [ ] Ordres réels transmis à la SGI et vrais avis d’opéré.
- [ ] Chemin retour : ventes et dividendes renvoyés vers la diaspora via Bitnob.
- [ ] Fractions d’action, uniquement si une SGI et le régulateur valident un montage.

---

## 8. Où nous en sommes face aux critères du hackathon

Estimations internes sur 10, pour piloter nos priorités ; ce ne sont pas des prédictions.

| Critère | Le 9 oct. | Aujourd’hui | Objectif au Demo Day | Levier principal |
| --- | --- | --- | --- | --- |
| Innovation et créativité | 5 | 7 | 8 | Récit diaspora et rôle de Bitnob dans le financement du compte |
| Réalisation technique | 4 | 8 | 8,5 | Bout en bout réel depuis l’app |
| Usage de Bitcoin et de l’API Bitnob | 2 | 7 | 8,5 | Paiement en direct sur scène, Lightning et Trading testés |
| Impact concret | 5 | 8 | 8,5 | Entretiens et contact SGI |
| UX et design | 6 | 8 | 8,5 | Version en ligne et finitions |
| Présentation et open source | 3 | 5,5 | 8 | Deck, licence, dépôt public, démo répétée |

---

## 9. Sources

- [BRVM — Comment investir à la BRVM](https://www.brvm.org/fr/comment-investir-la-brvm)
- [BRVM — Frais applicables](https://www.brvm.org/en/what-are-applicable-fees)
- [BRVM — Bilan 2025 du marché](https://www.brvm.org/en/node/1444402)
- [BRVM — Flux différé](https://www.brvm.org/fr/flux-differe)
- [BRVM — Application officielle et portefeuille virtuel](https://www.brvm.org/en/node/102085)
- [Société Générale CI — E_Bourse](https://particuliers.societegenerale.ci/fr/epargner/placements/e-bourse/)
- [Daba — Offre publique](https://dabafinance.com/en)
- [Famaya — À propos](https://famaya.app/a-propos)
- [eToro — CopyTrader](https://help.etoro.com/articles/en_GB/Knowledge/What-is-CopyTrader)
- [Code & Chain Dakar 2026 — site du hackathon](https://code-chain-dakar.vercel.app/)
- [Bitnob — Documentation développeurs](https://bitnob.dev/)
- [Bitnob — Devises de versement prises en charge](https://bitnob.dev/docs/payouts/supported-currencies)
- [Bitnob — Devises locales (centre d’aide, avril 2026)](https://intercom.help/Bitnob-help-center/en/articles/14685950-supported-local-currencies-on-bitnob)
- [TechMoran — Bitnob Business et Enterprise (juin 2026)](https://techmoran.com/2026/06/03/bitnob-unveils-enterprise-stack-as-demand-for-stablecoin-infrastructure-accelerates/)
- [Le Soleil — Transferts de la diaspora, rapport FIDA](https://lesoleil.sn/actualites/economie/le-senegal-trone-dans-luemoa-avec-2522-milliards-de-fcfa/)
- [Ecofin — BCEAO : comptes FCFA pour la diaspora (mars 2026)](https://www.ecofinagency.com/news-finances/2303-53987-west-africa-targets-diaspora-funds-with-new-banking-access-rules)
- [Droit & Médias Finance — Diaspora Bonds BHS](https://droitmediasfinance.com/index.php/actualites/droit-des-marches-financiers/134-brvm-les-obligations-destinees-a-la-diaspora-demarrent-au-ralenti)
- [Agence Ecofin — Réglementation des cryptoactifs dans l’UEMOA](https://www.agenceecofin.com/actualites-finance/2407-140478-uemoa-la-reglementation-des-cryptoactifs-reste-en-preparation-la-bceao-appelle-a-la-prudence)
- [Financial Afrik — Encadrement des cryptoactifs dans l’UEMOA (août 2026)](https://www.financialafrik.com/2026/08/26/lencadrement-des-cryptoactifs-dans-luemoa-entre-innovation-financiere-et-preservation-de-la-stabilite-monetaire/)

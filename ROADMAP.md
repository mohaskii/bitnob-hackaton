# Feuille de route TekkiTrade

Référence : [docs/TekkiTrade_Bilan_et_trajectoire.md](docs/TekkiTrade_Bilan_et_trajectoire.md)

## Fait (démo hackathon)

- [x] Cours BRVM réels et différés : source, date et statut de séance affichés, cache de 60 s, dernier relevé en secours, historique quotidien.
- [x] Fiches titres en langage simple (47 sociétés cotées) et explications contextuelles.
- [x] Estimation des frais : titres entiers, courtage SGI, taxe, BRVM 0,20 %, DC/BR 0,10 %.
- [x] Entraînement : achat et vente distincts, PRU, plus-values, avis d'opéré simulé, transactions SQL.
- [x] Parcours SGI : comparaison, pièces, consentement, dossier, statuts, espace partenaire.
- [x] Approvisionnement via Bitnob : cotation XOF, facture Lightning ou adresse stablecoin, versement à la SGI avec référence, webhook idempotent.
- [x] Sécurité de base : sessions signées, PBKDF2 avec sel, webhook vérifié, secrets hors git.
- [x] Tests du domaine (`deno task test`).

## P0 : avant un pilote

- [ ] Entretiens avec des débutants (dont la diaspora) et 2 à 3 SGI. Choisir la cible et l'indicateur de réussite.
- [ ] Remplacer une SGI de démonstration par la SGI pilote : grille homologuée, pièces, délais, portefeuille de collecte.
- [x] Sandbox Bitnob : signature, cotations, adresses, Lightning, versement réel `SUCCESS` (13 oct.).
- [ ] Approvisionnement réel depuis une adresse générée par l’app, Bitnob Trading (BTC → USDT) testé en réel.
- [ ] Analyse réglementaire : rôle de TekkiTrade (apporteur, agent ?), règles BCEAO sur les paiements et les crypto-actifs, KYC Bitnob.

## P1 : pilote

- [ ] API ou back-office de la SGI pour les statuts de dossier et la confirmation du crédit (remplace l'espace SGI de démo).
- [ ] Authentification de l'espace partenaire (rôles, journaux d'accès).
- [ ] Accord de diffusion des cours BRVM (flux différé officiel) à la place de la lecture HTML.
- [ ] Notifications (statut du dossier, fonds reçus).
- [ ] Sauvegardes, supervision, rotation des secrets.

## P2 : extensions sous réserve de validation

- [ ] Ordres réels transmis à la SGI et avis d'opéré réels.
- [ ] Retour des ventes et dividendes vers la diaspora via Bitnob.
- [ ] Stratégies d'observation enrichies (sans copie d'ordres réels).
- [ ] Fractions d'action, uniquement si une SGI et le régulateur valident un montage.

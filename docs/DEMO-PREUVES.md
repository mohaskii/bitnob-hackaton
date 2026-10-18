# Démo TekkiTrade — montrer les preuves en direct

Objectif : que le jury **voie** que tout est réel (cours, IA, voix, transaction
Bitnob), pas une maquette.

---

## A. 30 min avant — préparer l'écran

1. **Connexion : partage 4G du téléphone** (pas le Wi-Fi du lieu : un pare-feu
   peut bloquer le lien).
2. **Brev allumé** : console Brev → instance `tekkitrade` → _Running_.
3. Ouvrir **4 onglets** sur l'ordinateur projeté, dans cet ordre :
   1. **L'app** : `https://tekkitrade-jbhf2b00l.gobrev.dev` (vue mobile : F12 →
      icône téléphone, ou la projeter depuis le téléphone).
   2. **Bitnob** : tableau de bord sandbox → **Transactions**.
   3. **brvm.org** : la page des cours ou du dernier bulletin officiel.
   4. **Terminal** (preuve du webhook, facultatif) : ouvrir **WSL** (taper
      `wsl`), puis :
      `ssh tekkitrade "docker logs -f --since 1m tekkitrade-app 2>&1 | grep 'Bitnob Webhook'"`
      (si refusé : `brev refresh` dans WSL, puis relancer).
4. **Noter le solde Bitnob** (onglet 2, accueil) : ex. « 68 USDC ».
5. **Répétition éclair** : ouvrir l'app, poser une question à Tekki (réchauffe
   le serveur et la voix wolof).
6. Avoir **une adresse email jetable** prête pour créer le compte devant le
   jury.

---

## B. La démo — point par point

### 1. Le problème (30 s)

- Onglet **app**, landing : « Awa vit à Paris, veut investir dans Sonatel, ne
  comprend pas la bourse, ne sait pas comment envoyer l'argent à une SGI, a peur
  des frais cachés. »
- **Commencer sans compte** → **menu** (en haut à droite) → **Créer mon compte
  pour investir** → créer le compte en direct.

> Preuve : un compte se crée devant le jury, rien n'est préchargé.

### 2. Des cours réels (30 s)

- **Market** → rechercher `SNTS` → ouvrir **Sonatel** → montrer le cours et la
  date « Publié le … · brvm.org ».
- **Basculer sur l'onglet brvm.org** : même cours, même séance.

> Preuve : les données viennent de la BRVM, pas d'un fichier inventé.

### 3. Une vraie IA, en wolof (1 min 30)

- Toucher un **?** (ex. « Dernier cours ») : l'explication s'ouvre.
- Carte « Une question sur SNTS ? » → **WO** → **maintenir le micro** et
  demander en wolof : « Lan mooy Sonatel ? » (si le micro échoue : taper).
- Pendant que Tekki répond (~10 s en 4G), dire : « la réponse est générée
  maintenant, à partir des chiffres de la fiche ».
- **Écouter la réponse** : voix wolof générée sur notre GPU (Oolel).
- **Données et sources** : montrer que chaque chiffre vient de la fiche.
- **Demander au jury une question** et la poser telle quelle.
- Essayer « Est-ce que je dois acheter Sonatel ? » : Tekki **refuse de
  conseiller** et explique à la place.

> Preuves : question non préparée, réponse chiffrée et sourcée, voix wolof,
> garde-fou anti-conseil.

### 4. La vraie transaction Bitnob (2 min) — le moment fort

- Dire : « La SGI valide l'ouverture du compte dans ses outils ; on part d'un
  compte validé. »
- **Portfolio** → **Portefeuille Réel SGI** : **0 FCFA**.
- **Approvisionner mon compte via Bitnob** → **5 000 FCFA**, **USDC** (ne pas
  changer).
- Montrer la **cotation Bitnob en direct** (taux du moment, frais 0).
- Nom : « Awa Diop », pays : France → **Obtenir mon instruction de paiement**.
- Montrer la **vraie adresse de dépôt** et la **référence `TKT-ATL-…`** : «
  générées par Bitnob à l'instant ».
- Dire : « Bitnob n'a pas de simulateur de dépôt en sandbox : on utilise le
  solde de test. Tout ce qui suit est exécuté par Bitnob. »
- **Utiliser le solde de test Bitnob** → ~12 s → **« Crédité sur votre compte
  espèces »** + **« Transaction Bitnob 01a1… »**.
- (Facultatif) **Onglet terminal** : les lignes
  `[Bitnob Webhook]
  payouts.withdrawal.success` viennent d'apparaître : «
  Bitnob nous a prévenus par webhook signé ».
- **Basculer sur l'onglet Bitnob → Transactions → Actualiser** :
  - nouvelle ligne **`TKT-ATL-…-P`**, **Payout**, **~−8,49 USDC**,
    **Successful** ;
  - **même référence** que dans l'app (+ `-P`) ;
  - le **solde a baissé** par rapport au chiffre noté en préparation.

> Preuves : la transaction existe chez Bitnob, avec notre référence, au moment
> où le jury regarde.

### 5. Investir cet argent (1 min)

- **Portfolio** → Réel : **5 000 FCFA** (« 0 % depuis le départ » : le dépôt
  n'est pas compté comme un gain).
- **Market** → `ETIT` → **Acheter ETIT** → **5 000** → ouvrir **Frais estimés**
  : 73 FCFA, détaillés (courtage 1 % + TVA, BRVM 0,2 %, DC/BR 0,1 %).
- **Acheter** → **avis d'opéré** : quantité, cours, frais, référence SGI.
- **Portfolio** → Réel → **Comprendre mon portefeuille** : Tekki lit le compte
  réel (100 % ETIT, frais payés) et explique la concentration.

> Preuves : l'argent arrivé par Bitnob est investi ; chaque franc de frais est
> visible.

### 6. Conclusion (30 s)

- « TekkiTrade ne détient jamais les fonds : Bitnob reçoit, convertit, verse ;
  la SGI exécute. »
- « Trois problèmes réglés : comprendre (Tekki en wolof), envoyer (Bitnob),
  payer le juste prix (frais détaillés). »

---

## C. Ce qu'on ne montre pas

- **Withdraw** et **Carte Visa** (accueil) : maquettes. Si on demande : feuille
  de route (retrait Mobile Money, carte).
- **Recent Market News** (accueil) : l'actualité Sonatel « dividende record »
  n'est pas sourcée. Ne pas la lire ni la montrer.
- Les fractions d'action comme acquises : « possibles via le compte collectif de
  la SGI, sous réserve de son accord et du régulateur ».

## D. Si ça casse

| Problème               | Réponse immédiate                                                        |
| ---------------------- | ------------------------------------------------------------------------ |
| Le lien ne charge pas  | Vérifier la 4G ; sinon Brev arrêté → le redémarrer (~2 min)              |
| Tekki lent             | Parler pendant qu'il répond ; il répond en 4 à 13 s                      |
| Micro refusé           | Taper la question en wolof                                               |
| « Insufficient funds » | Solde de test vide : Bitnob → « Approvisionner le portefeuille de test » |
| Crédit qui tarde       | Attendre 10 s (vérification automatique)                                 |
| Achat refusé           | Montant > solde : choisir **5 000**                                      |

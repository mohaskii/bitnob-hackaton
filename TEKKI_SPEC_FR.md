> **Document historique, remplacé.** Ce cahier décrit la première idée (fractions dès 1 000 FCFA, copy trading automatique, carte Visa). Ces promesses ont été retirées parce qu'elles ne sont pas validées par une SGI ni par le régulateur. Le positionnement actuel est décrit dans [docs/TekkiTrade_Bilan_et_trajectoire.md](docs/TekkiTrade_Bilan_et_trajectoire.md).

# TekkiTrade — La Bourse Régionale pour Tous
> **Document de Cadrage & Spécification Hackathon Bitnob**  
> *Nom du projet :* **TekkiTrade** (ou **Tekki**)  
> *Slogan :* *"Tekki ci BRVM : L'investissement boursier ouest-africain dès 1 000 FCFA."*  
> *Cible :* Les 8 pays de l'UEMOA (Sénégal, Côte d'Ivoire, Bénin, Togo, Burkina Faso, Mali, Niger, Guinée-Bissau) + Diaspora africaine  

---

## 🇸🇳 1. Identité & Vision : Pourquoi "Tekki" ?

### La Signification Culturelle
En Wolof, **"Tekki"** est l'un des mots les plus forts et les plus universellement respectés. Il signifie :
* **Réussir sa vie, s'émanciper, prendre son envol financier, devenir quelqu'un.**
* L'expression populaire *"Tekki ci réew mi"* résume le rêve de toute la jeunesse sénégalaise et ouest-africaine : **créer sa richesse chez soi, sans devoir partir à l'aventure.**

### Le Problème du Marché
La **BRVM** (Bourse Régionale des Valeurs Mobilières) pèse plus de **21 400 milliards FCFA (~35 milliards USD)** et regroupe **48 fleurons économiques** d'Afrique de l'Ouest (Sonatel, Orange CI, Ecobank, Société Générale CI, Total Sénégal, etc.).

Pourtant, **moins de 1 % des citoyens y investissent** :
1. **Les actions coûtent trop cher à l'unité :** Une seule action Sonatel coûte ~18 000 FCFA, une action SGBC ~20 000 FCFA. Pour un étudiant ou un jeune travailleur, c'est bloquant.
2. **Le système est archaïque :** Passer par des courtiers physiques (SGI) avec des formulaires papier décourage les jeunes.
3. **Peur de l'inconnu :** Manque d'éducation financière et peur des arnaques.

### La Solution TekkiTrade
Une application mobile de **Social Trading et d'Investissement Fractionné**, inspirée du géant mondial **eToro** et propulsée par **l'infrastructure financière de Bitnob**.

---

## 📖 2. La Bourse Expliquée Simplement (Pour Ton Binôme )


### A. C'est quoi une "Action" ?
* **L'analogie du Taxi ou du "Tangana" :**  
  Imagine qu'un ami veuille acheter un taxi qui coûte 10 millions FCFA, mais qu'il n'a pas les fonds. Il découpe la propriété du taxi en **1 000 tickets de 10 000 FCFA**. Chaque ticket s'appelle une **action**.
  * Si tu achètes 1 ticket, tu n'es pas un prêteur : tu es **copropriétaire** du taxi à hauteur de 0,1 %.
  * Si la société de taxi prospère et possède demain 50 véhicules, ton ticket ne vaut plus 10 000 FCFA, mais peut-être 35 000 FCFA. C'est la **plus-value**.
* **Sur la BRVM :**  
  Acheter une action **Sonatel**, c'est devenir copropriétaire de la Sonatel. Chaque fois qu'une personne achète un forfait internet Orange ou paye avec Orange Money au Sénégal ou au Mali, une part infime de cette valeur revient dans ta poche.

### B. Comment est garantie l'authenticité d'une action ? (L'entité de référence)
* **La question :** *"Comment sait-on que ce n'est pas une arnaque ou du faux papier ?"*
* **L'analogie du Cadastre pour un terrain :**  
  Quand tu achètes une parcelle de terrain à Dakar ou Abidjan, tu ne te contentes pas d'un papier manuscrit : tu vérifies le **titre foncier au Cadastre de l'État**.
* **Dans la finance régionale (Le DC/BR) :**  
  Il existe une institution suprême commune aux 8 pays de l'UEMOA : le **DC/BR (Dépositaire Central / Banque de Règlement)**, supervisé par l'**AMF-UMOA** (le gendarme financier officiel).
  1. **Zéro falsification possible :** Chaque action émise est dématérialisée, possède un code d'identification unique (code ISIN) et est inscrite dans le grand livre officiel du DC/BR. Aucune entreprise ne peut imprimer des actions secrètes.
  2. **Réseau certifié :** Seules les **SGI** (Sociétés de Gestion et d'Intermédiation agréées) ont la clé informatique pour inscrire des ordres dans ce registre.
  3. **Rôle de TekkiTrade :** L'application est adossée à une SGI partenaire. Les actions réelles dorment dans le coffre-fort numérique officiel du DC/BR, pendant que TekkiTrade gère l'interface mobile intuitive et le fractionnement.

### C. C'est quoi un "Dividende" ?
* **L'analogie du Manguier :**  
  Imagine que tu possèdes un manguier avec un associé. Après avoir payé l'eau et l'entretien toute l'année, le manguier produit 100 cageots de mangues. Vous en gardez 20 pour replanter, et vous vous partagez les 80 restants. Cette part de récolte encaissée en argent liquide, c'est le **dividende**.
* **Le cas réel Sonatel :**  
  Chaque année, après avoir payé ses charges et ses impôts, la Sonatel reverse ses bénéfices à ses actionnaires.
  * En mai/juin, la Sonatel verse environ **1 500 à 1 700 FCFA par action** directement en cash.
  * **Tu n'as pas besoin de vendre ton action pour toucher cet argent :** l'action reste à toi et continue de t'appartenir, mais de l'argent liquide tombe chaque année sur ton compte.

### D. C'est quoi l'action fractionnée (*Fractional Share*) ?
* Une action Sonatel vaut ~18 000 FCFA. Un jeune n'a souvent que 2 000 FCFA.
* TekkiTrade achète 1 action entière certifiée au DC/BR et la découpe dans son grand livre informatique : l'utilisateur reçoit **0,11 action Sonatel**.
* Quand Sonatel verse son dividende de 1 600 FCFA, l'utilisateur reçoit automatiquement ses **176 FCFA** proportionnellement. Personne n'est exclu de la création de richesse.

---

## 👥 3. Le Modèle eToro : Les 3 Piliers Clés

1. **L'Investissement Fractionné :** Permettre l'achat d'actifs au montant en FCFA plutôt qu'au nombre d'actions entières (dès 1 000 FCFA).
2. **Le Social Trading & Copy-Trading :**
   * Un fil d'actualité où les meilleurs analystes partagent leurs portefeuilles.
   * Un bouton **"Copier ce Trader"** : le débutant alloue une somme, et chaque mouvement du trader expert est répliqué automatiquement en pourcentage sur son compte.
3. **La Monnaie Pivot Universelle :**
   * eToro utilise le Dollar US comme étalon mondial.
   * **TekkiTrade utilise les Stablecoins USD (USDT / USDC) via Bitnob** comme monnaie pivot neutre reliant le Sénégal (FCFA), le Nigéria (Naira) et la diaspora en Europe/USA.

---

## ⚡ 4. L'Architecture Technique & Le Rôle Clé de Bitnob

Bitnob est la colonne vertébrale financière de TekkiTrade : trésorerie, rails crypto/Lightning et retraits Mobile Money.

```
                  ┌─────────────────────────────────────────────────────────────┐
                  │                 APPLICATION TEKKITRADE                      │
                  │   - Front-end Mobile / Web (Social Feed & Copy Trading)     │
                  │   - BDD des 48 cours BRVM (Sonatel, Orange CI, SGBC...)     │
                  │   - Grand livre interne des parts fractionnées              │
                  └──────────────┬──────────────────────────────┬───────────────┘
                                 │                              │
                    [1. ALIMENTATION DU COMPTE]                 │ [3. RETRAITS & UTILITÉ]
                                 ▼                              ▼
             ┌───────────────────────────────┐      ┌───────────────────────────────┐
             │       BITNOB INGESTION        │      │    BITNOB PAYOUTS & CARDS     │
             │ • Bitcoin Lightning (instantané)    │ • Retraits Mobile Money réels │
             │   POST /api/lightning/invoices│   │   POST /api/payouts/quotes    │
             │ • Adresses Dépôt USDT         │      │   POST /api/payouts/.../init  │
             │   POST /api/addresses         │      │   POST /api/payouts/.../final │
             │ • Comptes Virtuels NGN        │      │ • Cartes Virtuelles Visa USD  │
             │   POST /api/virtual-accounts  │      │   POST /api/cards             │
             └──────────────┬────────────────┘      └───────────────────────────────┘
                            │
                            ▼
             ┌───────────────────────────────┐
             │   BITNOB WALLET INFRASTRUCTURE│
             │ • Trésorerie Enclave Sécurisée│
             │   POST /wallets               │
             └───────────────────────────────┘
```

### Les 5 Vecteurs d'Intégration Bitnob Réels :

1. **Vecteur 1 — Trésorerie & Wallets Utilisateurs (`POST /wallets`) :**
   * À la création de compte, un wallet dédié est lié au `customer_ref_id` du client dans le coffre-fort Bitnob.
   * La liquidité réelle (USDT, BTC) est conservée en sécurité dans l'enclave Bitnob.

2. **Vecteur 2 — Financement Transfrontalier (Lightning & USDT) :**
   * **Bitcoin Lightning :** `POST /api/lightning/invoices`. Dépôts instantanés avec frais quasi-nuls (< 0,01 $). Idéal pour les petits tickets et la diaspora.
   * **Stablecoins :** `POST /api/addresses`. Adresses Tron (TRC-20) / Ethereum pour déposer des USDT/USDC.
   * **Nigéria :** `POST /api/virtual-accounts`. Permet aux investisseurs nigérians de déposer en Naira pour acheter des actions francophones.

3. **Vecteur 3 — Retraits de Dividendes vers Wave & Orange Money :**
   * Quand Sonatel ou Ecobank verse un dividende, l'utilisateur peut encaisser son cash en 3 étapes via l'API Payouts de Bitnob :
     1. `POST /api/payouts/quotes` (Cotation USDT $\rightarrow$ XOF).
     2. `POST /api/payouts/:quoteId/initialize` (Sélection Mobile Money : Orange Money ou Wave au Sénégal/Côte d'Ivoire).
     3. `POST /api/payouts/:quoteId/finalize` (Déclenchement du paiement instantané sur le téléphone du client).

4. **Vecteur 4 — L'Effet "Waouh" : La Carte Virtuelle Visa Dividendes (`POST /api/cards`) :**
   * L'utilisateur peut créer en 1 clic une **Carte Virtuelle Visa Bitnob**.
   * Ses dividendes Sonatel y sont injectés (`POST /api/cards/:cardId/balance`).
   * Il peut dépenser directement ses gains boursiers sur Netflix, Amazon, Spotify ou des achats en ligne !

5. **Vecteur 5 — Webhooks Temps Réel :**
   * Détection automatique des paiements Lightning et mise à jour immédiate du solde de l'utilisateur.

---

## 🎬 5. Déroulement du Scénario de Démo (Pour les Jurés)

1. **Écran 1 (Onboarding) :**
   * Moussa se connecte sur TekkiTrade.
   * Il voit le Social Feed : "Fatou_Invest", investisseuse star, avec +28 % de performance sur Sonatel et Orange CI.
2. **Écran 2 (Dépôt) :**
   * Moussa dépose 5 000 FCFA via un QR Code Lightning Bitnob (ou USDT).
   * Webhook reçu $\rightarrow$ Son solde affiche 5 000 FCFA (8,20 USDT).
3. **Écran 3 (Achat Fractionné & Copie) :**
   * Moussa clique sur **"Copier Fatou_Invest"** avec 3 000 FCFA.
   * L'algorithme achète automatiquement **0,11 action Sonatel** et **0,4 action Ecobank**.
4. **Écran 4 (Réception du Dividende & Encaissement) :**
   * Simulation : Sonatel distribue un dividende. Le compte de Moussa reçoit 500 FCFA.
   * Deux boutons d'action s'offrent à lui :
     * **Bouton A :** "Retirer sur Wave / Orange Money" (déclenche Bitnob Payouts).
     * **Bouton B :** "Charger sur ma Carte Virtuelle Visa" (déclenche Bitnob Cards).


## 🎤 6. Pitch Éclair de 60 Secondes (À réciter devant le jury)

> *"Bonjour à tous.  
> En Afrique de l'Ouest, la BRVM pèse 35 milliards de dollars avec 48 géants économiques comme Sonatel ou Orange CI. Pourtant, 99 % des jeunes de notre génération sont exclus de la bourse parce qu'une seule action coûte trop cher et que les banques traditionnelles sont trop compliquées.  
> Nous avons créé **TekkiTrade** : la première plateforme de social trading et d'investissement fractionné sur la BRVM. En Wolof, Tekki signifie réussir et s'émanciper chez soi.  
> Grâce aux APIs de **Bitnob**, nous apportons les trois chaînons manquants :  
> 1. Un financement ultra-rapide par **Bitcoin Lightning et Stablecoins**, sans frontières.  
> 2. Le retrait instantané des dividendes directement vers **Wave et Orange Money**.  
> 3. Et une **Carte Virtuelle Visa** pour dépenser ses bénéfices boursiers dans la vraie vie.  
> Avec TekkiTrade et Bitnob, nous ne faisons pas que moderniser la finance : nous donnons à chaque jeune ouest-africain le pouvoir de **tekki** !"*

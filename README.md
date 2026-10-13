# TekkiTrade : votre première action BRVM, étape par étape

TekkiTrade accompagne les débutants de la découverte de la **BRVM** (Bourse Régionale des Valeurs Mobilières, UEMOA) jusqu'à un compte-titres ouvert **et approvisionné** chez une SGI agréée.

- **TekkiTrade guide** : cours sourcés, frais expliqués, entraînement, préparation du dossier, suivi.
- **La SGI partenaire exécute** : ouverture du compte, vérifications d'identité, ordres réels, conservation des titres.
- **Bitnob transporte l'argent** : l'investisseur envoie USDT, USDC ou Bitcoin depuis n'importe où, et la SGI reçoit des **FCFA** avec sa référence.

> Bilan, trajectoire et plan de travail : [docs/TekkiTrade_Bilan_et_trajectoire.md](docs/TekkiTrade_Bilan_et_trajectoire.md)

---

## Le parcours (6 étapes)

| # | Étape | Ce que voit l'utilisateur | Données |
|---|---|---|---|
| 1 | Découvrir un titre | Fiche : activité de l'entreprise, cours daté, source, volume | **Réelles** (brvm.org, différé) |
| 2 | Comprendre les coûts | Estimation : titres entiers, courtage, taxe, BRVM 0,20 %, DC/BR 0,10 % | Barème BRVM publié + barème SGI |
| 3 | S'entraîner | Ordre fictif, avis d'opéré simulé, portefeuille, plus-values | Argent fictif, cours réels |
| 4 | Choisir une SGI | Comparaison : frais sur 100 000 FCFA, minimum, délai, pièces | SGI **de démonstration** |
| 5 | Ouvrir son compte | Liste de pièces, consentement, dossier transmis, statuts | Statuts fournis par la SGI |
| 6 | Approvisionner | Cotation Bitnob, QR Lightning ou adresse USDT, suivi jusqu'au crédit | **Bitnob** (simulation / sandbox / live) |

Un **espace SGI** (`/partner`) montre le côté partenaire : entonnoir d'acquisition, dossiers pseudonymisés, fonds reçus via Bitnob à créditer.

## Pourquoi Bitnob est au centre

L'approvisionnement du compte est l'étape où l'on perd le plus d'investisseurs, en particulier ceux de la diaspora. Il faut faire un virement international, payer des frais de change, attendre plusieurs jours, et la SGI doit rapprocher le versement à la main. TekkiTrade s'appuie sur ce que Bitnob sait faire en 2026 :

- **Entrées** : stablecoins USDC/USDT sur une adresse dédiée (`POST /api/addresses`) et Bitcoin via facture Lightning (`POST /api/lightning/invoices`).
- **Conversion** : les BTC reçus sont vendus en USDT via Bitnob Trading, ce qui supprime le risque de prix avant le versement.
- **Sorties en FCFA** : versements Mobile Money vers la Côte d'Ivoire, le Sénégal et le Niger, de 100 à 2 000 000 FCFA (`/api/payouts/quotes` → `initialize` → `finalize`).
- **Rapprochement** : chaque versement porte la référence `TKT-…` du client, et la SGI confirme le crédit.

Tout cela a été vérifié en sandbox le 13 octobre 2026 : dépôt réel de 20 USDC reçu, puis versement de 100 FCFA vers un portefeuille Orange Money en Côte d'Ivoire, au statut `SUCCESS`.

TekkiTrade **ne détient jamais les fonds**. En mode simulation, aucun transfert n'a lieu, et l'interface l'indique partout.

## Ce qui est réel, simulé ou à valider

| Élément | État |
|---|---|
| Cours, indices, bulletin officiel | Réels, **différés**, lus sur brvm.org. Cache de 60 s et dernier relevé servi si le site est indisponible. Aucun prix n'est inventé. |
| Commissions BRVM / DC/BR | Réelles (0,20 % + 0,10 %, [source BRVM](https://www.brvm.org/en/what-are-applicable-fees)) |
| Courtage, minimums, délais des SGI | **Démonstration** : à remplacer par la grille homologuée de la SGI pilote |
| Ordres et portefeuille | **Simulés** (argent fictif, titres entiers, exécution au dernier cours publié) |
| Statuts de dossier | Simulés depuis l'espace SGI, à remplacer par l'API ou le back-office de la SGI |
| Bitnob | Simulation par défaut. Sandbox ou live avec des identifiants Bitnob (requêtes signées HMAC-SHA256) |
| Communauté | Profils et performances **d'exemple**. Aucun ordre n'est copié. |

Ce que TekkiTrade **ne promet pas** sans validation : fractions d'action, copy trading réel, ouverture instantanée, frais nuls.

## Architecture

```
api/                     Backend Deno (port 8000)
  domain/                Logique métier pure et testée
    fees.ts              Barème BRVM + courtage SGI, titres entiers
    paper.ts             Entraînement : achat/vente, PRU, P&L, transactions SQL
    sgi.ts               Catalogue des SGI (démo) + portefeuille de collecte Bitnob
    journey.ts           Parcours, dossier, statuts, entonnoir partenaire
    funding.ts           Approvisionnement via Bitnob (cotation, dépôt, versement)
    companies.ts         Fiches entreprises en langage simple
    domain_test.ts       Tests (deno task test)
  bitnob/client.ts       Client Bitnob signé (simulation | sandbox | live)
  bitnob/webhook.ts      Webhook vérifié et idempotent
  lib/auth.ts            PBKDF2 avec sel par utilisateur, sessions signées HMAC
  market-data.ts         Lecture des pages BRVM, cache, historique, secours
  routes.ts              Routes HTTP (GET /api/doc pour la liste)
app/                     Front Preact + signals (port 5173)
  features/<feature>/    *-state.ts (moteur) + composants
  screens/               Accueil, Marché, Pratique, Compte, Financer, Espace SGI, Communauté
capacitor/               Coque mobile Android
```

---

## Démarrage rapide

```bash
deno install
cp .env.example .env        # identifiants Bitnob vides = mode simulation
deno task db:reset          # crée la base, ajoute les exemples, récupère les cours BRVM
deno task server            # API sur http://localhost:8000
deno task dev               # app sur http://localhost:5173
deno task test              # tests du domaine (frais, entraînement, parcours, Bitnob, sessions)
```

### Passer Bitnob en sandbox

1. Créez une clé API sandbox dans le tableau de bord Bitnob (Settings > API Keys) et ajoutez l'IP de la machine qui fait tourner l'API à la liste blanche.
2. Renseignez `BITNOB_CLIENT_ID` et `BITNOB_CLIENT_SECRET` dans `.env`. `BITNOB_STABLECOIN_CHAIN=ethereum` correspond au testnet Sepolia en sandbox.
3. Vérifiez la configuration (signature, cotations par pays, sans afficher de secret) :

```bash
deno task bitnob:check
```

4. Les dépôts sont détectés automatiquement (lecture des transactions Bitnob toutes les 10 s). Le webhook est facultatif : pour l'activer, exposez `POST /api/bitnob/webhook` via un tunnel HTTPS et renseignez `BITNOB_WEBHOOK_SECRET`.

Pour obtenir des USDC de test, utilisez [faucet.circle.com](https://faucet.circle.com/) (Ethereum Sepolia).

En sandbox, l'endpoint de solde Bitnob affiche parfois 0 alors que le registre des transactions est correct : ne vous fiez pas à ce solde.

### Script de démo (5 minutes)

1. « Commencer sans compte » ouvre un compte invité neuf, ce qui rend la démo rejouable.
2. Marché → SNTS : fiche, cours daté et source, puis « Estimer un achat » avec un budget de 50 000 FCFA (1 titre entier et frais détaillés).
3. Passer l'ordre fictif et lire l'avis d'opéré.
4. Compte : comparer les 3 SGI, choisir, cocher les pièces, consentir, transmettre.
5. Espace SGI : passer le dossier en « Compte-titres ouvert ».
6. Financer : 5 000 FCFA en USDC donnent une cotation Bitnob, une adresse de dépôt (QR code) et une référence. En simulation, cliquez sur « Simuler la réception » ; en sandbox, envoyez les USDC de test et l'app détecte le dépôt toute seule.
7. Espace SGI : « Confirmer le crédit ». L'accueil affiche alors 6/6.

---

## Prerequisites & Installation (Step-by-Step)

Install each required toolchain component one by one:

### 1. Deno (Runtime for Backend & Frontend Bundler)

TekkiTrade requires Deno (v2.0+ recommended):

- **Linux / macOS**:
  ```bash
  curl -fsSL https://deno.land/install.sh | sh
  ```
- **macOS via Homebrew**:
  ```bash
  brew install deno
  ```
- **Windows (PowerShell)**:
  ```powershell
  irm https://deno.land/install.ps1 | iex
  ```
- **Verify installation**:
  ```bash
  deno --version
  ```

### 2. Node.js & npm (Required for Capacitor CLI)

Capacitor CLI relies on Node.js and npm:

- **Linux / Ubuntu / Debian**:
  ```bash
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
  ```
- **macOS via Homebrew**:
  ```bash
  brew install node
  ```
- **Windows**: Download the LTS installer from [nodejs.org](https://nodejs.org/).
- **Verify installation**:
  ```bash
  node -v
  npm -v
  npx -v
  ```

### 3. Java Development Kit (JDK 17 or 21 for Android)

Android builds require OpenJDK 17 or 21:

- **Linux**:
  ```bash
  sudo apt update && sudo apt install -y openjdk-17-jdk
  ```
- **macOS via Homebrew**:
  ```bash
  brew install openjdk@17
  sudo ln -sfn /opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk /Library/Java/JavaVirtualMachines/openjdk-17.jdk
  ```
- **Verify and set JAVA_HOME**:
  ```bash
  java -version
  # Add to your ~/.bashrc or ~/.zshrc:
  export JAVA_HOME=$(dirname $(dirname $(readlink -f $(which javac))))
  ```

### 4. Android Studio & Android SDK (For Android)

1. Download and install **Android Studio** from [developer.android.com/studio](https://developer.android.com/studio).
2. During setup, install:
   - **Android SDK Platform-Tools** (`adb`)
   - **Android SDK Build-Tools** (version 34+)
   - **Android SDK Command-line Tools**
   - **Android SDK Platform** (API 34 / Android 14)
3. Set your Android environment variables in `~/.bashrc` or `~/.zshrc`:
   ```bash
   export ANDROID_HOME=$HOME/Android/Sdk
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
   ```
4. Verify `adb`:
   ```bash
   adb version
   ```

### 5. Xcode & Xcode Command Line Tools (For iOS on macOS only)

1. Install **Xcode** from the Mac App Store.
2. Install Xcode Command Line Tools:
   ```bash
   xcode-select --install
   ```
3. Accept the Xcode license:
   ```bash
   sudo xcodebuild -license accept
   ```
4. Install CocoaPods (if using legacy pods):
   ```bash
   sudo gem install cocoapods
   ```

---

## Running on Mobile with Capacitor

Capacitor bridges the Preact web frontend into a high-performance native Android and iOS mobile app.

### Setting up the Host URL for Mobile

When running on an emulator or physical mobile phone, the mobile device cannot access `localhost` directly. Update `capacitor/capacitor.config.json` with your development computer's local Wi-Fi IP address:

```json
{
  "appId": "com.Lolo.app",
  "appName": "TekkiTrade",
  "webDir": "dist",
  "server": {
    "url": "http://192.168.1.137:5173",
    "cleartext": true
  }
}
```

> Replace `192.168.1.137` with your computer's local IP (obtain via `ip a` on Linux or `ifconfig` on macOS).

---

### Android Workflow (Emulators & Paired Physical Devices)

#### Option A: Running on an Android Emulator
1. Open **Android Studio** -> **Virtual Device Manager** (Device Manager in right sidebar).
2. Click **Create Device** (e.g. Pixel 8, System Image: API 34).
3. Start the virtual device.
4. Verify `adb` detects the emulator:
   ```bash
   adb devices
   ```
   *(Example output: `emulator-5554 device`)*

#### Option B: Pairing a Physical Android Device
1. On your Android phone, enable **Developer Options**:
   - Go to **Settings** -> **About Phone** -> Tap **Build Number** 7 times until you see *"You are now a developer!"*.
2. In **Settings** -> **System** -> **Developer Options**:
   - Enable **USB Debugging**.
   - (Optional) Enable **Wireless Debugging** if connecting over Wi-Fi without cables.
3. Connect your device via USB cable. When prompted on the phone screen, check **Always allow from this computer** and tap **Allow**.
4. If using **Wireless Debugging**:
   - Tap **Wireless Debugging** -> **Pair device with pairing code**.
   - In terminal:
     ```bash
     adb pair <ip-address>:<port> <pairing-code>
     adb connect <ip-address>:<connect-port>
     ```
5. Check connected devices:
   ```bash
   adb devices
   ```

#### Listing Targets and Launching the App
Navigate to the `capacitor/` folder:

```bash
cd capacitor

# 1. List all available devices and emulators
npx cap run android --list
```

Example output:
```
Available Android targets:
  emulator-5554 (Pixel 8 API 34)
  R58M345XYZW   (Samsung Galaxy S22)
```

```bash
# 2. Sync web assets and plugins to native Android project
npx cap sync android

# 3. Build and launch on your specific target
npx cap run android --target <device id>
```

*Example running on emulator:*
```bash
npx cap sync android && npx cap run android --target emulator-5554
```

*Example running on physical phone:*
```bash
npx cap sync android && npx cap run android --target R58M345XYZW
```

#### Opening Android Studio Directly
If you prefer building and inspecting directly inside Android Studio:
```bash
cd capacitor
npx cap open android
```
In Android Studio:
1. Wait for Gradle sync to finish.
2. Select your device from the target dropdown in the top toolbar.
3. Click the green **Run** (Play) button or press `Shift + F10`.

---

### iOS Workflow with Xcode (Step-by-Step)

> **Requirement**: macOS with Xcode 15+ installed.

#### Step 1: Add iOS Platform (First time only)
```bash
cd capacitor
npx cap add ios
```

#### Step 2: Sync Web Assets to Xcode Project
```bash
npx cap sync ios
```

#### Step 3: List Available iOS Simulators and Devices
```bash
npx cap run ios --list
```
Example output:
```
Available iOS targets:
  iPhone 15 Pro (Simulator - 785A1B8E-...)
  iPhone 15 (Simulator - 90EFB23C-...)
  Mohamed's iPhone (Device - 00008101-...)
```

#### Step 4: Run via Command Line
```bash
npx cap run ios --target <device id>
```
*Example:*
```bash
npx cap run ios --target "iPhone 15 Pro"
```

#### Step 5: Opening and Configuring in Xcode
Open the iOS project in Xcode:
```bash
cd capacitor
npx cap open ios
```

Configure signing in Xcode:
1. In Xcode's left **Project Navigator**, click the top-level **App** project item.
2. Select the **App** target and open the **Signing & Capabilities** tab.
3. Check the box **Automatically manage signing**.
4. In the **Team** dropdown, select your Apple Developer Account (or personal Apple ID).
5. In the top toolbar device selector, pick your desired **Simulator** (e.g., *iPhone 15 Pro*) or your connected physical iPhone.
6. Press the **Play** button (or press `Cmd + R`) to compile and run.

#### Running on a Physical iPhone:
1. When running on a physical iPhone for the first time with a free personal developer account, iOS blocks execution until the certificate is trusted.
2. On your iPhone, open **Settings** -> **General** -> **VPN & Device Management**.
3. Under **Developer App**, select your Apple ID email.
4. Tap **Trust [Your Name/Email]** and confirm.
5. Tap the TekkiTrade app icon on your home screen to launch.

---

## Qualité et vérification

- État front : moteurs à base de signals (`*-state.ts`), composants fins, aucune logique dans les composants (voir [`.agent/rules/pattern.md`](.agent/rules/pattern.md)).
- SQL paramétré. Les écritures qui touchent plusieurs tables passent par `withTransaction`.
- Sessions signées, mots de passe PBKDF2 avec sel par utilisateur, webhook Bitnob refusé sans signature valide hors simulation.

```bash
deno task test
deno check api/server.ts api/task-seed.ts app/main.tsx
```

La liste des routes est disponible sur `GET /api/doc`.

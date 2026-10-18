# Mettre TekkiTrade en ligne

## Option recommandée : tout sur une machine GPU NVIDIA Brev

Tout tourne sur la machine Brev (API, base SQLite, voix wolof Oolel sur le GPU),
avec Docker Compose (`compose.yaml`). Rien ne dépend du PC.

### Première fois

1. **Créer l'instance** sur [brev.nvidia.com](https://brev.nvidia.com) : une GPU
   NVIDIA (L4 ou mieux), mode VM avec Docker. Noter son nom.
2. **Se connecter au CLI Brev dans WSL** (comme pour defendable) : `wsl` puis
   `brev login`, puis `brev refresh` (écrit la config SSH). Tester :
   `ssh <instance> "docker --version && nvidia-smi"`.
3. **Déployer** depuis le projet, sous Windows :
   `deno task deploy:brev <instance>` (la première construction prend plusieurs
   minutes ; au premier démarrage, Oolel télécharge son modèle, ~8 Go, puis le
   garde dans un volume).
4. **Lien public** : console Brev → l'instance → **Access** → **Secure Links** →
   port **3000**, nom `tekkitrade`, accès **public**. On obtient
   `https://tekkitrade-xxxx.gobrev.dev`.
5. **Bitnob** : ajouter l'**IP publique de l'instance** à la liste d'IP
   autorisées de la clé API (sinon tous les appels Bitnob sont refusés). L'IP :
   `ssh <instance> "curl -s ifconfig.me"`.

### Les fois suivantes

Commiter, puis
`deno task deploy:brev <instance> https://tekkitrade-xxxx.gobrev.dev` (le script
attend que le lien réponde). Base de données et modèle sont conservés.

### Commandes utiles

- Logs : `ssh <instance> "cd ~/tekkitrade && docker compose logs --tail 40"`
- Voix prête ? `ssh <instance> "docker logs tekkitrade-oolel | grep ready"`
- Base propre :
  `ssh <instance> "cd ~/tekkitrade && docker compose down && docker volume rm tekkitrade_tekkitrade-data && docker compose up -d"`

---

## Autre option : Deno Deploy + PC local

```
Visiteur → https://<app>.deno.dev   (Deno Deploy : sert l'app, relaie /api/*)
                 ▼
         tunnel Cloudflare (https) → PC : serveur :8000 · SQLite · Oolel · Bitnob
```

Pourquoi le serveur reste sur le PC : Bitnob n'accepte que des IP autorisées
(Deno Deploy n'a pas d'IP fixe), la voix wolof (Oolel) a besoin du GPU, et la
base SQLite est locale.

## Première fois

1. Créer un compte sur [console.deno.com](https://console.deno.com) (connexion
   GitHub).
2. Terminal 1 : `deno task server` (et, pour la voix wolof, Oolel dans un autre
   terminal).
3. Terminal 2 : `deno task live`
   - construit l'app et la copie dans `deploy/public` ;
   - **la première fois**, crée l'app Deno Deploy : choisir l'organisation,
     nommer l'app (ex. `tekkitrade`) ; un navigateur s'ouvre pour se connecter ;
   - ouvre le tunnel Cloudflare, enregistre son adresse dans `BACKEND_URL` sur
     Deno Deploy, puis publie.
4. Ouvrir le lien `https://<app>.deno.dev` affiché à la fin.

Si `deno task live` redemande de créer l'app à chaque fois, écrire dans
`deploy/deno.json` :
`{ "deploy": { "org": "<organisation>", "app": "<nom de l'app>" } }`.

## Les fois suivantes

`deno task server` puis `deno task live`. Le lien `.deno.dev` ne change pas ;
seule l'adresse du tunnel change, et le script la met à jour.

## À savoir

- **Le PC doit rester allumé et connecté**, avec le terminal de `deno task live`
  ouvert. Sinon l'app s'affiche mais renvoie « serveur injoignable ».
- **Lien de secours** : l'adresse `https://….trycloudflare.com` affichée par le
  script sert la même app directement depuis le PC.
- **Le lien est public** : n'importe qui peut créer un compte invité. En
  sandbox, chaque « Utiliser le solde de test Bitnob » dépense ~8,5 USDC de
  test.

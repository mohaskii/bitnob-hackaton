# Mettre TekkiTrade en ligne (Deno Deploy + machine locale)

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

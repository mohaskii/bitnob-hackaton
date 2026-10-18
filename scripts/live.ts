/**
 * `deno task live`: puts the local TekkiTrade server online behind the Deno
 * Deploy app.
 *
 * 1. checks the local server answers (deno task server must be running);
 * 2. builds the PWA and copies it into deploy/public;
 * 3. opens a Cloudflare tunnel to localhost:8000 and reads its https address;
 * 4. stores that address as BACKEND_URL on Deno Deploy and redeploys deploy/.
 *
 * Keep this terminal open: closing it closes the tunnel.
 */
import { copy, emptyDir } from "jsr:@std/fs@1";
import { fromFileUrl } from "jsr:@std/path@1";

const ROOT = fromFileUrl(new URL("..", import.meta.url));
const DEPLOY_DIR = `${ROOT}deploy`;
const LOCAL = "http://localhost:8000";

const step = (text: string) => console.log(`\n▶ ${text}`);

const run = async (cmd: string, args: string[], cwd = ROOT) => {
  const { code } = await new Deno.Command(cmd, {
    args,
    cwd,
    stdin: "inherit", // Deno Deploy may ask questions or open a login page
    stdout: "inherit",
    stderr: "inherit",
  }).output();
  return code === 0;
};

const reachable = async (url: string) =>
  await fetch(`${url}/api/config`, { signal: AbortSignal.timeout(8_000) })
    .then((r) => r.ok).catch(() => false);

step("Serveur local");
if (!(await reachable(LOCAL))) {
  console.error(
    "✘ Le serveur ne répond pas sur localhost:8000. Lance d’abord « deno task server ».",
  );
  Deno.exit(1);
}
console.log("✔ localhost:8000 répond");

step("Construction de l’app");
if (!(await run("deno", ["task", "build"]))) Deno.exit(1);
await emptyDir(`${DEPLOY_DIR}/public`);
await copy(`${ROOT}app/dist`, `${DEPLOY_DIR}/public`, { overwrite: true });
console.log("✔ app copiée dans deploy/public");

/** `deno deploy create` stores the org and app in deploy/deno.json. */
const deployConfigured = async () => {
  const config = JSON.parse(await Deno.readTextFile(`${DEPLOY_DIR}/deno.json`));
  return Boolean(config?.deploy?.app);
};
if (!(await deployConfigured())) {
  step("Première fois : création de l’app sur Deno Deploy");
  console.log(
    "Réponds aux questions (organisation, nom de l’app). Un navigateur peut s’ouvrir pour te connecter.",
  );
  const created = await run("deno", [
    "deploy",
    "create",
    "--runtime-mode",
    "dynamic",
    "--entrypoint",
    "main.ts",
    "--do-not-use-detected-build-config",
  ], DEPLOY_DIR);
  if (!created) Deno.exit(1);
}

step("Tunnel Cloudflare vers localhost:8000");
const tunnel = new Deno.Command("cloudflared", {
  args: ["tunnel", "--no-autoupdate", "--url", LOCAL],
  stdout: "piped",
  stderr: "piped",
}).spawn();

/**
 * cloudflared prints the address of the quick tunnel on its logs. Its output
 * keeps being drained afterwards, otherwise a full pipe would stall it.
 */
const findTunnelUrl = () =>
  new Promise<string | null>((resolve) => {
    const decoder = new TextDecoder();
    let buffer = "";
    let found = false;
    (async () => {
      for await (const chunk of tunnel.stderr) {
        if (found) continue;
        buffer += decoder.decode(chunk);
        const match = buffer.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);
        if (match) {
          found = true;
          resolve(match[0]);
        }
      }
      if (!found) resolve(null);
    })();
    tunnel.stdout.pipeTo(new WritableStream()).catch(() => {});
  });
const tunnelUrl = await findTunnelUrl();
if (!tunnelUrl) {
  console.error("✘ cloudflared n’a pas donné d’adresse.");
  Deno.exit(1);
}
for (let i = 0; i < 30 && !(await reachable(tunnelUrl)); i++) {
  await new Promise((r) => setTimeout(r, 2_000));
}
if (!(await reachable(tunnelUrl))) {
  console.error(`✘ Le tunnel ${tunnelUrl} ne répond pas.`);
  Deno.exit(1);
}
console.log(`✔ ${tunnelUrl} → localhost:8000`);

step("Mise à jour de BACKEND_URL sur Deno Deploy");
const updated = await run(
  "deno",
  ["deploy", "env", "update-value", "BACKEND_URL", tunnelUrl],
  DEPLOY_DIR,
) ||
  await run(
    "deno",
    ["deploy", "env", "add", "BACKEND_URL", tunnelUrl],
    DEPLOY_DIR,
  );
if (!updated) {
  console.error(
    "✘ Impossible de mettre à jour BACKEND_URL (connecté à Deno Deploy ?).",
  );
  Deno.exit(1);
}

step("Publication sur Deno Deploy");
if (!(await run("deno", ["deploy", "--prod"], DEPLOY_DIR))) Deno.exit(1);

console.log(`
✔ TekkiTrade est en ligne.
  Lien public : celui de ton app Deno Deploy (affiché ci-dessus)
  Secours     : ${tunnelUrl} (même app, servie directement par ton PC)

Laisse ce terminal ouvert : le fermer coupe le tunnel.`);

// Keep the tunnel alive until Ctrl+C.
await tunnel.status;

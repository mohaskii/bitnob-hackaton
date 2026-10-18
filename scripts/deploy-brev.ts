/**
 * `deno task deploy:brev <instance> [public-url]`: deploys the committed code
 * (HEAD) on the NVIDIA Brev GPU machine and (re)starts it with Docker Compose.
 *
 * - The repository is private: the code travels in the SSH session (git
 *   archive), the machine needs no GitHub access.
 * - Keys (Bitnob, Gemini…) are copied from the local .env into
 *   ~/tekkitrade/.env-prod (mode 600) on the machine, never printed nor put on
 *   a command line. A random SESSION_SECRET is generated there the first time.
 * - Database and voice model live in Docker volumes: they survive redeploys.
 * - On Windows the Brev SSH config lives in WSL (`brev refresh` there).
 */
import { parse } from 'jsr:@std/dotenv@0.225/parse'
import { encodeBase64 } from 'jsr:@std/encoding@1/base64'

const instance = Deno.args[0] ?? Deno.env.get('BREV_INSTANCE')
const publicUrl = Deno.args[1] ?? Deno.env.get('DEPLOY_URL')
if (!instance) {
  console.error('Usage : deno task deploy:brev <instance-brev> [url-publique]')
  Deno.exit(2)
}

/** Keys of the local .env needed by the server on the machine. */
const SYNCED =
  /^(BITNOB_|GEMINI_|AI_PROVIDER|OLLAMA_|OOLEL_LANGUAGES|SIM_|SESSION_SECRET)/

const step = (text: string) => console.log(`\n▶ ${text}`)

const git = async (args: string[]) => {
  const out = await new Deno.Command('git', { args, stdout: 'piped' }).output()
  return out.stdout
}

step('Code à déployer')
const dirty = new TextDecoder().decode(await git(['status', '--porcelain']))
  .split('\n').filter((line) => line && !line.startsWith('??'))
if (dirty.length) {
  console.log(
    `⚠ ${dirty.length} fichier(s) modifié(s) non commité(s) : seul le dernier commit est déployé.`,
  )
}
const commit = new TextDecoder().decode(
  await git(['log', '-1', '--format=%h %s']),
)
  .trim()
console.log(`  ${commit}`)
const archive = encodeBase64(
  await git(['archive', '--format=tar.gz', 'HEAD']),
)

const local = await Deno.readTextFile('.env').then(parse).catch(() => ({}))
const synced = Object.entries(local)
  .filter(([key, value]) => SYNCED.test(key) && value)
  .map(([key, value]) => `${key}=${value}`)
  .join('\n')

/** Read by `bash -s` on the machine: nothing secret goes on a command line. */
const remoteScript = String.raw`
set -euo pipefail
mkdir -p ~/tekkitrade && cd ~/tekkitrade

# 1. code of the commit (everything except .env-prod is replaced)
find . -mindepth 1 -maxdepth 1 ! -name .env-prod -exec rm -rf {} +
echo '${archive}' | base64 -d | tar -xz

# 2. keys
ENV_FILE=.env-prod
umask 077
touch "$ENV_FILE"
set_env() {
  { grep -v "^$1=" "$ENV_FILE" || true; printf '%s\n' "$2"; } > "$ENV_FILE.tmp"
  mv "$ENV_FILE.tmp" "$ENV_FILE"
}
echo '${encodeBase64(`${synced}\n`)}' | base64 -d | while IFS= read -r line; do
  [ -n "$line" ] && set_env "$${'{'}line%%=*}" "$line"
done
if ! grep -q '^SESSION_SECRET=' "$ENV_FILE" \
  || grep -q '^SESSION_SECRET=tekkitrade-dev' "$ENV_FILE"; then
  set_env SESSION_SECRET "SESSION_SECRET=$(head -c 32 /dev/urandom | base64 | tr -d '/+=')"
fi
chmod 600 "$ENV_FILE"

# 3. build and (re)start
docker compose up -d --build
docker image prune -f >/dev/null
docker compose ps
`

step(
  `Envoi et construction sur ${instance} (la première fois : plusieurs minutes)`,
)
// On Windows the Brev ssh config lives inside WSL, not in Windows OpenSSH.
const [cmd, args] = Deno.build.os === 'windows'
  ? ['wsl', ['-e', 'bash', '-lc', `ssh -T ${instance} bash -s`]]
  : ['ssh', ['-T', instance, 'bash -s']]
const child = new Deno.Command(cmd, { args, stdin: 'piped' }).spawn()
const writer = child.stdin.getWriter()
await writer.write(new TextEncoder().encode(remoteScript))
await writer.close()
const { code } = await child.status
if (code !== 0) {
  console.error(`✘ Déploiement interrompu (code ${code}).`)
  Deno.exit(code)
}

if (publicUrl) {
  step(`Vérification de ${publicUrl}`)
  for (let i = 0; i < 40; i++) {
    const ok = await fetch(`${publicUrl.replace(/\/$/, '')}/api/config`, {
      signal: AbortSignal.timeout(10_000),
    }).then((r) => r.ok).catch(() => false)
    if (ok) {
      console.log(`✔ En ligne : ${publicUrl}`)
      Deno.exit(0)
    }
    await new Promise((r) => setTimeout(r, 3_000))
  }
  console.error(`✘ ${publicUrl} ne répond pas encore.`)
  console.error(
    `  Logs : ssh ${instance} "cd ~/tekkitrade && docker compose logs --tail 40"`,
  )
  Deno.exit(1)
}
console.log(
  '✔ Déployé (port 3000 de la machine). Crée le Secure Link Brev si ce n’est pas fait.',
)

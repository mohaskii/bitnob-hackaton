/**
 * TekkiTrade on Deno Deploy: serves the built app (public/) and relays every
 * /api request to the TekkiTrade server running on our machine (Bitnob only
 * accepts calls from an authorised IP, the Wolof voice needs the local GPU,
 * and the SQLite database lives there).
 *
 * BACKEND_URL: public HTTPS address of the local server (Cloudflare tunnel),
 * set by `deno task live`.
 */
import { serveDir, serveFile } from "jsr:@std/http@1/file-server";
import { fromFileUrl } from "jsr:@std/path@1";

const PUBLIC = fromFileUrl(new URL("./public", import.meta.url));
const BACKEND = (Deno.env.get("BACKEND_URL") ?? "").replace(/\/+$/, "");

const offline = (message: string) =>
  Response.json({ message }, { status: 503 });

/** Same request, same headers (session token included), to the local server. */
const relay = async (req: Request, url: URL) => {
  if (!BACKEND) return offline("Le serveur TekkiTrade n’est pas relié.");
  const headers = new Headers(req.headers);
  headers.delete("host");
  try {
    const res = await fetch(`${BACKEND}${url.pathname}${url.search}`, {
      method: req.method,
      headers,
      body: req.method === "GET" || req.method === "HEAD"
        ? undefined
        : await req.arrayBuffer(),
      redirect: "manual",
      signal: AbortSignal.timeout(120_000),
    });
    const out = new Headers(res.headers);
    // fetch already decoded the body: drop headers that describe the encoding.
    out.delete("content-encoding");
    out.delete("content-length");
    return new Response(res.body, { status: res.status, headers: out });
  } catch {
    return offline(
      "Le serveur TekkiTrade est momentanément injoignable. Réessaie dans un instant.",
    );
  }
};

/** The PWA, with the same caching rules as api/server.ts. */
const app = async (req: Request, url: URL) => {
  const res = await serveDir(req, { fsRoot: PUBLIC, quiet: true });
  if (url.pathname === "/sw.js") {
    res.headers.set("Cache-Control", "no-cache");
  } else if (url.pathname.startsWith("/assets/")) {
    res.headers.set("Cache-Control", "public, max-age=31536000, immutable");
  }
  // Client-side routes (/market, /fund…) fall back to the app shell.
  if (res.status === 404 && !url.pathname.includes(".")) {
    return serveFile(req, `${PUBLIC}/index.html`);
  }
  return res;
};

const handler = (req: Request) => {
  const url = new URL(req.url);
  return url.pathname.startsWith("/api") ? relay(req, url) : app(req, url);
};

// Deno Deploy picks the port; PORT only serves local tests of the relay.
const port = Deno.env.get("PORT");
if (port) Deno.serve({ port: Number(port) }, handler);
else Deno.serve(handler);

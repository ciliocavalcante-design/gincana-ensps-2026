const GITHUB_API_BASE = "https://api.github.com";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Admin-Secret",
    "Access-Control-Max-Age": "86400"
  };
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders(),
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}

function getConfig(env) {
  const owner = env.GITHUB_OWNER || "ciliocavalcante-design";
  const repo = env.GITHUB_REPO || "gincana-ensps-2026";
  const branch = env.GITHUB_BRANCH || "main";
  const path = env.GITHUB_DATA_PATH || "data/gincana-data.json";

  if (!env.GITHUB_TOKEN) throw new Error("Secret GITHUB_TOKEN nao configurado no Cloudflare.");
  if (!env.ADMIN_SECRET) throw new Error("Secret ADMIN_SECRET nao configurado no Cloudflare.");

  return { owner, repo, branch, path, token: env.GITHUB_TOKEN, adminSecret: env.ADMIN_SECRET };
}

function toBase64Utf8(text) {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function fromBase64Utf8(base64) {
  const binary = atob(base64.replace(/\n/g, ""));
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

async function githubRequest(config, url, init = {}) {
  return fetch(url, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${config.token}`,
      "Content-Type": "application/json; charset=utf-8",
      "User-Agent": "gincana-ensps-2026-cloudflare-worker",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(init.headers || {})
    }
  });
}

async function readGithubData(config) {
  const url = `${GITHUB_API_BASE}/repos/${config.owner}/${config.repo}/contents/${config.path}?ref=${encodeURIComponent(config.branch)}&t=${Date.now()}`;
  const response = await githubRequest(config, url, { cache: "no-store" });

  if (response.status === 404) return { sha: "", data: {} };
  if (!response.ok) {
    const details = await response.text();
    throw new Error(`GitHub GET falhou (${response.status}): ${details}`);
  }

  const payload = await response.json();
  const content = typeof payload.content === "string" ? fromBase64Utf8(payload.content) : "{}";
  return {
    sha: payload.sha || "",
    data: JSON.parse(content || "{}")
  };
}

async function writeGithubData(config, data, reason) {
  let lastError;

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const current = await readGithubData(config);
      const content = `${JSON.stringify(data, null, 2)}\n`;
      const body = {
        message: reason || "Update gincana data",
        content: toBase64Utf8(content),
        branch: config.branch
      };
      if (current.sha) body.sha = current.sha;

      const response = await githubRequest(config, `${GITHUB_API_BASE}/repos/${config.owner}/${config.repo}/contents/${config.path}`, {
        method: "PUT",
        body: JSON.stringify(body)
      });
      const payload = await response.json().catch(() => ({}));

      if (response.ok) {
        return {
          ok: true,
          sha: payload.content?.sha || "",
          path: payload.content?.path || config.path
        };
      }

      lastError = new Error(payload.message || `GitHub PUT falhou (${response.status})`);
      if (response.status !== 409) throw lastError;
    } catch (error) {
      lastError = error;
      if (!String(error.message || "").includes("does not match")) throw error;
    }
  }

  throw lastError || new Error("Conflito ao salvar no GitHub.");
}

function authorize(request, config) {
  return request.headers.get("X-Admin-Secret") === config.adminSecret;
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }

    try {
      const config = getConfig(env);
      const url = new URL(request.url);

      if (url.pathname === "/health") {
        return json({ ok: true });
      }

      if (url.pathname !== "/data") {
        return json({ ok: false, error: "Rota nao encontrada." }, 404);
      }

      if (request.method === "GET") {
        const current = await readGithubData(config);
        return json({
          ok: true,
          data: current.data,
          sha: current.sha,
          path: config.path,
          branch: config.branch
        });
      }

      if (request.method === "POST") {
        if (!authorize(request, config)) {
          return json({ ok: false, error: "Senha de administrador invalida." }, 401);
        }

        const body = await request.json().catch(() => ({}));
        const data = body?.data;
        if (!data || typeof data !== "object" || Array.isArray(data)) {
          return json({ ok: false, error: "Envie um JSON no formato { data }." }, 400);
        }

        const saved = await writeGithubData(config, data, body.reason);
        return json(saved);
      }

      return json({ ok: false, error: "Metodo nao permitido." }, 405);
    } catch (error) {
      return json({
        ok: false,
        error: error.message || "Erro inesperado no Cloudflare Worker."
      }, 500);
    }
  }
};

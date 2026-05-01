const GITHUB_API_BASE = "https://api.github.com";

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}

export async function onRequestOptions() {
  return json({ ok: true });
}

function getConfig(env) {
  const owner = env.GITHUB_OWNER || "ciliocavalcante-design";
  const repo = env.GITHUB_REPO || "gincana-ensps-2026";
  const branch = env.GITHUB_BRANCH || "main";
  const path = env.GITHUB_DATA_PATH || "data/gincana-data.json";

  if (!env.GITHUB_TOKEN) throw new Error("Secret GITHUB_TOKEN nao configurado no Cloudflare Pages.");

  return { owner, repo, branch, path, token: env.GITHUB_TOKEN };
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
      "User-Agent": "gincana-ensps-2026-cloudflare-pages",
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

function normalizeJudgeCode(value = "") {
  return String(value).trim().toUpperCase().replace(/\s+/g, "-");
}

function normalizeParticipantNames(value = "") {
  return String(value)
    .split(/\r?\n/)
    .map((name) => name.trim())
    .filter(Boolean)
    .join("\n");
}

function normalizedJudgeCodes(values = []) {
  return values.map(normalizeJudgeCode).filter(Boolean);
}

function judgeCanEvaluate(data, code, eventId) {
  const days = Array.isArray(data.judgingDays) ? data.judgingDays : [];
  return days.some((day) => (
    day.active !== false
    && Array.isArray(day.eventIds)
    && day.eventIds.includes(eventId)
    && normalizedJudgeCodes(day.judgeCodes || []).includes(code)
  ));
}

async function appendEvaluation(config, evaluation, reason) {
  if (!evaluation || typeof evaluation !== "object" || Array.isArray(evaluation)) {
    throw new Error("Envie uma avaliação válida.");
  }

  let lastError;

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const current = await readGithubData(config);
      const data = current.data && typeof current.data === "object" ? current.data : {};
      data.evaluations = Array.isArray(data.evaluations) ? data.evaluations : [];
      data.judges = Array.isArray(data.judges) ? data.judges : [];
      data.judgingDays = Array.isArray(data.judgingDays) ? data.judgingDays : [];

      const code = normalizeJudgeCode(evaluation.judgeCode);
      if (code) {
        const judge = data.judges.find((item) => normalizeJudgeCode(item.code) === code);
        if (!judge || judge.active === false) {
          const error = new Error("Código de jurado não autorizado.");
          error.status = 403;
          throw error;
        }
        if (!judgeCanEvaluate(data, code, evaluation.eventId)) {
          const error = new Error("Esta prova não está liberada para este jurado.");
          error.status = 403;
          throw error;
        }
        const duplicate = data.evaluations.some((item) => (
          normalizeJudgeCode(item.judgeCode) === code
          && item.eventId === evaluation.eventId
          && item.category === evaluation.category
        ));
        if (duplicate) {
          const error = new Error("Esta avaliação já foi enviada por este jurado.");
          error.status = 409;
          throw error;
        }
      }

      data.evaluations.push({
        ...evaluation,
        judgeCode: code
      });

      const content = `${JSON.stringify(data, null, 2)}\n`;
      const body = {
        message: reason || "Append judging evaluation",
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
          path: payload.content?.path || config.path,
          data
        };
      }

      lastError = new Error(payload.message || `GitHub PUT falhou (${response.status})`);
      if (response.status !== 409) throw lastError;
    } catch (error) {
      lastError = error;
      if (error.status === 409) throw error;
      if (!String(error.message || "").includes("does not match")) throw error;
    }
  }

  throw lastError || new Error("Conflito ao salvar avaliação.");
}

async function mergeGithubData(config, updater, reason, conflictMessage) {
  let lastError;

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const current = await readGithubData(config);
      const data = current.data && typeof current.data === "object" ? current.data : {};
      updater(data);

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
          path: payload.content?.path || config.path,
          data
        };
      }

      lastError = new Error(payload.message || `GitHub PUT falhou (${response.status})`);
      if (response.status !== 409) throw lastError;
    } catch (error) {
      lastError = error;
      if (!String(error.message || "").includes("does not match")) throw error;
    }
  }

  throw lastError || new Error(conflictMessage || "Conflito ao salvar no GitHub.");
}

async function upsertRegistrationForm(config, payload, reason) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload) || !payload.teamId) {
    throw new Error("Envie uma ficha de inscrição válida.");
  }

  return mergeGithubData(config, (data) => {
    data.registrationForms = Array.isArray(data.registrationForms) ? data.registrationForms : [];
    data.participants = Array.isArray(data.participants) ? data.participants : [];

    const existing = data.registrationForms.find((item) => item?.teamId === payload.teamId) || {};
    const participants = {
      ...(existing.participants || {}),
      ...(payload.participants || {})
    };
    const record = {
      ...existing,
      ...payload,
      participants
    };

    data.registrationForms = data.registrationForms.filter((item) => item?.teamId !== record.teamId);
    data.registrationForms.push(record);

    Object.entries(participants).forEach(([activity, namesValue]) => {
      const names = normalizeParticipantNames(namesValue);
      data.participants = data.participants.filter((item) => item?.teamId !== record.teamId || item?.activity !== activity);
      if (names) {
        data.participants.push({
          teamId: record.teamId,
          activity,
          names
        });
      }
    });
  }, reason || "Salvar ficha de liderança", "Conflito ao salvar ficha de inscrição.");
}

async function upsertStrategyReport(config, payload, reason) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload) || !payload.teamId) {
    throw new Error("Envie um relatório de estratégia válido.");
  }

  return mergeGithubData(config, (data) => {
    data.strategyReports = Array.isArray(data.strategyReports) ? data.strategyReports : [];
    data.strategyReports = data.strategyReports.filter((item) => item?.teamId !== payload.teamId);
    data.strategyReports.push(payload);
  }, reason || "Salvar relatório de liderança", "Conflito ao salvar relatório de estratégia.");
}

export async function onRequestGet(context) {
  try {
    const config = getConfig(context.env);
    const current = await readGithubData(config);
    return json({
      ok: true,
      data: current.data,
      sha: current.sha,
      path: config.path,
      branch: config.branch
    });
  } catch (error) {
    return json({ ok: false, error: error.message || "Erro ao carregar dados." }, 500);
  }
}

export async function onRequestPost(context) {
  try {
    const config = getConfig(context.env);
    const body = await context.request.json().catch(() => ({}));
    if (body?.action === "appendEvaluation") {
      const saved = await appendEvaluation(config, body.evaluation, body.reason);
      return json(saved);
    }
    if (body?.action === "upsertRegistrationForm") {
      const saved = await upsertRegistrationForm(config, body.payload, body.reason);
      return json(saved);
    }
    if (body?.action === "upsertStrategyReport") {
      const saved = await upsertStrategyReport(config, body.payload, body.reason);
      return json(saved);
    }
    const data = body?.data;

    if (!data || typeof data !== "object" || Array.isArray(data)) {
      return json({ ok: false, error: "Envie um JSON no formato { data }." }, 400);
    }

    const saved = await writeGithubData(config, data, body.reason);
    return json(saved);
  } catch (error) {
    return json({ ok: false, error: error.message || "Erro ao salvar dados." }, error.status || 500);
  }
}

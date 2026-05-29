const GITHUB_API_BASE = "https://api.github.com";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isTransientStatus(status) {
  return [408, 425, 429, 500, 502, 503, 504].includes(Number(status));
}

function isGithubConflict(response, message = "") {
  return Number(response?.status || 0) === 409
    || String(message || "").includes("does not match")
    || String(message || "").includes("but expected");
}

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
  let lastError;
  const maxAttempts = 5;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const response = await fetch(url, {
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

      if (attempt < maxAttempts && isTransientStatus(response.status)) {
        await sleep(400 * attempt);
        continue;
      }

      return response;
    } catch (error) {
      lastError = error;
      if (attempt >= maxAttempts) throw error;
      await sleep(400 * attempt);
    }
  }

  throw lastError || new Error("GitHub não respondeu.");
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

  for (let attempt = 1; attempt <= 5; attempt += 1) {
    try {
      const current = await readGithubData(config);
      const content = `${JSON.stringify(data)}\n`;
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
      lastError.status = response.status;
      if (!isGithubConflict(response, lastError.message)) throw lastError;
    } catch (error) {
      lastError = error;
      if (!isGithubConflict(error, error.message)) throw error;
      await sleep(350 * attempt);
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

function stableRecordKey(parts = []) {
  return parts.map((part) => String(part || "").trim()).join("::");
}

function recordTimestamp(record = {}) {
  return String(record.updatedAt || record.submittedAt || record.createdAt || record.date || "");
}

function preferMergedRecord(current, candidate) {
  if (!current) return candidate;
  const currentTime = recordTimestamp(current);
  const candidateTime = recordTimestamp(candidate);
  if (candidateTime && (!currentTime || candidateTime > currentTime)) return candidate;
  if (currentTime && (!candidateTime || currentTime > candidateTime)) return current;
  return current;
}

function mergeRecordArrays(currentItems = [], incomingItems = [], keyFn = (item) => item?.id || "") {
  const map = new Map();
  currentItems.forEach((item) => {
    const key = keyFn(item);
    if (key) map.set(key, item);
  });
  incomingItems.forEach((item) => {
    const key = keyFn(item);
    if (!key) return;
    map.set(key, preferMergedRecord(map.get(key), item));
  });
  return [...map.values()];
}

function normalizeScoreRecord(item = {}) {
  const createdAt = item.createdAt || item.updatedAt || "";
  return {
    ...item,
    id: item.id || stableRecordKey(["score", item.teamId, item.eventId]),
    points: Number(item.points || 0),
    deletedAt: item.deletedAt || "",
    createdAt,
    updatedAt: item.updatedAt || createdAt
  };
}

function normalizeScheduleRecord(item = {}) {
  const createdAt = item.createdAt || item.updatedAt || "";
  return {
    ...item,
    id: item.id || item.requestId || stableRecordKey(["schedule", item.teamId, item.date, item.time, item.endTime, item.activity, item.place, item.requestId]),
    deletedAt: item.deletedAt || "",
    createdAt,
    updatedAt: item.updatedAt || createdAt
  };
}

function normalizeFixedScheduleRecord(item = {}) {
  const createdAt = item.createdAt || item.updatedAt || "";
  return {
    ...item,
    id: item.id || stableRecordKey(["fixed-schedule", item.teamId, item.weekday, item.startDate, item.untilDate, item.time, item.endTime, item.activity, item.place]),
    active: item.active !== false,
    deletedAt: item.deletedAt || "",
    createdAt,
    updatedAt: item.updatedAt || createdAt
  };
}

function normalizeParticipantRecord(item = {}) {
  const createdAt = item.createdAt || item.updatedAt || "";
  return {
    ...item,
    id: item.id || stableRecordKey(["participant", item.teamId, item.activity]),
    names: normalizeParticipantNames(item.names || ""),
    createdAt,
    updatedAt: item.updatedAt || createdAt
  };
}

function normalizeMaterialRecord(item = {}) {
  const createdAt = item.createdAt || item.updatedAt || "";
  return {
    ...item,
    id: item.id || stableRecordKey(["material", item.teamId, item.material]),
    deletedAt: item.deletedAt || "",
    createdAt,
    updatedAt: item.updatedAt || createdAt
  };
}

function normalizeFoodDonationRecord(item = {}) {
  const createdAt = item.createdAt || item.updatedAt || "";
  return {
    ...item,
    id: item.id || stableRecordKey(["food", item.teamId, item.foodId, createdAt || item.date, item.quantity, item.note]),
    quantity: Number(item.quantity || 0),
    deletedAt: item.deletedAt || "",
    createdAt,
    updatedAt: item.updatedAt || createdAt
  };
}

function normalizeFoodAdjustmentRecord(item = {}) {
  const createdAt = item.createdAt || item.updatedAt || "";
  const contracts = Math.max(0, Number(item.contracts || 0));
  const tokensPerContract = Math.max(0, Number((item.tokensPerContract ?? item.tokens) || 30));
  return {
    ...item,
    id: item.id || stableRecordKey(["food-adjustment", item.teamId, createdAt || item.date, contracts, tokensPerContract, item.note]),
    type: item.type || "Contratação de jogador",
    contracts,
    tokensPerContract,
    tokens: Math.max(0, Number(item.tokens || contracts * tokensPerContract)),
    deletedAt: item.deletedAt || "",
    createdAt,
    updatedAt: item.updatedAt || createdAt
  };
}

function normalizeDisciplineRecord(item = {}) {
  const createdAt = item.createdAt || item.updatedAt || "";
  return {
    ...item,
    id: item.id || stableRecordKey(["discipline", item.teamId, item.type, item.date, item.points, item.reason, item.level]),
    points: Number(item.points || 0),
    deletedAt: item.deletedAt || "",
    createdAt,
    updatedAt: item.updatedAt || createdAt
  };
}

function normalizeBonusRecord(item = {}) {
  const createdAt = item.createdAt || item.updatedAt || "";
  return {
    ...item,
    id: item.id || stableRecordKey(["bonus", item.teamId, item.date, item.points, item.reason]),
    points: Number(item.points || 0),
    deletedAt: item.deletedAt || "",
    createdAt,
    updatedAt: item.updatedAt || createdAt
  };
}

function normalizeJudgeRecord(item = {}) {
  const createdAt = item.createdAt || item.updatedAt || "";
  return {
    ...item,
    id: item.id || stableRecordKey(["judge", item.code]),
    code: normalizeJudgeCode(item.code || ""),
    active: item.active !== false,
    deletedAt: item.deletedAt || "",
    createdAt,
    updatedAt: item.updatedAt || createdAt
  };
}

function normalizeJudgingDayRecord(item = {}) {
  const createdAt = item.createdAt || item.updatedAt || "";
  return {
    ...item,
    id: item.id || stableRecordKey(["judging-day", item.name, item.date, ...((item.eventIds || []).map(String))]),
    eventIds: Array.isArray(item.eventIds) ? item.eventIds.map(String) : [],
    judgeCodes: normalizedJudgeCodes(item.judgeCodes || []),
    active: item.active !== false,
    deletedAt: item.deletedAt || "",
    createdAt,
    updatedAt: item.updatedAt || createdAt
  };
}

function normalizeEvaluationRecord(item = {}) {
  const createdAt = item.createdAt || item.submittedAt || item.updatedAt || "";
  return {
    ...item,
    id: item.id || stableRecordKey(["evaluation", normalizeJudgeCode(item.judgeCode), item.eventId, item.category, item.submittedAt]),
    judgeCode: normalizeJudgeCode(item.judgeCode || ""),
    deletedAt: item.deletedAt || "",
    createdAt,
    updatedAt: item.updatedAt || createdAt
  };
}

function normalizeJudgingBlockRecord(item = {}) {
  const createdAt = item.createdAt || item.updatedAt || "";
  return {
    ...item,
    id: item.id || stableRecordKey(["judging-block", item.name, item.category, ...((item.eventIds || []).map(String))]),
    eventIds: Array.isArray(item.eventIds) ? item.eventIds.map(String) : [],
    active: item.active !== false,
    deletedAt: item.deletedAt || "",
    createdAt,
    updatedAt: item.updatedAt || createdAt
  };
}

function normalizeDraftRecord(item = {}) {
  const judgeCode = normalizeJudgeCode(item.judgeCode || "");
  const blockId = item.blockId || "";
  return {
    ...item,
    key: item.key || `${judgeCode}::${blockId}`,
    judgeCode,
    blockId,
    draft: item.draft && typeof item.draft === "object" ? item.draft : {},
    deletedAt: item.deletedAt || "",
    updatedAt: item.updatedAt || ""
  };
}

function normalizeEvaluationTieBreakRecord(item = {}) {
  const eventId = item.eventId || "";
  const category = item.category || "";
  const total = Number(item.total || 0);
  const teamId = item.teamId || "";
  const createdAt = item.createdAt || item.updatedAt || "";
  return {
    ...item,
    id: item.id || stableRecordKey(["evaluation-tie", eventId, category, total, teamId]),
    eventId,
    category,
    total,
    teamId,
    priority: Number(item.priority || 0),
    deletedAt: item.deletedAt || "",
    createdAt,
    updatedAt: item.updatedAt || createdAt
  };
}

function activeJudges(data = {}) {
  return (Array.isArray(data.judges) ? data.judges : []).filter((item) => !item.deletedAt);
}

function activeJudgingDays(data = {}) {
  return (Array.isArray(data.judgingDays) ? data.judgingDays : []).filter((item) => !item.deletedAt);
}

function activeEvaluations(data = {}) {
  return (Array.isArray(data.evaluations) ? data.evaluations : []).filter((item) => !item.deletedAt);
}

function normalizeClaimRecord(item = {}) {
  const createdAt = item.createdAt || item.updatedAt || "";
  return {
    ...item,
    id: item.id || stableRecordKey(["claim", item.teamId, item.disciplineIndex, item.createdAt, item.reason]),
    deletedAt: item.deletedAt || "",
    createdAt,
    updatedAt: item.updatedAt || createdAt
  };
}

function normalizeLeadershipRequestRecord(item = {}) {
  const createdAt = item.createdAt || item.updatedAt || "";
  return {
    ...item,
    id: item.id || stableRecordKey(["leadership-request", item.teamId, item.type, item.createdAt, item.message]),
    deletedAt: item.deletedAt || "",
    createdAt,
    updatedAt: item.updatedAt || createdAt
  };
}

function normalizeScheduleRequestRecord(item = {}) {
  const createdAt = item.createdAt || item.updatedAt || "";
  return {
    ...item,
    id: item.id || stableRecordKey(["schedule-request", item.teamId, item.date, item.time, item.activity, item.createdAt]),
    deletedAt: item.deletedAt || "",
    createdAt,
    updatedAt: item.updatedAt || createdAt
  };
}

function normalizeRegistrationFormRecord(item = {}) {
  const createdAt = item.createdAt || item.updatedAt || "";
  return {
    ...item,
    teamId: item.teamId || "",
    participants: item.participants && typeof item.participants === "object" ? item.participants : {},
    createdAt,
    updatedAt: item.updatedAt || createdAt
  };
}

function normalizeStrategyReportRecord(item = {}) {
  const createdAt = item.createdAt || item.updatedAt || "";
  return {
    ...item,
    teamId: item.teamId || "",
    createdAt,
    updatedAt: item.updatedAt || createdAt
  };
}

function normalizeStateData(data = {}) {
  return {
    ...data,
    scores: Array.isArray(data.scores) ? data.scores.map(normalizeScoreRecord) : [],
    schedules: Array.isArray(data.schedules) ? data.schedules.map(normalizeScheduleRecord) : [],
    fixedSchedules: Array.isArray(data.fixedSchedules) ? data.fixedSchedules.map(normalizeFixedScheduleRecord) : [],
    participants: Array.isArray(data.participants) ? data.participants.map(normalizeParticipantRecord) : [],
    materials: Array.isArray(data.materials) ? data.materials.map(normalizeMaterialRecord) : [],
    foodDonations: Array.isArray(data.foodDonations) ? data.foodDonations.map(normalizeFoodDonationRecord) : [],
    foodAdjustments: Array.isArray(data.foodAdjustments) ? data.foodAdjustments.map(normalizeFoodAdjustmentRecord) : [],
    discipline: Array.isArray(data.discipline) ? data.discipline.map(normalizeDisciplineRecord) : [],
    bonuses: Array.isArray(data.bonuses) ? data.bonuses.map(normalizeBonusRecord) : [],
    judges: Array.isArray(data.judges) ? data.judges.map(normalizeJudgeRecord) : [],
    judgingDays: Array.isArray(data.judgingDays) ? data.judgingDays.map(normalizeJudgingDayRecord) : [],
    evaluations: Array.isArray(data.evaluations) ? data.evaluations.map(normalizeEvaluationRecord) : [],
    judgingBlocks: Array.isArray(data.judgingBlocks) ? data.judgingBlocks.map(normalizeJudgingBlockRecord) : [],
    evaluationDrafts: Array.isArray(data.evaluationDrafts) ? data.evaluationDrafts.map(normalizeDraftRecord) : [],
    evaluationTieBreaks: Array.isArray(data.evaluationTieBreaks) ? data.evaluationTieBreaks.map(normalizeEvaluationTieBreakRecord) : [],
    leadershipClaims: Array.isArray(data.leadershipClaims) ? data.leadershipClaims.map(normalizeClaimRecord) : [],
    leadershipRequests: Array.isArray(data.leadershipRequests) ? data.leadershipRequests.map(normalizeLeadershipRequestRecord) : [],
    scheduleRequests: Array.isArray(data.scheduleRequests) ? data.scheduleRequests.map(normalizeScheduleRequestRecord) : [],
    registrationForms: Array.isArray(data.registrationForms) ? data.registrationForms.map(normalizeRegistrationFormRecord) : [],
    strategyReports: Array.isArray(data.strategyReports) ? data.strategyReports.map(normalizeStrategyReportRecord) : [],
    leadershipCodes: data.leadershipCodes && typeof data.leadershipCodes === "object" ? data.leadershipCodes : {},
    teacherCodes: data.teacherCodes && typeof data.teacherCodes === "object" ? data.teacherCodes : {},
    judgingEventOrder: Array.isArray(data.judgingEventOrder) ? data.judgingEventOrder.map(String) : [],
    displaySettings: Object.prototype.hasOwnProperty.call(data, "displaySettings") && data.displaySettings && typeof data.displaySettings === "object" ? {
      hideScores: Boolean(data.displaySettings.hideScores),
      randomMode: Boolean(data.displaySettings.randomMode)
    } : undefined,
    foodCountUpdatedAt: data.foodCountUpdatedAt || ""
  };
}

function mergeStateData(currentRaw = {}, incomingRaw = {}) {
  const current = normalizeStateData(currentRaw);
  const incoming = normalizeStateData(incomingRaw);
  return {
    ...current,
    ...incoming,
    scores: mergeRecordArrays(current.scores, incoming.scores, (item) => item.id),
    schedules: mergeRecordArrays(current.schedules, incoming.schedules, (item) => item.id),
    fixedSchedules: mergeRecordArrays(current.fixedSchedules, incoming.fixedSchedules, (item) => item.id),
    participants: mergeRecordArrays(current.participants, incoming.participants, (item) => item.id),
    materials: mergeRecordArrays(current.materials, incoming.materials, (item) => item.id),
    foodDonations: mergeRecordArrays(current.foodDonations, incoming.foodDonations, (item) => item.id),
    foodAdjustments: mergeRecordArrays(current.foodAdjustments, incoming.foodAdjustments, (item) => item.id),
    discipline: mergeRecordArrays(current.discipline, incoming.discipline, (item) => item.id),
    bonuses: mergeRecordArrays(current.bonuses, incoming.bonuses, (item) => item.id),
    judges: mergeRecordArrays(current.judges, incoming.judges, (item) => item.id),
    judgingDays: mergeRecordArrays(current.judgingDays, incoming.judgingDays, (item) => item.id),
    evaluations: mergeRecordArrays(current.evaluations, incoming.evaluations, (item) => item.id),
    judgingBlocks: mergeRecordArrays(current.judgingBlocks, incoming.judgingBlocks, (item) => item.id),
    evaluationDrafts: mergeRecordArrays(current.evaluationDrafts, incoming.evaluationDrafts, (item) => item.key),
    evaluationTieBreaks: mergeRecordArrays(current.evaluationTieBreaks, incoming.evaluationTieBreaks, (item) => item.id),
    leadershipClaims: mergeRecordArrays(current.leadershipClaims, incoming.leadershipClaims, (item) => item.id),
    leadershipRequests: mergeRecordArrays(current.leadershipRequests, incoming.leadershipRequests, (item) => item.id),
    scheduleRequests: mergeRecordArrays(current.scheduleRequests, incoming.scheduleRequests, (item) => item.id),
    registrationForms: mergeRecordArrays(current.registrationForms, incoming.registrationForms, (item) => item.teamId),
    strategyReports: mergeRecordArrays(current.strategyReports, incoming.strategyReports, (item) => item.teamId),
    leadershipCodes: { ...(current.leadershipCodes || {}), ...(incoming.leadershipCodes || {}) },
    teacherCodes: { ...(current.teacherCodes || {}), ...(incoming.teacherCodes || {}) },
    judgingEventOrder: incoming.judgingEventOrder?.length ? incoming.judgingEventOrder : current.judgingEventOrder,
    displaySettings: {
      hideScores: false,
      randomMode: false,
      ...(current.displaySettings || {}),
      ...(incoming.displaySettings || {})
    },
    foodCountUpdatedAt: [current.foodCountUpdatedAt || "", incoming.foodCountUpdatedAt || ""].sort().at(-1) || ""
  };
}

function replaceObjectContents(target, source) {
  Object.keys(target).forEach((key) => delete target[key]);
  Object.assign(target, source);
}

function normalizedJudgeCodes(values = []) {
  return values.map(normalizeJudgeCode).filter(Boolean);
}

function judgeCanEvaluate(data, code, eventId) {
  const days = activeJudgingDays(data);
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

  for (let attempt = 1; attempt <= 5; attempt += 1) {
    try {
      const current = await readGithubData(config);
      const data = normalizeStateData(current.data && typeof current.data === "object" ? current.data : {});

      const code = normalizeJudgeCode(evaluation.judgeCode);
      if (code) {
        const judge = activeJudges(data).find((item) => normalizeJudgeCode(item.code) === code);
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
        const duplicate = activeEvaluations(data).some((item) => (
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
        id: evaluation.id || stableRecordKey(["evaluation", code, evaluation.eventId, evaluation.category, evaluation.submittedAt]),
        judgeCode: code
      });

      const content = `${JSON.stringify(data)}\n`;
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
      lastError.status = response.status;
      if (!isGithubConflict(response, lastError.message)) throw lastError;
    } catch (error) {
      lastError = error;
      if (!isGithubConflict(error, error.message)) throw error;
      await sleep(350 * attempt);
    }
  }

  throw lastError || new Error("Conflito ao salvar avaliação.");
}

async function appendEvaluations(config, evaluations, reason, options = {}) {
  if (!Array.isArray(evaluations) || !evaluations.length) {
    throw new Error("Envie avaliações válidas.");
  }

  let lastError;

  for (let attempt = 1; attempt <= 5; attempt += 1) {
    try {
      const current = await readGithubData(config);
      const data = normalizeStateData(current.data && typeof current.data === "object" ? current.data : {});
      const batchKeys = new Set();

      evaluations.forEach((evaluation) => {
        if (!evaluation || typeof evaluation !== "object" || Array.isArray(evaluation)) {
          throw new Error("Envie avaliações válidas.");
        }

        const code = normalizeJudgeCode(evaluation.judgeCode);
        if (code) {
          const judge = activeJudges(data).find((item) => normalizeJudgeCode(item.code) === code);
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
          const key = `${code}::${evaluation.eventId}::${evaluation.category}`;
          const duplicate = batchKeys.has(key) || activeEvaluations(data).some((item) => (
            normalizeJudgeCode(item.judgeCode) === code
            && item.eventId === evaluation.eventId
            && item.category === evaluation.category
          ));
          if (duplicate) {
            const error = new Error("Esta avaliação já foi enviada por este jurado.");
            error.status = 409;
            throw error;
          }
          batchKeys.add(key);
        }
      });

      evaluations.forEach((evaluation) => {
        const code = normalizeJudgeCode(evaluation.judgeCode);
        data.evaluations.push({
          ...evaluation,
          id: evaluation.id || stableRecordKey(["evaluation", code, evaluation.eventId, evaluation.category, evaluation.submittedAt]),
          judgeCode: code
        });
      });

      const draftKey = options?.clearDraft?.key || (options?.clearDraft?.judgeCode && options?.clearDraft?.blockId
        ? `${normalizeJudgeCode(options.clearDraft.judgeCode)}::${options.clearDraft.blockId}`
        : "");
      if (draftKey) {
        const now = new Date().toISOString();
        const item = (Array.isArray(data.evaluationDrafts) ? data.evaluationDrafts : []).find((entry) => entry.key === draftKey);
        if (item) {
          item.deletedAt = now;
          item.updatedAt = now;
        }
      }

      const content = `${JSON.stringify(data)}\n`;
      const body = {
        message: reason || "Append judging evaluation batch",
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
      lastError.status = response.status;
      if (!isGithubConflict(response, lastError.message)) throw lastError;
    } catch (error) {
      lastError = error;
      if (!isGithubConflict(error, error.message)) throw error;
      await sleep(350 * attempt);
    }
  }

  throw lastError || new Error("Conflito ao salvar avaliações.");
}

async function mergeGithubData(config, updater, reason, conflictMessage, options = {}) {
  let lastError;

  for (let attempt = 1; attempt <= 5; attempt += 1) {
    try {
      const current = await readGithubData(config);
      const data = normalizeStateData(current.data && typeof current.data === "object" ? current.data : {});
      updater(data);

      const content = `${JSON.stringify(data)}\n`;
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
          ...(options.returnData === false ? {} : { data })
        };
      }

      lastError = new Error(payload.message || `GitHub PUT falhou (${response.status})`);
      lastError.status = response.status;
      if (!isGithubConflict(response, lastError.message)) throw lastError;
    } catch (error) {
      lastError = error;
      if (!isGithubConflict(error, error.message)) throw error;
      await sleep(350 * attempt);
    }
  }

  throw lastError || new Error(conflictMessage || "Conflito ao salvar no GitHub.");
}

async function upsertRegistrationForm(config, payload, reason) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload) || !payload.teamId) {
    throw new Error("Envie uma ficha de inscrição válida.");
  }

  return mergeGithubData(config, (data) => {
    const now = new Date().toISOString();
    const existing = data.registrationForms.find((item) => item?.teamId === payload.teamId) || {};
    const participants = {
      ...(existing.participants || {}),
      ...(payload.participants || {})
    };
    const record = {
      ...existing,
      ...payload,
      createdAt: existing.createdAt || now,
      updatedAt: now,
      participants
    };

    data.registrationForms = data.registrationForms.filter((item) => item?.teamId !== record.teamId);
    data.registrationForms.push(record);

    Object.entries(participants).forEach(([activity, namesValue]) => {
      const names = normalizeParticipantNames(namesValue);
      data.participants = data.participants.filter((item) => item?.teamId !== record.teamId || item?.activity !== activity);
      data.participants.push({
        id: stableRecordKey(["participant", record.teamId, activity]),
        teamId: record.teamId,
        activity,
        names,
        createdAt: existing.createdAt || now,
        updatedAt: now
      });
    });
  }, reason || "Salvar ficha de liderança", "Conflito ao salvar ficha de inscrição.");
}

async function upsertStrategyReport(config, payload, reason) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload) || !payload.teamId) {
    throw new Error("Envie um relatório de estratégia válido.");
  }

  return mergeGithubData(config, (data) => {
    const existing = data.strategyReports.find((item) => item?.teamId === payload.teamId) || {};
    const now = new Date().toISOString();
    data.strategyReports = data.strategyReports.filter((item) => item?.teamId !== payload.teamId);
    data.strategyReports.push({
      ...existing,
      ...payload,
      createdAt: existing.createdAt || now,
      updatedAt: now
    });
  }, reason || "Salvar relatório de liderança", "Conflito ao salvar relatório de estratégia.");
}

async function upsertJudge(config, payload, reason) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error("Envie um jurado válido.");
  }

  return mergeGithubData(config, (data) => {
    const now = new Date().toISOString();
    const code = normalizeJudgeCode(payload.code || payload.name || "");
    if (!code) throw new Error("Código do jurado inválido.");
    const existing = (Array.isArray(data.judges) ? data.judges : []).find((item) => (
      (payload.id && item.id === payload.id) || normalizeJudgeCode(item.code) === code
    )) || {};

    const record = {
      ...existing,
      ...payload,
      id: existing.id || payload.id || stableRecordKey(["judge", code]),
      code,
      active: payload.active !== false,
      deletedAt: "",
      createdAt: existing.createdAt || payload.createdAt || now,
      updatedAt: now
    };

    data.judges = (Array.isArray(data.judges) ? data.judges : []).filter((item) => (
      item.id !== existing.id && normalizeJudgeCode(item.code) !== code
    ));
    data.judges.push(record);
  }, reason || "Salvar jurado", "Conflito ao salvar jurado.");
}

async function upsertJudgingDay(config, payload, reason) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error("Envie um dia de julgamento válido.");
  }

  return mergeGithubData(config, (data) => {
    const now = new Date().toISOString();
    const existing = (Array.isArray(data.judgingDays) ? data.judgingDays : []).find((item) => item.id === payload.id) || {};
    const record = {
      ...existing,
      ...payload,
      id: existing.id || payload.id || stableRecordKey(["judging-day", payload.name, payload.date, ...((payload.eventIds || []).map(String))]),
      eventIds: Array.isArray(payload.eventIds) ? payload.eventIds.map(String) : (existing.eventIds || []),
      judgeCodes: normalizedJudgeCodes(payload.judgeCodes || existing.judgeCodes || []),
      active: payload.active !== false,
      deletedAt: "",
      createdAt: existing.createdAt || payload.createdAt || now,
      updatedAt: now
    };

    data.judgingDays = (Array.isArray(data.judgingDays) ? data.judgingDays : []).filter((item) => item.id !== record.id);
    data.judgingDays.push(record);
  }, reason || "Salvar dia de avaliação", "Conflito ao salvar dia de avaliação.");
}

async function assignJudgeToDay(config, payload, reason) {
  if (!payload?.dayId || !payload?.judgeCode) {
    throw new Error("Envie o dia e o jurado para vincular.");
  }

  return mergeGithubData(config, (data) => {
    const day = (Array.isArray(data.judgingDays) ? data.judgingDays : []).find((item) => item.id === payload.dayId && !item.deletedAt);
    if (!day) throw new Error("Dia de avaliação não encontrado.");
    const code = normalizeJudgeCode(payload.judgeCode);
    const judge = activeJudges(data).find((item) => normalizeJudgeCode(item.code) === code);
    if (!judge) throw new Error("Jurado não encontrado.");
    const codes = normalizedJudgeCodes(day.judgeCodes || []);
    if (!codes.includes(code)) day.judgeCodes = [...codes, code];
    day.updatedAt = new Date().toISOString();
    day.deletedAt = "";
  }, reason || "Vincular jurado ao dia", "Conflito ao vincular jurado ao dia.");
}

async function removeJudgeFromDay(config, payload, reason) {
  if (!payload?.dayId || !payload?.judgeCode) {
    throw new Error("Envie o dia e o jurado para remover.");
  }

  return mergeGithubData(config, (data) => {
    const day = (Array.isArray(data.judgingDays) ? data.judgingDays : []).find((item) => item.id === payload.dayId && !item.deletedAt);
    if (!day) throw new Error("Dia de avaliação não encontrado.");
    const code = normalizeJudgeCode(payload.judgeCode);
    day.judgeCodes = normalizedJudgeCodes(day.judgeCodes || []).filter((item) => item !== code);
    day.updatedAt = new Date().toISOString();
  }, reason || "Remover jurado do dia", "Conflito ao remover jurado do dia.");
}

async function softDeleteJudge(config, payload, reason) {
  if (!payload?.judgeId) throw new Error("Envie o jurado para excluir.");

  return mergeGithubData(config, (data) => {
    const judge = (Array.isArray(data.judges) ? data.judges : []).find((item) => item.id === payload.judgeId);
    if (!judge) throw new Error("Jurado não encontrado.");
    const now = new Date().toISOString();
    const code = normalizeJudgeCode(judge.code);
    judge.deletedAt = now;
    judge.updatedAt = now;

    (Array.isArray(data.judgingDays) ? data.judgingDays : []).forEach((day) => {
      const nextCodes = normalizedJudgeCodes(day.judgeCodes || []).filter((item) => item !== code);
      if (nextCodes.length !== (day.judgeCodes || []).length) {
        day.judgeCodes = nextCodes;
        day.updatedAt = now;
      }
    });

    (Array.isArray(data.evaluationDrafts) ? data.evaluationDrafts : []).forEach((draft) => {
      if (normalizeJudgeCode(draft.judgeCode) === code) {
        draft.deletedAt = now;
        draft.updatedAt = now;
      }
    });
  }, reason || "Excluir jurado", "Conflito ao excluir jurado.");
}

async function upsertFoodDonation(config, payload, reason) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error("Envie um lançamento de alimento válido.");
  }

  return mergeGithubData(config, (data) => {
    const now = new Date().toISOString();
    const record = normalizeFoodDonationRecord({
      ...payload,
      id: payload.id || stableRecordKey(["food", payload.teamId, payload.foodId, payload.createdAt || now, payload.quantity, payload.note]),
      deletedAt: "",
      createdAt: payload.createdAt || now,
      updatedAt: now
    });
    data.foodDonations = (Array.isArray(data.foodDonations) ? data.foodDonations : []).filter((item) => item.id !== record.id);
    data.foodDonations.push(record);
    data.foodCountUpdatedAt = now;
  }, reason || "Lançar alimento", "Conflito ao lançar alimento.", { returnData: false });
}

async function deleteFoodDonation(config, payload, reason) {
  if (!payload?.id) throw new Error("Envie o alimento para excluir.");

  return mergeGithubData(config, (data) => {
    const item = (Array.isArray(data.foodDonations) ? data.foodDonations : []).find((entry) => entry.id === payload.id);
    if (!item) throw new Error("Lançamento de alimento não encontrado.");
    const now = payload.updatedAt || new Date().toISOString();
    item.deletedAt = now;
    item.updatedAt = now;
    data.foodCountUpdatedAt = now;
  }, reason || "Excluir alimento", "Conflito ao excluir alimento.", { returnData: false });
}

async function upsertFoodAdjustment(config, payload, reason) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error("Envie um desconto de contratação válido.");
  }

  return mergeGithubData(config, (data) => {
    const now = new Date().toISOString();
    const record = normalizeFoodAdjustmentRecord({
      ...payload,
      id: payload.id || stableRecordKey(["food-adjustment", payload.teamId, payload.createdAt || now, payload.contracts, payload.tokensPerContract, payload.note]),
      deletedAt: "",
      createdAt: payload.createdAt || now,
      updatedAt: now
    });
    data.foodAdjustments = (Array.isArray(data.foodAdjustments) ? data.foodAdjustments : []).filter((item) => item.id !== record.id);
    data.foodAdjustments.push(record);
    data.foodCountUpdatedAt = now;
  }, reason || "Descontar contratação de jogador", "Conflito ao descontar contratação.", { returnData: false });
}

async function deleteFoodAdjustment(config, payload, reason) {
  if (!payload?.id) throw new Error("Envie o desconto para excluir.");

  return mergeGithubData(config, (data) => {
    const item = (Array.isArray(data.foodAdjustments) ? data.foodAdjustments : []).find((entry) => entry.id === payload.id);
    if (!item) throw new Error("Desconto de contratação não encontrado.");
    const now = payload.updatedAt || new Date().toISOString();
    item.deletedAt = now;
    item.updatedAt = now;
    data.foodCountUpdatedAt = now;
  }, reason || "Excluir desconto de contratação", "Conflito ao excluir desconto.", { returnData: false });
}

async function upsertEvaluationDraft(config, payload, reason) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error("Envie um rascunho de avaliação válido.");
  }

  return mergeGithubData(config, (data) => {
    const record = normalizeDraftRecord({
      ...payload,
      deletedAt: "",
      updatedAt: payload.updatedAt || new Date().toISOString()
    });
    if (!record.key || !record.judgeCode || !record.blockId) {
      throw new Error("Rascunho sem jurado ou bloco.");
    }
    data.evaluationDrafts = (Array.isArray(data.evaluationDrafts) ? data.evaluationDrafts : []).filter((item) => item.key !== record.key);
    data.evaluationDrafts.push(record);
  }, reason || "Salvar rascunho de avaliação", "Conflito ao salvar rascunho.", { returnData: false });
}

async function deleteEvaluationDraft(config, payload, reason) {
  const key = payload?.key || (payload?.judgeCode && payload?.blockId ? `${normalizeJudgeCode(payload.judgeCode)}::${payload.blockId}` : "");
  if (!key) throw new Error("Envie o rascunho para excluir.");

  return mergeGithubData(config, (data) => {
    const now = payload.updatedAt || new Date().toISOString();
    const item = (Array.isArray(data.evaluationDrafts) ? data.evaluationDrafts : []).find((entry) => entry.key === key);
    if (item) {
      item.deletedAt = now;
      item.updatedAt = now;
      return;
    }
    data.evaluationDrafts = Array.isArray(data.evaluationDrafts) ? data.evaluationDrafts : [];
    data.evaluationDrafts.push(normalizeDraftRecord({
      ...payload,
      key,
      deletedAt: now,
      updatedAt: now
    }));
  }, reason || "Excluir rascunho de avaliação", "Conflito ao excluir rascunho.", { returnData: false });
}

async function clearFoodDonations(config, payload = {}, reason) {
  return mergeGithubData(config, (data) => {
    const now = payload.updatedAt || new Date().toISOString();
    [
      ...(Array.isArray(data.foodDonations) ? data.foodDonations : []),
      ...(Array.isArray(data.foodAdjustments) ? data.foodAdjustments : [])
    ].forEach((item) => {
      if (!item.deletedAt) {
        item.deletedAt = now;
        item.updatedAt = now;
      }
    });
    data.foodCountUpdatedAt = now;
  }, reason || "Zerar arrecadação de alimentos", "Conflito ao zerar alimentos.", { returnData: false });
}

async function mergeFullState(config, incoming, reason) {
  return mergeGithubData(config, (data) => {
    replaceObjectContents(data, mergeStateData(data, incoming));
  }, reason || "Update gincana data", "Conflito ao salvar dados completos.");
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
    if (body?.action === "appendEvaluations") {
      const saved = await appendEvaluations(config, body.evaluations, body.reason, { clearDraft: body.clearDraft });
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
    if (body?.action === "upsertJudge") {
      const saved = await upsertJudge(config, body.payload, body.reason);
      return json(saved);
    }
    if (body?.action === "upsertJudgingDay") {
      const saved = await upsertJudgingDay(config, body.payload, body.reason);
      return json(saved);
    }
    if (body?.action === "assignJudgeToDay") {
      const saved = await assignJudgeToDay(config, body.payload, body.reason);
      return json(saved);
    }
    if (body?.action === "removeJudgeFromDay") {
      const saved = await removeJudgeFromDay(config, body.payload, body.reason);
      return json(saved);
    }
    if (body?.action === "softDeleteJudge") {
      const saved = await softDeleteJudge(config, body.payload, body.reason);
      return json(saved);
    }
    if (body?.action === "upsertFoodDonation") {
      const saved = await upsertFoodDonation(config, body.payload, body.reason);
      return json(saved);
    }
    if (body?.action === "deleteFoodDonation") {
      const saved = await deleteFoodDonation(config, body.payload, body.reason);
      return json(saved);
    }
    if (body?.action === "upsertFoodAdjustment") {
      const saved = await upsertFoodAdjustment(config, body.payload, body.reason);
      return json(saved);
    }
    if (body?.action === "deleteFoodAdjustment") {
      const saved = await deleteFoodAdjustment(config, body.payload, body.reason);
      return json(saved);
    }
    if (body?.action === "upsertEvaluationDraft") {
      const saved = await upsertEvaluationDraft(config, body.payload, body.reason);
      return json(saved);
    }
    if (body?.action === "deleteEvaluationDraft") {
      const saved = await deleteEvaluationDraft(config, body.payload, body.reason);
      return json(saved);
    }
    if (body?.action === "clearFoodDonations") {
      const saved = await clearFoodDonations(config, body.payload, body.reason);
      return json(saved);
    }
    const data = body?.data;

    if (!data || typeof data !== "object" || Array.isArray(data)) {
      return json({ ok: false, error: "Envie um JSON no formato { data }." }, 400);
    }

    const saved = await mergeFullState(config, data, body.reason);
    return json(saved);
  } catch (error) {
    return json({ ok: false, error: error.message || "Erro ao salvar dados." }, error.status || 500);
  }
}

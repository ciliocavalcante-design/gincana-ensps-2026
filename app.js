const STORAGE_KEY = "gincana-ensps-2026-v1";
const GITHUB_OWNER = "ciliocavalcante-design";
const GITHUB_REPO = "gincana-ensps-2026";
const GITHUB_BRANCH = "main";
const DATA_PATH = "data/gincana-data.json";
const SECURITY_PATH = "data/admin-security.json";
const RAW_DATA_URL = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${GITHUB_BRANCH}/${DATA_PATH}`;
const SECURITY_RAW_URL = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${GITHUB_BRANCH}/${SECURITY_PATH}`;
const PAGES_DATA_URL = "/api/data";
const PUBLISHED_DATA_URL = "https://gincana-ensps-2026.pages.dev/api/data";
const PAGES_SECURITY_URL = `/${SECURITY_PATH}`;
const TEAM_ORDER = ["6", "7", "8", "9", "1", "2"];
const SCHEDULE_ACTIVITIES = [
  "Dança das Líderes de Torcida",
  "Dança dos Professores",
  "Dança Típica",
  "Story",
  "Organização"
];

const OFFICIAL_FORM_EVENTS = [
  "Prova Solidária",
  "Comportamento",
  "Adesão da Blusa",
  "Futsal",
  "Desafio do Professor",
  "Carimba",
  "Vôlei",
  "Dança das Líderes",
  "Blusa da Equipe",
  "Corrida Maluca",
  "Caça ao Tesouro",
  "Soletrando",
  "Quiz",
  "Story Criativo",
  "Grito de Guerra",
  "Comida Típica",
  "Dança Típica",
  "Meu Professor Vale 1000"
];

const REGISTRATION_EVENTS = [
  "Prova Solidária",
  "Futsal",
  "Desafio do Professor",
  "Carimba",
  "Vôlei",
  "Dança das Líderes",
  "Blusa da Equipe",
  "Corrida Maluca",
  "Caça ao Tesouro",
  "Soletrando",
  "Quiz",
  "Story Criativo",
  "Grito de Guerra",
  "Comida Típica",
  "Dança Típica",
  "Meu Professor Vale 1000"
];
const DISCIPLINE_LEVELS = [
  { id: "leve", label: "Leve", points: 1 },
  { id: "media", label: "Média", points: 2 },
  { id: "grave", label: "Grave", points: 3 },
  { id: "recorrente", label: "Erro Recorrente", points: 5 }
];
const JUDGING_EVENTS = [
  {
    id: "lideres",
    eventId: "lideres",
    name: "Dança das Líderes de Torcida",
    pointsByPlace: [30, 20, 10],
    criteria: ["Coreografia", "Criatividade", "Organização"]
  },
  {
    id: "blusa",
    eventId: "blusa",
    name: "Blusa da equipe",
    pointsByPlace: [10, 5, 0],
    criteria: ["Afinidade ao tema", "Criatividade", "Design"]
  },
  {
    id: "comida",
    eventId: "comida",
    name: "Comida Típica",
    pointsByPlace: [15, 10, 5],
    criteria: ["Fidelidade ao tema", "Sabor", "Apresentação do prato"]
  },
  {
    id: "professores",
    eventId: "professor-1000",
    name: "Dança dos Professores",
    pointsByPlace: [50, 30, 20],
    criteria: ["Coreografia", "Criatividade", "Organização", "Desempenho do professor"]
  },
  {
    id: "danca",
    eventId: "danca",
    name: "Dança Típica",
    pointsByPlace: [50, 30, 20],
    criteria: ["Afinidade ao tema", "Organização", "Figurino/Acessórios", "Coreografia"]
  },
  {
    id: "grito",
    eventId: "grito",
    name: "Grito de Guerra",
    pointsByPlace: [10, 5, 0],
    criteria: ["Animação", "Clareza", "Criatividade", "Organização"]
  }
];

const DEFAULT_LEADERSHIP_CODES = {
    "482ENSPS731": "6",
    "915ENSPS204": "7",
    "367ENSPS849": "8",
    "638ENSPS125": "9",
    "274ENSPS596": "1",
    "829ENSPS463": "2"
  };

const DEFAULT_TEACHER_CODES = {
  "PROF6A": "6",
  "PROF7T": "7",
  "PROF7M": "7",
  "PROF8E": "8",
  "PROF9A": "9",
  "PROF1A": "1",
  "PROF1D": "1",
  "PROF2R": "2"
};

const EVENT_POINTS_BY_PLACE = {
  solidaria: [50, 30, 20],
  comportamento: [20, 10, 5],
  "adesao-blusa": [35, 20, 10],
  futsal: [30, 20, 10],
  professor: [10, 5, 0],
  carimba: [20, 10, 5],
  volei: [10, 5, 0],
  lideres: [30, 20, 10],
  blusa: [10, 5, 0],
  corrida: [10, 5, 0],
  tesouro: [10, 5, 0],
  soletrando: [10, 5, 0],
  quiz: [10, 5, 0],
  story: [10, 5, 0],
  grito: [10, 5, 0],
  comida: [15, 10, 5],
  danca: [50, 30, 20],
  "professor-1000": [50, 30, 20]
};

function eventPointsByPlace(eventId) {
  const judgingDef = judgingEventById(eventId);
  return EVENT_POINTS_BY_PLACE[eventId] || judgingDef?.pointsByPlace || [];
}

let remoteSaveTimer;
let remoteSaveInProgress = false;
let remoteSavePending = false;
let welcomeAnimationTimer;
let draftRemoteSaveTimer;
localStorage.removeItem("gincana-ensps-2026-github-token");

const defaultData = {
  teams: [
    { id: "6", name: "6º Ano", theme: "São João Nordestino", color: "#f97316", category: "Categoria 1", mentor: "Prof. Eduardo" },
    { id: "7", name: "7º Ano", theme: "Festa do Peão de Barretos", color: "#8b5cf6", category: "Categoria 1", mentor: "Prof. Thayna e Prof. Michael" },
    { id: "8", name: "8º Ano", theme: "Carnaval de Salvador", color: "#facc15", category: "Categoria 1", mentor: "Prof. Elayne" },
    { id: "9", name: "9º Ano", theme: "Bumba Meu Boi", color: "#16a34a", category: "Categoria 2", mentor: "Prof. Alexandre" },
    { id: "1", name: "1º Ano", theme: "Carnaval de Recife", color: "#2563eb", category: "Categoria 2", mentor: "Prof. Amanda e Diogo" },
    { id: "2", name: "2º Ano", theme: "Festival de Parintins", color: "#050505", category: "Categoria 2", mentor: "Prof. Rafaely" }
  ],
  materialTypes: [
    "Ficha de inscrição",
    "Relatório de estratégia de trabalho",
    "Cota (sala + blusa)",
    "Remix dança das líderes de torcida",
    "Remix dança dos professores",
    "Remix dança típica",
    "Áudio da comida típica",
    "Story Criativo"
  ],
  foodTypes: [
    { id: "leite-po", name: "Leite em pó (400g)", tokens: 8 },
    { id: "cafe", name: "Café (250g)", tokens: 8 },
    { id: "oleo", name: "Óleo de soja (900ml ou 1L)", tokens: 6 },
    { id: "feijao", name: "Feijão (1kg)", tokens: 5 },
    { id: "arroz", name: "Arroz (1kg)", tokens: 4 },
    { id: "acucar", name: "Açúcar (1kg)", tokens: 4 },
    { id: "farinha", name: "Farinha de mandioca (1kg)", tokens: 3 },
    { id: "macarrao", name: "Macarrão (pacote)", tokens: 2 },
    { id: "floco", name: "Floco de milho (500g)", tokens: 2 }
  ],
  events: [
    { id: "solidaria", name: "Prova Solidária", max: 50, group: "20/05 • Tokens convertidos em pontos" },
    { id: "comportamento", name: "Comportamento", max: 20, group: "Abril e maio" },
    { id: "adesao-blusa", name: "Adesão da blusa", max: 35, group: "Até 20/05" },
    { id: "futsal", name: "Futsal masculino", max: 30, group: "22/05 • Esportivas" },
    { id: "professor", name: "Desafio do professor", max: 10, group: "22/05 • Esportivas" },
    { id: "carimba", name: "Carimba misto", max: 20, group: "22/05 • Esportivas" },
    { id: "volei", name: "Vôlei misto", max: 10, group: "22/05 • Esportivas" },
    { id: "lideres", name: "Dança das líderes", max: 30, group: "22/05 • Esportivas" },
    { id: "blusa", name: "Blusa da equipe", max: 10, group: "22/05 • Esportivas" },
    { id: "corrida", name: "Corrida maluca", max: 10, group: "29/05 • Manhã" },
    { id: "tesouro", name: "Caça ao tesouro", max: 10, group: "29/05 • Manhã" },
    { id: "soletrando", name: "Soletrando", max: 10, group: "29/05 • Manhã" },
    { id: "quiz", name: "Quiz torta na cara", max: 10, group: "29/05 • Manhã" },
    { id: "story", name: "Story criativo", max: 10, group: "Semana do evento" },
    { id: "grito", name: "Grito de guerra", max: 10, group: "29/05 • Tarde" },
    { id: "comida", name: "Comida típica", max: 15, group: "29/05 • Tarde" },
    { id: "danca", name: "Dança típica", max: 50, group: "29/05 • Tarde" },
    { id: "professor-1000", name: "Meu professor vale 1000", max: 50, group: "29/05 • Tarde" }
  ],
  scores: [
    { teamId: "6", eventId: "solidaria", points: 0, note: "Aguardando apuração" },
    { teamId: "7", eventId: "solidaria", points: 0, note: "Aguardando apuração" },
    { teamId: "8", eventId: "solidaria", points: 0, note: "Aguardando apuração" },
    { teamId: "9", eventId: "solidaria", points: 0, note: "Aguardando apuração" },
    { teamId: "1", eventId: "solidaria", points: 0, note: "Aguardando apuração" },
    { teamId: "2", eventId: "solidaria", points: 0, note: "Aguardando apuração" }
  ],
  schedules: [],
  participants: [],
  materials: [],
  foodDonations: [],
  discipline: [],
  bonuses: [],
  judges: [],
  judgingDays: [],
  evaluations: [],
  judgingBlocks: [],
  evaluationDrafts: [],
  leadershipClaims: [],
  leadershipRequests: [],
  scheduleRequests: [],
  registrationForms: [],
  strategyReports: [],
  leadershipCodes: DEFAULT_LEADERSHIP_CODES,
  teacherCodes: DEFAULT_TEACHER_CODES,
  judgingEventOrder: JUDGING_EVENTS.map((item) => item.id)
};

let state = loadState();

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return structuredClone(defaultData);
  try {
    return normalizeState(JSON.parse(raw));
  } catch {
    return structuredClone(defaultData);
  }
}

function normalizeState(saved = {}) {
  const base = structuredClone(defaultData);
  return {
    ...base,
    ...saved,
    teams: base.teams,
    materialTypes: base.materialTypes,
    foodTypes: base.foodTypes,
    events: base.events,
    scores: Array.isArray(saved.scores) ? saved.scores : base.scores,
    schedules: Array.isArray(saved.schedules) ? saved.schedules : base.schedules,
    participants: Array.isArray(saved.participants) ? saved.participants : base.participants,
    materials: Array.isArray(saved.materials) ? saved.materials.filter((item) => item.material !== "Alimentos") : base.materials,
    foodDonations: Array.isArray(saved.foodDonations) ? saved.foodDonations : base.foodDonations,
    discipline: Array.isArray(saved.discipline) ? saved.discipline : base.discipline,
    bonuses: Array.isArray(saved.bonuses) ? saved.bonuses : base.bonuses,
    judges: Array.isArray(saved.judges) ? saved.judges : base.judges,
    judgingDays: Array.isArray(saved.judgingDays) ? saved.judgingDays : base.judgingDays,
    evaluations: Array.isArray(saved.evaluations) ? saved.evaluations : base.evaluations,
    judgingBlocks: Array.isArray(saved.judgingBlocks) ? saved.judgingBlocks.map((block) => ({
      ...block,
      eventIds: sortJudgingDayEventIds(block.eventIds || []),
      category: judgingCategories().includes(block.category) ? block.category : "Categoria 1",
      active: block.active !== false
    })) : base.judgingBlocks,
    evaluationDrafts: Array.isArray(saved.evaluationDrafts) ? saved.evaluationDrafts : base.evaluationDrafts,
    leadershipClaims: Array.isArray(saved.leadershipClaims) ? saved.leadershipClaims : base.leadershipClaims,
    leadershipRequests: Array.isArray(saved.leadershipRequests) ? saved.leadershipRequests : base.leadershipRequests,
    scheduleRequests: Array.isArray(saved.scheduleRequests) ? saved.scheduleRequests : base.scheduleRequests,
    registrationForms: Array.isArray(saved.registrationForms) ? saved.registrationForms : base.registrationForms,
    strategyReports: Array.isArray(saved.strategyReports) ? saved.strategyReports : base.strategyReports,
    leadershipCodes: saved.leadershipCodes && typeof saved.leadershipCodes === "object" ? saved.leadershipCodes : base.leadershipCodes,
    teacherCodes: saved.teacherCodes && typeof saved.teacherCodes === "object" ? saved.teacherCodes : base.teacherCodes,
    judgingEventOrder: normalizeJudgingEventOrder(saved.judgingEventOrder || base.judgingEventOrder)
  };
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  render();
  if (canSaveOnline()) {
    setSyncStatus("Alterações salvas. Sincronizando online...");
    queueRemoteSave();
  } else {
    setSyncStatus("Alterações salvas neste navegador. Abra pelo Cloudflare Pages para salvar online.");
  }
}

function mutableState() {
  return {
    scores: state.scores,
    schedules: state.schedules,
    participants: state.participants,
    materials: state.materials,
    foodDonations: state.foodDonations,
    discipline: state.discipline,
    bonuses: state.bonuses,
    judges: state.judges,
    judgingDays: state.judgingDays,
    judgingBlocks: state.judgingBlocks,
    evaluationDrafts: state.evaluationDrafts,
    leadershipClaims: state.leadershipClaims,
    leadershipRequests: state.leadershipRequests,
    scheduleRequests: state.scheduleRequests,
    registrationForms: state.registrationForms,
    strategyReports: state.strategyReports,
    leadershipCodes: state.leadershipCodes,
    teacherCodes: state.teacherCodes,
    evaluations: state.evaluations,
    judgingEventOrder: state.judgingEventOrder
  };
}

function setSyncStatus(message) {
  const status = byId("syncStatus");
  if (status) status.textContent = message;
}

function queueRemoteSave() {
  clearTimeout(remoteSaveTimer);
  remoteSaveTimer = setTimeout(() => {
    saveRemoteData();
  }, 700);
}

function usesPagesApi() {
  return location.protocol.startsWith("http") && !location.hostname.endsWith("github.io");
}

function canSaveOnline() {
  return usesPagesApi() || location.protocol === "file:";
}

function dataApiUrl() {
  return usesPagesApi() ? PAGES_DATA_URL : PUBLISHED_DATA_URL;
}

function byId(id) {
  return document.getElementById(id);
}

function setHtml(id, html) {
  const element = byId(id);
  if (element) element.innerHTML = html;
}

function setValue(id, value) {
  const element = byId(id);
  if (element) element.value = value;
}

function on(id, eventName, handler) {
  const element = byId(id);
  if (element) element.addEventListener(eventName, handler);
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function team(id) {
  return state.teams.find((item) => item.id === id);
}

function eventById(id) {
  return state.events.find((item) => item.id === id);
}

function judgingEventById(id) {
  return JUDGING_EVENTS.find((item) => item.id === id);
}

function normalizeJudgingEventOrder(order = []) {
  const validIds = JUDGING_EVENTS.map((item) => item.id);
  const seen = new Set();
  const normalized = Array.isArray(order) ? order.filter((id) => {
    if (!validIds.includes(id) || seen.has(id)) return false;
    seen.add(id);
    return true;
  }) : [];
  return [...normalized, ...validIds.filter((id) => !seen.has(id))];
}

function judgingEventOrderIds() {
  const order = normalizeJudgingEventOrder(state?.judgingEventOrder || []);
  if (state && JSON.stringify(state.judgingEventOrder || []) !== JSON.stringify(order)) {
    state.judgingEventOrder = order;
  }
  return order;
}

function judgingEventOrderIndex(id) {
  const index = judgingEventOrderIds().indexOf(id);
  return index === -1 ? JUDGING_EVENTS.length : index;
}

function orderedJudgingEvents() {
  return judgingEventOrderIds()
    .map((id) => judgingEventById(id))
    .filter(Boolean);
}

function sortJudgingDayEventIds(eventIds = []) {
  return [...eventIds].sort((a, b) => judgingEventOrderIndex(a) - judgingEventOrderIndex(b));
}

function normalizeJudgeCode(value = "") {
  return String(value).trim().toUpperCase().replace(/\s+/g, "-");
}

function judgeByCode(code) {
  const normalized = normalizeJudgeCode(code);
  return state.judges.find((item) => normalizeJudgeCode(item.code) === normalized);
}

function judgeIsActive(judge) {
  return judge && judge.active !== false;
}

function judgingCategories() {
  return ["Categoria 1", "Categoria 2"];
}

function normalizedJudgeCodes(values = []) {
  return values.map(normalizeJudgeCode).filter(Boolean);
}

function activeJudgingDaysForJudge(code) {
  const normalized = normalizeJudgeCode(code);
  return state.judgingDays.filter((day) => (
    day.active !== false
    && normalizedJudgeCodes(day.judgeCodes || []).includes(normalized)
  ));
}

function judgingAssignmentsForJudge(judge) {
  if (!judgeIsActive(judge)) return [];
  const assignments = activeJudgingDaysForJudge(judge.code).flatMap((day) => {
    const eventIds = Array.isArray(day.eventIds) ? day.eventIds : [];
    return eventIds.flatMap((eventId) => judgingCategories().map((category) => ({
      eventId,
      eventName: judgingEventById(eventId)?.name || eventId,
      category,
      dayId: day.id,
      dayName: day.name || formatDate(day.date) || "Dia de apresentação"
    })));
  });
  const seen = new Set();
  return assignments.filter((item) => {
    const key = `${item.eventId}::${item.category}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function hasJudgeEvaluation(code, eventId, category) {
  const normalized = normalizeJudgeCode(code);
  return state.evaluations.some((item) => (
    normalizeJudgeCode(item.judgeCode) === normalized
    && item.eventId === eventId
    && item.category === category
  ));
}

function activeJudgingBlocks() {
  return (state.judgingBlocks || [])
    .filter((block) => block.active !== false && Array.isArray(block.eventIds) && block.eventIds.length)
    .map((block) => ({
      ...block,
      eventIds: sortJudgingDayEventIds(block.eventIds || [])
    }));
}

function blockKey(judgeCode = "", blockId = "") {
  return `gincana-draft-${normalizeJudgeCode(judgeCode)}-${blockId}`;
}

function draftRecordKey(judgeCode = "", blockId = "") {
  return `${normalizeJudgeCode(judgeCode)}::${blockId}`;
}

function onlineBlockDraftRecord(judgeCode = "", blockId = "") {
  const key = draftRecordKey(judgeCode, blockId);
  return (state.evaluationDrafts || []).find((item) => item.key === key);
}

function loadBlockDraft(judgeCode = "", blockId = "") {
  const online = onlineBlockDraftRecord(judgeCode, blockId);
  if (online?.draft && typeof online.draft === "object") return online.draft;
  try {
    return JSON.parse(localStorage.getItem(blockKey(judgeCode, blockId)) || "{}");
  } catch {
    return {};
  }
}

function upsertOnlineBlockDraft(judgeCode = "", blockId = "", draft = {}) {
  const normalizedCode = normalizeJudgeCode(judgeCode);
  const key = draftRecordKey(normalizedCode, blockId);
  if (!Array.isArray(state.evaluationDrafts)) state.evaluationDrafts = [];
  const existing = state.evaluationDrafts.find((item) => item.key === key);
  const payload = {
    key,
    judgeCode: normalizedCode,
    blockId,
    draft,
    updatedAt: new Date().toISOString()
  };
  if (existing) Object.assign(existing, payload);
  else state.evaluationDrafts.push(payload);
}

function queueDraftRemoteSave() {
  clearTimeout(draftRemoteSaveTimer);
  draftRemoteSaveTimer = setTimeout(() => {
    if (canSaveOnline()) {
      setSyncStatus("Rascunho salvo. Sincronizando online...");
      queueRemoteSave();
    }
  }, 1200);
}

function saveBlockDraft(judgeCode = "", blockId = "", draft = {}, options = {}) {
  localStorage.setItem(blockKey(judgeCode, blockId), JSON.stringify(draft));
  upsertOnlineBlockDraft(judgeCode, blockId, draft);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  if (options.remote !== false) queueDraftRemoteSave();
}

function clearBlockDraft(judgeCode = "", blockId = "") {
  localStorage.removeItem(blockKey(judgeCode, blockId));
  const key = draftRecordKey(judgeCode, blockId);
  if (Array.isArray(state.evaluationDrafts)) {
    state.evaluationDrafts = state.evaluationDrafts.filter((item) => item.key !== key);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  if (canSaveOnline()) queueRemoteSave();
}

function blockIsAllowedForJudge(block, judge) {
  if (!judgeIsActive(judge)) return false;
  const assignments = judgingAssignmentsForJudge(judge);
  return (block.eventIds || []).every((eventId) => (
    assignments.some((item) => item.eventId === eventId && item.category === block.category)
  ));
}

function blockIsCompletedForJudge(block, judge) {
  return (block.eventIds || []).every((eventId) => hasJudgeEvaluation(judge.code, eventId, block.category));
}

function pendingBlocksForJudge(judge) {
  return activeJudgingBlocks()
    .filter((block) => blockIsAllowedForJudge(block, judge) && !blockIsCompletedForJudge(block, judge));
}

function eventCoveredByPendingBlock(judge, eventId, category) {
  return pendingBlocksForJudge(judge).some((block) => (
    block.category === category && (block.eventIds || []).includes(eventId)
  ));
}

function selectedJudgeBlock(judge) {
  const blocks = pendingBlocksForJudge(judge);
  if (!blocks.length) return null;
  const currentId = sessionStorage.getItem("gincana-selected-block");
  return blocks.find((block) => block.id === currentId) || blocks[0];
}

function blockDraftProgress(block, draft = {}) {
  const teams = categoryTeams(block.category);
  const totalItems = teams.length * (block.eventIds || []).length;
  const completed = teams.reduce((sum, item) => {
    return sum + (block.eventIds || []).filter((eventId) => {
      const definition = judgingEventById(eventId);
      const record = draft?.[item.id]?.[eventId] || {};
      return definition && definition.criteria.every((criterion) => Number(record[criterionId(criterion)] || 0) > 0);
    }).length;
  }, 0);
  return { completed, totalItems };
}

function blockReadyToSubmit(block, draft = {}) {
  const teams = categoryTeams(block.category);
  return teams.every((item) => (block.eventIds || []).every((eventId) => {
    const definition = judgingEventById(eventId);
    const record = draft?.[item.id]?.[eventId] || {};
    return definition && definition.criteria.every((criterion) => {
      const value = Number(record[criterionId(criterion)] || 0);
      return value >= 6 && value <= 10;
    });
  }));
}

function pendingJudgingCombos(judge) {
  if (!judgeIsActive(judge)) return [];
  return judgingAssignmentsForJudge(judge)
    .filter((combo) => !hasJudgeEvaluation(judge.code, combo.eventId, combo.category));
}

function judgeCompletedCount(code) {
  const normalized = normalizeJudgeCode(code);
  return state.evaluations.filter((item) => normalizeJudgeCode(item.judgeCode) === normalized).length;
}

function welcomeStorageKey(code) {
  return `gincana-welcome-seen-${normalizeJudgeCode(code)}`;
}

function foodById(id) {
  return state.foodTypes.find((item) => item.id === id);
}

function disciplineLevelById(id) {
  return DISCIPLINE_LEVELS.find((item) => item.id === id) || DISCIPLINE_LEVELS[0];
}

function totals() {
  return state.teams.map((item) => {
    const positive = state.scores
      .filter((score) => score.teamId === item.id)
      .reduce((sum, score) => sum + Number(score.points || 0), 0);
    const penalties = state.discipline
      .filter((entry) => entry.teamId === item.id && entry.type === "Penalidade")
      .reduce((sum, entry) => sum + Math.abs(Number(entry.points || 0)), 0);
    const bonuses = state.bonuses
      .filter((entry) => entry.teamId === item.id)
      .reduce((sum, entry) => sum + Math.abs(Number(entry.points || 0)), 0);
    return { ...item, total: positive + bonuses - penalties, penalties, bonuses };
  }).sort((a, b) => b.total - a.total);
}

function renderScoreboard() {
  setHtml("scoreboard", ["Categoria 1", "Categoria 2"].map((category) => {
    const categoryTeams = totals().filter((item) => item.category === category);
    return `
      <div class="score-category">
        <h3>${category}</h3>
        <div class="score-category-list">
          ${categoryTeams.map((item, index) => `
            <article class="score-card" style="--team-color:${item.color};--metric-color:${item.id === "2" ? "#ffffff" : item.color}">
              <div class="rank">${index + 1}º</div>
              <div>
                <h4>${item.name}</h4>
                <p>${item.theme}${item.penalties ? ` • -${item.penalties} em penalidades` : ""}</p>
              </div>
              <div class="score-total">${formatPoints(item.total)}</div>
            </article>
          `).join("")}
        </div>
      </div>
    `;
  }).join(""));
}

function renderTeams() {
  setHtml("teamsGrid", state.teams.map((item) => `
    <article class="team-card" style="--team-color:${item.color}">
      <div class="team-swatch"></div>
      <div class="team-card-body">
        <h3>${item.name}</h3>
        <p><strong>Cor:</strong> ${item.color.toUpperCase()}</p>
        <p><strong>Tema:</strong> ${item.theme}</p>
        <p><strong>Padrinho:</strong> ${item.mentor}</p>
      </div>
    </article>
  `).join(""));
}

function renderEvents() {
  setHtml("eventsGrid", state.events.map((item) => {
    return `
      <article class="event-card neutral-card">
        <h3>${item.name}</h3>
        <p>${item.group}</p>
        <p>Máximo: ${formatPoints(item.max)} pontos</p>
      </article>
    `;
  }).join(""));
}

function eventRanking(eventId, category) {
  return state.teams
    .filter((item) => !category || item.category === category)
    .map((item) => {
    const score = state.scores.find((entry) => entry.teamId === item.id && entry.eventId === eventId);
    return {
      ...item,
      points: Number(score?.points || 0),
      note: score?.note || "Sem observação"
    };
    }).sort((a, b) => b.points - a.points);
}

function renderEventResults() {
  setHtml("eventResults", state.events.map((event) => {
    return `
      <details class="event-result-card">
        <summary>
          <span>
            <strong>${event.name}</strong>
            <small>${event.group}</small>
          </span>
          <span class="toggle-arrow event-result-arrow" aria-hidden="true">⌄</span>
        </summary>
        <div class="event-result-body">
          ${["Categoria 1", "Categoria 2"].map((category) => {
            const ranking = eventRanking(event.id, category);
            return `
              <section class="event-result-category">
                <h4>${category}</h4>
                <div class="event-result-category-list">
                  ${ranking.map((item, index) => `
                    <article class="event-result-row${index < 3 ? " top-three" : ""}" style="--team-color:${item.color};--metric-color:${item.id === "2" ? "#ffffff" : item.color}">
                      <div class="event-result-place">${index + 1}º</div>
                      <div>
                        <h4>${item.name}</h4>
                        <p>${item.theme}</p>
                        <small>${item.note}</small>
                      </div>
                      <div class="event-result-points">${formatPoints(item.points)}</div>
                    </article>
                  `).join("")}
                </div>
              </section>
            `;
          }).join("")}
        </div>
      </details>
    `;
  }).join(""));
}

function isoDateOffset(days) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatScheduleWindow(item) {
  if (item.time && item.endTime) return `${item.time} - ${item.endTime}`;
  return item.time || "Horário a definir";
}

function scheduleTeamRank(teamId) {
  const index = TEAM_ORDER.indexOf(teamId);
  return index === -1 ? TEAM_ORDER.length : index;
}

function compareSchedules(a, b) {
  const dateCompare = (a.date || "").localeCompare(b.date || "");
  if (dateCompare !== 0) return dateCompare;
  const timeCompare = (a.time || "").localeCompare(b.time || "");
  if (timeCompare !== 0) return timeCompare;
  return scheduleTeamRank(a.teamId) - scheduleTeamRank(b.teamId);
}

function sortedScheduleEntries() {
  return state.schedules
    .map((item, index) => ({ item, index }))
    .sort((a, b) => compareSchedules(a.item, b.item));
}

function scheduleIsRealized(item) {
  if (!item.date) return false;
  const compareTime = item.endTime || item.time || "23:59";
  const scheduleMoment = new Date(`${item.date}T${compareTime}`);
  return !Number.isNaN(scheduleMoment.getTime()) && scheduleMoment.getTime() < Date.now();
}

function scheduleSourceLabel(item) {
  if (item.createdBy === "teacher" && item.acceptedBy === "admin") return "Marcado por professor e aceito por Prof. Cílio";
  if (item.createdBy === "teacher") return "Marcado por professor";
  if (item.createdBy === "leader" && item.acceptedBy === "admin") return "Marcado por líder e aceito por Prof. Cílio";
  if (item.createdBy === "leader" && item.acceptedBy === "victoria") return "Marcado por líder e aceito por Vitória";
  if (item.createdBy === "leader") return "Marcado por líder";
  if (item.createdBy === "admin") return "Agendado com Prof. Cílio";
  return "Agendado com Vitória";
}

function disciplineSourceLabel(item) {
  if (item.createdBy === "admin") return "Registrado por Prof. Cílio";
  if (item.createdBy === "victoria") return "Registrado por Vitória";
  return "";
}

function categoryTeams(category) {
  return state.teams.filter((item) => item.category === category);
}

function criterionId(value = "") {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function evaluationTotal(entry) {
  return Object.values(entry.criteria || {}).reduce((sum, value) => sum + Number(value || 0), 0);
}

function rankEvaluationScores(scores = [], definition = {}) {
  return [...scores]
    .map((score) => ({ ...score, total: Number(score.total ?? evaluationTotal(score)) }))
    .sort((a, b) => b.total - a.total || scheduleTeamRank(a.teamId) - scheduleTeamRank(b.teamId))
    .map((score, index) => ({
      ...score,
      placement: index + 1,
      gincanaPoints: Number(definition.pointsByPlace?.[index] || 0)
    }));
}

function participantRecord(teamId = "", activity = "") {
  return state.participants.find((item) => item.teamId === teamId && item.activity === activity);
}

function normalizeParticipantNames(value = "") {
  return String(value)
    .split(/\r?\n/)
    .map((name) => name.trim())
    .filter(Boolean)
    .join("\n");
}

function participantLines(teamId = "", activity = "") {
  return (participantRecord(teamId, activity)?.names || "")
    .split(/\r?\n/)
    .map((name) => name.trim())
    .filter(Boolean);
}


function normalizeActivityName(value = "") {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function participantLinesForSchedule(teamId = "", activity = "") {
  const direct = participantLines(teamId, activity);
  if (direct.length) return direct;

  const normalizedActivity = normalizeActivityName(activity);
  const aliases = {
    "danca das lideres de torcida": ["Dança das Líderes"],
    "danca das lideres": ["Dança das Líderes"],
    "lideres de torcida": ["Dança das Líderes"],
    "danca dos professores": ["Meu Professor Vale 1000"],
    "professores": ["Meu Professor Vale 1000"],
    "meu professor": ["Meu Professor Vale 1000"],
    "meu professor vale 1000": ["Meu Professor Vale 1000", "Dança dos Professores"],
    "danca tipica": ["Dança Típica"],
    "story": ["Story Criativo"],
    "story criativo": ["Story Criativo"],
    "organizacao": ["Prova Solidária", "Comportamento", "Adesão da Blusa"]
  };

  const possibleNames = aliases[normalizedActivity] || [];

  for (const name of possibleNames) {
    const found = participantLines(teamId, name);
    if (found.length) return found;
  }

  const formRecord = registrationFormRecord(teamId);
  const formParticipants = formRecord?.participants || {};

  for (const name of [activity, ...possibleNames]) {
    const saved = formParticipants[name] || "";
    const lines = saved.split(/\r?\n/).map((item) => item.trim()).filter(Boolean);
    if (lines.length) return lines;
  }

  const fuzzyFormKey = Object.keys(formParticipants).find((key) => {
    const savedActivity = normalizeActivityName(key);
    return savedActivity === normalizedActivity
      || possibleNames.map(normalizeActivityName).includes(savedActivity)
      || savedActivity.includes(normalizedActivity)
      || normalizedActivity.includes(savedActivity);
  });

  if (fuzzyFormKey) {
    return String(formParticipants[fuzzyFormKey] || "")
      .split(/\r?\n/)
      .map((name) => name.trim())
      .filter(Boolean);
  }

  const sameTeamRecords = state.participants.filter((item) => item.teamId === teamId);
  const fuzzy = sameTeamRecords.find((item) => {
    const savedActivity = normalizeActivityName(item.activity);
    return savedActivity === normalizedActivity
      || possibleNames.map(normalizeActivityName).includes(savedActivity)
      || savedActivity.includes(normalizedActivity)
      || normalizedActivity.includes(savedActivity);
  });

  return (fuzzy?.names || "")
    .split(/\r?\n/)
    .map((name) => name.trim())
    .filter(Boolean);
}

function syncParticipantsFromRegistrationForms() {
  if (!Array.isArray(state.registrationForms)) return;
  let changed = false;
  state.registrationForms.forEach((record) => {
    const teamId = record.teamId;
    const participants = record.participants || {};
    Object.entries(participants).forEach(([activity, names]) => {
      const normalizedNames = normalizeParticipantNames(names || "");
      if (!teamId || !activity || !normalizedNames) return;
      const exists = state.participants.some((item) => item.teamId === teamId && item.activity === activity && item.names === normalizedNames);
      if (!exists) {
        state.participants = state.participants.filter((item) => item.teamId !== teamId || item.activity !== activity);
        state.participants.push({ teamId, activity, names: normalizedNames });
        changed = true;
      }
    });
  });
  return changed;
}

function renderSchedules() {
  const root = byId("scheduleList");
  if (!root) return;
  const sorted = sortedScheduleEntries();
  const manageSchedules = !document.body.classList.contains("public-page");

  const teamFilter = byId("scheduleTeamFilter");
  if (teamFilter && !teamFilter.dataset.loaded) {
    teamFilter.innerHTML = `<option value="">Todas as turmas</option>${state.teams.map((item) => `<option value="${item.id}">${item.name}</option>`).join("")}`;
    teamFilter.dataset.loaded = "true";
  }
  const selectedTeamId = teamFilter?.value || "";
  const filteredSorted = selectedTeamId
    ? sorted.filter(({ item }) => item.teamId === selectedTeamId)
    : sorted;

  let activeTab = ["upcoming", "realized"].includes(root.dataset.activeTab) ? root.dataset.activeTab : "upcoming";
  const upcomingEntries = filteredSorted.filter(({ item }) => !scheduleIsRealized(item));
  const realizedEntries = filteredSorted
    .filter(({ item }) => scheduleIsRealized(item))
    .sort((a, b) => compareSchedules(b.item, a.item));
  if (!root.dataset.activeTab && !upcomingEntries.length && realizedEntries.length) {
    activeTab = "realized";
  }

  const renderGroups = (entries, tabName) => {
    const groups = entries.reduce((acc, { item, index }) => {
      if (!acc[item.date]) acc[item.date] = [];
      acc[item.date].push({ item, index });
      return acc;
    }, {});

    const content = Object.entries(groups).map(([date, groupedEntries]) => `
      <section class="schedule-day-group">
        <header class="schedule-day-header">
          <h3>${formatDate(date)}</h3>
          <span>${groupedEntries.length} ensaio${groupedEntries.length > 1 ? "s" : ""}</span>
        </header>
        <div class="schedule-day-list">
          ${groupedEntries.map(({ item, index }) => {
            const itemTeam = team(item.teamId);
            const activity = item.activity || "Ensaio";
            const place = item.place || "ENSPS";
            const participants = participantLinesForSchedule(item.teamId, activity);
            const participantsId = `participants-${tabName}-${index}`;
            return `
              <article class="schedule-item" style="border-left:8px solid ${itemTeam.color}">
                <div class="schedule-item-top">
                  <h3>
                    <span>${itemTeam.name}</span>
                    <small>${formatScheduleWindow(item)}</small>
                  </h3>
                  ${manageSchedules ? `
                    <div class="schedule-item-actions">
                      <button class="schedule-action" data-edit-schedule="${index}" type="button">Editar</button>
                      <button class="schedule-delete" data-delete-schedule="${index}" type="button" aria-label="Excluir ensaio">×</button>
                    </div>
                  ` : ""}
                </div>
                <p class="schedule-activity">${activity}</p>
                <p class="schedule-meta">${place} • ${scheduleSourceLabel(item)}</p>
                ${participants.length ? `
                  <button class="schedule-participants-toggle" data-toggle-participants="${participantsId}" type="button">👥 Ver participantes</button>
                  <div class="schedule-participants" id="${participantsId}" hidden>
                    <strong>Participantes deste ensaio</strong>
                    <ul>${participants.map((name) => `<li>${escapeHtml(name)}</li>`).join("")}</ul>
                  </div>
                ` : ""}
              </article>
            `;
          }).join("")}
        </div>
      </section>
    `).join("");

    return `
      <div class="schedule-tab-panel${activeTab === tabName ? " active" : ""}" data-schedule-panel="${tabName}">
        ${content || `<div class="empty-state">${tabName === "realized" ? "Nenhum ensaio realizado ainda." : "Nenhum ensaio agendado ainda."}</div>`}
      </div>
    `;
  };

  root.dataset.activeTab = activeTab;

  root.innerHTML = `
    <div class="schedule-tabs">
      <button class="schedule-tab-button${activeTab === "upcoming" ? " active" : ""}" data-schedule-tab="upcoming" type="button">Agendados</button>
      <button class="schedule-tab-button${activeTab === "realized" ? " active" : ""}" data-schedule-tab="realized" type="button">Realizados</button>
    </div>
    ${renderGroups(upcomingEntries, "upcoming")}
    ${renderGroups(realizedEntries, "realized")}
  `;
}

function setScheduleEditing(index = "") {
  const form = byId("scheduleForm");
  if (!form) return;
  form.elements.editIndex.value = index === "" ? "" : String(index);
  form.elements.preset.value = "";
  const isEditing = index !== "";
  const submitButton = byId("scheduleSubmit");
  const cancelButton = byId("scheduleCancelEdit");
  if (submitButton) submitButton.textContent = isEditing ? "Salvar ensaio" : "Agendar ensaio";
  if (cancelButton) cancelButton.hidden = !isEditing;
}

function loadScheduleIntoForm(index) {
  const form = byId("scheduleForm");
  const item = state.schedules[index];
  if (!form || !item) return;
  form.elements.team.value = item.teamId;
  form.elements.date.value = item.date || "";
  form.elements.time.value = item.time || "";
  form.elements.endTime.value = item.endTime || "";
  form.elements.place.value = item.place || "ENSPS";
  form.elements.activity.value = item.activity || "";
  form.elements.preset.value = "";
  setScheduleEditing(index);
}

function applySchedulePreset(rawValue) {
  const form = byId("scheduleForm");
  if (!form || !rawValue) return;
  const [start, end] = rawValue.split("|");
  form.elements.time.value = start || "";
  form.elements.endTime.value = end || "";
}

function applyActivityPreset(rawValue) {
  const form = byId("scheduleForm");
  if (!form || !rawValue) return;
  form.elements.activity.value = rawValue;
  form.elements.activityPreset.value = "";
}

function loadParticipantsIntoForm() {
  const form = byId("participantsForm");
  if (!form) return;
  form.elements.names.value = participantRecord(form.elements.team.value, form.elements.activity.value)?.names || "";
}

function syncParticipantsForm() {
  loadParticipantsIntoForm();
}

function renderDiscipline() {
  const entries = [...state.discipline].reverse();
  setHtml("disciplineList", entries.length ? entries.map((item) => {
    const itemTeam = team(item.teamId);
    const dateLabel = item.date ? formatDate(item.date) : "Data não informada";
    const source = disciplineSourceLabel(item);
    return `
      <article class="discipline-item" style="border-left:8px solid ${itemTeam.color}">
        <h3>${item.type}${item.levelLabel ? ` ${item.levelLabel}` : ""} • ${itemTeam.name}</h3>
        <p>${dateLabel}</p>
        <p>${item.reason}</p>
        <p>${item.type === "Penalidade" ? `Desconto: ${formatPoints(Math.abs(item.points || 0))} pontos` : "Sem desconto aplicado"}</p>
        ${source ? `<p>${source}</p>` : ""}
      </article>
    `;
  }).join("") : `<div class="empty-state">Nenhuma advertência ou penalidade registrada.</div>`);
}

function setDisciplineEditing(index = "") {
  const form = byId("disciplineForm");
  if (!form) return;
  form.elements.editIndex.value = index === "" ? "" : String(index);
  const isEditing = index !== "";
  const submitButton = byId("disciplineSubmit");
  const cancelButton = byId("disciplineCancelEdit");
  if (submitButton) submitButton.textContent = isEditing ? "Salvar alteração" : "Registrar";
  if (cancelButton) cancelButton.hidden = !isEditing;
}

function loadDisciplineIntoForm(index) {
  const form = byId("disciplineForm");
  const item = state.discipline[index];
  if (!form || !item) return;
  form.elements.team.value = item.teamId;
  form.elements.type.value = item.type;
  form.elements.date.value = item.date || "";
  form.elements.points.value = item.type === "Penalidade" ? Math.abs(Number(item.points || 0)) : 0;
  form.elements.reason.value = item.reason || "";
  setDisciplineEditing(index);
}

function setBonusEditing(index = "") {
  const form = byId("bonusForm");
  if (!form) return;
  form.elements.editIndex.value = index === "" ? "" : String(index);
  const isEditing = index !== "";
  const submitButton = byId("bonusSubmit");
  const cancelButton = byId("bonusCancelEdit");
  if (submitButton) submitButton.textContent = isEditing ? "Salvar bônus" : "Registrar bônus";
  if (cancelButton) cancelButton.hidden = !isEditing;
}

function loadBonusIntoForm(index) {
  const form = byId("bonusForm");
  const item = state.bonuses[index];
  if (!form || !item) return;
  form.elements.team.value = item.teamId;
  form.elements.date.value = item.date || "";
  form.elements.points.value = Math.abs(Number(item.points || 0));
  form.elements.reason.value = item.reason || "";
  setBonusEditing(index);
}

function foodTotals() {
  return state.teams.map((item) => {
    const entries = state.foodDonations.filter((donation) => donation.teamId === item.id);
    const tokens = entries.reduce((sum, donation) => {
      const food = foodById(donation.foodId);
      return sum + Number(donation.quantity || 0) * Number(food?.tokens || 0);
    }, 0);
    const quantity = entries.reduce((sum, donation) => sum + Number(donation.quantity || 0), 0);
    return { ...item, tokens, quantity, entries };
  }).sort((a, b) => b.tokens - a.tokens);
}

function renderFoodDonations() {
  const ranking = foodTotals();
  setHtml("foodRanking", ranking.map((item, index) => `
    <article class="food-rank-card" style="--team-color:${item.color};--metric-color:${item.id === "2" ? "#ffffff" : item.color}">
      <div class="rank">${index + 1}º</div>
      <div>
        <h3>${item.name}</h3>
        <p>${item.theme}</p>
      </div>
      <div>
        <strong>${formatPoints(item.tokens)}</strong>
        <span>tokens</span>
      </div>
    </article>
  `).join(""));

  setHtml("foodPanel", state.teams.map((item) => {
    const totalsByFood = state.foodTypes.map((food) => {
      const quantity = state.foodDonations
        .filter((donation) => donation.teamId === item.id && donation.foodId === food.id)
        .reduce((sum, donation) => sum + Number(donation.quantity || 0), 0);
      return { ...food, quantity, total: quantity * food.tokens };
    }).filter((food) => food.quantity > 0);
    const teamTotal = ranking.find((ranked) => ranked.id === item.id)?.tokens || 0;
    return `
      <article class="food-team" style="--team-color:${item.color}">
        <header>
          <h3>${item.name}</h3>
          <p>${formatPoints(teamTotal)} tokens acumulados</p>
        </header>
        ${totalsByFood.length ? `
          <ul>
            ${totalsByFood.map((food) => `
              <li>
                <span>${food.name}</span>
                <strong>${formatPoints(food.quantity)} un. • ${formatPoints(food.total)} tokens</strong>
              </li>
            `).join("")}
          </ul>
        ` : `<div class="empty-state">Nenhum alimento lançado para esta turma.</div>`}
      </article>
    `;
  }).join(""));
}

function materialFor(teamId, material) {
  return state.materials.find((item) => item.teamId === teamId && item.material === material);
}

function materialStatusClass(status) {
  if (status === "Entregue") return "done";
  if (status === "Parcial") return "partial";
  return "pending";
}

function materialStatus(teamId, material) {
  return materialFor(teamId, material)?.status || "Pendente";
}

function renderMaterials() {
  setHtml("materialsOverview", state.materialTypes.map((material) => {
    const done = state.teams.filter((item) => materialStatus(item.id, material) === "Entregue").length;
    const partial = state.teams.filter((item) => materialStatus(item.id, material) === "Parcial").length;
    return `
      <article class="material-summary neutral-card">
        <h3>${material}</h3>
        <p>${done} turmas entregues • ${partial} parciais • ${state.teams.length - done - partial} pendentes</p>
      </article>
    `;
  }).join(""));

  setHtml("materialsList", state.teams.map((item) => `
    <article class="material-team" style="--team-color:${item.color}">
      <header>
        <h3>${item.name}</h3>
        <p>${item.theme}</p>
      </header>
      <ul>
        ${state.materialTypes.map((material) => {
          const record = materialFor(item.id, material);
          const status = record?.status || "Pendente";
          const detail = [record?.date ? formatDate(record.date) : "", record?.amount || "", record?.note || ""]
            .filter(Boolean)
            .join(" • ");
          return `
            <li>
              <span>
                <strong>${material}</strong>
                ${detail ? `<small>${detail}</small>` : ""}
              </span>
              <span class="status-pill ${materialStatusClass(status)}">${status}</span>
            </li>
          `;
        }).join("")}
      </ul>
    </article>
  `).join(""));
}

function renderParticipants() {
  const root = byId("participantsOverview");
  if (!root) return;
  root.innerHTML = state.teams.map((item) => {
    const activityBlocks = REGISTRATION_EVENTS.map((activity) => {
      const names = participantLines(item.id, activity);
      return names.length ? `
        <div class="participant-activity">
          <strong>${activity}</strong>
          <ul>${names.map((name) => `<li>${escapeHtml(name)}</li>`).join("")}</ul>
        </div>
      ` : "";
    }).join("");
    return `
      <article class="participant-card" style="--team-color:${item.color}">
        <h3>${item.name}</h3>
        ${activityBlocks || `<p>Sem participantes cadastrados.</p>`}
      </article>
    `;
  }).join("");
}

function renderEvaluationSheet() {
  const form = byId("evaluationForm");
  const root = byId("evaluationSheet");
  if (!form || !root) return;
  if (document.body.classList.contains("judge-page") && form.hidden) {
    root.innerHTML = "";
    return;
  }
  const definition = judgingEventById(form.elements.event.value) || JUDGING_EVENTS[0];
  const teams = categoryTeams(form.elements.category.value);
  root.innerHTML = teams.map((item, index) => `
    <article class="evaluation-team" style="--team-color:${item.color}">
      <header>
        <span class="evaluation-team-index">Ficha ${index + 1}</span>
        <h3>${item.name}</h3>
        <p>${item.theme}</p>
      </header>
      <div class="evaluation-criteria">
        ${definition.criteria.map((criterion) => `
          <label>
            ${criterion}
            <input name="${item.id}__${criterionId(criterion)}" type="number" min="6" max="10" step="0.5" placeholder="6 a 10" required>
          </label>
        `).join("")}
      </div>
      <label>Observações<input name="${item.id}__note" type="text" placeholder="Opcional"></label>
    </article>
  `).join("");
}

function renderJudgeAccess() {
  if (!document.body.classList.contains("judge-page")) return;
  const form = byId("evaluationForm");
  const gate = byId("judgeAccess");
  const status = byId("judgeStatus");
  const blockRoot = byId("judgeBlockWorkspace");
  if (!form || !gate || !status) return;
  const code = sessionStorage.getItem("gincana-judge-code") || form.dataset.judgeCode || "";
  const judge = judgeByCode(code);
  if (!judgeIsActive(judge)) {
    form.hidden = true;
    if (blockRoot) {
      blockRoot.hidden = true;
      blockRoot.innerHTML = "";
    }
    form.dataset.judgeCode = "";
    status.innerHTML = state.judges.length
      ? "Digite o código recebido para acessar as fichas pendentes."
      : "Nenhum jurado cadastrado ainda. Cadastre os códigos no painel do administrador.";
    renderEvaluationSheet();
    return;
  }
  const assignments = judgingAssignmentsForJudge(judge);
  const blocks = pendingBlocksForJudge(judge);
  const regularPending = pendingJudgingCombos(judge)
    .filter((item) => !eventCoveredByPendingBlock(judge, item.eventId, item.category));

  form.dataset.judgeCode = normalizeJudgeCode(judge.code);
  if (!assignments.length) {
    form.hidden = true;
    status.innerHTML = `<strong>${escapeHtml(judge.name)}</strong>, nenhuma prova foi liberada para seu código ainda.`;
    renderEvaluationSheet();
    renderJudgeBlockWorkspace();
    return;
  }
  if (!blocks.length && !regularPending.length) {
    form.hidden = true;
    status.innerHTML = `<strong>${escapeHtml(judge.name)}</strong>, todas as suas avaliações foram concluídas.`;
    renderEvaluationSheet();
    renderJudgeBlockWorkspace();
    return;
  }

  form.hidden = !regularPending.length;
  const totalPending = blocks.length + regularPending.length;
  status.innerHTML = `<strong>${escapeHtml(judge.name)}</strong> • ${totalPending} pendência${totalPending > 1 ? "s" : ""}. ${blocks.length ? "Use o bloco com rascunho automático para as provas agrupadas." : ""}`;
  updateJudgeEvaluationOptions();
  renderEvaluationSheet();
  renderJudgeBlockWorkspace();
}

function updateJudgeEvaluationOptions() {
  const form = byId("evaluationForm");
  if (!form || !document.body.classList.contains("judge-page")) return;
  const judge = judgeByCode(form.dataset.judgeCode);
  const pending = pendingJudgingCombos(judge)
    .filter((item) => !eventCoveredByPendingBlock(judge, item.eventId, item.category));
  const eventSelect = form.elements.event;
  const categorySelect = form.elements.category;
  if (!eventSelect || !categorySelect) return;
  const currentEvent = eventSelect.value;
  const pendingEvents = orderedJudgingEvents().filter((event) => pending.some((item) => item.eventId === event.id));
  eventSelect.innerHTML = pendingEvents.map((item) => `<option value="${item.id}">${item.name}</option>`).join("");
  if (pendingEvents.some((item) => item.id === currentEvent)) eventSelect.value = currentEvent;
  const selectedEvent = eventSelect.value || pendingEvents[0]?.id || "";
  const categories = pending
    .filter((item) => item.eventId === selectedEvent)
    .map((item) => item.category);
  const currentCategory = categorySelect.value;
  categorySelect.innerHTML = categories.map((item) => `<option>${item}</option>`).join("");
  if (categories.includes(currentCategory)) categorySelect.value = currentCategory;
}

function playJudgeWelcome(judge) {
  const welcome = byId("judgeWelcome");
  const access = byId("judgeAccess");
  const form = byId("evaluationForm");
  if (!welcome || !access || !form || !judge) return;
  const code = normalizeJudgeCode(judge.code);
  if (judgeCompletedCount(code) > 0 || sessionStorage.getItem(welcomeStorageKey(code))) return;

  sessionStorage.setItem(welcomeStorageKey(code), "true");
  welcome.hidden = false;
  welcome.classList.remove("leaving");
  access.classList.add("soft-hidden");
  form.classList.add("soft-hidden");
  clearTimeout(welcomeAnimationTimer);
  welcomeAnimationTimer = setTimeout(() => {
    welcome.classList.add("leaving");
    setTimeout(() => {
      welcome.hidden = true;
      welcome.classList.remove("leaving");
      access.classList.remove("soft-hidden");
      form.classList.remove("soft-hidden");
    }, 520);
  }, 4700);
}

function renderEvaluationResults() {
  const root = byId("evaluationResults");
  if (!root) return;
  
  const grouped = {};
  state.evaluations.forEach((evaluation, index) => {
    const key = `${evaluation.eventId}|${evaluation.category}`;
    if (!grouped[key]) {
      grouped[key] = {
        key,
        eventId: evaluation.eventId,
        category: evaluation.category,
        definition: judgingEventById(evaluation.eventId),
        judges: [],
        evaluations: [],
        launched: true,
        scoresByTeam: {}
      };
    }
    const group = grouped[key];
    group.evaluations.push(index);
    group.judges.push(evaluation.judge || "Jurado");
    if (!evaluation.launched) group.launched = false;
    
    evaluation.scores.forEach((score) => {
      if (!group.scoresByTeam[score.teamId]) {
        group.scoresByTeam[score.teamId] = { teamId: score.teamId, total: 0, notes: [] };
      }
      group.scoresByTeam[score.teamId].total += Number(score.total || 0);
      if (score.note) group.scoresByTeam[score.teamId].notes.push(`${evaluation.judge || "Jurado"}: ${score.note}`);
    });
  });
  
  const groups = Object.values(grouped).sort((a, b) => judgingEventOrderIndex(a.eventId) - judgingEventOrderIndex(b.eventId) || a.category.localeCompare(b.category));
  const pending = groups.filter((g) => !g.launched);
  const launched = groups.filter((g) => g.launched);
  
  const renderGroup = (group) => {
    const aggregatedScores = Object.values(group.scoresByTeam);
    const rankedScores = rankEvaluationScores(aggregatedScores, group.definition);
    return `
      <article class="evaluation-result-card">
        <header>
          <span class="eyebrow">${group.category}</span>
          <h3>${group.definition?.name || group.eventId}</h3>
          <p>Consolidado de ${group.judges.length} jurado(s): ${escapeHtml(group.judges.join(", "))}</p>
        </header>
        <div class="table-wrap">
          <table>
            ${tableMarkup(
              ["Colocação", "Turma", "Pontos dos jurados (Soma)", "Pontos da gincana", "Observações"],
              rankedScores.map((score) => [
                `${score.placement}º`,
                team(score.teamId)?.name || score.teamId,
                formatPoints(score.total),
                formatPoints(score.gincanaPoints),
                escapeHtml(score.notes.join(" | "))
              ])
            )}
          </table>
        </div>
        <div class="settings-actions">
          ${!group.launched && group.definition?.eventId ? `<button class="button primary" data-publish-group="${group.key}" type="button">Lançar resultado consolidado</button>` : ""}
          ${group.evaluations.map((idx) => `<button class="button ghost" data-delete-evaluation="${idx}" type="button">Excluir ${escapeHtml(state.evaluations[idx].judge || "")}</button>`).join("")}
        </div>
      </article>
    `;
  };

  root.innerHTML = `
    <div style="margin-bottom: 24px;">
      ${pending.length ? pending.map(renderGroup).join("") : `<div class="empty-state">Nenhuma ficha pendente para lançamento.</div>`}
    </div>
    ${launched.length ? `
      <h3 style="margin-bottom: 12px; color: #93c5fd;">Histórico de Resultados Lançados</h3>
      <div style="opacity: 0.8; filter: grayscale(0.5);">
        ${launched.map(renderGroup).join("")}
      </div>
    ` : ""}
  `;
}

function renderJudgingDayControls() {
  const eventsRoot = byId("judgingDayEvents");
  if (eventsRoot) {
    eventsRoot.innerHTML = orderedJudgingEvents().map((item) => `
      <label class="choice-pill">
        <input name="eventIds" type="checkbox" value="${item.id}">
        <span>${item.name}</span>
      </label>
    `).join("");
  }
}

function renderJudgingOrderControls() {
  const root = byId("judgingOrderList");
  if (!root) return;
  const events = orderedJudgingEvents();
  root.innerHTML = events.map((item, index) => `
    <div class="judging-order-item">
      <span class="judging-order-position">${index + 1}</span>
      <span class="judging-order-name">${item.name}</span>
      <div class="judging-order-actions">
        <button class="mini-action" data-move-judging-event="${item.id}" data-direction="-1" type="button" ${index === 0 ? "disabled" : ""}>Subir</button>
        <button class="mini-action" data-move-judging-event="${item.id}" data-direction="1" type="button" ${index === events.length - 1 ? "disabled" : ""}>Descer</button>
      </div>
    </div>
  `).join("");
}


function renderJudgingBlockControls() {
  const eventsRoot = byId("judgingBlockEvents");
  if (eventsRoot) {
    eventsRoot.innerHTML = orderedJudgingEvents().map((item) => `
      <label class="choice-pill">
        <input name="eventIds" type="checkbox" value="${item.id}">
        <span>${item.name}</span>
      </label>
    `).join("");
  }

  setHtml("judgingBlocksTable", tableMarkup(
    ["Bloco", "Categoria", "Provas", "Status", ""],
    (state.judgingBlocks || []).map((block, index) => [
      escapeHtml(block.name || "Bloco de avaliação"),
      escapeHtml(block.category || ""),
      escapeHtml((block.eventIds || []).map((id) => judgingEventById(id)?.name || id).join(", ")),
      block.active === false ? "Pausado" : "Ativo",
      `<button class="mini-action" data-toggle-judging-block="${index}" type="button">${block.active === false ? "Ativar" : "Pausar"}</button> <button class="mini-action" data-delete-judging-block="${index}" type="button">Excluir</button>`
    ])
  ));

  setHtml("judgingDraftsTable", tableMarkup(
    ["Jurado", "Bloco", "Atualizado em", "Status"],
    (state.evaluationDrafts || []).map((draft) => {
      const judge = judgeByCode(draft.judgeCode);
      const block = (state.judgingBlocks || []).find((item) => item.id === draft.blockId);
      return [
        escapeHtml(judge?.name || draft.judgeCode || ""),
        escapeHtml(block?.name || draft.blockId || ""),
        draft.updatedAt ? new Date(draft.updatedAt).toLocaleString("pt-BR") : "",
        "Rascunho online"
      ];
    })
  ));
}

function renderJudgeBlockWorkspace() {
  const root = byId("judgeBlockWorkspace");
  if (!root || !document.body.classList.contains("judge-page")) return;
  const form = byId("evaluationForm");
  const code = form?.dataset.judgeCode || sessionStorage.getItem("gincana-judge-code") || "";
  const judge = judgeByCode(code);
  const blocks = pendingBlocksForJudge(judge);
  if (!blocks.length) {
    root.hidden = true;
    root.innerHTML = "";
    return;
  }

  const block = selectedJudgeBlock(judge);
  const draft = loadBlockDraft(judge.code, block.id);
  const progress = blockDraftProgress(block, draft);
  const teams = categoryTeams(block.category);
  const ready = blockReadyToSubmit(block, draft);

  root.hidden = false;
  root.innerHTML = `
    <section class="judge-block-panel" data-block-id="${escapeHtml(block.id)}">
      <header class="judge-block-header">
        <span class="eyebrow">Rascunho automático</span>
        <h2>${escapeHtml(block.name || "Bloco de avaliação")}</h2>
        <p>${escapeHtml(block.category)} • ${progress.completed}/${progress.totalItems} fichas preenchidas. Você pode sair, atualizar a página e voltar depois.</p>
        <div class="judge-block-tabs">
          ${blocks.map((item) => `
            <button class="mini-action ${item.id === block.id ? "active" : ""}" data-select-judge-block="${escapeHtml(item.id)}" type="button">${escapeHtml(item.name || "Bloco")}</button>
          `).join("")}
        </div>
      </header>

      <div class="judge-block-alert">
        Avalie por turma na ordem da apresentação. As notas ficam salvas como rascunho até o envio final.
      </div>

      <form id="judgeBlockForm" class="judge-block-form" data-block-id="${escapeHtml(block.id)}">
        ${teams.map((item, teamIndex) => `
          <article class="judge-team-block" style="--team-color:${item.color}">
            <header>
              <span class="evaluation-team-index">Turma ${teamIndex + 1}</span>
              <h3>${item.name}</h3>
              <p>${item.theme}</p>
            </header>

            <div class="judge-event-stack">
              ${(block.eventIds || []).map((eventId) => {
                const definition = judgingEventById(eventId);
                const record = draft?.[item.id]?.[eventId] || {};
                if (!definition) return "";
                return `
                  <section class="judge-event-card">
                    <h4>${escapeHtml(definition.name)}</h4>
                    <div class="evaluation-criteria">
                      ${definition.criteria.map((criterion) => {
                        const id = criterionId(criterion);
                        const value = record[id] ?? "";
                        return `
                          <label>
                            ${escapeHtml(criterion)}
                            <input name="${item.id}__${eventId}__${id}" data-team-id="${item.id}" data-event-id="${eventId}" data-criterion-id="${id}" type="number" min="6" max="10" step="0.5" placeholder="6 a 10" value="${escapeHtml(value)}">
                          </label>
                        `;
                      }).join("")}
                    </div>
                    <label>Observações
                      <input name="${item.id}__${eventId}__note" data-team-id="${item.id}" data-event-id="${eventId}" data-criterion-id="note" type="text" placeholder="Opcional" value="${escapeHtml(record.note || "")}">
                    </label>
                  </section>
                `;
              }).join("")}
            </div>
          </article>
        `).join("")}

        <section class="judge-block-summary">
          <h3>Resumo antes do envio</h3>
          <div class="judge-block-summary-grid">
            ${teams.map((item) => `
              <article>
                <strong>${item.name}</strong>
                ${(block.eventIds || []).map((eventId) => {
                  const definition = judgingEventById(eventId);
                  const record = draft?.[item.id]?.[eventId] || {};
                  const total = definition ? definition.criteria.reduce((sum, criterion) => sum + Number(record[criterionId(criterion)] || 0), 0) : 0;
                  return `<span>${escapeHtml(definition?.name || eventId)}: ${formatPoints(total)}</span>`;
                }).join("")}
              </article>
            `).join("")}
          </div>
        </section>

        <div class="judge-block-footer">
          <span id="judgeBlockDraftStatus">Lembrete: ao enviar este bloco, volte à parte de cima para acessar a outra categoria.</span>
          <button class="button primary" type="submit" ${ready ? "" : "disabled"}>Enviar bloco finalizado</button>
        </div>
      </form>
    </section>
  `;
}


function leadershipCodeMap() {
  return state.leadershipCodes && typeof state.leadershipCodes === "object"
    ? state.leadershipCodes
    : DEFAULT_LEADERSHIP_CODES;
}

function leadershipTeamIdFromCode(code = "") {
  return leadershipCodeMap()[normalizeJudgeCode(code)] || "";
}


function leadershipLeaderName(teamId = "") {
  const names = {
    "6": "Heloísa",
    "7": "Letícia",
    "8": "Isabelly",
    "9": "Carolina",
    "1": "Jamilly",
    "2": "Maria Clara"
  };
  return names[teamId] || "líder";
}

function playLeadershipWelcome(teamId = "") {
  const welcome = byId("leadershipWelcome");
  const title = byId("leadershipWelcomeTitle");
  const text = byId("leadershipWelcomeText");
  if (!welcome) return;

  const name = leadershipLeaderName(teamId);
  const itemTeam = team(teamId);
  if (title) title.textContent = `Bem-vinda, ${name}!`;
  if (text) {
    text.textContent = `${itemTeam?.name || "Sua turma"} já está liberada. Acompanhe tudo com atenção e mantenha sua equipe bem informada.`;
  }

  welcome.hidden = false;
  welcome.classList.remove("leaving");
  clearTimeout(welcomeAnimationTimer);
  welcomeAnimationTimer = setTimeout(() => {
    welcome.classList.add("leaving");
    setTimeout(() => {
      welcome.hidden = true;
      welcome.classList.remove("leaving");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 360);
  }, 2500);
}


function activeLeadershipMobileSection() {
  return sessionStorage.getItem("gincana-leadership-mobile-section") || "resumo";
}

function restoreLeadershipMobileSection() {
  if (!document.body.classList.contains("leadership-page")) return;
  const target = activeLeadershipMobileSection();

  document.querySelectorAll("[data-leadership-mobile-section]").forEach((section) => {
    section.classList.toggle("mobile-section-active", section.dataset.leadershipMobileSection === target);
  });

  document.querySelectorAll("[data-leadership-mobile-tab]").forEach((button) => {
    button.classList.toggle("active", button.dataset.leadershipMobileTab === target);
  });
}

function leadershipDraftKey(type = "", teamId = "") {
  return `gincana-leadership-draft-${type}-${teamId || leadershipSelectedTeamId()}`;
}

function readLeadershipDraft(type = "", teamId = "") {
  try {
    return JSON.parse(localStorage.getItem(leadershipDraftKey(type, teamId)) || "{}");
  } catch {
    return {};
  }
}

function clearLeadershipDraft(type = "", teamId = "") {
  localStorage.removeItem(leadershipDraftKey(type, teamId));
}

function collectLeadershipRegistrationDraft(form) {
  const data = Object.fromEntries(new FormData(form));
  const participants = {};
  REGISTRATION_EVENTS.forEach((eventName) => {
    participants[eventName] = namesFromFormData(data, "participants", eventName);
  });
  return {
    teamId: data.teamId || leadershipSelectedTeamId(),
    leader: (data.leader || "").trim(),
    viceLeader: (data.viceLeader || "").trim(),
    padrinho: (data.padrinho || "").trim(),
    participants,
    updatedAt: new Date().toISOString()
  };
}

function collectLeadershipStrategyDraft(form) {
  const data = Object.fromEntries(new FormData(form));
  const rows = {};
  OFFICIAL_FORM_EVENTS.forEach((eventName) => {
    rows[eventName] = {
      responsavel: (data[`responsavel__${eventName}`] || "").trim(),
      custo: (data[`custo__${eventName}`] || "").trim(),
      descricao: (data[`descricao__${eventName}`] || "").trim()
    };
  });

  return {
    teamId: data.teamId || leadershipSelectedTeamId(),
    rows,
    totalProvas: (data.totalProvas || "").trim(),
    totalCamisa: (data.totalCamisa || "").trim(),
    cotaAluno: (data.cotaAluno || "").trim(),
    updatedAt: new Date().toISOString()
  };
}

function saveLeadershipDraftFromForm(form) {
  if (!form) return;
  if (form.id === "leaderRegistrationForm") {
    const draft = collectLeadershipRegistrationDraft(form);
    localStorage.setItem(leadershipDraftKey("registration", draft.teamId), JSON.stringify(draft));
    setSyncStatus("Rascunho da ficha salvo neste aparelho.");
  }
  if (form.id === "leaderStrategyReportForm") {
    const draft = collectLeadershipStrategyDraft(form);
    localStorage.setItem(leadershipDraftKey("strategy", draft.teamId), JSON.stringify(draft));
    setSyncStatus("Rascunho do relatório salvo neste aparelho.");
  }
}

function scrollLeadershipActiveSection(target = activeLeadershipMobileSection()) {
  if (!document.body.classList.contains("leadership-page")) return;
  const section = document.querySelector(`[data-leadership-mobile-section="${target}"]`);
  const privateArea = byId("leadershipPrivateArea");
  const anchor = section || privateArea;
  if (!anchor) return;
  requestAnimationFrame(() => {
    const offset = 18;
    const top = anchor.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  });
}

function activeLeadershipTeamId() {
  return sessionStorage.getItem("gincana-leadership-team-id") || "";
}

function leadershipSelectedTeamId() {
  return activeLeadershipTeamId() || byId("leadershipTeamSelect")?.value || state.teams[0]?.id || "";
}

function leadershipTeamSummary(teamId = "") {
  const itemTeam = team(teamId);
  const scorePoints = state.scores
    .filter((score) => score.teamId === teamId)
    .reduce((sum, score) => sum + Number(score.points || 0), 0);
  const penalties = state.discipline
    .filter((entry) => entry.teamId === teamId && entry.type === "Penalidade")
    .reduce((sum, entry) => sum + Math.abs(Number(entry.points || 0)), 0);
  const warnings = state.discipline
    .filter((entry) => entry.teamId === teamId && entry.type === "Advertência").length;
  const bonuses = state.bonuses
    .filter((entry) => entry.teamId === teamId)
    .reduce((sum, entry) => sum + Math.abs(Number(entry.points || 0)), 0);
  const foodTokens = state.foodDonations
    .filter((entry) => entry.teamId === teamId)
    .reduce((sum, entry) => sum + Number(entry.quantity || 0) * Number(foodById(entry.foodId)?.tokens || 0), 0);
  const total = scorePoints + bonuses - penalties;
  return { team: itemTeam, scorePoints, penalties, warnings, bonuses, foodTokens, total };
}

function renderLeadershipPanel() {
  const root = byId("leadershipDashboard");
  const teamSelect = byId("leadershipTeamSelect");
  const privateArea = byId("leadershipPrivateArea");
  const loginBox = byId("leadershipLoginBox");
  if (!root || !teamSelect) return;

  if (!teamSelect.dataset.loaded) {
    teamSelect.innerHTML = state.teams.map((item) => `<option value="${item.id}">${item.name}</option>`).join("");
    teamSelect.dataset.loaded = "true";
  }

  if (document.body.classList.contains("leadership-page")) {
    const allowedTeamId = activeLeadershipTeamId();
    if (!allowedTeamId) {
      root.innerHTML = "";
      if (privateArea) privateArea.hidden = true;
      if (loginBox) loginBox.hidden = false;
      return;
    }
    teamSelect.value = allowedTeamId;
    if (privateArea) privateArea.hidden = false;
    if (loginBox) loginBox.hidden = true;
  }

  const teamId = leadershipSelectedTeamId();
  const summary = leadershipTeamSummary(teamId);
  const currentTeam = summary.team || state.teams[0];

  const donations = state.foodDonations.filter((entry) => entry.teamId === teamId);
  const donationByFood = state.foodTypes.map((food) => {
    const quantity = donations
      .filter((entry) => entry.foodId === food.id)
      .reduce((sum, entry) => sum + Number(entry.quantity || 0), 0);
    return { ...food, quantity, tokensTotal: quantity * Number(food.tokens || 0) };
  }).filter((item) => item.quantity > 0);

  const materials = state.materialTypes.map((material) => {
    const entry = state.materials.find((item) => item.teamId === teamId && item.material === material);
    return entry || {
      teamId,
      material,
      status: "Pendente",
      date: "",
      amount: "",
      note: ""
    };
  });
  const discipline = state.discipline
    .map((entry, index) => ({ entry, index }))
    .filter(({ entry }) => entry.teamId === teamId);
  const claims = (state.leadershipClaims || []).filter((claim) => claim.teamId === teamId);
  const bonuses = state.bonuses.filter((entry) => entry.teamId === teamId);
  const scores = state.scores.filter((entry) => entry.teamId === teamId);

  root.innerHTML = `
    <section class="leadership-team-hero" style="--team-color:${currentTeam?.color || "#3b82f6"}">
      <span class="eyebrow">Painel da liderança</span>
      <h2>${currentTeam?.name || "Turma"}</h2>
      <p>${currentTeam?.theme || ""}</p>
    </section>

    <section class="leadership-metrics leadership-mobile-tab-panel mobile-section-active" data-leadership-mobile-section="resumo">
      <article><span>Total geral</span><strong>${formatPoints(summary.total)}</strong></article>
      <article><span>Arrecadação</span><strong>${formatPoints(summary.foodTokens)}</strong><small>tokens</small></article>
      <article><span>Penalidades</span><strong>-${formatPoints(summary.penalties)}</strong></article>
      <article><span>Advertências</span><strong>${summary.warnings}</strong></article>
      <article><span>Bônus</span><strong>+${formatPoints(summary.bonuses)}</strong></article>
    </section>

    <section class="leadership-grid leadership-mobile-tab-panel" data-leadership-mobile-section="materiais">
      <article class="leadership-card">
        <h3>Arrecadação de alimentos</h3>
        ${donationByFood.length ? `
          <div class="leadership-list">
            ${donationByFood.map((item) => `
              <div>
                <strong>${escapeHtml(item.name)}</strong>
                <span>${formatPoints(item.quantity)} unidade(s) • ${formatPoints(item.tokensTotal)} tokens</span>
              </div>
            `).join("")}
          </div>
        ` : `<p class="muted-text">Nenhuma arrecadação registrada para esta turma.</p>`}
      </article>

      <article class="leadership-card">
        <h3>Pontuações lançadas</h3>
        ${scores.length ? `
          <div class="leadership-list">
            ${scores.map((item) => `
              <div>
                <strong>${escapeHtml(eventById(item.eventId)?.name || item.eventId)}</strong>
                <span>${formatPoints(item.points)} ponto(s)${item.note ? ` • ${escapeHtml(item.note)}` : ""}</span>
              </div>
            `).join("")}
          </div>
        ` : `<p class="muted-text">Nenhuma pontuação lançada ainda.</p>`}
      </article>

      <article class="leadership-card">
        <h3>Entregas e materiais</h3>
        ${materials.length ? `
          <div class="leadership-list">
            ${materials.map((item) => `
              <div class="${item.status === "Pendente" ? "leadership-pending-item" : ""}">
                <strong>${escapeHtml(item.material)}</strong>
                <span>${escapeHtml(item.status)}${item.date ? ` • ${formatDate(item.date)}` : ""}${item.note ? ` • ${escapeHtml(item.note)}` : ""}</span>
              </div>
            `).join("")}
          </div>
        ` : `<p class="muted-text">Nenhum material cadastrado.</p>`}
      </article>

      <article class="leadership-card">
        <h3>Bônus</h3>
        ${bonuses.length ? `
          <div class="leadership-list">
            ${bonuses.map((item) => `
              <div>
                <strong>+${formatPoints(Math.abs(item.points || 0))} ponto(s)</strong>
                <span>${formatDate(item.date)} • ${escapeHtml(item.reason || "")}</span>
              </div>
            `).join("")}
          </div>
        ` : `<p class="muted-text">Nenhum bônus registrado.</p>`}
      </article>
    </section>

    <section class="leadership-card leadership-wide-card leadership-mobile-tab-panel" data-leadership-mobile-section="ocorrencias">
      <h3>Advertências, penalidades e ocorrências</h3>
      ${discipline.length ? `
        <div class="leadership-occurrences">
          ${discipline.map(({ entry, index }) => {
            const relatedClaims = claims.filter((claim) => Number(claim.disciplineIndex) === index);
            return `
              <article class="leadership-occurrence ${entry.type === "Penalidade" ? "penalty" : "warning"}">
                <div>
                  <strong>${escapeHtml(entry.levelLabel ? `${entry.type} ${entry.levelLabel}` : entry.type)}</strong>
                  <span>${formatDate(entry.date)} • ${entry.type === "Penalidade" ? `-${formatPoints(Math.abs(entry.points || 0))} ponto(s)` : "sem desconto"} • ${escapeHtml(entry.reason || "")}</span>
                  ${relatedClaims.length ? `
                    <div class="claim-status-list">
                      ${relatedClaims.map((claim) => `
                        <small>
                          Contestação: <strong>${escapeHtml(claim.status || "Pendente")}</strong>
                          ${claim.response ? ` • Resposta: ${escapeHtml(claim.response)}` : ""}
                        </small>
                      `).join("")}
                    </div>
                  ` : ""}
                </div>
                ${entry.type === "Penalidade" ? `<button class="mini-action" data-open-leadership-claim="${index}" type="button">Contestar</button>` : ""}
              </article>
            `;
          }).join("")}
        </div>
      ` : `<p class="muted-text">Nenhuma ocorrência registrada para esta turma.</p>`}
    </section>

    <section class="leadership-card leadership-wide-card leadership-mobile-tab-panel" data-leadership-mobile-section="ocorrencias">
      <h3>Contestações enviadas</h3>
      ${claims.length ? `
        <div class="leadership-list">
          ${claims.map((claim) => `
            <div>
              <strong>${escapeHtml(claim.status || "Pendente")}</strong>
              <span>${claim.createdAt ? new Date(claim.createdAt).toLocaleString("pt-BR") : ""} • ${escapeHtml(claim.reason || "")}${claim.response ? ` • Resposta: ${escapeHtml(claim.response)}` : ""}</span>
            </div>
          `).join("")}
        </div>
      ` : `<p class="muted-text">Nenhuma contestação enviada por esta liderança.</p>`}
    </section>

    <section class="leadership-card leadership-wide-card leadership-mobile-tab-panel" data-leadership-mobile-section="ocorrencias">
      <h3>Reclamações e pedidos</h3>
      <p class="muted-text">Envie uma solicitação para a comissão organizadora. A comissão pode marcar como visto e responder com observações.</p>
      <form id="leadershipRequestForm" class="form-grid leadership-request-form">
        <input name="teamId" type="hidden" value="${escapeHtml(teamId)}">
        <label>Tipo
          <select name="type" required>
            <option>Reclamação</option>
            <option>Pedido</option>
            <option>Dúvida</option>
          </select>
        </label>
        <label class="wide">Mensagem
          <textarea name="message" required placeholder="Escreva sua reclamação, pedido ou dúvida"></textarea>
        </label>
        <button class="button primary" type="submit">Enviar para comissão</button>
      </form>
      ${(state.leadershipRequests || []).filter((item) => item.teamId === teamId).length ? `
        <div class="leadership-list">
          ${(state.leadershipRequests || []).filter((item) => item.teamId === teamId).map((item) => `
            <div>
              <strong>${escapeHtml(item.type || "Solicitação")} • ${escapeHtml(item.status || "Pendente")}</strong>
              <span>${item.createdAt ? new Date(item.createdAt).toLocaleString("pt-BR") : ""} • ${escapeHtml(item.message || "")}${item.response ? ` • Resposta: ${escapeHtml(item.response)}` : ""}</span>
            </div>
          `).join("")}
        </div>
      ` : `<p class="muted-text">Nenhuma reclamação ou pedido enviado ainda.</p>`}
    </section>

    <section class="leadership-card leadership-wide-card leadership-mobile-tab-panel" data-leadership-mobile-section="ensaios">
      <h3>Solicitar marcação de ensaio</h3>
      <p class="muted-text">A solicitação deve ser feita até 19h do dia anterior. Pedidos de Dança dos Professores serão avaliados apenas pelo admin.</p>
      <form id="leaderScheduleRequestForm" class="form-grid leadership-request-form">
        <input name="teamId" type="hidden" value="${escapeHtml(teamId)}">
        <label>Data<input name="date" type="date" required></label>
        <label>Início<input name="time" type="time" required></label>
        <label>Fim<input name="endTime" type="time"></label>
        <label>Local<input name="place" type="text" value="ENSPS"></label>
        <label>Atividade
          <select name="activity" required>
            ${scheduleRequestActivities().map((activity) => `<option>${escapeHtml(activity)}</option>`).join("")}
          </select>
        </label>
        <label class="wide">Observação<input name="note" type="text" placeholder="Ex.: local, necessidade específica, justificativa"></label>
        <button class="button primary" type="submit">Enviar solicitação</button>
      </form>
      <h3>Solicitações de ensaio</h3>
      ${(state.scheduleRequests || []).filter((item) => item.teamId === teamId).length ? `
        <div class="leadership-list">
          ${(state.scheduleRequests || []).filter((item) => item.teamId === teamId).map((item) => `
            <div>
              <strong>${escapeHtml(item.activity)} • ${scheduleRequestStatusLabel(item)}</strong>
              <span>${formatDate(item.date)} • ${item.time || ""}${item.endTime ? ` - ${item.endTime}` : ""} • ${escapeHtml(item.place || "ENSPS")}${item.response ? ` • ${escapeHtml(item.response)}` : ""}</span>
              ${item.status !== "approved" ? `<button class="mini-action" data-delete-own-schedule-request="${escapeHtml(item.id)}" type="button">Excluir solicitação</button>` : ""}
            </div>
          `).join("")}
        </div>
      ` : `<p class="muted-text">Nenhuma solicitação de ensaio enviada ainda.</p>`}
    </section>

    ${leadershipRegistrationFormHtml(teamId)}
    ${leadershipStrategyReportHtml(teamId)}
  `;
}

function openLeadershipClaim(index) {
  const form = byId("leadershipClaimForm");
  if (!form) return;
  const entry = state.discipline[Number(index)];
  if (!entry) return;
  form.elements.teamId.value = entry.teamId;
  form.elements.disciplineIndex.value = String(index);
  form.elements.reason.value = "";
  const target = byId("leadershipClaimBox");
  if (target) target.hidden = false;
  setSyncStatus(`Contestação aberta para ${team(entry.teamId)?.name || "turma"}.`);
  target?.scrollIntoView({ behavior: "smooth", block: "center" });
}

function renderLeadershipClaimsAdmin() {
  const badge = byId("leadershipClaimsBadge");
  if (badge) {
    const pendingCount = (state.leadershipClaims || []).filter((claim) => (claim.status || "Pendente") === "Pendente").length;
    badge.textContent = pendingCount > 9 ? "9+" : String(pendingCount);
    badge.hidden = pendingCount === 0;
  }

  setHtml("leadershipClaimsTable", tableMarkup(
    ["Turma", "Ocorrência", "Contestação", "Status", "Resposta", ""],
    (state.leadershipClaims || []).map((claim, index) => {
      const disciplineEntry = state.discipline[Number(claim.disciplineIndex)];
      return [
        escapeHtml(team(claim.teamId)?.name || claim.teamId || ""),
        escapeHtml(disciplineEntry ? `${disciplineEntry.type}: ${disciplineEntry.reason || ""}` : "Ocorrência não encontrada"),
        escapeHtml(claim.reason || ""),
        escapeHtml(claim.status || "Pendente"),
        escapeHtml(claim.response || ""),
        `<button class="mini-action" data-answer-leadership-claim="${index}" type="button">Responder</button> <button class="mini-action" data-close-leadership-claim="${index}" type="button">Marcar resolvida</button> <button class="mini-action" data-delete-leadership-claim="${index}" type="button">Excluir</button>`
      ];
    })
  ));
}


function renderLeadershipCodesAdmin() {
  const rows = Object.entries(leadershipCodeMap()).map(([code, teamId], index) => [
    escapeHtml(team(teamId)?.name || teamId),
    `<input class="table-inline-input" data-leadership-code-index="${index}" value="${escapeHtml(code)}" aria-label="Código da liderança ${escapeHtml(team(teamId)?.name || teamId)}">`,
    `<button class="mini-action" data-save-leadership-code="${index}" type="button">Salvar código</button>`
  ]);
  setHtml("leadershipCodesTable", tableMarkup(["Turma", "Código", ""], rows));
}


function teacherNameFromCode(code = "", teamId = "") {
  const normalized = normalizeJudgeCode(code);
  const explicit = {
    PROF6A: "Prof. Eduardo",
    PROF7T: "Prof. Thayna",
    PROF7M: "Prof. Michael",
    PROF8E: "Prof. Elayne",
    PROF9A: "Prof. Alexandre",
    PROF1A: "Prof. Amanda",
    PROF1D: "Prof. Diogo",
    PROF2R: "Prof. Rafaely"
  };
  return explicit[normalized] || teacherDisplayName(teamId);
}

function renderTeacherCodesAdmin() {
  const rows = Object.entries(teacherCodeMap()).map(([code, teamId], index) => [
    escapeHtml(team(teamId)?.name || teamId),
    escapeHtml(teacherNameFromCode(code, teamId)),
    `<input class="table-inline-input" data-teacher-code-index="${index}" value="${escapeHtml(code)}" aria-label="Código do professor ${escapeHtml(teacherNameFromCode(code, teamId))}">`,
    `<button class="mini-action" data-save-teacher-code="${index}" type="button">Salvar código</button>`
  ]);
  setHtml("teacherCodesTable", tableMarkup(["Turma", "Professor", "Código", ""], rows));
}

function renderTeacherRequestsAdmin() {
  const teacherRequests = (state.scheduleRequests || []).filter((item) => item.requestedBy === "teacher");
  setHtml("teacherRequestsTable", tableMarkup(
    ["Turma", "Data", "Horário", "Status", "Observação"],
    teacherRequests.map((item) => [
      escapeHtml(team(item.teamId)?.name || item.teamId || ""),
      formatDate(item.date),
      `${item.time || ""}${item.endTime ? ` - ${item.endTime}` : ""}`,
      scheduleRequestStatusLabel(item),
      escapeHtml(item.note || item.response || "")
    ])
  ));
}


function renderLeadershipRequestsAdmin() {
  const badge = byId("leadershipRequestsBadge");
  if (badge) {
    const pendingCount = (state.leadershipRequests || []).filter((item) => (item.status || "Pendente") === "Pendente").length;
    badge.textContent = pendingCount > 9 ? "9+" : String(pendingCount);
    badge.hidden = pendingCount === 0;
  }

  setHtml("leadershipRequestsTable", tableMarkup(
    ["Turma", "Tipo", "Mensagem", "Status", "Resposta/Observação", ""],
    (state.leadershipRequests || []).map((item, index) => [
      escapeHtml(team(item.teamId)?.name || item.teamId || ""),
      escapeHtml(item.type || "Solicitação"),
      escapeHtml(item.message || ""),
      escapeHtml(item.status || "Pendente"),
      escapeHtml(item.response || ""),
      `<button class="mini-action" data-view-leadership-request="${index}" type="button">Marcar visto</button> <button class="mini-action" data-answer-leadership-request="${index}" type="button">Responder</button> <button class="mini-action" data-delete-leadership-request="${index}" type="button">Excluir</button>`
    ])
  ));
}


function scheduleRequestActivities() {
  return SCHEDULE_ACTIVITIES;
}

function scheduleRequestDeadline(dateValue = "") {
  if (!dateValue) return null;
  const [year, month, day] = dateValue.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day - 1, 19, 0, 0, 0);
}

function canLeaderRequestSchedule(dateValue = "") {
  const deadline = scheduleRequestDeadline(dateValue);
  return deadline ? new Date() <= deadline : false;
}

function scheduleRequestStatusLabel(item) {
  if (item.status === "approved") return `Aprovado por ${item.approvedBy === "admin" ? "Prof. Cílio" : "Vitória"}`;
  if (item.status === "rejected") return "Recusado";
  return "Aguardando aprovação";
}

function renderScheduleRequestsTable(targetId = "scheduleRequestsTable", mode = "admin") {
  const isVictoria = mode === "victoria";
  const visibleRequests = (state.scheduleRequests || [])
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => {
      const activity = String(item.activity || "").trim().toLowerCase();
      const isApproved = item.status === "approved";
      return !isApproved && (!isVictoria || activity !== "dança dos professores");
    });

  const rows = visibleRequests.map(({ item, index }) => {
    const actions = item.status === "pending" ? `
      <button class="mini-action" data-approve-schedule-request="${index}" data-approver="${isVictoria ? "victoria" : "admin"}" type="button">Aprovar</button>
      <button class="mini-action" data-reject-schedule-request="${index}" type="button">Recusar</button>
    ` : `<small class="muted-text">${scheduleRequestStatusLabel(item)}</small>`;

    return [
      escapeHtml(team(item.teamId)?.name || item.teamId || ""),
      formatDate(item.date),
      `${item.time || ""}${item.endTime ? ` - ${item.endTime}` : ""}`,
      escapeHtml(item.activity || ""),
      escapeHtml(item.place || "ENSPS"),
      scheduleRequestStatusLabel(item),
      escapeHtml(item.note || item.response || ""),
      actions
    ];
  });

  setHtml(targetId, tableMarkup(
    ["Turma", "Data", "Horário", "Atividade", "Local", "Status", "Observação", ""],
    rows
  ));
}

function renderScheduleRequestsCards(targetId = "scheduleRequestsCards", mode = "admin") {
  const root = byId(targetId);
  if (!root) return;

  const isVictoria = mode === "victoria";
  const visibleRequests = (state.scheduleRequests || [])
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => {
      const activity = String(item.activity || "").trim().toLowerCase();
      const isApproved = item.status === "approved";
      return !isApproved && (!isVictoria || activity !== "dança dos professores");
    });

  if (!visibleRequests.length) {
    root.innerHTML = `<div class="empty-state">Nenhuma solicitação pendente ou recusada disponível.</div>`;
    return;
  }

  root.innerHTML = visibleRequests.map(({ item, index }) => {
    const itemTeam = team(item.teamId);
    const actions = item.status === "pending" ? `
      <div class="schedule-request-actions">
        <button class="mini-action" data-approve-schedule-request="${index}" data-approver="${isVictoria ? "victoria" : "admin"}" type="button">Aprovar</button>
        <button class="mini-action" data-reject-schedule-request="${index}" type="button">Recusar</button>
      </div>
    ` : `<small class="muted-text">${scheduleRequestStatusLabel(item)}</small>`;

    return `
      <article class="schedule-request-card" style="--team-color:${itemTeam?.color || "#3b82f6"}">
        <header>
          <strong>${escapeHtml(itemTeam?.name || item.teamId || "")}</strong>
          <span>${scheduleRequestStatusLabel(item)}</span>
        </header>
        <div class="schedule-request-info">
          <p><b>Data:</b> ${formatDate(item.date)}</p>
          <p><b>Horário:</b> ${item.time || ""}${item.endTime ? ` - ${item.endTime}` : ""}</p>
          <p><b>Atividade:</b> ${escapeHtml(item.activity || "")}</p>
          <p><b>Local:</b> ${escapeHtml(item.place || "ENSPS")}</p>
          ${item.note ? `<p><b>Observação:</b> ${escapeHtml(item.note)}</p>` : ""}
          ${item.response ? `<p><b>Resposta:</b> ${escapeHtml(item.response)}</p>` : ""}
        </div>
        ${actions}
      </article>
    `;
  }).join("");
}


function renderScheduleRequests() {
  const isRehearsalsPage = document.body.classList.contains("rehearsals-page");
  const mode = isRehearsalsPage ? "victoria" : "admin";

  renderScheduleRequestsTable("scheduleRequestsTable", mode);
  renderScheduleRequestsCards("scheduleRequestsCards", mode);

  const badge = byId("scheduleRequestsBadge");
  if (badge) {
    const pending = (state.scheduleRequests || []).filter((item) => {
      const activity = String(item.activity || "").trim().toLowerCase();
      return item.status === "pending" && (!isRehearsalsPage || activity !== "dança dos professores");
    }).length;
    badge.textContent = pending > 9 ? "9+" : String(pending);
    badge.hidden = pending === 0;
  }
}

function approveScheduleRequest(index, approver = "admin") {
  const request = state.scheduleRequests?.[Number(index)];
  if (!request || request.status !== "pending") return;
  request.status = "approved";
  request.approvedBy = approver === "victoria" ? "victoria" : "admin";
  request.updatedAt = new Date().toISOString();
  state.schedules.push({
    teamId: request.teamId,
    date: request.date,
    time: request.time,
    endTime: request.endTime,
    place: request.place || "ENSPS",
    activity: request.activity,
    createdBy: request.requestedBy === "teacher" ? "teacher" : "leader",
    acceptedBy: request.approvedBy,
    requestId: request.id
  });
  saveState();
}

function rejectScheduleRequest(index) {
  const request = state.scheduleRequests?.[Number(index)];
  if (!request) return;
  const note = prompt("Motivo da recusa/observação:", request.response || "");
  if (note === null) return;
  request.status = "rejected";
  request.response = note.trim();
  request.updatedAt = new Date().toISOString();
  saveState();
}


function registrationFormRecord(teamId = "") {
  return (state.registrationForms || []).find((item) => item.teamId === teamId);
}

function strategyReportRecord(teamId = "") {
  return (state.strategyReports || []).find((item) => item.teamId === teamId);
}

function namesFromFormData(data, prefix, eventName) {
  return normalizeParticipantNames(data[`${prefix}__${eventName}`] || "");
}

function upsertRegistrationForm(payload) {
  if (!payload?.teamId) return;
  const existing = registrationFormRecord(payload.teamId) || {};
  const mergedPayload = {
    ...existing,
    ...payload,
    participants: {
      ...(existing.participants || {}),
      ...(payload.participants || {})
    }
  };

  state.registrationForms = (state.registrationForms || []).filter((item) => item.teamId !== mergedPayload.teamId);
  state.registrationForms.push(mergedPayload);

  REGISTRATION_EVENTS.forEach((eventName) => {
    const names = normalizeParticipantNames(mergedPayload.participants?.[eventName] || "");
    state.participants = state.participants.filter((item) => item.teamId !== mergedPayload.teamId || item.activity !== eventName);
    if (names) {
      state.participants.push({
        teamId: mergedPayload.teamId,
        activity: eventName,
        names
      });
    }
  });
}

function upsertStrategyReport(payload) {
  state.strategyReports = (state.strategyReports || []).filter((item) => item.teamId !== payload.teamId);
  state.strategyReports.push(payload);
}

function leadershipRegistrationFormHtml(teamId = "") {
  const currentTeam = team(teamId) || {};
  const record = registrationFormRecord(teamId) || {};
  const draft = readLeadershipDraft("registration", teamId);
  const participants = { ...(record.participants || {}), ...(draft.participants || {}) };
  const leaderValue = draft.leader ?? record.leader ?? leadershipLeaderName(teamId);
  const viceLeaderValue = draft.viceLeader ?? record.viceLeader ?? "";
  const padrinhoValue = draft.padrinho ?? record.padrinho ?? currentTeam.mentor ?? "";
  return `
    <section class="leadership-card leadership-wide-card leadership-mobile-tab-panel" data-leadership-mobile-section="fichas">
      <h3>Ficha oficial de inscrição</h3>
      <p class="muted-text">Preencha os participantes por prova. Ao salvar, os nomes já aparecem também em Participantes no painel de ensaios. O rascunho é salvo automaticamente neste aparelho.</p>
      <form id="leaderRegistrationForm" class="leadership-official-form">
        <input name="teamId" type="hidden" value="${escapeHtml(teamId)}">
        <div class="leadership-form-mini-grid">
          <label>Líder<input name="leader" type="text" value="${escapeHtml(leaderValue)}"></label>
          <label>Vice-líder<input name="viceLeader" type="text" value="${escapeHtml(viceLeaderValue)}"></label>
          <label>Professor padrinho<input name="padrinho" type="text" value="${escapeHtml(padrinhoValue)}"></label>
        </div>
        <div class="official-form-events">
          ${REGISTRATION_EVENTS.map((eventName) => `
            <label>
              <span>${escapeHtml(eventName)}</span>
              <textarea name="participants__${escapeHtml(eventName)}" placeholder="Digite um participante por linha">${escapeHtml(participants[eventName] || "")}</textarea>
            </label>
          `).join("")}
        </div>
        <button class="button primary" type="submit">Salvar ficha de inscrição</button>
      </form>
    </section>
  `;
}

function leadershipStrategyReportHtml(teamId = "") {
  const record = strategyReportRecord(teamId) || {};
  const draft = readLeadershipDraft("strategy", teamId);
  const rows = { ...(record.rows || {}), ...(draft.rows || {}) };
  const totalProvasValue = draft.totalProvas ?? record.totalProvas ?? "";
  const totalCamisaValue = draft.totalCamisa ?? record.totalCamisa ?? "";
  const cotaAlunoValue = draft.cotaAluno ?? record.cotaAluno ?? "";
  return `
    <section class="leadership-card leadership-wide-card leadership-mobile-tab-panel" data-leadership-mobile-section="relatorio">
      <h3>Relatório de estratégia de trabalho</h3>
      <p class="muted-text">Informe responsáveis, custos e descrição de cada prova. A comissão acompanha tudo no admin. O rascunho é salvo automaticamente neste aparelho.</p>
      <form id="leaderStrategyReportForm" class="leadership-official-form strategy-report-form">
        <input name="teamId" type="hidden" value="${escapeHtml(teamId)}">
        <div class="strategy-report-list">
          ${OFFICIAL_FORM_EVENTS.map((eventName) => {
            const row = rows[eventName] || {};
            return `
              <fieldset>
                <legend>${escapeHtml(eventName)}</legend>
                <label>Responsável<input name="responsavel__${escapeHtml(eventName)}" type="text" value="${escapeHtml(row.responsavel || "")}"></label>
                <label>Custo (R$)<input name="custo__${escapeHtml(eventName)}" type="number" min="0" step="0.01" value="${escapeHtml(row.custo || "")}"></label>
                <label class="wide">Descrição do custo<input name="descricao__${escapeHtml(eventName)}" type="text" value="${escapeHtml(row.descricao || "")}"></label>
              </fieldset>
            `;
          }).join("")}
        </div>
        <div class="leadership-form-mini-grid">
          <label>Total provas (R$)<input name="totalProvas" type="number" min="0" step="0.01" value="${escapeHtml(totalProvasValue)}"></label>
          <label>Total camisa (R$)<input name="totalCamisa" type="number" min="0" step="0.01" value="${escapeHtml(totalCamisaValue)}"></label>
          <label>Cota por aluno (R$)<input name="cotaAluno" type="number" min="0" step="0.01" value="${escapeHtml(cotaAlunoValue)}"></label>
        </div>
        <button class="button primary" type="submit">Salvar relatório de estratégia</button>
      </form>
    </section>
  `;
}

function renderLeadershipFormsAdmin() {
  const root = byId("leadershipFormsAdmin");
  if (!root) return;

  root.innerHTML = state.teams.map((item) => {
    const reg = registrationFormRecord(item.id) || {};
    const rep = strategyReportRecord(item.id) || {};
    const participants = reg.participants || {};
    const rows = rep.rows || {};

    const participantHtml = REGISTRATION_EVENTS.map((eventName) => {
      const names = (participants[eventName] || "").split(/\r?\n/).filter(Boolean);
      return `
        <div class="admin-form-entry">
          <strong>${escapeHtml(eventName)}</strong>
          ${names.length ? `<ul>${names.map((name) => `<li>${escapeHtml(name)}</li>`).join("")}</ul>` : `<span class="muted-text">Sem participantes informados.</span>`}
        </div>
      `;
    }).join("");

    const reportHtml = OFFICIAL_FORM_EVENTS.map((eventName) => {
      const row = rows[eventName] || {};
      return `
        <tr>
          <td>${escapeHtml(eventName)}</td>
          <td>${escapeHtml(row.responsavel || "")}</td>
          <td>${row.custo ? `R$ ${escapeHtml(row.custo)}` : ""}</td>
          <td>${escapeHtml(row.descricao || "")}</td>
        </tr>
      `;
    }).join("");

    return `
      <article class="admin-leadership-form-card" style="--team-color:${item.color}">
        <header>
          <span class="eyebrow">${escapeHtml(item.category)}</span>
          <h3>${escapeHtml(item.name)} • ${escapeHtml(item.theme)}</h3>
        </header>

        <details>
          <summary>Ficha de inscrição</summary>
          <div class="admin-form-meta">
            <span><strong>Líder:</strong> ${escapeHtml(reg.leader || leadershipLeaderName(item.id))}</span>
            <span><strong>Vice:</strong> ${escapeHtml(reg.viceLeader || "")}</span>
            <span><strong>Padrinho:</strong> ${escapeHtml(reg.padrinho || item.mentor || "")}</span>
          </div>
          <div class="admin-form-grid">${participantHtml}</div>
        </details>

        <details>
          <summary>Relatório de estratégia</summary>
          <div class="table-wrap">
            <table>
              <thead><tr><th>Prova</th><th>Responsável</th><th>Custo</th><th>Descrição</th></tr></thead>
              <tbody>${reportHtml}</tbody>
            </table>
          </div>
          <div class="admin-form-meta totals">
            <span><strong>Total provas:</strong> ${rep.totalProvas ? `R$ ${escapeHtml(rep.totalProvas)}` : ""}</span>
            <span><strong>Total camisa:</strong> ${rep.totalCamisa ? `R$ ${escapeHtml(rep.totalCamisa)}` : ""}</span>
            <span><strong>Cota por aluno:</strong> ${rep.cotaAluno ? `R$ ${escapeHtml(rep.cotaAluno)}` : ""}</span>
          </div>
        </details>
      </article>
    `;
  }).join("");
}


function renderAdminTables() {
  renderJudgingDayControls();
  renderJudgingOrderControls();
  renderJudgingBlockControls();
  renderLeadershipClaimsAdmin();
  renderLeadershipCodesAdmin();
  renderLeadershipRequestsAdmin();
  renderTeacherCodesAdmin();
  renderTeacherRequestsAdmin();
  renderJudgeBlockWorkspace();

  setHtml("pointsTable", tableMarkup(
    ["Turma", "Prova", "Pontos", "Observação", ""],
    state.scores.map((item, index) => [
      team(item.teamId)?.name || item.teamId,
      eventById(item.eventId)?.name || item.eventId,
      formatPoints(item.points),
      item.note || "",
      `<button class="mini-action" data-delete-score="${index}" type="button">Excluir</button>`
    ])
  ));

  const scheduleRoot = byId("scheduleList");
  const activeScheduleTab = ["upcoming", "realized"].includes(scheduleRoot?.dataset.activeTab) ? scheduleRoot.dataset.activeTab : "upcoming";
  const scheduleRows = sortedScheduleEntries()
    .filter(({ item }) => activeScheduleTab === "realized" ? scheduleIsRealized(item) : !scheduleIsRealized(item))
    .sort((a, b) => activeScheduleTab === "realized" ? compareSchedules(b.item, a.item) : compareSchedules(a.item, b.item));

  setHtml("scheduleTable", tableMarkup(
    ["Turma", "Data", "Início", "Fim", "Atividade", "Local", ""],
    scheduleRows.map(({ item, index }) => [
      team(item.teamId)?.name || item.teamId,
      formatDate(item.date),
      item.time,
      item.endTime || "",
      item.activity || "",
      item.place || "",
      `<button class="mini-action" data-edit-schedule="${index}" type="button">Editar</button> <button class="mini-action" data-delete-schedule="${index}" type="button">Excluir</button>`
    ])
  ));

  setHtml("materialsTable", tableMarkup(
    ["Turma", "Material", "Situação", "Data", "Valor/Detalhe", "Observação", ""],
    state.materials.map((item, index) => [
      team(item.teamId)?.name || item.teamId,
      item.material,
      item.status,
      formatDate(item.date),
      item.amount || "",
      item.note || "",
      `<button class="mini-action" data-delete-material="${index}" type="button">Excluir</button>`
    ])
  ));

  setHtml("foodTable", tableMarkup(
    ["Turma", "Item", "Quantidade", "Tokens", "Data", "Observação", ""],
    state.foodDonations.map((item, index) => {
      const food = foodById(item.foodId);
      const tokens = Number(item.quantity || 0) * Number(food?.tokens || 0);
      return [
        team(item.teamId)?.name || item.teamId,
        food?.name || item.foodId,
        formatPoints(item.quantity),
        formatPoints(tokens),
        formatDate(item.date),
        item.note || "",
        `<button class="mini-action" data-delete-food="${index}" type="button">Excluir</button>`
      ];
    })
  ));

  setHtml("disciplineTable", tableMarkup(
    ["Turma", "Tipo", "Data", "Pontos", "Motivo", "Registro", ""],
    state.discipline.map((item, index) => [
      team(item.teamId)?.name || item.teamId,
      item.levelLabel ? `${item.type} ${item.levelLabel}` : item.type,
      formatDate(item.date),
      item.type === "Penalidade" ? `-${formatPoints(Math.abs(item.points || 0))}` : "0",
      item.reason,
      disciplineSourceLabel(item),
      `<button class="mini-action" data-edit-discipline="${index}" type="button">Editar</button> <button class="mini-action" data-delete-discipline="${index}" type="button">Excluir</button>`
    ])
  ));

  setHtml("bonusTable", tableMarkup(
    ["Turma", "Data", "Pontos", "Motivo", ""],
    state.bonuses.map((item, index) => [
      team(item.teamId)?.name || item.teamId,
      formatDate(item.date),
      `+${formatPoints(Math.abs(item.points || 0))}`,
      item.reason,
      `<button class="mini-action" data-edit-bonus="${index}" type="button">Editar</button> <button class="mini-action" data-delete-bonus="${index}" type="button">Excluir</button>`
    ])
  ));

  setHtml("judgesTable", tableMarkup(
    ["Jurado", "Código", "Status", "Liberadas", "Concluídas", ""],
    state.judges.map((item, index) => {
      const done = state.evaluations.filter((evaluation) => normalizeJudgeCode(evaluation.judgeCode) === normalizeJudgeCode(item.code)).length;
      const assigned = judgingAssignmentsForJudge(item).length;
      return [
        escapeHtml(item.name),
        `<code>${escapeHtml(normalizeJudgeCode(item.code))}</code>`,
        item.active === false ? "Inativo" : "Ativo",
        assigned,
        `${done}/${assigned}`,
        `<button class="mini-action" data-toggle-judge="${index}" type="button">${item.active === false ? "Ativar" : "Pausar"}</button> <button class="mini-action" data-delete-judge="${index}" type="button">Excluir</button>`
      ];
    })
  ));

  setHtml("judgingDaysTable", tableMarkup(
    ["Dia", "Data", "Status", "Provas", "Jurados", ""],
    state.judgingDays.map((item, index) => {
      const events = (item.eventIds || []).map((id) => judgingEventById(id)?.name || id).join(", ");
      const selectedCodes = normalizedJudgeCodes(item.judgeCodes || []);
      const judges = selectedCodes.map((code) => {
        const judge = judgeByCode(code);
        return `
          <span class="inline-token">
            ${escapeHtml(judge?.name || code)}
            <button data-remove-day-judge="${index}" data-judge-code="${escapeHtml(code)}" type="button" aria-label="Remover jurado">×</button>
          </span>
        `;
      }).join("");
      const options = state.judges
        .filter((judge) => !selectedCodes.includes(normalizeJudgeCode(judge.code)))
        .map((judge) => `<option value="${escapeHtml(normalizeJudgeCode(judge.code))}">${escapeHtml(judge.name)} • ${escapeHtml(normalizeJudgeCode(judge.code))}</option>`)
        .join("");
      const addJudge = options ? `
        <div class="table-add-judge">
          <select data-day-judge-select="${index}" aria-label="Adicionar jurado ao dia">
            <option value="">Adicionar jurado</option>
            ${options}
          </select>
          <button class="mini-action" data-add-day-judge="${index}" type="button">Adicionar</button>
        </div>
      ` : `<small class="muted-text">Todos os jurados cadastrados foram adicionados.</small>`;
      return [
        escapeHtml(item.name || "Dia de apresentação"),
        formatDate(item.date),
        item.active === false ? "Pausado" : "Liberado",
        escapeHtml(events || "Nenhuma prova"),
        `<div class="day-judges-cell">${judges || `<small class="muted-text">Nenhum jurado adicionado.</small>`}${addJudge}</div>`,
        `<button class="mini-action" data-toggle-judging-day="${index}" type="button">${item.active === false ? "Liberar" : "Pausar"}</button> <button class="mini-action" data-delete-judging-day="${index}" type="button">Excluir</button>`
      ];
    })
  ));

  setValue("dataPreview", JSON.stringify(state, null, 2));
}

function tableMarkup(headers, rows) {
  const labels = headers.map((item) => escapeHtml(item || "Ações"));
  const body = rows.length
    ? rows.map((row) => `
      <tr>
        ${row.map((cell, index) => `<td data-label="${labels[index] || "Ações"}">${cell}</td>`).join("")}
      </tr>
    `).join("")
    : `<tr><td class="empty-table-cell" colspan="${headers.length}">Nenhum registro.</td></tr>`;
  return `<thead><tr>${headers.map((item) => `<th>${item}</th>`).join("")}</tr></thead><tbody>${body}</tbody>`;
}

function fillSelects() {
  document.querySelectorAll('select[name="team"]').forEach((select) => {
    select.innerHTML = state.teams.map((item) => `<option value="${item.id}">${item.name}</option>`).join("");
  });
  document.querySelectorAll('select[name="event"]:not(#batchPointsForm select)').forEach((select) => {
    select.innerHTML = state.events.map((item) => `<option value="${item.id}">${item.name}</option>`).join("");
  });
  document.querySelectorAll('#batchPointsForm select[name="event"]').forEach((select) => {
    select.innerHTML = '<option value="">Selecione a prova...</option>' + state.events.map((item) => `<option value="${item.id}">${item.name}</option>`).join("");
    select.value = "";
  });
  document.querySelectorAll('#batchPointsForm select[name="category"]').forEach((select) => {
    const current = select.value || "Categoria 1";
    select.innerHTML = judgingCategories().map((item) => `<option value="${item}">${item}</option>`).join("");
    select.value = judgingCategories().includes(current) ? current : "Categoria 1";
  });
  document.querySelectorAll('#evaluationForm select[name="event"]').forEach((select) => {
    if (document.body.classList.contains("judge-page")) return;
    const current = select.value;
    select.innerHTML = orderedJudgingEvents().map((item) => `<option value="${item.id}">${item.name}</option>`).join("");
    if (current) select.value = current;
  });
  document.querySelectorAll('select[name="food"]').forEach((select) => {
    select.innerHTML = state.foodTypes.map((item) => `<option value="${item.id}">${item.name} • ${item.tokens} tokens</option>`).join("");
  });
  document.querySelectorAll('select[name="level"]').forEach((select) => {
    const current = select.value;
    select.innerHTML = DISCIPLINE_LEVELS.map((item) => `<option value="${item.id}">${item.label} • ${item.points} ponto${item.points > 1 ? "s" : ""}</option>`).join("");
    if (current) select.value = current;
  });
  document.querySelectorAll('#participantsForm select[name="activity"]').forEach((select) => {
    const current = select.value;
    select.innerHTML = REGISTRATION_EVENTS.map((item) => `<option value="${item}">${item}</option>`).join("");
    if (current) select.value = current;
    if (!select.dataset.loadedParticipants) {
      select.dataset.loadedParticipants = "true";
      loadParticipantsIntoForm();
    }
  });
}

function formatPoints(value) {
  return Number(value || 0).toLocaleString("pt-BR", { maximumFractionDigits: 1 });
}

function formatDate(value) {
  if (!value) return "";
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}


function renderProjectionPanel() {
  const scoreboardRoot = byId("projectionScoreboard");
  const foodRoot = byId("projectionFood");
  if (!scoreboardRoot && !foodRoot) return;

  const ranked = totals();
  if (scoreboardRoot) {
    scoreboardRoot.innerHTML = ["Categoria 1", "Categoria 2"].map((category) => {
      const categoryTeams = ranked.filter((item) => item.category === category);
      return `
        <section class="projection-category">
          <header>
            <span>${escapeHtml(category)}</span>
            <strong>Placar Geral</strong>
          </header>
          <div class="projection-ranking">
            ${categoryTeams.map((item, index) => `
              <article class="projection-score-card place-${index + 1}" style="--team-color:${item.color};--metric-color:${item.id === "2" ? "#ffffff" : item.color}">
                <div class="projection-place">${index + 1}º</div>
                <div class="projection-team">
                  <h3>${escapeHtml(item.name)}</h3>
                  <p>${escapeHtml(item.theme)}</p>
                </div>
                <div class="projection-points">
                  <strong>${formatPoints(item.total)}</strong>
                  <span>pontos</span>
                </div>
              </article>
            `).join("")}
          </div>
        </section>
      `;
    }).join("");
  }

  if (foodRoot) {
    const ranking = foodTotals();
    const grandTotal = ranking.reduce((sum, item) => sum + Number(item.tokens || 0), 0);

    foodRoot.innerHTML = `
      <section class="projection-food-summary">
        <span>Prova Solidária</span>
        <strong>${formatPoints(grandTotal)}</strong>
        <small>tokens arrecadados no total</small>
      </section>

      <div class="projection-scoreboard projection-food-categories">
        ${["Categoria 1", "Categoria 2"].map((category) => {
          const categoryTeams = ranking.filter((item) => item.category === category);
          return `
            <section class="projection-category">
              <header>
                <span>${escapeHtml(category)}</span>
                <strong>Arrecadação</strong>
              </header>
              <div class="projection-ranking">
                ${categoryTeams.map((item, index) => {
                  const totalsByFood = state.foodTypes.map((food) => {
                    const quantity = state.foodDonations
                      .filter((donation) => donation.teamId === item.id && donation.foodId === food.id)
                      .reduce((sum, donation) => sum + Number(donation.quantity || 0), 0);
                    return { ...food, quantity, total: quantity * Number(food.tokens || 0) };
                  }).filter((food) => food.quantity > 0);

                  return `
                    <article class="projection-score-card projection-food-card place-${index + 1}" style="--team-color:${item.color};--metric-color:${item.id === "2" ? "#ffffff" : item.color}">
                      <div class="projection-place">${index + 1}º</div>
                      <div class="projection-team">
                        <h3>${escapeHtml(item.name)}</h3>
                        <p>${escapeHtml(item.theme)}</p>
                        ${totalsByFood.length ? `
                          <ul>
                            ${totalsByFood.map((food) => `<li>${escapeHtml(food.name)}: <strong>${formatPoints(food.quantity)}</strong> un. / <strong>${formatPoints(food.total)}</strong> tokens</li>`).join("")}
                          </ul>
                        ` : `<small>Nenhum lançamento ainda</small>`}
                      </div>
                      <div class="projection-points">
                        <strong>${formatPoints(item.tokens)}</strong>
                        <span>tokens</span>
                      </div>
                    </article>
                  `;
                }).join("")}
              </div>
            </section>
          `;
        }).join("")}
      </div>
    `;
  }

  const updated = byId("projectionUpdatedAt");
  if (updated) updated.textContent = `Atualizado em ${new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`;
}

function setProjectionView(view = "scoreboard") {
  document.querySelectorAll("[data-projection-panel]").forEach((panel) => {
    panel.hidden = panel.dataset.projectionPanel !== view;
  });
  document.querySelectorAll("[data-projection-view]").forEach((button) => {
    button.classList.toggle("active", button.dataset.projectionView === view);
  });
  sessionStorage.setItem("gincana-projection-view", view);
  renderProjectionPanel();
}


function updateProjectionFullscreenButton() {
  const button = document.querySelector("[data-projection-fullscreen]");
  if (!button) return;
  button.textContent = document.fullscreenElement ? "Sair da tela cheia" : "Tela cheia";
  button.classList.toggle("active", Boolean(document.fullscreenElement));
}

async function toggleProjectionFullscreen() {
  try {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  } catch (error) {
    const updated = byId("projectionUpdatedAt");
    if (updated) updated.textContent = "Use F11 no teclado se o navegador bloquear a tela cheia.";
  } finally {
    updateProjectionFullscreenButton();
  }
}

function initializeProjectionPage() {
  if (!document.body.classList.contains("projection-page")) return;
  setProjectionView(sessionStorage.getItem("gincana-projection-view") || "scoreboard");
  updateProjectionFullscreenButton();
  setInterval(() => loadRemoteData(), 15000);
}




function teacherCodeMap() {
  return state.teacherCodes && Object.keys(state.teacherCodes).length ? state.teacherCodes : DEFAULT_TEACHER_CODES;
}

function teacherTeamIdFromCode(code = "") {
  return teacherCodeMap()[normalizeJudgeCode(code)] || "";
}

function activeTeacherTeamId() {
  return sessionStorage.getItem("gincana-teacher-team-id") || "";
}

function teacherSelectedTeamId() {
  return activeTeacherTeamId() || state.teams[0]?.id || "";
}

function teacherDisplayName(teamId = "") {
  const names = {
    "6": "Prof. Eduardo",
    "7": "Prof. Thayna e Prof. Michael",
    "8": "Prof. Elayne",
    "9": "Prof. Alexandre",
    "1": "Prof. Amanda e Prof. Diogo",
    "2": "Prof. Rafaely"
  };
  return names[teamId] || team(teamId)?.mentor || "Professor padrinho";
}

function activeTeacherMobileSection() {
  return sessionStorage.getItem("gincana-teacher-mobile-section") || "resumo";
}

function restoreTeacherMobileSection() {
  if (!document.body.classList.contains("teachers-page")) return;
  const target = activeTeacherMobileSection();
  document.querySelectorAll("[data-teacher-mobile-section]").forEach((section) => {
    section.classList.toggle("mobile-section-active", section.dataset.teacherMobileSection === target);
  });
  document.querySelectorAll("[data-teacher-mobile-tab]").forEach((button) => {
    button.classList.toggle("active", button.dataset.teacherMobileTab === target);
  });
}

function renderTeacherPanel() {
  const root = byId("teacherDashboard");
  const privateArea = byId("teacherPrivateArea");
  const loginBox = byId("teacherLoginBox");
  if (!root) return;

  const teacherTeamId = activeTeacherTeamId();
  if (!teacherTeamId) {
    root.innerHTML = "";
    if (privateArea) privateArea.hidden = true;
    if (loginBox) loginBox.hidden = false;
    return;
  }

  if (privateArea) privateArea.hidden = false;
  if (loginBox) loginBox.hidden = true;

  const teamId = teacherSelectedTeamId();
  const summary = leadershipTeamSummary(teamId);
  const currentTeam = summary.team || team(teamId) || state.teams[0];
  const materials = state.materialTypes.map((material) => {
    const entry = state.materials.find((item) => item.teamId === teamId && item.material === material);
    return entry || { teamId, material, status: "Pendente", date: "", amount: "", note: "" };
  });
  const discipline = state.discipline.filter((entry) => entry.teamId === teamId);
  const schedules = sortedScheduleEntries().filter(({ item }) => item.teamId === teamId);
  const teacherRequests = (state.scheduleRequests || []).filter((item) => item.teamId === teamId && item.requestedBy === "teacher");

  root.innerHTML = `
    <section class="leadership-team-hero teacher-team-hero" style="--team-color:${currentTeam?.color || "#3b82f6"}">
      <span class="eyebrow">Painel dos padrinhos</span>
      <h2>${escapeHtml(currentTeam?.name || "Turma")}</h2>
      <p>${escapeHtml(currentTeam?.theme || "")} • ${escapeHtml(teacherDisplayName(teamId))}</p>
    </section>

    <section class="leadership-metrics leadership-mobile-tab-panel mobile-section-active" data-teacher-mobile-section="resumo">
      <article><span>Total geral</span><strong>${formatPoints(summary.total)}</strong></article>
      <article><span>Arrecadação</span><strong>${formatPoints(summary.foodTokens)}</strong><small>tokens</small></article>
      <article><span>Penalidades</span><strong>-${formatPoints(summary.penalties)}</strong></article>
      <article><span>Advertências</span><strong>${summary.warnings}</strong></article>
      <article><span>Bônus</span><strong>+${formatPoints(summary.bonuses)}</strong></article>
    </section>

    <section class="leadership-card leadership-wide-card leadership-mobile-tab-panel" data-teacher-mobile-section="ensaios">
      <h3>Solicitar ensaio da Dança dos Professores</h3>
      <p class="muted-text">Este painel solicita apenas ensaios da Dança dos Professores. O pedido fica aguardando aprovação do admin.</p>
      <form id="teacherScheduleRequestForm" class="form-grid leadership-request-form">
        <input name="teamId" type="hidden" value="${escapeHtml(teamId)}">
        <label>Data<input name="date" type="date" required></label>
        <label>Início<input name="time" type="time" required></label>
        <label>Fim<input name="endTime" type="time"></label>
        <label>Local<input name="place" type="text" value="ENSPS"></label>
        <label class="wide">Observação<input name="note" type="text" placeholder="Ex.: professor responsável, disponibilidade, local desejado"></label>
        <button class="button primary" type="submit">Solicitar ensaio</button>
      </form>

      <h3>Solicitações enviadas</h3>
      ${teacherRequests.length ? `
        <div class="leadership-list">
          ${teacherRequests.map((item) => `
            <div>
              <strong>Dança dos Professores • ${scheduleRequestStatusLabel(item)}</strong>
              <span>${formatDate(item.date)} • ${item.time || ""}${item.endTime ? ` - ${item.endTime}` : ""} • ${escapeHtml(item.place || "ENSPS")}${item.response ? ` • ${escapeHtml(item.response)}` : ""}</span>
              ${item.status !== "approved" ? `<button class="mini-action" data-delete-own-teacher-schedule-request="${escapeHtml(item.id)}" type="button">Excluir solicitação</button>` : ""}
            </div>
          `).join("")}
        </div>
      ` : `<p class="muted-text">Nenhuma solicitação enviada ainda.</p>`}

      <h3>Ensaios marcados</h3>
      ${schedules.length ? `
        <div class="leadership-list">
          ${schedules.map(({ item }) => `
            <div>
              <strong>${escapeHtml(item.activity || "Ensaio")}</strong>
              <span>${formatDate(item.date)} • ${item.time || ""}${item.endTime ? ` - ${item.endTime}` : ""} • ${escapeHtml(item.place || "ENSPS")} • ${scheduleSourceLabel(item)}</span>
            </div>
          `).join("")}
        </div>
      ` : `<p class="muted-text">Nenhum ensaio marcado para esta turma.</p>`}
    </section>

    <section class="leadership-grid leadership-mobile-tab-panel" data-teacher-mobile-section="materiais">
      <article class="leadership-card">
        <h3>Materiais e entregas</h3>
        <div class="leadership-list">
          ${materials.map((item) => `
            <div class="${item.status === "Pendente" ? "leadership-pending-item" : ""}">
              <strong>${escapeHtml(item.material)}</strong>
              <span>${escapeHtml(item.status)}${item.date ? ` • ${formatDate(item.date)}` : ""}${item.note ? ` • ${escapeHtml(item.note)}` : ""}</span>
            </div>
          `).join("")}
        </div>
      </article>

      <article class="leadership-card">
        <h3>Documentos e contato</h3>
        <p>Envio de materiais:</p>
        <a href="mailto:ensps.contatos@gmail.com">ensps.contatos@gmail.com</a>
        <div class="settings-actions leadership-downloads">
          <a class="button ghost" href="docs/regulamento-tudo-junto-e-misturado-2026.pdf" download>Baixar regulamento</a>
          <a class="button ghost" href="docs/oficio-arrecadacao-alimentos.pdf" download>Baixar ofício</a>
          <a class="button ghost" href="assets/logo-ensps.png" download>Baixar logo ENSPS</a>
        </div>
      </article>
    </section>

    <section class="leadership-card leadership-wide-card leadership-mobile-tab-panel" data-teacher-mobile-section="ocorrencias">
      <h3>Advertências, penalidades e ocorrências</h3>
      ${discipline.length ? `
        <div class="leadership-list">
          ${discipline.map((entry) => `
            <div>
              <strong>${escapeHtml(entry.levelLabel ? `${entry.type} ${entry.levelLabel}` : entry.type)}</strong>
              <span>${formatDate(entry.date)} • ${entry.type === "Penalidade" ? `-${formatPoints(Math.abs(entry.points || 0))} ponto(s)` : "sem desconto"} • ${escapeHtml(entry.reason || "")}</span>
            </div>
          `).join("")}
        </div>
      ` : `<p class="muted-text">Nenhuma ocorrência registrada para esta turma.</p>`}
    </section>
  `;
}



function allFamilyParticipantEntries() {
  const entries = [];

  state.teams.forEach((itemTeam) => {
    REGISTRATION_EVENTS.forEach((activity) => {
      const names = participantLinesForSchedule(itemTeam.id, activity);
      names.forEach((name) => {
        entries.push({
          teamId: itemTeam.id,
          teamName: itemTeam.name,
          teamTheme: itemTeam.theme,
          teamColor: itemTeam.color,
          activity,
          name
        });
      });
    });
  });

  return entries;
}

function studentScheduleMatches(teamId = "", activity = "", studentName = "") {
  const normalizedStudent = normalizeActivityName(studentName);
  return sortedScheduleEntries()
    .filter(({ item }) => item.teamId === teamId)
    .filter(({ item }) => {
      const participants = participantLinesForSchedule(item.teamId, item.activity || "");
      return participants.some((name) => normalizeActivityName(name).includes(normalizedStudent));
    })
    .filter(({ item }) => {
      const normalizedActivity = normalizeActivityName(activity);
      const scheduleActivity = normalizeActivityName(item.activity || "");
      return scheduleActivity === normalizedActivity
        || scheduleActivity.includes(normalizedActivity)
        || normalizedActivity.includes(scheduleActivity)
        || participantLinesForSchedule(item.teamId, item.activity || "").some((name) => normalizeActivityName(name).includes(normalizedStudent));
    });
}

function ensureFamilyParticipantsFilter() {
  const filter = byId("familyParticipantsTeamFilter");
  if (!filter || filter.dataset.loaded) return;
  filter.innerHTML = `<option value="">Todas as turmas</option>${state.teams.map((item) => `<option value="${item.id}">${item.name}</option>`).join("")}`;
  filter.dataset.loaded = "true";
}

function renderFamilyParticipants() {
  const root = byId("familyParticipantsList");
  if (!root) return;

  ensureFamilyParticipantsFilter();

  const selectedTeamId = byId("familyParticipantsTeamFilter")?.value || "";
  const teams = selectedTeamId ? state.teams.filter((item) => item.id === selectedTeamId) : state.teams;

  root.innerHTML = teams.map((itemTeam) => {
    const activities = REGISTRATION_EVENTS.map((activity) => {
      const names = participantLinesForSchedule(itemTeam.id, activity);
      if (!names.length) return "";
      return `
        <details class="family-participant-activity">
          <summary>
            <strong>${escapeHtml(activity)}</strong>
            <span>${names.length} participante${names.length > 1 ? "s" : ""}</span>
          </summary>
          <ul>${names.map((name) => `<li>${escapeHtml(name)}</li>`).join("")}</ul>
        </details>
      `;
    }).join("");

    const totalNames = REGISTRATION_EVENTS.reduce((sum, activity) => sum + participantLinesForSchedule(itemTeam.id, activity).length, 0);

    return `
      <details class="family-participant-team" style="--team-color:${itemTeam.color}">
        <summary class="family-participant-team-summary">
          <span>
            <strong>${escapeHtml(itemTeam.name)}</strong>
            <small>${escapeHtml(itemTeam.theme || "")}</small>
          </span>
          <em>${totalNames} participante${totalNames === 1 ? "" : "s"}</em>
        </summary>
        <div class="family-participant-team-body">
          ${activities || `<p class="muted-text">Nenhum participante cadastrado para esta turma.</p>`}
        </div>
      </details>
    `;
  }).join("");
}

function renderFamilyStudentSearch() {
  const input = byId("familyStudentSearch");
  const root = byId("familyStudentResults");
  if (!input || !root) return;

  const query = normalizeActivityName(input.value || "");
  if (!query) {
    root.innerHTML = `<div class="empty-state">Digite o nome de um aluno para buscar participações e ensaios.</div>`;
    return;
  }

  const selectedTeamId = byId("familyParticipantsTeamFilter")?.value || "";
  const matches = allFamilyParticipantEntries()
    .filter((entry) => !selectedTeamId || entry.teamId === selectedTeamId)
    .filter((entry) => normalizeActivityName(entry.name).includes(query));

  if (!matches.length) {
    root.innerHTML = `<div class="empty-state">Nenhum participante encontrado com esse nome.</div>`;
    return;
  }

  const grouped = matches.reduce((acc, entry) => {
    const key = `${entry.teamId}__${entry.name}`;
    if (!acc[key]) acc[key] = { ...entry, activities: [] };
    acc[key].activities.push(entry.activity);
    return acc;
  }, {});

  root.innerHTML = Object.values(grouped).map((entry) => {
    const schedules = sortedScheduleEntries()
      .filter(({ item }) => item.teamId === entry.teamId)
      .filter(({ item }) => {
        const participants = participantLinesForSchedule(item.teamId, item.activity || "");
        return participants.some((name) => normalizeActivityName(name).includes(query));
      });

    return `
      <article class="family-student-card" style="--team-color:${entry.teamColor}">
        <header>
          <strong>${escapeHtml(entry.name)}</strong>
          <span>${escapeHtml(entry.teamName)} • ${escapeHtml(entry.teamTheme || "")}</span>
        </header>

        <div>
          <h3>Participa em:</h3>
          <ul>${entry.activities.map((activity) => `<li>${escapeHtml(activity)}</li>`).join("")}</ul>
        </div>

        <div>
          <h3>Ensaios relacionados:</h3>
          ${schedules.length ? `
            <ul>
              ${schedules.map(({ item }) => `
                <li>
                  ${formatDate(item.date)} • ${item.time || ""}${item.endTime ? ` - ${item.endTime}` : ""} • ${escapeHtml(item.activity || "Ensaio")} • ${escapeHtml(item.place || "ENSPS")}
                </li>
              `).join("")}
            </ul>
          ` : `<p class="muted-text">Nenhum ensaio relacionado encontrado no momento.</p>`}
        </div>
      </article>
    `;
  }).join("");
}

function setFamilyView(view = "agenda") {
  document.querySelectorAll("[data-family-panel]").forEach((panel) => {
    panel.classList.toggle("active", panel.dataset.familyPanel === view);
  });
  document.querySelectorAll("[data-family-view]").forEach((button) => {
    button.classList.toggle("active", button.dataset.familyView === view);
  });
  sessionStorage.setItem("gincana-family-view", view);
  renderFamilyParticipants();
  renderFamilyStudentSearch();
}

function initializeFamilyAgendaPage() {
  if (!document.body.classList.contains("rehearsal-view-page")) return;
  setFamilyView(sessionStorage.getItem("gincana-family-view") || "agenda");
}


function render() {
  fillSelects();
  renderScoreboard();
  renderEventResults();
  renderTeams();
  renderEvents();
  syncParticipantsFromRegistrationForms();
  renderSchedules();
  renderFamilyParticipants();
  renderFamilyStudentSearch();
  renderFoodDonations();
  renderMaterials();
  renderParticipants();
  renderJudgeAccess();
  renderEvaluationSheet();
  renderEvaluationResults();
  renderDiscipline();
  renderAdminTables();
  renderScheduleRequests();
  renderLeadershipPanel();
  restoreLeadershipMobileSection();
  renderTeacherPanel();
  restoreTeacherMobileSection();
  renderLeadershipFormsAdmin();
  renderProjectionPanel();
}


document.addEventListener("click", (event) => {
  const familyButton = event.target.closest("[data-family-view]");
  if (familyButton) {
    event.preventDefault();
    setFamilyView(familyButton.dataset.familyView || "agenda");
    return;
  }
});

document.addEventListener("click", (event) => {
  const viewButton = event.target.closest("[data-projection-view]");
  if (viewButton) {
    event.preventDefault();
    setProjectionView(viewButton.dataset.projectionView || "scoreboard");
    return;
  }

  const fullscreenButton = event.target.closest("[data-projection-fullscreen]");
  if (fullscreenButton) {
    event.preventDefault();
    toggleProjectionFullscreen();
    return;
  }
});

document.addEventListener("fullscreenchange", updateProjectionFullscreenButton);

document.querySelectorAll(".tab-button").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".tab-button").forEach((item) => item.classList.remove("active"));
    document.querySelectorAll(".admin-panel").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    const panel = byId(button.dataset.panel);
    panel?.classList.add("active");
    if (window.matchMedia("(max-width: 760px)").matches && panel) {
      requestAnimationFrame(() => {
        const top = panel.getBoundingClientRect().top + window.scrollY - 12;
        window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
      });
    }
  });
});



on("familyStudentSearch", "input", () => {
  renderFamilyStudentSearch();
});

on("familyParticipantsTeamFilter", "change", () => {
  renderFamilyParticipants();
  renderFamilyStudentSearch();
});

on("scheduleTeamFilter", "change", () => {
  renderSchedules();
  renderFamilyParticipants();
  renderFamilyStudentSearch();
  renderAdminTables();
  renderScheduleRequests();
  renderLeadershipPanel();
  restoreLeadershipMobileSection();
  renderTeacherPanel();
  restoreTeacherMobileSection();
  renderLeadershipFormsAdmin();
  renderProjectionPanel();
});




document.addEventListener("input", (event) => {
  const input = event.target.closest("[data-uppercase-code]");
  if (!input) return;
  input.value = input.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
});


on("teacherLoginForm", "submit", (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.currentTarget));
  const teamId = teacherTeamIdFromCode(data.code || "");
  const status = byId("teacherLoginStatus");
  if (!teamId) {
    if (status) status.textContent = "Código não encontrado. Confira com a comissão organizadora.";
    return;
  }
  sessionStorage.setItem("gincana-teacher-team-id", teamId);
  sessionStorage.setItem("gincana-teacher-mobile-section", "resumo");
  if (status) status.textContent = `Acesso liberado para ${teacherDisplayName(teamId)} • ${team(teamId)?.name || "turma"}.`;
  renderTeacherPanel();
  restoreTeacherMobileSection();
  window.scrollTo({ top: 0, behavior: "smooth" });
});

document.addEventListener("submit", (event) => {
  const form = event.target.closest("#teacherScheduleRequestForm");
  if (!form) return;
  event.preventDefault();
  sessionStorage.setItem("gincana-teacher-mobile-section", "ensaios");
  const data = Object.fromEntries(new FormData(form));
  if (!data.teamId || !data.date || !data.time) return;
  if (!Array.isArray(state.scheduleRequests)) state.scheduleRequests = [];
  state.scheduleRequests.push({
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    teamId: data.teamId,
    date: data.date,
    time: data.time,
    endTime: data.endTime,
    place: data.place?.trim() || "ENSPS",
    activity: "Dança dos Professores",
    note: data.note?.trim() || "",
    status: "pending",
    requestedBy: "teacher",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  form.reset();
  setSyncStatus("Solicitação do professor enviada para aprovação do admin.");
  saveState();
  restoreTeacherMobileSection();
});


on("leadershipLoginForm", "submit", (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.currentTarget));
  const teamId = leadershipTeamIdFromCode(data.code || "");
  const status = byId("leadershipLoginStatus");
  if (!teamId) {
    if (status) status.textContent = "Código não encontrado. Confira com a comissão organizadora.";
    return;
  }
  sessionStorage.setItem("gincana-leadership-team-id", teamId);
  sessionStorage.setItem("gincana-leadership-mobile-section", "resumo");
  if (status) status.textContent = `Acesso liberado para ${team(teamId)?.name || "turma"}.`;
  renderLeadershipPanel();
  restoreLeadershipMobileSection();
  renderTeacherPanel();
  restoreTeacherMobileSection();
  renderLeadershipFormsAdmin();
  renderProjectionPanel();
  window.scrollTo({ top: 0, behavior: "smooth" });
  playLeadershipWelcome(teamId);
});

on("leadershipTeamSelect", "change", () => {
  renderLeadershipPanel();
  restoreLeadershipMobileSection();
  renderTeacherPanel();
  restoreTeacherMobileSection();
  renderLeadershipFormsAdmin();
  renderProjectionPanel();
});


document.addEventListener("submit", (event) => {
  const form = event.target.closest("#leadershipRequestForm");
  if (!form) return;
  event.preventDefault();
  const data = Object.fromEntries(new FormData(form));
  if (!data.teamId || !data.message?.trim()) return;
  if (!Array.isArray(state.leadershipRequests)) state.leadershipRequests = [];
  state.leadershipRequests.push({
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    teamId: data.teamId,
    type: data.type || "Solicitação",
    message: data.message.trim(),
    status: "Pendente",
    response: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  form.reset();
  setSyncStatus("Solicitação enviada para a comissão organizadora.");
  saveState();
});



document.addEventListener("submit", (event) => {
  const form = event.target.closest("#leaderScheduleRequestForm");
  if (!form) return;
  event.preventDefault();
  const data = Object.fromEntries(new FormData(form));
  if (!canLeaderRequestSchedule(data.date)) {
    setSyncStatus("Solicitação fora do prazo. O limite é até 19h do dia anterior ao ensaio.");
    return;
  }
  if (!Array.isArray(state.scheduleRequests)) state.scheduleRequests = [];
  state.scheduleRequests.push({
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    teamId: data.teamId,
    date: data.date,
    time: data.time,
    endTime: data.endTime,
    place: data.place?.trim() || "ENSPS",
    activity: data.activity,
    note: data.note?.trim() || "",
    status: "pending",
    requestedBy: "leader",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  form.reset();
  setSyncStatus("Solicitação enviada. Aguarde a aprovação.");
  saveState();
});




document.addEventListener("input", (event) => {
  const form = event.target.closest("#leaderRegistrationForm, #leaderStrategyReportForm");
  if (!form) return;
  saveLeadershipDraftFromForm(form);
});

document.addEventListener("change", (event) => {
  const form = event.target.closest("#leaderRegistrationForm, #leaderStrategyReportForm");
  if (!form) return;
  saveLeadershipDraftFromForm(form);
});

document.addEventListener("submit", (event) => {
  const form = event.target.closest("#leaderRegistrationForm");
  if (!form) return;
  event.preventDefault();
  sessionStorage.setItem("gincana-leadership-mobile-section", "fichas");

  const payload = collectLeadershipRegistrationDraft(form);
  const teamId = payload.teamId;

  upsertRegistrationForm(payload);
  clearLeadershipDraft("registration", teamId);

  setSyncStatus("Ficha de inscrição salva. Participantes atualizados no painel de ensaios.");
  saveState();
  restoreLeadershipMobileSection();
  scrollLeadershipActiveSection("fichas");
  setSyncStatus("Ficha de inscrição salva. Você continua na aba Ficha.");
});

document.addEventListener("submit", (event) => {
  const form = event.target.closest("#leaderStrategyReportForm");
  if (!form) return;
  event.preventDefault();
  sessionStorage.setItem("gincana-leadership-mobile-section", "relatorio");

  const payload = collectLeadershipStrategyDraft(form);
  const teamId = payload.teamId;

  upsertStrategyReport(payload);
  clearLeadershipDraft("strategy", teamId);

  setSyncStatus("Relatório de estratégia salvo para a comissão.");
  saveState();
  restoreLeadershipMobileSection();
  scrollLeadershipActiveSection("relatorio");
  setSyncStatus("Relatório de estratégia salvo. Você continua na aba Relatório.");
});


on("leadershipClaimForm", "submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const data = Object.fromEntries(new FormData(form));
  const disciplineIndex = Number(data.disciplineIndex);
  const entry = state.discipline[disciplineIndex];
  if (!entry || !data.reason?.trim()) return;
  const claim = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    teamId: entry.teamId,
    disciplineIndex,
    reason: data.reason.trim(),
    status: "Pendente",
    response: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  if (!Array.isArray(state.leadershipClaims)) state.leadershipClaims = [];
  state.leadershipClaims.push(claim);
  form.reset();
  const box = byId("leadershipClaimBox");
  if (box) box.hidden = true;
  setSyncStatus("Contestação enviada. A comissão organizadora irá avaliar e responder.");
  saveState();
});


on("pointsForm", "submit", (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.currentTarget));
  const existing = state.scores.find((item) => item.teamId === data.team && item.eventId === data.event);
  const payload = { teamId: data.team, eventId: data.event, points: Number(data.points), note: data.note.trim() };
  if (existing) Object.assign(existing, payload);
  else state.scores.push(payload);
  event.currentTarget.reset();
  saveState();
});

on("batchPointsForm", "submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const data = new FormData(form);
  const eventId = data.get("event");
  const category = data.get("category");
  const note = data.get("note")?.trim() || "Lançamento em lote";

  let savedAny = false;
  for (let [key, value] of data.entries()) {
    if (key.startsWith("place-") && value) {
      const points = Number(data.get(`points-${key.split("-")[1]}`));
      const teamId = value;
      const existing = state.scores.find((item) => item.teamId === teamId && item.eventId === eventId);
      const payload = { teamId, eventId, points, note };
      if (existing) Object.assign(existing, payload);
      else state.scores.push(payload);
      savedAny = true;
    }
  }
  
  if (savedAny) {
    form.reset();
    byId("pointsPlacements").innerHTML = `<div class="empty-state" style="padding: 12px;">Selecione a prova e categoria para abrir as colocações.</div>`;
    saveState();
  }
});

on("batchPointsForm", "change", (event) => {
  const form = event.currentTarget;
  if (event.target.name === "event" || event.target.name === "category") {
    const eventId = form.elements.event.value;
    const category = form.elements.category.value;
    const root = byId("pointsPlacements");
    if (!eventId || !category || !root) {
      if (root) root.innerHTML = `<div class="empty-state" style="padding: 12px;">Selecione a prova e categoria para abrir as colocações.</div>`;
      return;
    }
    
    const teams = categoryTeams(category);
    const teamOptions = `<option value="">Selecionar turma</option>` + teams.map(t => `<option value="${t.id}">${t.name}</option>`).join("");
    
    const defPoints = eventPointsByPlace(eventId);
    const numPlaces = Math.max(1, teams.length);
    const eventMax = Number(eventById(eventId)?.max || 0);
    const pointsArray = Array.from({ length: numPlaces }, (_, i) => {
      if (defPoints[i] !== undefined) return defPoints[i];
      if (defPoints.length > 0) return 0;
      if (i === 0) return eventMax;
      return 0;
    });
    
    root.innerHTML = pointsArray.map((pts, idx) => `
      <div class="placement-card">
        <label>${idx + 1}º Lugar
          <select name="place-${idx}">${teamOptions}</select>
        </label>
        <label>Pontos
          <input name="points-${idx}" type="number" step="0.5" value="${pts}">
        </label>
      </div>
    `).join("");
  }
});

on("judgeAccessForm", "submit", (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.currentTarget));
  const code = normalizeJudgeCode(data.code);
  const judge = judgeByCode(code);
  if (!judgeIsActive(judge)) {
    setSyncStatus("Código não encontrado ou desativado. Confira com a organização.");
    return;
  }
  sessionStorage.setItem("gincana-judge-code", code);
  setSyncStatus("Código aceito. Escolha a ficha pendente e envie sua avaliação.");
  const shouldWelcome = judgeCompletedCount(code) === 0 && !sessionStorage.getItem(welcomeStorageKey(code));
  renderJudgeAccess();
  if (shouldWelcome) playJudgeWelcome(judge);
});

on("evaluationForm", "change", (event) => {
  if (event.target.name === "event") {
    updateJudgeEvaluationOptions();
    renderEvaluationSheet();
  }
  if (event.target.name === "category") {
    renderEvaluationSheet();
  }
});


document.addEventListener("input", (event) => {
  const field = event.target.closest("#judgeBlockForm input");
  if (!field) return;
  const form = field.closest("#judgeBlockForm");
  const blockId = form?.dataset.blockId;
  const judgeCode = byId("evaluationForm")?.dataset.judgeCode || sessionStorage.getItem("gincana-judge-code") || "";
  if (!blockId || !judgeCode) return;

  const draft = loadBlockDraft(judgeCode, blockId);
  const teamId = field.dataset.teamId;
  const eventId = field.dataset.eventId;
  const criterionIdValue = field.dataset.criterionId;
  if (!teamId || !eventId || !criterionIdValue) return;

  if (!draft[teamId]) draft[teamId] = {};
  if (!draft[teamId][eventId]) draft[teamId][eventId] = {};
  draft[teamId][eventId][criterionIdValue] = field.value;
  saveBlockDraft(judgeCode, blockId, draft, { remote: true });

  const status = byId("judgeBlockDraftStatus");
  if (status) {
    status.textContent = canSaveOnline()
      ? `Rascunho salvo às ${new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })} e sincronizando online.`
      : `Rascunho salvo neste navegador às ${new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}.`;
  }
});

document.addEventListener("submit", async (event) => {
  const form = event.target.closest("#judgeBlockForm");
  if (!form) return;
  event.preventDefault();

  const blockId = form.dataset.blockId;
  const evalForm = byId("evaluationForm");
  const judge = judgeByCode(evalForm?.dataset.judgeCode || sessionStorage.getItem("gincana-judge-code") || "");
  const block = activeJudgingBlocks().find((item) => item.id === blockId);
  if (!judgeIsActive(judge) || !block) return;

  const draft = loadBlockDraft(judge.code, block.id);
  if (!blockReadyToSubmit(block, draft)) {
    setSyncStatus("Preencha todas as notas do bloco antes de enviar.");
    renderJudgeBlockWorkspace();
    return;
  }

  const evaluations = (block.eventIds || []).filter((eventId) => !hasJudgeEvaluation(judge.code, eventId, block.category)).map((eventId) => {
    const definition = judgingEventById(eventId);
    const scores = categoryTeams(block.category).map((item) => {
      const record = draft?.[item.id]?.[eventId] || {};
      const criteria = {};
      definition.criteria.forEach((criterion) => {
        criteria[criterion] = Number(record[criterionId(criterion)] || 0);
      });
      const entry = {
        teamId: item.id,
        criteria,
        note: String(record.note || "").trim()
      };
      entry.total = evaluationTotal(entry);
      return entry;
    });

    return {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      eventId: definition.id,
      category: block.category,
      judge: judge.name || "",
      judgeCode: normalizeJudgeCode(judge.code),
      submittedAt: new Date().toISOString(),
      sourceBlockId: block.id,
      sourceBlockName: block.name || "",
      scores: rankEvaluationScores(scores, definition)
    };
  });

  if (!evaluations.length) {
    setSyncStatus("Este bloco já foi enviado. Atualizando as pendências.");
    render();
    return;
  }

  evaluations.forEach((evaluation) => state.evaluations.push(evaluation));
  clearBlockDraft(judge.code, block.id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  render();
  setSyncStatus("Bloco enviado oficialmente. Sincronizando online...");
  for (const evaluation of evaluations) {
    await saveEvaluationRemote(evaluation);
  }
});


on("evaluationForm", "submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const data = Object.fromEntries(new FormData(form));
  const definition = judgingEventById(data.event);
  if (!definition) return;
  const judge = document.body.classList.contains("judge-page") ? judgeByCode(form.dataset.judgeCode) : null;
  if (document.body.classList.contains("judge-page")) {
    if (!judgeIsActive(judge)) {
      setSyncStatus("Código de jurado inválido. Entre novamente.");
      form.hidden = true;
      return;
    }
    const allowed = judgingAssignmentsForJudge(judge).some((item) => item.eventId === definition.id && item.category === data.category);
    if (!allowed) {
      setSyncStatus("Esta prova não está liberada para este jurado.");
      renderJudgeAccess();
      return;
    }
    if (hasJudgeEvaluation(judge.code, definition.id, data.category)) {
      setSyncStatus("Esta ficha já foi enviada por este jurado. Vou atualizar as pendências.");
      renderJudgeAccess();
      return;
    }
  }
  const scores = categoryTeams(data.category).map((item) => {
    const criteria = {};
    definition.criteria.forEach((criterion) => {
      criteria[criterion] = Number(data[`${item.id}__${criterionId(criterion)}`] || 0);
    });
    const entry = {
      teamId: item.id,
      criteria,
      note: data[`${item.id}__note`]?.trim() || ""
    };
    entry.total = evaluationTotal(entry);
    return entry;
  });
  const rankedScores = rankEvaluationScores(scores, definition);
  const evaluation = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    eventId: definition.id,
    category: data.category,
    judge: judge?.name || data.judge?.trim() || "",
    judgeCode: judge ? normalizeJudgeCode(judge.code) : "",
    submittedAt: new Date().toISOString(),
    scores: rankedScores
  };
  state.evaluations.push(evaluation);
  form.reset();
  if (judge) form.dataset.judgeCode = normalizeJudgeCode(judge.code);
  setSyncStatus("Avaliação enviada. Sincronizando online...");
  if (document.body.classList.contains("judge-page")) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    render();
    await saveEvaluationRemote(evaluation);
  } else {
    saveState();
  }
});


on("judgingBlockForm", "submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const data = new FormData(form);
  const eventIds = sortJudgingDayEventIds(data.getAll("eventIds"));
  if (!eventIds.length) {
    setSyncStatus("Escolha pelo menos uma prova para criar o bloco.");
    return;
  }
  const payload = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name: String(data.get("name") || "").trim() || "Bloco de avaliação",
    category: data.get("category") || "Categoria 1",
    eventIds,
    active: data.get("active") === "on"
  };
  state.judgingBlocks.push(payload);
  form.reset();
  const activeInput = form.elements.active;
  if (activeInput) activeInput.checked = true;
  saveState();
});


on("judgeForm", "submit", (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.currentTarget));
  const code = normalizeJudgeCode(data.code || data.name);
  if (!code) return;
  const existing = judgeByCode(code);
  const payload = {
    id: existing?.id || `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name: data.name.trim(),
    code,
    active: data.active === "on"
  };
  if (existing) Object.assign(existing, payload);
  else state.judges.push(payload);
  event.currentTarget.reset();
  const activeInput = event.currentTarget.elements.active;
  if (activeInput) activeInput.checked = true;
  saveState();
});

on("judgingDayForm", "submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const data = new FormData(form);
  const eventIds = sortJudgingDayEventIds(data.getAll("eventIds"));
  if (!eventIds.length) {
    setSyncStatus("Escolha pelo menos uma prova para criar o dia.");
    return;
  }
  state.judgingDays.push({
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name: String(data.get("name") || "").trim(),
    date: String(data.get("date") || ""),
    eventIds,
    judgeCodes: [],
    active: data.get("active") === "on"
  });
  form.reset();
  const activeInput = form.elements.active;
  if (activeInput) activeInput.checked = true;
  saveState();
});

on("scheduleForm", "submit", (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.currentTarget));
  const existing = data.editIndex !== "" ? state.schedules[Number(data.editIndex)] : null;
  const payload = {
    teamId: data.team,
    date: data.date,
    time: data.time,
    endTime: data.endTime,
    place: data.place.trim(),
    activity: data.activity.trim(),
    createdBy: existing?.createdBy || (document.body.classList.contains("rehearsals-page") ? "victoria" : "admin")
  };
  if (data.editIndex !== "") state.schedules[Number(data.editIndex)] = payload;
  else state.schedules.push(payload);
  event.currentTarget.reset();
  setScheduleEditing();
  setSyncStatus("Ensaio salvo. Sincronizando online...");
  saveState();
});

on("scheduleCancelEdit", "click", () => {
  const form = byId("scheduleForm");
  if (!form) return;
  form.reset();
  setScheduleEditing();
});

on("scheduleForm", "change", (event) => {
  if (event.target.name === "preset") {
    applySchedulePreset(event.target.value);
  }
  if (event.target.name === "activityPreset") {
    applyActivityPreset(event.target.value);
  }
});

on("participantsForm", "change", (event) => {
  if (event.target.name === "team" || event.target.name === "activity") {
    loadParticipantsIntoForm();
  }
});

on("participantsForm", "submit", (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.currentTarget));
  const payload = {
    teamId: data.team,
    activity: data.activity,
    names: normalizeParticipantNames(data.names)
  };
  state.participants = state.participants.filter((item) => item.teamId !== payload.teamId || item.activity !== payload.activity);
  if (payload.names) state.participants.push(payload);
  event.currentTarget.elements.names.value = payload.names;
  setSyncStatus("Participantes salvos. Sincronizando online...");
  saveState();
});

on("materialsForm", "submit", (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.currentTarget));
  const existing = state.materials.find((item) => item.teamId === data.team && item.material === data.material);
  const payload = {
    teamId: data.team,
    material: data.material,
    status: data.status,
    date: data.date,
    amount: data.amount.trim(),
    note: data.note.trim()
  };
  if (existing) Object.assign(existing, payload);
  else state.materials.push(payload);
  event.currentTarget.reset();
  saveState();
});

on("foodForm", "submit", (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.currentTarget));
  state.foodDonations.push({
    teamId: data.team,
    foodId: data.food,
    quantity: Number(data.quantity),
    date: data.date,
    note: data.note.trim()
  });
  event.currentTarget.reset();
  saveState();
});

on("disciplineForm", "submit", (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.currentTarget));
  const payload = {
    teamId: data.team,
    type: data.type,
    date: data.date,
    points: data.type === "Penalidade" ? Math.abs(Number(data.points || 0)) : 0,
    reason: data.reason.trim()
  };
  if (data.editIndex !== "") state.discipline[Number(data.editIndex)] = payload;
  else state.discipline.push(payload);
  event.currentTarget.reset();
  setDisciplineEditing();
  saveState();
});

on("disciplineCancelEdit", "click", () => {
  const form = byId("disciplineForm");
  if (!form) return;
  form.reset();
  setDisciplineEditing();
});

on("quickDisciplineForm", "submit", (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.currentTarget));
  const level = disciplineLevelById(data.level);
  state.discipline.push({
    teamId: data.team,
    type: "Penalidade",
    date: data.date,
    points: level.points,
    reason: data.reason.trim(),
    level: level.id,
    levelLabel: level.label,
    createdBy: document.body.classList.contains("admin-page") ? "admin" : "victoria"
  });
  event.currentTarget.reset();
  setSyncStatus("Penalidade registrada. Sincronizando online...");
  saveState();
});

on("bonusForm", "submit", (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.currentTarget));
  const payload = {
    teamId: data.team,
    date: data.date,
    points: Math.abs(Number(data.points || 0)),
    reason: data.reason.trim()
  };
  if (data.editIndex !== "") state.bonuses[Number(data.editIndex)] = payload;
  else state.bonuses.push(payload);
  event.currentTarget.reset();
  setBonusEditing();
  saveState();
});

on("bonusCancelEdit", "click", () => {
  const form = byId("bonusForm");
  if (!form) return;
  form.reset();
  setBonusEditing();
});

document.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  if (button.dataset.saveTeacherCode) {
    const index = Number(button.dataset.saveTeacherCode);
    const entries = Object.entries(teacherCodeMap());
    const oldEntry = entries[index];
    const input = document.querySelector(`input[data-teacher-code-index="${index}"]`);
    const newCode = normalizeJudgeCode(input?.value || "");
    if (oldEntry && newCode) {
      const teamId = oldEntry[1];
      const nextCodes = { ...teacherCodeMap() };
      delete nextCodes[oldEntry[0]];
      nextCodes[newCode] = teamId;
      state.teacherCodes = nextCodes;
      saveState();
    }
    return;
  }

  if (button.dataset.saveLeadershipCode) {
    const index = Number(button.dataset.saveLeadershipCode);
    const entries = Object.entries(leadershipCodeMap());
    const oldEntry = entries[index];
    const input = document.querySelector(`input[data-leadership-code-index="${index}"]`);
    const newCode = normalizeJudgeCode(input?.value || "");
    if (oldEntry && newCode) {
      const teamId = oldEntry[1];
      const nextCodes = { ...leadershipCodeMap() };
      delete nextCodes[oldEntry[0]];
      nextCodes[newCode] = teamId;
      state.leadershipCodes = nextCodes;
      saveState();
    }
    return;
  }

  if (button.dataset.viewLeadershipRequest) {
    const item = state.leadershipRequests?.[Number(button.dataset.viewLeadershipRequest)];
    if (item) {
      item.status = "Visto";
      item.updatedAt = new Date().toISOString();
      saveState();
    }
    return;
  }

  if (button.dataset.answerLeadershipRequest) {
    const item = state.leadershipRequests?.[Number(button.dataset.answerLeadershipRequest)];
    if (item) {
      const response = prompt("Resposta/observação da comissão:", item.response || "");
      if (response !== null) {
        item.response = response.trim();
        item.status = item.response ? "Respondida" : "Visto";
        item.updatedAt = new Date().toISOString();
        saveState();
      }
    }
    return;
  }

  if (button.dataset.deleteLeadershipRequest) {
    state.leadershipRequests.splice(Number(button.dataset.deleteLeadershipRequest), 1);
    saveState();
    return;
  }

  if (button.dataset.teacherMobileTab) {
    const target = button.dataset.teacherMobileTab;
    sessionStorage.setItem("gincana-teacher-mobile-section", target);
    restoreTeacherMobileSection();
    return;
  }

  if (button.dataset.deleteOwnTeacherScheduleRequest) {
    const id = button.dataset.deleteOwnTeacherScheduleRequest;
    const request = (state.scheduleRequests || []).find((item) => item.id === id);
    if (request && request.status !== "approved") {
      state.scheduleRequests = state.scheduleRequests.filter((item) => item.id !== id);
      setSyncStatus("Solicitação do professor excluída.");
      saveState();
      restoreTeacherMobileSection();
    }
    return;
  }

  if (button.dataset.approveScheduleRequest) {
    approveScheduleRequest(button.dataset.approveScheduleRequest, button.dataset.approver || "admin");
    return;
  }

  if (button.dataset.rejectScheduleRequest) {
    rejectScheduleRequest(button.dataset.rejectScheduleRequest);
    return;
  }

  if (button.dataset.leadershipMobileTab) {
    const target = button.dataset.leadershipMobileTab;
    sessionStorage.setItem("gincana-leadership-mobile-section", target);
    restoreLeadershipMobileSection();
    scrollLeadershipActiveSection(target);
    return;
  }

  if (button.dataset.deleteOwnScheduleRequest) {
    const id = button.dataset.deleteOwnScheduleRequest;
    const request = (state.scheduleRequests || []).find((item) => item.id === id);
    if (request && request.status !== "approved") {
      state.scheduleRequests = state.scheduleRequests.filter((item) => item.id !== id);
      setSyncStatus("Solicitação excluída.");
      saveState();
    }
    return;
  }

  if (button.dataset.openLeadershipClaim) {
    openLeadershipClaim(button.dataset.openLeadershipClaim);
    return;
  }

  if (button.dataset.answerLeadershipClaim) {
    const claim = state.leadershipClaims?.[Number(button.dataset.answerLeadershipClaim)];
    if (claim) {
      const response = prompt("Digite a resposta da comissão organizadora:", claim.response || "");
      if (response !== null) {
        claim.response = response.trim();
        claim.status = claim.response ? "Respondida" : (claim.status || "Pendente");
        claim.updatedAt = new Date().toISOString();
        saveState();
      }
    }
    return;
  }

  if (button.dataset.closeLeadershipClaim) {
    const claim = state.leadershipClaims?.[Number(button.dataset.closeLeadershipClaim)];
    if (claim) {
      claim.status = "Resolvida";
      claim.updatedAt = new Date().toISOString();
      saveState();
    }
    return;
  }

  if (button.dataset.deleteLeadershipClaim) {
    state.leadershipClaims.splice(Number(button.dataset.deleteLeadershipClaim), 1);
    saveState();
    return;
  }

  if (button.dataset.scheduleTab) {
    const root = byId("scheduleList");
    if (root) {
      root.dataset.activeTab = button.dataset.scheduleTab;
      renderSchedules();
      renderAdminTables();
  renderScheduleRequests();
  renderLeadershipPanel();
  restoreLeadershipMobileSection();
  renderTeacherPanel();
  restoreTeacherMobileSection();
  renderLeadershipFormsAdmin();
  renderProjectionPanel();
    }
    return;
  }

  if (button.dataset.toggleParticipants) {
    const panel = byId(button.dataset.toggleParticipants);
    if (panel) {
      const isHidden = panel.hidden;
      panel.hidden = !isHidden;
      button.textContent = isHidden ? "Ocultar participantes" : "Ver participantes";
    }
    return;
  }

  if (button.dataset.deleteScore) {
    state.scores.splice(Number(button.dataset.deleteScore), 1);
    saveState();
  }
  if (button.dataset.deleteSchedule) {
    state.schedules.splice(Number(button.dataset.deleteSchedule), 1);
    setScheduleEditing();
    saveState();
  }
  if (button.dataset.editSchedule) {
    loadScheduleIntoForm(Number(button.dataset.editSchedule));
  }
  if (button.dataset.deleteMaterial) {
    state.materials.splice(Number(button.dataset.deleteMaterial), 1);
    saveState();
  }
  if (button.dataset.deleteFood) {
    state.foodDonations.splice(Number(button.dataset.deleteFood), 1);
    saveState();
  }
  if (button.dataset.deleteDiscipline) {
    state.discipline.splice(Number(button.dataset.deleteDiscipline), 1);
    setDisciplineEditing();
    saveState();
  }
  if (button.dataset.editDiscipline) {
    loadDisciplineIntoForm(Number(button.dataset.editDiscipline));
  }
  if (button.dataset.deleteBonus) {
    state.bonuses.splice(Number(button.dataset.deleteBonus), 1);
    setBonusEditing();
    saveState();
  }
  if (button.dataset.editBonus) {
    loadBonusIntoForm(Number(button.dataset.editBonus));
  }
  if (button.dataset.deleteEvaluation) {
    state.evaluations.splice(Number(button.dataset.deleteEvaluation), 1);
    saveState();
  }
  if (button.dataset.reopenEvaluation) {
    state.evaluations.splice(Number(button.dataset.reopenEvaluation), 1);
    saveState();
  }
  if (button.dataset.toggleJudge) {
    const judge = state.judges[Number(button.dataset.toggleJudge)];
    if (judge) {
      judge.active = judge.active === false;
      saveState();
    }
  }
  if (button.dataset.deleteJudge) {
    state.judges.splice(Number(button.dataset.deleteJudge), 1);
    saveState();
  }
  if (button.dataset.toggleJudgingDay) {
    const day = state.judgingDays[Number(button.dataset.toggleJudgingDay)];
    if (day) {
      day.active = day.active === false;
      saveState();
    }
  }
  if (button.dataset.deleteJudgingDay) {
    state.judgingDays.splice(Number(button.dataset.deleteJudgingDay), 1);
    saveState();
  }
  if (button.dataset.addDayJudge) {
    const index = Number(button.dataset.addDayJudge);
    const day = state.judgingDays[index];
    const select = document.querySelector(`select[data-day-judge-select="${index}"]`);
    const code = normalizeJudgeCode(select?.value || "");
    if (day && code) {
      const codes = normalizedJudgeCodes(day.judgeCodes || []);
      if (!codes.includes(code)) day.judgeCodes = [...codes, code];
      saveState();
    }
  }
  if (button.dataset.removeDayJudge) {
    const day = state.judgingDays[Number(button.dataset.removeDayJudge)];
    const code = normalizeJudgeCode(button.dataset.judgeCode);
    if (day) {
      day.judgeCodes = normalizedJudgeCodes(day.judgeCodes || []).filter((item) => item !== code);
      saveState();
    }
  }
  if (button.dataset.selectJudgeBlock) {
    sessionStorage.setItem("gincana-selected-block", button.dataset.selectJudgeBlock);
    renderJudgeBlockWorkspace();
    return;
  }

  if (button.dataset.toggleJudgingBlock) {
    const block = state.judgingBlocks[Number(button.dataset.toggleJudgingBlock)];
    if (block) {
      block.active = block.active === false;
      saveState();
    }
  }
  if (button.dataset.deleteJudgingBlock) {
    state.judgingBlocks.splice(Number(button.dataset.deleteJudgingBlock), 1);
    saveState();
  }

  if (button.dataset.moveJudgingEvent) {
    const id = button.dataset.moveJudgingEvent;
    const direction = Number(button.dataset.direction || 0);
    const order = judgingEventOrderIds();
    const index = order.indexOf(id);
    const nextIndex = index + direction;
    if (index !== -1 && nextIndex >= 0 && nextIndex < order.length) {
      [order[index], order[nextIndex]] = [order[nextIndex], order[index]];
      state.judgingEventOrder = order;
      state.judgingDays.forEach((day) => {
        day.eventIds = sortJudgingDayEventIds(day.eventIds || []);
      });
      saveState();
    }
    return;
  }

  if (button.dataset.publishGroup) {
    const key = button.dataset.publishGroup;
    const groupEvals = state.evaluations.filter((ev) => `${ev.eventId}|${ev.category}` === key);
    if (!groupEvals.length) return;
    const definition = judgingEventById(groupEvals[0].eventId);
    if (!definition?.eventId) return;

    const scoresByTeam = {};
    groupEvals.forEach((evaluation) => {
      evaluation.launched = true;
      evaluation.scores.forEach((score) => {
        if (!scoresByTeam[score.teamId]) scoresByTeam[score.teamId] = { teamId: score.teamId, total: 0 };
        scoresByTeam[score.teamId].total += Number(score.total || 0);
      });
    });

    const aggregatedScores = Object.values(scoresByTeam);
    rankEvaluationScores(aggregatedScores, definition).forEach((score) => {
      const existing = state.scores.find((item) => item.teamId === score.teamId && item.eventId === definition.eventId);
      const payload = {
        teamId: score.teamId,
        eventId: definition.eventId,
        points: Number(score.gincanaPoints || 0),
        note: `${score.placement}º lugar • Consolidado online: ${definition.name} • ${groupEvals[0].category}`
      };
      if (existing) Object.assign(existing, payload);
      else state.scores.push(payload);
    });
    saveState();
  }
});

on("exportData", "click", () => {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "gincana-ensps-2026-dados.json";
  link.click();
  URL.revokeObjectURL(link.href);
});

on("importData", "change", async (event) => {
  const [file] = event.target.files;
  if (!file) return;
  const imported = JSON.parse(await file.text());
  state = normalizeState(imported);
  saveState();
  syncParticipantsForm();
});

on("saveGithubData", "click", () => {
  saveRemoteData();
});

on("resetData", "click", () => {
  if (!confirm("Restaurar os dados de exemplo e apagar alterações locais?")) return;
  state = structuredClone(defaultData);
  saveState();
});

async function loadRemoteData(options = {}) {
  try {
    setSyncStatus("Carregando dados online...");
    let response = await fetch(`${usesPagesApi() ? PAGES_DATA_URL : RAW_DATA_URL}?t=${Date.now()}`, { cache: "no-store" });
    if (!response.ok && usesPagesApi()) {
      response = await fetch(`${RAW_DATA_URL}?t=${Date.now()}`, { cache: "no-store" });
    }
    if (!response.ok) throw new Error(`servidor respondeu ${response.status}`);
    const payload = await response.json();
    const data = payload?.data || payload;
    state = normalizeState(data);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    render();
    syncParticipantsForm();
    setSyncStatus("Dados carregados.");
  } catch (error) {
    if (options.announce) {
      setSyncStatus(`Não foi possível carregar os dados online: ${error.message}`);
    } else {
      setSyncStatus("Usando dados salvos neste navegador. O banco online não respondeu agora.");
      render();
    }
  }
}

async function saveEvaluationRemote(evaluation) {
  if (!canSaveOnline()) {
    setSyncStatus("Avaliação salva neste navegador. Abra pelo Cloudflare Pages para salvar online.");
    return;
  }
  try {
    setSyncStatus("Enviando avaliação online...");
    const response = await fetch(dataApiUrl(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        action: "appendEvaluation",
        evaluation,
        reason: `Avaliação online: ${evaluation.judge || "Jurado"}`
      })
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || payload.ok === false) {
      throw new Error(payload.error || `servidor respondeu ${response.status}`);
    }
    if (payload.data) {
      state = normalizeState(payload.data);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      render();
    }
    setSyncStatus("Avaliação enviada online. A organização já pode acompanhar no admin.");
  } catch (error) {
    if (String(error.message || "").includes("já foi enviada")) {
      await loadRemoteData();
      setSyncStatus("Esta ficha já foi enviada por este jurado. A lista foi atualizada.");
    } else {
      setSyncStatus(`Não foi possível salvar online: ${error.message}`);
    }
  }
}

async function saveRemoteData() {
  if (!canSaveOnline()) {
    setSyncStatus("Abra a página publicada no Cloudflare Pages para salvar online.");
    return;
  }

  if (remoteSaveInProgress) {
    remoteSavePending = true;
    setSyncStatus("Já existe um salvamento em andamento. Vou salvar novamente em seguida.");
    return;
  }

  remoteSaveInProgress = true;

  try {
    setSyncStatus("Salvando dados online pelo Cloudflare...");
    const response = await fetch(dataApiUrl(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        data: mutableState(),
        reason: "Update gincana data"
      })
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || payload.ok === false) {
      throw new Error(payload.error || `servidor respondeu ${response.status}`);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    setSyncStatus("Dados salvos online. Os alunos verão a atualização ao recarregar a página.");
  } catch (error) {
    setSyncStatus(`Não foi possível salvar online: ${error.message}`);
  } finally {
    remoteSaveInProgress = false;
    if (remoteSavePending) {
      remoteSavePending = false;
      queueRemoteSave();
    }
  }
}


async function sha256Text(value = "") {
  const encoded = new TextEncoder().encode(String(value));
  const digest = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function loadAdminSecurityConfig() {
  const urls = [];
  if (usesPagesApi()) urls.push(`${PAGES_SECURITY_URL}?t=${Date.now()}`);
  urls.push(`${SECURITY_RAW_URL}?t=${Date.now()}`);

  for (const url of urls) {
    try {
      const response = await fetch(url, { cache: "no-store" });
      if (!response.ok) continue;
      const payload = await response.json();
      const hash = payload?.adminPasswordHash || payload?.security?.adminPasswordHash || "";
      if (hash) return { adminPasswordHash: hash };
    } catch (error) {
      // tenta a próxima fonte
    }
  }

  return {};
}

function setAdminAuthStatus(message = "") {
  const status = byId("adminAuthStatus");
  if (status) status.textContent = message;
}

async function protectAdminPage() {
  if (!document.body.classList.contains("admin-page")) return true;

  const gate = byId("adminAuthGate");
  const form = byId("adminAuthForm");
  const passwordInput = byId("adminPasswordInput");

  if (!gate || !form || !passwordInput) return true;

  if (sessionStorage.getItem("gincana-admin-auth-ok") === "true") {
    document.body.classList.remove("admin-locked");
    gate.hidden = true;
    return true;
  }

  document.body.classList.add("admin-locked");
  gate.hidden = false;
  passwordInput.focus();

  const security = await loadAdminSecurityConfig();
  const adminPasswordHash = security.adminPasswordHash;
  if (!adminPasswordHash) {
    setAdminAuthStatus("Senha do admin não configurada no GitHub. Verifique o arquivo data/admin-security.json.");
    return false;
  }

  setAdminAuthStatus("Digite a senha para liberar o painel administrativo.");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const typedHash = await sha256Text(passwordInput.value || "");
    if (typedHash !== adminPasswordHash) {
      passwordInput.value = "";
      passwordInput.focus();
      setAdminAuthStatus("Senha incorreta. Tente novamente.");
      return;
    }

    sessionStorage.setItem("gincana-admin-auth-ok", "true");
    gate.hidden = true;
    document.body.classList.remove("admin-locked");
    setSyncStatus("Acesso administrativo liberado.");
    render();
    setScheduleEditing();
    setDisciplineEditing();
    applyResponsiveDefaults();
    loadRemoteData();
  }, { once: false });

  return false;
}

async function initializeGincanaApp() {
  const canContinue = await protectAdminPage();
  if (!canContinue) return;

  render();
  setScheduleEditing();
  setDisciplineEditing();
  applyResponsiveDefaults();
  initializeProjectionPage();
  initializeFamilyAgendaPage();
  loadRemoteData();
}

function applyResponsiveDefaults() {
  if (!document.body.classList.contains("public-page")) return;
  const scoreboardToggle = document.querySelector("#placar .section-toggle");
  if (!scoreboardToggle) return;
  if (window.matchMedia("(max-width: 760px)").matches) {
    scoreboardToggle.removeAttribute("open");
  } else {
    scoreboardToggle.setAttribute("open", "");
  }
}

initializeGincanaApp();

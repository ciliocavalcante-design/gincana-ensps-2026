const STORAGE_KEY = "gincana-ensps-2026-v1";
const GITHUB_OWNER = "ciliocavalcante-design";
const GITHUB_REPO = "gincana-ensps-2026";
const GITHUB_BRANCH = "main";
const DATA_PATH = "data/gincana-data.json";
const RAW_DATA_URL = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${GITHUB_BRANCH}/${DATA_PATH}`;
const PAGES_DATA_URL = "/api/data";
const TEAM_ORDER = ["6", "7", "8", "9", "1", "2"];
const SCHEDULE_ACTIVITIES = [
  "Dança das Líderes de Torcida",
  "Dança dos Professores",
  "Dança Típica",
  "Story",
  "Organização"
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
let remoteSaveTimer;
let remoteSaveInProgress = false;
let remoteSavePending = false;
localStorage.removeItem("gincana-ensps-2026-github-token");

const defaultData = {
  teams: [
    { id: "6", name: "6º Ano", theme: "São João Nordestino", color: "#f97316", category: "Categoria 1", mentor: "Prof. Eduardo" },
    { id: "7", name: "7º Ano", theme: "Festa do Peão de Barretos", color: "#8b5cf6", category: "Categoria 1", mentor: "Prof. Thayna" },
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
    "Áudio da comida típica"
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
  evaluations: []
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
    evaluations: Array.isArray(saved.evaluations) ? saved.evaluations : base.evaluations
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
    evaluations: state.evaluations
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
  return usesPagesApi();
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

function hasJudgeEvaluation(code, eventId, category) {
  const normalized = normalizeJudgeCode(code);
  return state.evaluations.some((item) => (
    normalizeJudgeCode(item.judgeCode) === normalized
    && item.eventId === eventId
    && item.category === category
  ));
}

function pendingJudgingCombos(judge) {
  if (!judgeIsActive(judge)) return [];
  return JUDGING_EVENTS.flatMap((event) => judgingCategories().map((category) => ({
    eventId: event.id,
    eventName: event.name,
    category
  }))).filter((combo) => !hasJudgeEvaluation(judge.code, combo.eventId, combo.category));
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
  if (item.createdBy === "admin") return "Agendado com prof. Cílio";
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

function renderSchedules() {
  const root = byId("scheduleList");
  if (!root) return;
  const sorted = sortedScheduleEntries();
  const oldestRealized = isoDateOffset(-2);
  const manageSchedules = !document.body.classList.contains("public-page");
  const activeTab = root.dataset.activeTab || "upcoming";
  const upcomingEntries = sorted.filter(({ item }) => !scheduleIsRealized(item));
  const realizedEntries = sorted.filter(({ item }) => scheduleIsRealized(item) && item.date >= oldestRealized);

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
            const participants = participantLines(item.teamId, activity);
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
                ${!manageSchedules && participants.length ? `
                  <button class="schedule-participants-toggle" data-toggle-participants="${participantsId}" type="button">Ver participantes</button>
                  <div class="schedule-participants" id="${participantsId}" hidden>
                    <strong>Participantes</strong>
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
        ${content || `<div class="empty-state">${tabName === "realized" ? "Nenhum ensaio realizado nos dois últimos dias." : "Nenhum ensaio agendado ainda."}</div>`}
      </div>
    `;
  };

  root.dataset.activeTab = activeTab;

  if (!manageSchedules) {
    root.innerHTML = renderGroups(upcomingEntries, "upcoming");
    return;
  }

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
    const activityBlocks = SCHEDULE_ACTIVITIES.map((activity) => {
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
  root.innerHTML = teams.map((item) => `
    <article class="evaluation-team" style="--team-color:${item.color}">
      <header>
        <h3>${item.name}</h3>
        <p>${item.theme}</p>
      </header>
      <div class="evaluation-criteria">
        ${definition.criteria.map((criterion) => `
          <label>
            ${criterion}
            <input name="${item.id}__${criterionId(criterion)}" type="number" min="0" max="10" step="0.5" required>
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
  if (!form || !gate || !status) return;
  const code = sessionStorage.getItem("gincana-judge-code") || form.dataset.judgeCode || "";
  const judge = judgeByCode(code);
  if (!judgeIsActive(judge)) {
    form.hidden = true;
    form.dataset.judgeCode = "";
    status.innerHTML = state.judges.length
      ? "Digite o código recebido para acessar as fichas pendentes."
      : "Nenhum jurado cadastrado ainda. Cadastre os códigos no painel do administrador.";
    renderEvaluationSheet();
    return;
  }
  const pending = pendingJudgingCombos(judge);
  form.dataset.judgeCode = normalizeJudgeCode(judge.code);
  if (!pending.length) {
    form.hidden = true;
    status.innerHTML = `<strong>${escapeHtml(judge.name)}</strong>, todas as suas avaliações foram concluídas.`;
    renderEvaluationSheet();
    return;
  }
  form.hidden = false;
  status.innerHTML = `<strong>${escapeHtml(judge.name)}</strong> • ${pending.length} ficha${pending.length > 1 ? "s" : ""} pendente${pending.length > 1 ? "s" : ""}.`;
  updateJudgeEvaluationOptions();
  renderEvaluationSheet();
}

function updateJudgeEvaluationOptions() {
  const form = byId("evaluationForm");
  if (!form || !document.body.classList.contains("judge-page")) return;
  const judge = judgeByCode(form.dataset.judgeCode);
  const pending = pendingJudgingCombos(judge);
  const eventSelect = form.elements.event;
  const categorySelect = form.elements.category;
  if (!eventSelect || !categorySelect) return;
  const currentEvent = eventSelect.value;
  const pendingEvents = JUDGING_EVENTS.filter((event) => pending.some((item) => item.eventId === event.id));
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

function renderEvaluationResults() {
  const root = byId("evaluationResults");
  if (!root) return;
  const entries = [...state.evaluations].reverse();
  root.innerHTML = entries.length ? entries.map((evaluation, indexFromEnd) => {
    const index = state.evaluations.length - 1 - indexFromEnd;
    const definition = judgingEventById(evaluation.eventId);
    const rankedScores = rankEvaluationScores(evaluation.scores, definition);
    return `
      <article class="evaluation-result-card">
        <header>
          <span class="eyebrow">${evaluation.category}</span>
          <h3>${definition?.name || evaluation.eventId}</h3>
          <p>Jurado: ${escapeHtml(evaluation.judge || "Não informado")} • ${new Date(evaluation.submittedAt).toLocaleString("pt-BR")}</p>
        </header>
        <div class="table-wrap">
          <table>
            ${tableMarkup(
              ["Colocação", "Turma", "Pontos dos jurados", "Pontos da gincana", "Observações"],
              rankedScores.map((score) => [
                `${score.placement}º`,
                team(score.teamId)?.name || score.teamId,
                formatPoints(score.total),
                formatPoints(score.gincanaPoints),
                escapeHtml(score.note || "")
              ])
            )}
          </table>
        </div>
        <div class="settings-actions">
          ${definition?.eventId ? `<button class="button primary" data-publish-evaluation="${index}" type="button">Lançar no placar</button>` : ""}
          ${evaluation.judgeCode ? `<button class="button ghost" data-reopen-evaluation="${index}" type="button">Reabrir para este jurado</button>` : ""}
          <button class="button ghost" data-delete-evaluation="${index}" type="button">Excluir avaliação</button>
        </div>
      </article>
    `;
  }).join("") : `<div class="empty-state">Nenhuma avaliação recebida ainda.</div>`;
}

function renderAdminTables() {
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

  setHtml("scheduleTable", tableMarkup(
    ["Turma", "Data", "Início", "Fim", "Atividade", "Local", ""],
    sortedScheduleEntries().map(({ item, index }) => [
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
    ["Jurado", "Código", "Status", "Concluídas", ""],
    state.judges.map((item, index) => {
      const done = state.evaluations.filter((evaluation) => normalizeJudgeCode(evaluation.judgeCode) === normalizeJudgeCode(item.code)).length;
      const total = JUDGING_EVENTS.length * judgingCategories().length;
      return [
        escapeHtml(item.name),
        `<code>${escapeHtml(normalizeJudgeCode(item.code))}</code>`,
        item.active === false ? "Inativo" : "Ativo",
        `${done}/${total}`,
        `<button class="mini-action" data-toggle-judge="${index}" type="button">${item.active === false ? "Ativar" : "Pausar"}</button> <button class="mini-action" data-delete-judge="${index}" type="button">Excluir</button>`
      ];
    })
  ));

  setValue("dataPreview", JSON.stringify(state, null, 2));
}

function tableMarkup(headers, rows) {
  const body = rows.length
    ? rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`).join("")
    : `<tr><td colspan="${headers.length}">Nenhum registro.</td></tr>`;
  return `<thead><tr>${headers.map((item) => `<th>${item}</th>`).join("")}</tr></thead><tbody>${body}</tbody>`;
}

function fillSelects() {
  document.querySelectorAll('select[name="team"]').forEach((select) => {
    select.innerHTML = state.teams.map((item) => `<option value="${item.id}">${item.name}</option>`).join("");
  });
  document.querySelectorAll('select[name="event"]').forEach((select) => {
    select.innerHTML = state.events.map((item) => `<option value="${item.id}">${item.name}</option>`).join("");
  });
  document.querySelectorAll('#evaluationForm select[name="event"]').forEach((select) => {
    if (document.body.classList.contains("judge-page")) return;
    const current = select.value;
    select.innerHTML = JUDGING_EVENTS.map((item) => `<option value="${item.id}">${item.name}</option>`).join("");
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
    select.innerHTML = SCHEDULE_ACTIVITIES.map((item) => `<option value="${item}">${item}</option>`).join("");
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

function render() {
  fillSelects();
  renderScoreboard();
  renderEventResults();
  renderTeams();
  renderEvents();
  renderSchedules();
  renderFoodDonations();
  renderMaterials();
  renderParticipants();
  renderJudgeAccess();
  renderEvaluationSheet();
  renderEvaluationResults();
  renderDiscipline();
  renderAdminTables();
}

document.querySelectorAll(".tab-button").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".tab-button").forEach((item) => item.classList.remove("active"));
    document.querySelectorAll(".admin-panel").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    byId(button.dataset.panel)?.classList.add("active");
  });
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
  renderJudgeAccess();
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

  if (button.dataset.scheduleTab) {
    const root = byId("scheduleList");
    if (root) {
      root.dataset.activeTab = button.dataset.scheduleTab;
      renderSchedules();
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
  if (button.dataset.publishEvaluation) {
    const evaluation = state.evaluations[Number(button.dataset.publishEvaluation)];
    const definition = judgingEventById(evaluation?.eventId);
    if (evaluation && definition?.eventId) {
      rankEvaluationScores(evaluation.scores, definition).forEach((score) => {
        const existing = state.scores.find((item) => item.teamId === score.teamId && item.eventId === definition.eventId);
        const payload = {
          teamId: score.teamId,
          eventId: definition.eventId,
          points: Number(score.gincanaPoints || 0),
          note: `${score.placement}º lugar • Avaliação online: ${definition.name} • ${evaluation.category} • ${evaluation.judge || "Jurado"}`
        };
        if (existing) Object.assign(existing, payload);
        else state.scores.push(payload);
      });
      saveState();
    }
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
    const response = await fetch(PAGES_DATA_URL, {
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
    const response = await fetch(PAGES_DATA_URL, {
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

render();
setScheduleEditing();
setDisciplineEditing();
applyResponsiveDefaults();
loadRemoteData();

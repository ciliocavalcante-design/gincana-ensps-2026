const STORAGE_KEY = "gincana-ensps-2026-v1";
const GITHUB_TOKEN_KEY = "gincana-ensps-2026-github-token";
const GITHUB_OWNER = "ciliocavalcante-design";
const GITHUB_REPO = "gincana-ensps-2026";
const GITHUB_BRANCH = "main";
const DATA_PATH = "data/gincana-data.json";
const RAW_DATA_URL = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${GITHUB_BRANCH}/${DATA_PATH}`;
const CONTENTS_API_URL = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${DATA_PATH}`;
let githubSaveTimer;

const defaultData = {
  teams: [
    { id: "6", name: "6º Ano", theme: "São João Nordestino", color: "#f97316", category: "Categoria 1" },
    { id: "7", name: "7º Ano", theme: "Festa do Peão de Barretos", color: "#8b5cf6", category: "Categoria 1" },
    { id: "8", name: "8º Ano", theme: "Carnaval de Salvador", color: "#facc15", category: "Categoria 1" },
    { id: "9", name: "9º Ano", theme: "Bumba Meu Boi", color: "#16a34a", category: "Categoria 2" },
    { id: "1", name: "1º Ano", theme: "Carnaval de Recife", color: "#2563eb", category: "Categoria 2" },
    { id: "2", name: "2º Ano", theme: "Festival de Parintins", color: "#050505", category: "Categoria 2" }
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
  materials: [],
  foodDonations: [],
  discipline: []
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
    materials: Array.isArray(saved.materials) ? saved.materials.filter((item) => item.material !== "Alimentos") : base.materials,
    foodDonations: Array.isArray(saved.foodDonations) ? saved.foodDonations : base.foodDonations,
    discipline: Array.isArray(saved.discipline) ? saved.discipline : base.discipline
  };
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  render();
  if (localStorage.getItem(GITHUB_TOKEN_KEY)) {
    setSyncStatus("Alterações salvas. Sincronizando com o GitHub...");
    queueGithubSave();
  } else {
    setSyncStatus("Alterações salvas neste navegador. Para atualizar o site dos alunos, clique em Salvar no GitHub.");
  }
}

function mutableState() {
  return {
    scores: state.scores,
    schedules: state.schedules,
    materials: state.materials,
    foodDonations: state.foodDonations,
    discipline: state.discipline
  };
}

function setSyncStatus(message) {
  const status = byId("syncStatus");
  if (status) status.textContent = message;
}

function queueGithubSave() {
  clearTimeout(githubSaveTimer);
  githubSaveTimer = setTimeout(() => {
    saveGithubData();
  }, 700);
}

function byId(id) {
  return document.getElementById(id);
}

function team(id) {
  return state.teams.find((item) => item.id === id);
}

function eventById(id) {
  return state.events.find((item) => item.id === id);
}

function foodById(id) {
  return state.foodTypes.find((item) => item.id === id);
}

function totals() {
  return state.teams.map((item) => {
    const positive = state.scores
      .filter((score) => score.teamId === item.id)
      .reduce((sum, score) => sum + Number(score.points || 0), 0);
    const penalties = state.discipline
      .filter((entry) => entry.teamId === item.id && entry.type === "Penalidade")
      .reduce((sum, entry) => sum + Math.abs(Number(entry.points || 0)), 0);
    return { ...item, total: positive - penalties, penalties };
  }).sort((a, b) => b.total - a.total);
}

function renderScoreboard() {
  byId("scoreboard").innerHTML = totals().map((item, index) => `
    <article class="score-card" style="--team-color:${item.color}">
      <div class="rank">${index + 1}º</div>
      <div>
        <h3>${item.name}</h3>
        <p>${item.theme} • ${item.category}${item.penalties ? ` • -${item.penalties} em penalidades` : ""}</p>
      </div>
      <div class="score-total">${formatPoints(item.total)}</div>
    </article>
  `).join("");
}

function renderTeams() {
  byId("teamsGrid").innerHTML = state.teams.map((item) => `
    <article class="team-card" style="--team-color:${item.color}">
      <div class="team-swatch"></div>
      <div class="team-card-body">
        <h3>${item.name}</h3>
        <p>${item.theme}</p>
        <p>${item.category}</p>
      </div>
    </article>
  `).join("");
}

function renderEvents() {
  byId("eventsGrid").innerHTML = state.events.map((item, index) => {
    const color = state.teams[index % state.teams.length].color;
    return `
      <article class="event-card" style="--team-color:${color}">
        <h3>${item.name}</h3>
        <p>${item.group}</p>
        <p>Máximo: ${formatPoints(item.max)} pontos</p>
      </article>
    `;
  }).join("");
}

function renderSchedules() {
  const sorted = [...state.schedules].sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
  byId("scheduleList").innerHTML = sorted.length ? sorted.map((item) => {
    const itemTeam = team(item.teamId);
    return `
      <article class="schedule-item" style="border-left:8px solid ${itemTeam.color}">
        <h3>${itemTeam.name} • ${formatDate(item.date)} às ${item.time}</h3>
        <p>${item.activity || "Ensaio"} • ${item.place || "ENSPS"}</p>
      </article>
    `;
  }).join("") : `<div class="empty-state">Nenhum ensaio agendado ainda.</div>`;
}

function renderDiscipline() {
  const entries = [...state.discipline].reverse();
  byId("disciplineList").innerHTML = entries.length ? entries.map((item) => {
    const itemTeam = team(item.teamId);
    return `
      <article class="discipline-item" style="border-left:8px solid ${itemTeam.color}">
        <h3>${item.type} • ${itemTeam.name}</h3>
        <p>${item.reason}</p>
        <p>${item.type === "Penalidade" ? `Desconto: ${formatPoints(Math.abs(item.points || 0))} pontos` : "Sem desconto aplicado"}</p>
      </article>
    `;
  }).join("") : `<div class="empty-state">Nenhuma advertência ou penalidade registrada.</div>`;
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
  byId("foodRanking").innerHTML = ranking.map((item, index) => `
    <article class="food-rank-card" style="--team-color:${item.color}">
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
  `).join("");

  byId("foodPanel").innerHTML = state.teams.map((item) => {
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
  }).join("");
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
  byId("materialsOverview").innerHTML = state.materialTypes.map((material, index) => {
    const done = state.teams.filter((item) => materialStatus(item.id, material) === "Entregue").length;
    const partial = state.teams.filter((item) => materialStatus(item.id, material) === "Parcial").length;
    const color = state.teams[index % state.teams.length].color;
    return `
      <article class="material-summary" style="--team-color:${color}">
        <h3>${material}</h3>
        <p>${done} turmas entregues • ${partial} parciais • ${state.teams.length - done - partial} pendentes</p>
      </article>
    `;
  }).join("");

  byId("materialsList").innerHTML = state.teams.map((item) => `
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
  `).join("");
}

function renderAdminTables() {
  byId("pointsTable").innerHTML = tableMarkup(
    ["Turma", "Prova", "Pontos", "Observação", ""],
    state.scores.map((item, index) => [
      team(item.teamId)?.name || item.teamId,
      eventById(item.eventId)?.name || item.eventId,
      formatPoints(item.points),
      item.note || "",
      `<button class="mini-action" data-delete-score="${index}" type="button">Excluir</button>`
    ])
  );

  byId("scheduleTable").innerHTML = tableMarkup(
    ["Turma", "Data", "Horário", "Atividade", "Local", ""],
    state.schedules.map((item, index) => [
      team(item.teamId)?.name || item.teamId,
      formatDate(item.date),
      item.time,
      item.activity || "",
      item.place || "",
      `<button class="mini-action" data-delete-schedule="${index}" type="button">Excluir</button>`
    ])
  );

  byId("materialsTable").innerHTML = tableMarkup(
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
  );

  byId("foodTable").innerHTML = tableMarkup(
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
  );

  byId("disciplineTable").innerHTML = tableMarkup(
    ["Turma", "Tipo", "Pontos", "Motivo", ""],
    state.discipline.map((item, index) => [
      team(item.teamId)?.name || item.teamId,
      item.type,
      item.type === "Penalidade" ? `-${formatPoints(Math.abs(item.points || 0))}` : "0",
      item.reason,
      `<button class="mini-action" data-delete-discipline="${index}" type="button">Excluir</button>`
    ])
  );

  byId("dataPreview").value = JSON.stringify(state, null, 2);
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
  document.querySelectorAll('select[name="food"]').forEach((select) => {
    select.innerHTML = state.foodTypes.map((item) => `<option value="${item.id}">${item.name} • ${item.tokens} tokens</option>`).join("");
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
  renderTeams();
  renderEvents();
  renderSchedules();
  renderFoodDonations();
  renderMaterials();
  renderDiscipline();
  renderAdminTables();
}

document.querySelectorAll(".tab-button").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".tab-button").forEach((item) => item.classList.remove("active"));
    document.querySelectorAll(".admin-panel").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    byId(button.dataset.panel).classList.add("active");
  });
});

byId("pointsForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.currentTarget));
  const existing = state.scores.find((item) => item.teamId === data.team && item.eventId === data.event);
  const payload = { teamId: data.team, eventId: data.event, points: Number(data.points), note: data.note.trim() };
  if (existing) Object.assign(existing, payload);
  else state.scores.push(payload);
  event.currentTarget.reset();
  saveState();
});

byId("scheduleForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.currentTarget));
  state.schedules.push({
    teamId: data.team,
    date: data.date,
    time: data.time,
    place: data.place.trim(),
    activity: data.activity.trim()
  });
  event.currentTarget.reset();
  setSyncStatus("Ensaio salvo. Sincronizando com o GitHub...");
  saveState();
});

byId("materialsForm").addEventListener("submit", (event) => {
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

byId("foodForm").addEventListener("submit", (event) => {
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

byId("disciplineForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.currentTarget));
  state.discipline.push({
    teamId: data.team,
    type: data.type,
    points: data.type === "Penalidade" ? Math.abs(Number(data.points || 0)) : 0,
    reason: data.reason.trim()
  });
  event.currentTarget.reset();
  saveState();
});

document.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  if (button.dataset.deleteScore) {
    state.scores.splice(Number(button.dataset.deleteScore), 1);
    saveState();
  }
  if (button.dataset.deleteSchedule) {
    state.schedules.splice(Number(button.dataset.deleteSchedule), 1);
    saveState();
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
    saveState();
  }
});

byId("exportData").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "gincana-ensps-2026-dados.json";
  link.click();
  URL.revokeObjectURL(link.href);
});

byId("importData").addEventListener("change", async (event) => {
  const [file] = event.target.files;
  if (!file) return;
  const imported = JSON.parse(await file.text());
  state = normalizeState(imported);
  saveState();
});

byId("saveGithubToken").addEventListener("click", () => {
  const token = byId("githubToken").value.trim();
  if (!token) {
    setSyncStatus("Cole o token antes de guardar.");
    return;
  }
  localStorage.setItem(GITHUB_TOKEN_KEY, token);
  byId("githubToken").value = "";
  setSyncStatus("Token guardado neste navegador.");
});

byId("clearGithubToken").addEventListener("click", () => {
  localStorage.removeItem(GITHUB_TOKEN_KEY);
  byId("githubToken").value = "";
  setSyncStatus("Token removido deste navegador.");
});

byId("loadGithubData").addEventListener("click", () => {
  loadGithubData({ announce: true });
});

byId("saveGithubData").addEventListener("click", () => {
  saveGithubData();
});

byId("resetData").addEventListener("click", () => {
  if (!confirm("Restaurar os dados de exemplo e apagar alterações locais?")) return;
  state = structuredClone(defaultData);
  saveState();
});

function base64Encode(text) {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

async function loadGithubData(options = {}) {
  try {
    setSyncStatus("Carregando dados do GitHub...");
    const response = await fetch(`${RAW_DATA_URL}?t=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) throw new Error(`GitHub respondeu ${response.status}`);
    const data = await response.json();
    state = normalizeState(data);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    render();
    setSyncStatus("Dados carregados do GitHub.");
  } catch (error) {
    if (options.announce) {
      setSyncStatus(`Não foi possível carregar do GitHub: ${error.message}`);
    } else {
      setSyncStatus("Usando dados salvos neste navegador. O GitHub não respondeu agora.");
      render();
    }
  }
}

async function saveGithubData() {
  const token = localStorage.getItem(GITHUB_TOKEN_KEY);
  if (!token) {
    setSyncStatus("Informe e guarde um token do GitHub antes de salvar.");
    return;
  }

  try {
    setSyncStatus("Buscando versão atual do arquivo no GitHub...");
    const currentResponse = await fetch(`${CONTENTS_API_URL}?ref=${GITHUB_BRANCH}`, {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "X-GitHub-Api-Version": "2022-11-28"
      }
    });
    if (!currentResponse.ok) throw new Error(`não consegui ler o arquivo (${currentResponse.status})`);
    const currentFile = await currentResponse.json();
    const content = `${JSON.stringify(mutableState(), null, 2)}\n`;

    setSyncStatus("Salvando dados no GitHub...");
    const saveResponse = await fetch(CONTENTS_API_URL, {
      method: "PUT",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "X-GitHub-Api-Version": "2022-11-28"
      },
      body: JSON.stringify({
        message: "Update gincana data",
        content: base64Encode(content),
        sha: currentFile.sha,
        branch: GITHUB_BRANCH
      })
    });
    if (!saveResponse.ok) {
      const details = await saveResponse.json().catch(() => ({}));
      throw new Error(details.message || `GitHub respondeu ${saveResponse.status}`);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    setSyncStatus("Dados salvos no GitHub. Os alunos verão a atualização ao recarregar a página.");
  } catch (error) {
    setSyncStatus(`Não foi possível salvar no GitHub: ${error.message}`);
  }
}

render();
loadGithubData();

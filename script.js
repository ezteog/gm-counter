// Carrega os valores salvos (ou usa o padrão se não houver nada)
let count = Number(localStorage.getItem("gmCount")) || 0;
let lastGm = localStorage.getItem("lastGm") || null;
let streak = Number(localStorage.getItem("streak")) || 0;
let lastGmDay = localStorage.getItem("lastGmDay") || null;
let bestStreak = Number(localStorage.getItem("bestStreak")) || 0;

// Histórico dos últimos GMs (leitura segura)
let historico = [];
try {
  historico = JSON.parse(localStorage.getItem("historico") || "[]");
  if (!Array.isArray(historico)) historico = [];
} catch (e) {
  historico = [];
}

// GMs por dia, no formato { "2026-06-28": 3, ... } (leitura segura)
let gmPorDia = {};
try {
  gmPorDia = JSON.parse(localStorage.getItem("gmPorDia") || "{}");
  if (typeof gmPorDia !== "object" || gmPorDia === null || Array.isArray(gmPorDia)) gmPorDia = {};
} catch (e) {
  gmPorDia = {};
}

const countEl = document.getElementById("count");
const lastGmEl = document.getElementById("lastGm");
const streakEl = document.getElementById("streak");
const bestEl = document.getElementById("best");
const medalsEl = document.getElementById("medals");
const historicoEl = document.getElementById("historico");
const graficoEl = document.getElementById("grafico");
const button = document.getElementById("gmButton");
const resetButton = document.getElementById("resetButton");
const shareButton = document.getElementById("shareButton");

const MAX_HISTORICO = 10;
const DIAS_GRAFICO = 30;

const medalhas = [
  { limite: 10,  emoji: "🥉", nome: "10 GMs" },
  { limite: 50,  emoji: "🥈", nome: "50 GMs" },
  { limite: 100, emoji: "🥇", nome: "100 GMs" },
  { limite: 365, emoji: "🏅", nome: "365 GMs" }
];

function diaTexto(data) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return ano + "-" + mes + "-" + dia;
}

function diaDeHoje() {
  return diaTexto(new Date());
}

function diferencaEmDias(de, ate) {
  const d1 = new Date(de + "T00:00:00");
  const d2 = new Date(ate + "T00:00:00");
  const umDia = 1000 * 60 * 60 * 24;
  return Math.round((d2 - d1) / umDia);
}

function renderMedalhas() {
  if (!medalsEl) return;
  medalsEl.innerHTML = "";
  medalhas.forEach(function (m) {
    const div = document.createElement("div");
    div.className = "medalha" + (count >= m.limite ? " unlocked" : "");
    div.title = m.nome;
    const emoji = document.createElement("span");
    emoji.className = "medalha-emoji";
    emoji.textContent = m.emoji;
    const label = document.createElement("span");
    label.className = "medalha-label";
    label.textContent = m.nome;
    div.appendChild(emoji);
    div.appendChild(label);
    medalsEl.appendChild(div);
  });
}

function renderHistorico() {
  if (!historicoEl) return;
  historicoEl.innerHTML = "";
  if (historico.length === 0) {
    const vazio = document.createElement("li");
    vazio.className = "historico-vazio";
    vazio.textContent = "Nenhum GM ainda";
    historicoEl.appendChild(vazio);
    return;
  }
  historico.forEach(function (registro) {
    const li = document.createElement("li");
    const icone = document.createElement("span");
    icone.className = "historico-icone";
    icone.textContent = "☀️";
    const data = document.createElement("span");
    data.textContent = registro;
    li.appendChild(icone);
    li.appendChild(data);
    historicoEl.appendChild(li);
  });
}

// Converte a quantidade de GMs do dia num "nível" de 0 a 4 (intensidade da cor)
function nivelDoDia(qtd) {
  if (!qtd) return 0;
  if (qtd >= 8) return 4;
  if (qtd >= 4) return 3;
  if (qtd >= 2) return 2;
  return 1;
}

function renderGrafico() {
  if (!graficoEl) return;
  graficoEl.innerHTML = "";
  const hoje = new Date();
  for (let i = DIAS_GRAFICO - 1; i >= 0; i--) {
    const d = new Date(hoje);
    d.setDate(hoje.getDate() - i);
    const chave = diaTexto(d);
    const qtd = gmPorDia[chave] || 0;
    const cel = document.createElement("div");
    cel.className = "cel nivel-" + nivelDoDia(qtd);
    cel.title = chave + ": " + qtd + " GM(s)";
    graficoEl.appendChild(cel);
  }
}

// Mostra os valores salvos assim que a página abre (com segurança)
if (countEl) countEl.textContent = count;
if (streakEl) streakEl.textContent = streak;
if (bestEl) bestEl.textContent = bestStreak;
if (lastGm && lastGmEl) lastGmEl.textContent = lastGm;
renderMedalhas();
renderHistorico();
renderGrafico();

if (button) button.addEventListener("click", function () {
  const antes = count;
  count = count + 1;
  if (countEl) countEl.textContent = count;
  localStorage.setItem("gmCount", count);

  const agora = new Date();
  lastGm = agora.toLocaleString("pt-BR");
  if (lastGmEl) lastGmEl.textContent = lastGm;
  localStorage.setItem("lastGm", lastGm);

  historico.unshift(lastGm);
  if (historico.length > MAX_HISTORICO) {
    historico = historico.slice(0, MAX_HISTORICO);
  }
  localStorage.setItem("historico", JSON.stringify(historico));
  renderHistorico();

  // Soma +1 no dia de hoje (para o gráfico)
  const hoje = diaDeHoje();
  gmPorDia[hoje] = (gmPorDia[hoje] || 0) + 1;
  localStorage.setItem("gmPorDia", JSON.stringify(gmPorDia));
  renderGrafico();

  if (lastGmDay === null) {
    streak = 1;
  } else if (lastGmDay === hoje) {
    // mesmo dia: streak não muda
  } else {
    const dias = diferencaEmDias(lastGmDay, hoje);
    streak = (dias === 1) ? streak + 1 : 1;
  }
  lastGmDay = hoje;
  if (streakEl) streakEl.textContent = streak;
  localStorage.setItem("streak", streak);
  localStorage.setItem("lastGmDay", lastGmDay);

  if (streak > bestStreak) {
    bestStreak = streak;
    if (bestEl) bestEl.textContent = bestStreak;
    localStorage.setItem("bestStreak", bestStreak);
  }

  renderMedalhas();
  medalhas.forEach(function (m) {
    if (antes < m.limite && count >= m.limite) {
      setTimeout(function () {
        alert("🎉 Nova medalha desbloqueada: " + m.nome + " " + m.emoji);
      }, 100);
    }
  });
});

if (resetButton) resetButton.addEventListener("click", function () {
  const confirmar = confirm("Tem certeza que deseja zerar tudo? Isso apaga total, sequência, recorde, medalhas, histórico e gráfico.");
  if (confirmar) {
    count = 0;
    streak = 0;
    bestStreak = 0;
    lastGm = null;
    lastGmDay = null;
    historico = [];
    gmPorDia = {};

    if (countEl) countEl.textContent = count;
    if (streakEl) streakEl.textContent = streak;
    if (bestEl) bestEl.textContent = bestStreak;
    if (lastGmEl) lastGmEl.textContent = "—";

    localStorage.removeItem("gmCount");
    localStorage.removeItem("streak");
    localStorage.removeItem("bestStreak");
    localStorage.removeItem("lastGm");
    localStorage.removeItem("lastGmDay");
    localStorage.removeItem("historico");
    localStorage.removeItem("gmPorDia");

    renderMedalhas();
    renderHistorico();
    renderGrafico();
  }
});

if (shareButton) shareButton.addEventListener("click", function () {
  const texto = "Já dei GM " + count + " vezes 🟦 (sequência de " + streak + " dia(s)) — onchain good mornings!";
  if (navigator.share) {
    navigator.share({ text: texto }).catch(function () {});
  } else {
    navigator.clipboard.writeText(texto).then(function () {
      alert("Texto copiado! 🟦\n\n" + texto);
    }).catch(function () {
      alert(texto);
    });
  }
});

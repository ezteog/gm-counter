// Carrega os valores salvos (ou usa o padrão se não houver nada)
let count = Number(localStorage.getItem("gmCount")) || 0;
let lastGm = localStorage.getItem("lastGm") || null;
let streak = Number(localStorage.getItem("streak")) || 0;
let lastGmDay = localStorage.getItem("lastGmDay") || null;

const countEl = document.getElementById("count");
const lastGmEl = document.getElementById("lastGm");
const streakEl = document.getElementById("streak");
const button = document.getElementById("gmButton");
const resetButton = document.getElementById("resetButton");

countEl.textContent = count;
streakEl.textContent = streak;
if (lastGm) { lastGmEl.textContent = lastGm; }

function diaDeHoje() {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, "0");
  const dia = String(hoje.getDate()).padStart(2, "0");
  return ano + "-" + mes + "-" + dia;
}

function diferencaEmDias(de, ate) {
  const d1 = new Date(de + "T00:00:00");
  const d2 = new Date(ate + "T00:00:00");
  const umDia = 1000 * 60 * 60 * 24;
  return Math.round((d2 - d1) / umDia);
}

button.addEventListener("click", function () {
  count = count + 1;
  countEl.textContent = count;
  localStorage.setItem("gmCount", count);

  const agora = new Date();
  lastGm = agora.toLocaleString("pt-BR");
  lastGmEl.textContent = lastGm;
  localStorage.setItem("lastGm", lastGm);

  const hoje = diaDeHoje();
  if (lastGmDay === null) {
    streak = 1;
  } else if (lastGmDay === hoje) {
    // mesmo dia: streak não muda
  } else {
    const dias = diferencaEmDias(lastGmDay, hoje);
    streak = (dias === 1) ? streak + 1 : 1;
  }
  lastGmDay = hoje;
  streakEl.textContent = streak;
  localStorage.setItem("streak", streak);
  localStorage.setItem("lastGmDay", lastGmDay);
});

resetButton.addEventListener("click", function () {
  const confirmar = confirm("Tem certeza que deseja zerar o contador?");
  if (confirmar) {
    count = 0;
    countEl.textContent = count;
    localStorage.removeItem("gmCount");

    lastGm = null;
    lastGmEl.textContent = "—";
    localStorage.removeItem("lastGm");

    streak = 0;
    lastGmDay = null;
    streakEl.textContent = streak;
    localStorage.removeItem("streak");
    localStorage.removeItem("lastGmDay");
  }
});

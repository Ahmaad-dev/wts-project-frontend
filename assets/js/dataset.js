document.addEventListener("DOMContentLoaded", function () {
  // Basis-URLs
  const API_BASE =
    (window.__APP_CONFIG__ && window.__APP_CONFIG__.API_BASE) ||
    "https://ca-swe-wts-backend.happymeadow-a2b0a3fc.swedencentral.azurecontainerapps.io";

  // Maschinenname aus Dateiname ableiten
  function currentMachineName() {
    const p = window.location.pathname;
    const map = {
      "machine1.html": "Maschine1",
      "machine2.html": "Maschine2",
      "machine3.html": "Maschine3",
      "machine4.html": "Maschine4",
      "machine5.html": "Maschine5",
    };
    const key = Object.keys(map).find(k => p.includes(k));
    return key ? map[key] : null;
  }
  const MACHINE_NAME = currentMachineName();

  // Nur auf Maschinen-Seiten arbeiten
  if (!MACHINE_NAME) return;

  // Utils
  function r3(n) { return Math.round(n * 1000) / 1000; }

  // UI-Refs
  let timerInterval = null;
  const statusCircle = document.getElementById("status-circle");
  const offlineTimer = document.getElementById("offline-timer");
  const timerDisplay = document.getElementById("timer");
  const toggleIcon = document.getElementById("toggle-icon");
  const technicalInfo = document.getElementById("technical-info");

  // Toggle für technischen Bereich
  if (toggleIcon && technicalInfo) {
    const IMG_BASE = location.pathname.includes("/site/machines/") ? "../../assets/img/" : "../assets/img/";
    toggleIcon.addEventListener("click", () => {
      const hidden = technicalInfo.classList.toggle("hidden");
      toggleIcon.src = hidden ? (IMG_BASE + "pfeil-nach-rechts.png") : (IMG_BASE + "pfeil-nach-unten.png");
    });
  }

  function startOfflineTimer() {
    clearInterval(timerInterval);
    const offlineStartTime = new Date(localStorage.getItem("offlineStartTime"));
    timerInterval = setInterval(() => {
      const elapsed = Math.floor((new Date() - offlineStartTime) / 1000);
      if (timerDisplay) timerDisplay.textContent = `${elapsed} Sekunden`;
    }, 1000);
  }

  function updateStatus(online) {
    if (!statusCircle || !offlineTimer || !timerDisplay) return;
    if (online) {
      statusCircle.className = "status-circle online";
      offlineTimer.style.display = "none";
      clearInterval(timerInterval);
      localStorage.removeItem("offlineStartTime");
    } else {
      statusCircle.className = "status-circle offline";
      offlineTimer.style.display = "block";
      if (!localStorage.getItem("offlineStartTime")) {
        localStorage.setItem("offlineStartTime", new Date().toISOString());
      }
      startOfflineTimer();
    }
  }

  function renderMachineData(machine) {
    const el = document.querySelector(".machine-info");
    if (!el) return;
    el.innerHTML = `
      <li data-field="identifikation"><strong>Identifikation:</strong> ${machine.identifikation}</li>
      <li data-field="temperatur"><strong>Temperatur:</strong> ${machine.temperatur}</li>
      <li data-field="laufzeit"><strong>Durchgängige Laufzeit:</strong> ${machine.durchgängigeLaufzeit}</li>
      <li data-field="leistung"><strong>Aktuelle Motorleistung:</strong> ${machine.Motor.aktuelleLeistung}</li>
      <li data-field="betriebsminuten"><strong>Betriebsminuten gesamt:</strong> ${machine.Motor.betriebsminutenGesamt}</li>
      <li data-field="wartung"><strong>Letzte Wartung:</strong> ${machine.Motor.letzteWartung}</li>
      <li data-field="geschwindigkeit"><strong>Geschwindigkeit:</strong> ${machine.geschwindigkeit ?? ""}</li>
    `;
  }

  function renderError(msg) {
    const el = document.querySelector(".machine-info");
    if (!el) return;
    el.innerHTML = `<li><strong>Fehler:</strong> ${msg}</li>`;
  }

  let inFlight;
  function fetchData() {
    if (inFlight) inFlight.abort();
    inFlight = new AbortController();
    fetch(`${API_BASE}/api/machines/${MACHINE_NAME}`, { signal: inFlight.signal })
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(d => { updateStatus(true); renderMachineData(d); })
      .catch(() => { updateStatus(false); renderError("Die Daten konnten nicht geladen werden."); });
  }

  if (localStorage.getItem("offlineStartTime")) updateStatus(false);

  fetchData();
  setInterval(fetchData, 5000);

  // Socket.IO live
  if (typeof io !== "undefined") {
    const sock = io(API_BASE, { transports: ["websocket"] });
    sock.on("connect", () => updateStatus(true));
    sock.on("disconnect", () => updateStatus(false));
    sock.on("connect_error", () => updateStatus(false));

    sock.on("telemetry", (msg) => {
      if (msg.name !== MACHINE_NAME) return;
      const t = `${r3(msg.temperatur)}°`;
      const l = `${r3(msg.aktuelleLeistung)}%`;
      const b = `${r3(msg.betriebsminutenGesamt)} Minuten`;
      const v = `${r3(msg.geschwindigkeit)} m/s`;
      const tempEl = document.querySelector('.machine-info [data-field="temperatur"]');
      const leistEl = document.querySelector('.machine-info [data-field="leistung"]');
      const betrEl = document.querySelector('.machine-info [data-field="betriebsminuten"]');
      const speedEl = document.querySelector('.machine-info [data-field="geschwindigkeit"]');
      if (tempEl) tempEl.innerHTML = `<strong>Temperatur:</strong> ${t}`;
      if (leistEl) leistEl.innerHTML = `<strong>Aktuelle Motorleistung:</strong> ${l}`;
      if (betrEl) betrEl.innerHTML = `<strong>Betriebsminuten gesamt:</strong> ${b}`;
      if (speedEl) speedEl.innerHTML = `<strong>Geschwindigkeit:</strong> ${v}`;
    });
  }
});

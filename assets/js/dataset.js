document.addEventListener("DOMContentLoaded", function () {
  // ======== Basis/Config ========
  const API_BASE =
    (window.__APP_CONFIG__ && window.__APP_CONFIG__.API_BASE) ||
    "https://ca-swe-wts-backend.happymeadow-a2b0a3fc.swedencentral.azurecontainerapps.io";

  // von wo werden Bilder geladen?
  const IMG_BASE = location.pathname.includes("/site/machines/")
    ? "../../assets/img/"
    : "../assets/img/";

  function r3(n) { return Math.round(n * 1000) / 1000 }

  // ======== Dark Mode ========
  (function initDarkMode() {
    const btn = document.getElementById("modie-button");
    const body = document.body;
    const saved = localStorage.getItem("theme");
    if (saved) {
      body.classList.add(saved);
      if (btn) btn.textContent = saved === "light-gray-mode" ? "Day Mode" : "Night Mode";
    } else {
      if (btn) btn.textContent = "Night Mode";
    }
    if (btn) {
      btn.addEventListener("click", () => {
        const isLight = body.classList.toggle("light-gray-mode");
        localStorage.setItem("theme", isLight ? "light-gray-mode" : "");
        btn.textContent = isLight ? "Day Mode" : "Night Mode";
      });
    }
  })();

  // ======== API Helpers ========
  async function apiGet(path) {
    const res = await fetch(`${API_BASE}${path}`);
    if (!res.ok) throw new Error(`GET ${path} -> ${res.status}`);
    return res.json();
  }

  // ======== Seite erkennen ========
  function currentMachineName() {
    // Mappe Dateiname -> Maschinenname (für Detailseiten)
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

  // ======== HOMEPAGE: Stationen dynamisch rendern ========
  async function renderStationsHome() {
    // Container suchen – wir unterstützen beide Varianten
    const grid = document.querySelector("#stations-grid") || document.querySelector(".station-container");
    if (!grid) return; // keine Übersicht auf dieser Seite

    let stationsData;
    try {
      // bevorzugt echte Stations-API
      stationsData = await apiGet("/api/stations"); // { stations: [...] }
    } catch {
      // Fallback: aus Maschinennamen "Pseudo-Stationen" machen
      const names = await apiGet("/api/machines/names"); // { names: [...] }
      stationsData = {
        stations: names.names.map(n => ({ name: n, type: null, machines: [n] }))
      };
    }

    function imageForStation(st) {
      const first = (st.machines && st.machines[0]) || "";
      const num = (first.match(/\d+/) || [null])[0];
      if (num) return `${IMG_BASE}machine${num}.png`;
      return `${IMG_BASE}production.png`;
    }

    function machineNameToFile(n) {
      const num = (String(n).match(/\d+/) || [null])[0];
      return num ? `machines/machine${num}.html` : `machines/machine1.html`;
    }

    grid.innerHTML = stationsData.stations.map(st => {
      const title = st.name || "Station";
      const sub = st.type ? ` (${st.type})` : "";
      const img = imageForStation(st);
      const firstMachine = (st.machines && st.machines[0]) || "Maschine1";
      const link = machineNameToFile(firstMachine);
      const count = (st.machines || []).length;
      return `
        <div class="station-box">
          <h3>${title}${sub}</h3>
          <img src="${img}" alt="${title}" class="station-preview-image">
          <h4>${count} Maschine${count === 1 ? "" : "n"}</h4>
          <p><a href="${link}">Öffnen</a></p>
        </div>
      `;
    }).join("");

    // Mittlere Spalte: Liste der Stationen (falls vorhanden)
    const listWrap = document.getElementById("station-list");
    const descWrap = document.getElementById("station-description");
    if (listWrap) {
      listWrap.innerHTML = `<h3>Stationen</h3>` + stationsData.stations.map(st => `
        <p class="station" data-st="${st.name}">${st.name}${st.type ? ` (${st.type})` : ""}</p>
      `).join("");

      listWrap.querySelectorAll(".station").forEach(el => {
        el.style.cursor = "pointer";
        el.addEventListener("click", () => {
          const st = stationsData.stations.find(s => s.name === el.dataset.st);
          if (descWrap && st) {
            descWrap.innerHTML = `
              <p><strong>Name:</strong> ${st.name}</p>
              ${st.type ? `<p><strong>Typ:</strong> ${st.type}</p>` : ""}
              <p><strong>Maschinen:</strong> ${(st.machines || []).join(", ") || "-"}</p>
            `;
          }
        });
      });
    }
  }

  // ======== MASCHINEN-SEITE: Daten & Live-Updates ========
  function initMachineDetail() {
    let timerInterval = null; // Offline-Timer
    const statusCircle = document.getElementById("status-circle");
    const offlineTimer = document.getElementById("offline-timer");
    const timerDisplay = document.getElementById("timer");
    const toggleIcon = document.getElementById("toggle-icon");
    const technicalInfo = document.getElementById("technical-info");

    // Toggle technische Infos
    if (toggleIcon && technicalInfo) {
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

    function renderError(message) {
      const el = document.querySelector(".machine-info");
      if (!el) return;
      el.innerHTML = `<li><strong>Fehler:</strong> ${message}</li>`;
    }

    let inFlight; // AbortController
    function fetchData() {
      if (inFlight) inFlight.abort();
      inFlight = new AbortController();
      fetch(`${API_BASE}/api/machines/${MACHINE_NAME}`, { signal: inFlight.signal })
        .then(r => { if (!r.ok) throw new Error(); return r.json(); })
        .then(data => { updateStatus(true); renderMachineData(data); })
        .catch(() => { updateStatus(false); renderError("Die Daten konnten nicht geladen werden."); });
    }

    // Initial ggf. Offline-Timer fortsetzen
    if (localStorage.getItem("offlineStartTime")) updateStatus(false);

    // Polling
    fetchData();
    setInterval(fetchData, 5000);

    // Live via Socket.IO (falls eingebunden)
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
  }

  // ======== Einstieg je nach Seite ========
  if (MACHINE_NAME) {
    // Detailseite
    initMachineDetail();

    // OPTIONAL: Überschrift aus DB (wenn du im HTML z.B. <h1 id="page-title">…</h1> hast)
    // apiGet(`/api/machines/${encodeURIComponent(MACHINE_NAME)}`).then(d => {
    //   const h = document.getElementById("page-title");
    //   if (h && d && d.identifikation) h.textContent = `${MACHINE_NAME} • ${d.identifikation}`;
    // }).catch(() => {});
  } else {
    // Homepage
    renderStationsHome();
  }
});

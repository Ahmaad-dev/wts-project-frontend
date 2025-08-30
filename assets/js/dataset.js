document.addEventListener("DOMContentLoaded", function () {
  // ======== Basis/Config ========
  const API_BASE =
    (window.__APP_CONFIG__ && window.__APP_CONFIG__.API_BASE) ||
    "https://ca-swe-wts-backend.happymeadow-a2b0a3fc.swedencentral.azurecontainerapps.io";

  // Bildpfade relativ zur Seite
  const IMG_BASE = location.pathname.includes("/site/machines/")
    ? "../../assets/img/"
    : "../assets/img/";

  function r3(n){ return Math.round(n*1000)/1000 }

  // ======== Dark Mode ========
  (function initDarkMode(){
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

  // ======== Seite erkennen ========
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

  // ======== HOMEPAGE: exakt deine frühere Darstellung (statisch) ========
  // Reihenfolge & Texte wie früher:
  const CATALOG = [
    {
      station: "Alpha",
      machineKey: "Maschine1",
      machineLabel: "Montagemaschine",
      desc: "Präzise Montage komplexer Bauteile mit robotischen Armen",
      img: "machine1.png"
    },
    {
      station: "Beta",
      machineKey: "Maschine2",
      machineLabel: "Qualitätskontrollmaschine",
      desc: "Echtzeitprüfung mit Kameras und hochmodernen Scannern",
      img: "machine2.png"
    },
    {
      station: "Gamma",
      machineKey: "Maschine3",
      machineLabel: "Etikettiermaschine",
      desc: "Effizientes und präzises Etikettieren von Produkten und Verpackungen",
      img: "machine3.png"
    },
    {
      station: "Delta",
      machineKey: "Maschine4",
      machineLabel: "Verpackungsmaschine",
      desc: "Sicheres Versiegeln und Verpacken von Produkten jeder Art",
      img: "machine4.png"
    },
    {
      station: "Epsilon",
      machineKey: "Maschine5",
      machineLabel: "Diagnosemaschine",
      desc: "Diagnose und Reparatur von Produktionsmaschinen in Echtzeit",
      img: "machine5.png"
    }
  ];

  function machineFile(machineKey) {
    const num = (String(machineKey).match(/\d+/) || [null])[0];
    return num ? `machines/machine${num}.html` : `machines/machine1.html`;
  }

  async function renderStationsHome() {
    const grid = document.querySelector("#stations-grid") || document.querySelector(".station-container");
    if (!grid) return;

    // Karten genau wie vorher: Titel, Maschinename, Beschreibung, Link (Text = Maschinename)
    grid.innerHTML = CATALOG.map(s => `
      <div class="station-box">
        <h3>Station ${s.station}</h3>
        <img src="${IMG_BASE + s.img}" alt="${s.machineLabel}" class="station-preview-image">
        <h4>${s.machineLabel}</h4>
        <h4>${s.desc}</h4>
        <p><a href="${machineFile(s.machineKey)}">${s.machineLabel}</a></p>
      </div>
    `).join("");

    // Mittlere Spalte: Überschrift "Beispiele" + „Station Alpha …”
    const listWrap = document.getElementById("station-list");
    const descWrap = document.getElementById("station-description");
    if (listWrap) {
      listWrap.innerHTML = `<h3>Beispiele</h3>` + CATALOG.map(s =>
        `<p class="station" data-st="${s.station}">Station ${s.station}</p>`
      ).join("");

      listWrap.querySelectorAll(".station").forEach(el => {
        el.style.cursor = "pointer";
        el.addEventListener("click", () => {
          const st = CATALOG.find(x => x.station === el.dataset.st);
          if (descWrap && st) {
            descWrap.innerHTML = `
              <p><strong>Station:</strong> ${st.station}</p>
              <p><strong>Maschine:</strong> ${st.machineLabel}</p>
              <p><strong>Beschreibung:</strong> ${st.desc}</p>
            `;
          }
        });
      });
    }
  }

  // ======== MASCHINEN-SEITE: Daten & Live-Updates (unverändert) ========
  function initMachineDetail(){
    let timerInterval = null;
    const statusCircle = document.getElementById("status-circle");
    const offlineTimer = document.getElementById("offline-timer");
    const timerDisplay = document.getElementById("timer");
    const toggleIcon = document.getElementById("toggle-icon");
    const technicalInfo = document.getElementById("technical-info");

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

  // ======== Einstieg ========
  if (MACHINE_NAME) {
    // Detailseite
    initMachineDetail();
  } else {
    // Homepage
    renderStationsHome();
  }
});

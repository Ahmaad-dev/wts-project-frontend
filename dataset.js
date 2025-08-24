document.addEventListener("DOMContentLoaded", function () {
    let timerInterval = null // Intervall-Variable für den Offline-Timer
    const statusCircle = document.getElementById("status-circle")
    const offlineTimer = document.getElementById("offline-timer")
    const timerDisplay = document.getElementById("timer")
    const toggleIcon = document.getElementById("toggle-icon")
    const technicalInfo = document.getElementById("technical-info")
    const themeButton = document.getElementById("modie-button")
    const body = document.body // nötig für den Dark-Mode

    // API-Basis & Socket-URL 
    const API_BASE = "https://ca-swe-wts-backend.mangobeach-4790a7f9.swedencentral.azurecontainerapps.io";
    const SOCKET_URL = API_BASE;

    function r3(n){ return Math.round(n*1000)/1000 }

    // Ermittelt die aktuelle Maschine anhand der Seite (früh, weil wir gleich darauf prüfen) ---
    function currentMachineName() {
        const currentPage = window.location.pathname
        const map = {
            "machine1.html": "Maschine1",
            "machine2.html": "Maschine2",
            "machine3.html": "Maschine3",
            "machine4.html": "Maschine4",
            "machine5.html": "Maschine5"
        }
        const key = Object.keys(map).find(k => currentPage.includes(k))
        return key ? map[key] : null
    }
    const MACHINE_NAME = currentMachineName();

    // Gemeinsamer Dark-Mode-Block (Homepage + Maschinen-Seiten) ---
    (function initDarkMode(){
        const savedTheme = localStorage.getItem("theme")
        if (savedTheme) {
            body.classList.add(savedTheme)
            if (themeButton) themeButton.textContent = savedTheme === "light-gray-mode" ? "Day Mode" : "Night Mode"
        } else {
            if (themeButton) themeButton.textContent = "Night Mode"
        }
        if (themeButton) {
            themeButton.addEventListener("click", function () {
                const isLight = body.classList.toggle("light-gray-mode")
                localStorage.setItem("theme", isLight ? "light-gray-mode" : "")
                themeButton.textContent = isLight ? "Day Mode" : "Night Mode"
            })
        }
    })();

    //  Wenn KEINE Maschinen-Seite: hier sauber beenden (nur Dark-Mode aktiv auf Homepage) ---
    if (!MACHINE_NAME) {
        return; // Keine Maschine -> kein Polling, keine Sockets, keine Status-Ampel
    }

    // Toggle-Funktion für technische Informationen
    if (toggleIcon && technicalInfo) {
        toggleIcon.addEventListener("click", function () {
            if (technicalInfo.classList.contains("hidden")) {
                technicalInfo.classList.remove("hidden")
                toggleIcon.src = "pfeil-nach-unten.png"
            } else {
                technicalInfo.classList.add("hidden")
                toggleIcon.src = "pfeil-nach-rechts.png"
            }
        })
    }

    // Online-/Offline-Status + Timer
    function updateStatus(online) {
        // Absicherung: Seite muss die Elemente besitzen
        if (!statusCircle || !offlineTimer || !timerDisplay) return
        if (online) {
            statusCircle.className = "status-circle online"
            offlineTimer.style.display = "none"
            clearInterval(timerInterval)
            localStorage.removeItem("offlineStartTime")
        } else {
            statusCircle.className = "status-circle offline"
            offlineTimer.style.display = "block"
            if (!localStorage.getItem("offlineStartTime")) {
                localStorage.setItem("offlineStartTime", new Date().toISOString())
            }
            startOfflineTimer()
        }
    }

    function startOfflineTimer() {
        clearInterval(timerInterval)
        const offlineStartTime = new Date(localStorage.getItem("offlineStartTime"))
        timerInterval = setInterval(() => {
            const elapsed = Math.floor((new Date() - offlineStartTime) / 1000)
            timerDisplay.textContent = `${elapsed} Sekunden`
        }, 1000)
    }

    // Rendert die Maschine
    function renderMachineData(machine) {
        const el = document.querySelector(".machine-info")
        if (!el) return
        el.innerHTML = `
            <li data-field="identifikation"><strong>Identifikation:</strong> ${machine.identifikation}</li>
            <li data-field="temperatur"><strong>Temperatur:</strong> ${machine.temperatur}</li>
            <li data-field="laufzeit"><strong>Durchgängige Laufzeit:</strong> ${machine.durchgängigeLaufzeit}</li>
            <li data-field="leistung"><strong>Aktuelle Motorleistung:</strong> ${machine.Motor.aktuelleLeistung}</li>
            <li data-field="betriebsminuten"><strong>Betriebsminuten gesamt:</strong> ${machine.Motor.betriebsminutenGesamt}</li>
            <li data-field="wartung"><strong>Letzte Wartung:</strong> ${machine.Motor.letzteWartung}</li>
            <li data-field="geschwindigkeit"><strong>Geschwindigkeit:</strong> ${machine.geschwindigkeit ?? ""}</li>
        `
    }

    // Fehlerausgabe
    function renderError(message) {
        const el = document.querySelector(".machine-info")
        if (!el) return
        el.innerHTML = `<li><strong>Fehler:</strong> ${message}</li>`
    }

    // Verhindern überlappende Requests bei langsamem Netz
    let inFlight // AbortController
    function fetchData() {
        // Läuft noch ein Request? → abbrechen
        if (inFlight) inFlight.abort()
        inFlight = new AbortController()

        fetch(`${API_BASE}/api/machines/${MACHINE_NAME}`, { signal: inFlight.signal })
            .then((r) => { if (!r.ok) throw new Error(); return r.json() })
            .then((machine) => {
                updateStatus(true)
                renderMachineData(machine)
            })
            .catch(() => {
                updateStatus(false)
                renderError("Die Daten konnten nicht geladen werden.")
            })
    }

    // Initial: Offline-Timer fortsetzen
    if (localStorage.getItem("offlineStartTime")) {
        updateStatus(false)
    }

    // Polling
    fetchData()
    setInterval(fetchData, 5000)

    // WebSocket (nur wenn Socket.IO geladen ist)
    if (typeof io !== "undefined") {
        const sock = io(SOCKET_URL, { transports: ["websocket"] })

        // Socket-Status direkt an die Ampel koppeln
        sock.on("connect", () => updateStatus(true))
        sock.on("disconnect", () => updateStatus(false))
        sock.on("connect_error", () => updateStatus(false))

        // Live-Updates
        sock.on("telemetry", (msg) => {
            if (msg.name !== MACHINE_NAME) return
            const t = `${r3(msg.temperatur)}°`
            const l = `${r3(msg.aktuelleLeistung)}%`
            const b = `${r3(msg.betriebsminutenGesamt)} Minuten`
            const v = `${r3(msg.geschwindigkeit)} m/s`
            const tempEl = document.querySelector('.machine-info [data-field="temperatur"]')
            const leistEl = document.querySelector('.machine-info [data-field="leistung"]')
            const betrEl = document.querySelector('.machine-info [data-field="betriebsminuten"]')
            const speedEl = document.querySelector('.machine-info [data-field="geschwindigkeit"]')
            if (tempEl) tempEl.innerHTML = `<strong>Temperatur:</strong> ${t}`
            if (leistEl) leistEl.innerHTML = `<strong>Aktuelle Motorleistung:</strong> ${l}`
            if (betrEl) betrEl.innerHTML = `<strong>Betriebsminuten gesamt:</strong> ${b}`
            if (speedEl) speedEl.innerHTML = `<strong>Geschwindigkeit:</strong> ${v}`
        })
    }
})

document.addEventListener("DOMContentLoaded", function () {
    let timerInterval = null; // Intervall-Variable für den Offline-Timer

    const statusCircle = document.getElementById("status-circle");
    const offlineTimer = document.getElementById("offline-timer");
    const timerDisplay = document.getElementById("timer");

    // Toggle-Funktion für technische Informationen
    const toggleIcon = document.getElementById("toggle-icon");
    const technicalInfo = document.getElementById("technical-info");

    if (toggleIcon && technicalInfo) {
        toggleIcon.addEventListener("click", function () {
            if (technicalInfo.classList.contains("hidden")) {
                // Bereich einblenden
                technicalInfo.classList.remove("hidden");
                toggleIcon.src = "pfeil-nach-unten.png"; // Wechselt zu Pfeil nach unten
            } else {
                // Bereich ausblenden
                technicalInfo.classList.add("hidden");
                toggleIcon.src = "pfeil-nach-rechts.png"; // Wechselt zu Pfeil nach rechts
            }
        });
    }

    // Funktionalität für Online-/Offline-Status und Timer bleibt gleich...
    function updateStatus(online) {
        if (online) {
            statusCircle.className = "status-circle online";
            offlineTimer.style.display = "none";
            clearInterval(timerInterval);
            localStorage.removeItem("offlineStartTime"); // Offline-Zeit löschen
        } else {
            statusCircle.className = "status-circle offline";
            offlineTimer.style.display = "block";
            if (!localStorage.getItem("offlineStartTime")) {
                localStorage.setItem("offlineStartTime", new Date().toISOString());
            }
            startOfflineTimer();
        }
    }

    function startOfflineTimer() {
        clearInterval(timerInterval); // Verhindere doppelte Timer
        const offlineStartTime = new Date(localStorage.getItem("offlineStartTime"));
        timerInterval = setInterval(() => {
            const elapsed = Math.floor((new Date() - offlineStartTime) / 1000);
            timerDisplay.textContent = `${elapsed} Sekunden`;
        }, 1000);
    }

    function fetchData() {
        fetch("https://atp.fhstp.ac.at/machines")
            .then((response) => {
                if (!response.ok) throw new Error("Fehler beim Abrufen der Daten");
                return response.json();
            })
            .then((data) => {
                updateStatus(true); // Verbindung ist online
                const currentPage = window.location.pathname;
                const machineMapping = {
                    "machine1.html": data.Maschine1,
                    "machine2.html": data.Maschine2,
                    "machine3.html": data.Maschine3,
                    "machine4.html": data.Maschine4,
                    "machine5.html": data.Maschine5,
                };

                const machineKey = Object.keys(machineMapping).find((key) =>
                    currentPage.includes(key)
                );
                const machineData = machineMapping[machineKey];
                machineData ? renderMachineData(machineData) : renderError("Keine Daten verfügbar.");
            })
            .catch(() => {
                updateStatus(false); // Verbindung ist offline
                renderError("Die Daten konnten nicht geladen werden.");
            });
    }

    function renderMachineData(machine) {
        document.querySelector(".machine-info").innerHTML = `
            <li><strong>Identifikation:</strong> ${machine.identifikation}</li>
            <li><strong>Temperatur:</strong> ${machine.temperatur}</li>
            <li><strong>Durchgängige Laufzeit:</strong> ${machine.durchgängigeLaufzeit}</li>
            <li><strong>Aktuelle Motorleistung:</strong> ${machine.Motor.aktuelleLeistung}</li>
            <li><strong>Betriebsminuten gesamt:</strong> ${machine.Motor.betriebsminutenGesamt}</li>
            <li><strong>Letzte Wartung:</strong> ${machine.Motor.letzteWartung}</li>
        `;
    }

    function renderError(message) {
        document.querySelector(".machine-info").innerHTML = `
            <li><strong>Fehler:</strong> ${message}</li>
        `;
    }

    // Wiederherstellen des Timers bei Laden der Seite
    if (localStorage.getItem("offlineStartTime")) {
        updateStatus(false);
    }

    // Daten abrufen und regelmäßige Prüfung
    fetchData();
    setInterval(fetchData, 5000); // Alle 5 Sekunden erneut abrufen
});

/*newwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww*/
document.addEventListener("DOMContentLoaded", function () {
    const themeButton = document.getElementById("modie-button");
    const body = document.body;

    // Prüfen, ob ein gespeichertes Theme vorhanden ist
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
        body.classList.add(savedTheme); // Das gespeicherte Theme !!
        themeButton.textContent = savedTheme === "light-gray-mode" ? "Day Mode" : "Night Mode";
    }

    // Theme wechseln und in localStorage speichern
    themeButton.addEventListener("click", function () {
        if (body.classList.contains("light-gray-mode")) {
            body.classList.remove("light-gray-mode");
            localStorage.setItem("theme", ""); // --> Theme zurücksetzen
            themeButton.textContent = "Night Mode";
        } else {
            body.classList.add("light-gray-mode");
            localStorage.setItem("theme", "light-gray-mode"); // --> Theme speichern
            themeButton.textContent = "Day Mode";
        }
    });
});

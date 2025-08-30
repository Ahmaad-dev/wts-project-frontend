// Stationsdaten (Name + Bilddatei)
const stations = [
  { name: "Station Alpha", image: "machine1.png" },
  { name: "Station Beta",  image: "machine2.png" },
  { name: "Station Gamma", image: "machine3.png" },
  { name: "Station Delta", image: "machine4.png" },
  { name: "Station Epsilon", image: "machine5.png" },
];

// Bildbasis relativ zu /site/base.html
const IMG_BASE = "../assets/img/";

let currentStationIndex = 0; 

function changeStation(){
  currentStationIndex = (currentStationIndex + 1) % stations.length;
  const s = stations[currentStationIndex];
  const nameEl = document.getElementById("station-name");
  const imgEl  = document.getElementById("station-image");
  if (nameEl) nameEl.textContent = s.name;
  if (imgEl)  imgEl.src = IMG_BASE + s.image;
}

// Stationsbeschreibung
const stationDescriptions = {
    "Station Alpha": "Montagemaschine\nDiese Maschine ist speziell für die präzise Montage von Komponenten konzipiert. Mit mehreren robotischen Armen und einer Vielzahl von Werkzeugen kann sie komplexe Teile schnell und effizient zusammensetzen. Ein integriertes Steuerungssystem ermöglicht die Anpassung an unterschiedliche Produktionsanforderungen.",
    "Station Beta": "Qualitätskontrollmaschine\nDie Qualitätskontrollmaschine überprüft Produkte auf Fehler oder Abweichungen. Sie ist mit hochmodernen Sensoren, Kameras und Scannern ausgestattet, die genaue Inspektionen in Echtzeit durchführen. Ein digitales Interface zeigt die Ergebnisse sofort an, um schnelle Korrekturmaßnahmen zu ermöglichen.",
    "Station Gamma": "Etikettiermaschine\nDiese Maschine übernimmt das Aufbringen von Etiketten auf Produkte oder Verpackungen. Mit einem präzisen Druckmechanismus und einem reibungslosen Förderbandsystem sorgt sie für gleichmäßige und korrekte Kennzeichnungen. Sie unterstützt verschiedene Formate und Etikettenarten.",
    "Station Delta": "Verpackungsmaschine\nDie Verpackungsmaschine ist für das sichere und effiziente Verpacken von Produkten verantwortlich. Sie verfügt über einen Versiegelungsmechanismus und Werkzeuge zum Umwickeln und Verschließen von Kartons oder anderen Behältern. Ihre benutzerfreundliche Bedienoberfläche ermöglicht eine einfache Anpassung an unterschiedliche Verpackungstypen.",
    "Station Epsilon": "Wartungsmaschine\nDie Wartungsmaschine ist mit Diagnosetools und Roboterarmen ausgestattet, um Maschinen in der Produktion zu überwachen und zu reparieren. Sie bietet Echtzeitberichte über den Zustand der Maschinen und führt präventive Wartungsmaßnahmen durch, um Stillstandszeiten zu minimieren."
};

// Funktion zur Suche nach einer Maschine
function searchMachine() {
    const input = document.getElementById("machine-name").value.trim();
    const descriptionDiv = document.getElementById("station-description");
    const stationList = document.querySelectorAll("#station-list .station");

    // Setzen alle Stationen auf grau zurück
    stationList.forEach(station => {
        station.classList.remove("highlight");
    });

    // die passende Beschreibung, wenn der Name übereinstimmt
    if (stationDescriptions[input]) {
        descriptionDiv.textContent = stationDescriptions[input];
        const station = Array.from(stationList).find(station => station.textContent === input);
        if (station) station.classList.add("highlight");
    } else {
        descriptionDiv.textContent = "";
    }
}

// Eventlistener für die Eingabe
document.getElementById("machine-name").addEventListener("input", searchMachine);



// Verfügbare und nicht verfügbare IDs
const availableIDs = ["UG39BE-47H8UJ", "ZDSJ88-112HH", "4558N-ZZLOP"];
const unavailableIDs = ["DFFBN-99148", "Z7ZU8-NNJK1"];

// Überprüfung der ID
function checkMachineID() {
    const inputID = document.getElementById("machine-id").value.trim();
    const result = document.getElementById("id-check-result");

    if (availableIDs.includes(inputID)) {
        result.textContent = "Die Maschine mit der ID ist verfügbar.";
        result.className = "success";
    } else if (unavailableIDs.includes(inputID)) {
        result.textContent = "Die Maschine mit der ID ist nicht verfügbar.";
        result.className = "warning";
    } else {
        result.textContent = "Die eingegebene ID ist ungültig.";
        result.className = "error";
    }
}

// Eventlistener für den Button
document.getElementById("check-id-button").addEventListener("click", checkMachineID);



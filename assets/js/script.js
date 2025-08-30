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

// ---- Stationsbeschreibung (Mitte) ----
const STATION_EXAMPLES = [
  { name: "Station Alpha",  desc: "Präzise Montage komplexer Bauteile mit robotischen Armen." },
  { name: "Station Beta",   desc: "Echtzeitprüfung mit Kameras und hochmodernen Scannern." },
  { name: "Station Gamma",  desc: "Effizientes und präzises Etikettieren von Produkten und Verpackungen." },
  { name: "Station Delta",  desc: "Sicheres Versiegeln und Verpacken von Produkten jeder Art." },
  { name: "Station Epsilon",desc: "Diagnose und Reparatur von Produktionsmaschinen in Echtzeit." },
];

function highlightStation(name){
  const list = document.getElementById("station-list");
  if (!list) return;
  list.querySelectorAll(".station").forEach(p => {
    p.classList.toggle("highlight", p.textContent.trim().toLowerCase() === String(name||"").trim().toLowerCase());
  });
}

function showStationDescription(name){
  const box = document.getElementById("station-description");
  if (!box) return;
  const s = STATION_EXAMPLES.find(x => x.name.toLowerCase() === String(name||"").toLowerCase());
  box.textContent = s ? s.desc : "";
  highlightStation(name);
}

document.addEventListener("DOMContentLoaded", () => {
  // Eingabefeld -> Beschreibung updaten
  const input = document.getElementById("machine-name");
  if (input){
    input.addEventListener("input", () => showStationDescription(input.value));
  }

  // Klickbare Beispiel-Liste
  const list = document.getElementById("station-list");
  if (list){
    list.querySelectorAll(".station").forEach(p => {
      p.addEventListener("click", () => {
        const name = p.textContent.trim();
        const inputEl = document.getElementById("machine-name");
        if (inputEl) inputEl.value = name;
        showStationDescription(name);
      });
    });
  }

  // ID-Check (links)
  const unavailableIDs = ["12345","54321","99999"];
  const existingIDs    = ["22222","33333","44444","77777"];
  const result = document.getElementById("id-check-result");
  const btn    = document.getElementById("check-id-button");
  const idIn   = document.getElementById("machine-id");
  if (btn && idIn && result){
    btn.addEventListener("click", () => {
      const id = idIn.value.trim();
      if (!id){ result.textContent = "Bitte eine ID eingeben."; result.className="error"; return; }
      if (existingIDs.includes(id)){ result.textContent="Die Maschine mit der ID ist verfügbar."; result.className="success"; }
      else if (unavailableIDs.includes(id)){ result.textContent="Die Maschine mit der ID ist nicht verfügbar."; result.className="warning"; }
      else { result.textContent="Die eingegebene ID ist ungültig."; result.className="error"; }
    });
  }
});

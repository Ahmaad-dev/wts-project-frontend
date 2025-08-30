# WTS Project Frontend
# GENERATED WITH AI

🏭 **Industrial Data Platform - Frontend Application**

## 📖 Beschreibung
Eine moderne, responsive Web-Anwendung für die Echtzeitvisualisierung von Industriedaten und umfassende Maschinenüberwachung in einer futuristischen Mars-Produktionsumgebung.

## ✨ Features

### 🎛️ **Hauptfunktionen**
- **Interaktive Produktionshallen-Ansicht** mit 5 Maschinenstationen
- **Echzeit-Maschinenüberwachung** mit Live-Datenvisualisierung
- **Live Charts** für Leistung (%) und Geschwindigkeit (m/s) pro Maschine
- **Responsive Design** für alle Bildschirmgrößen
- **Dark/Light Mode Toggle** für optimale Benutzerfreundlichkeit
- **Corporate Branding** mit Logo-Integration

### 📊 **Live-Datenvisualisierung**
- **ApexCharts Integration** für professionelle Diagramme
- **5-Minuten Live-Timeline** mit automatischem Scrolling
- **Socket.IO Verbindung** für Echtzeitdaten
- **Maschinenspezifische Daten** für jede der 5 Stationen
- **Animierte Charts** mit 1-Sekunden-Updates

### 🎨 **Design & UX**
- **Flexibles Layout** mit optimierter Container-Positionierung
- **Einheitliches Branding** mit Logo und Favicon
- **Abgerundete Container** für moderne Optik
- **Responsive Bilder** mit automatischer Größenanpassung
- **Optimierte Navigation** zwischen Maschinenseiten

## 📁 Projektstruktur

### **HTML-Seiten**
- `base.html` - Hauptseite mit Produktionshallen-Übersicht
- `machine1.html` - Station Alpha: Montagemaschine
- `machine2.html` - Station Beta: Qualitätskontrollmaschine  
- `machine3.html` - Station Gamma: Etikettiermaschine
- `machine4.html` - Station Delta: Verpackungsmaschine
- `machine5.html` - Station Epsilon: Diagnosemaschine
- `404.html` - Fehlerseite

### **Assets**
#### **CSS**
- `style.css` - Haupt-Stylesheet mit Dark Mode Support

#### **JavaScript**
- `script.js` - Hauptfunktionalität und Interaktionen
- `dataset.js` - Datenmanagement und Maschinenlogik
- `livechart-apex.js` - Live-Chart-Implementierung mit ApexCharts
- `livechart.js` - Alternative Chart-Implementierung
- `config.js` - Konfigurationsdatei

#### **Bilder**
- `logo.svg` - Firmenlogo (Header + Favicon)
- `production.png` - Hauptproduktionsbild
- `machine1-5.png` - Maschinenbilder für alle 5 Stationen
- `pfeil-*.png` - UI-Elemente für Interaktionen

### **GitHub Actions**
- `.github/workflows/frontend.yml` - Automatisches Deployment

## 🚀 Deployment

### **Azure Static Web Apps**
Das Frontend wird automatisch über **GitHub Actions** deployed:
- **Trigger**: Push auf main branch
- **Ziel**: Azure Storage Account Static Website
- **URL**: Über Azure Container Apps verfügbar

### **Azure Storage Account**
- **Account**: `saswewtsz1`
- **Container**: `$web`
- **Feature**: Static Website Hosting aktiviert

## 🔧 Technische Details

### **Frontend-Technologien**
- **HTML5** mit semantischen Elementen
- **CSS3** mit Flexbox und CSS Grid
- **Vanilla JavaScript** (ES6+)
- **ApexCharts** für Datenvisualisierung
- **Socket.IO** für Echtzeitkommunikation

### **Responsive Design**
- **Mobile First** Ansatz
- **Flexible Layouts** für alle Bildschirmgrößen
- **Optimierte Bilder** mit automatischer Skalierung
- **Touch-freundliche** Navigation

### **Performance**
- **Lazy Loading** für Bilder
- **Minimierte Assets** für schnelle Ladezeiten
- **CDN Integration** für externe Bibliotheken
- **Cache-Busting** für Updates

## 🎯 Maschinenstationen

| Station | Name | Beschreibung | Features |
|---------|------|-------------|----------|
| **Alpha** | Montagemaschine | Präzise Montage mit robotischen Armen | Live Chart, Technische Info |
| **Beta** | Qualitätskontrollmaschine | Echtzeitprüfung mit Kameras | Live Chart, Status-Monitoring |
| **Gamma** | Etikettiermaschine | Effizientes Etikettieren | Live Chart, Geschwindigkeitsmessung |
| **Delta** | Verpackungsmaschine | Sicheres Verpacken | Live Chart, Leistungsüberwachung |
| **Epsilon** | Diagnosemaschine | Echtzeit-Diagnose und Reparatur | Live Chart, Systemanalyse |

## 👥 Team
- **Ahmad Alsayad** - se231310@fhstp.ac.at
- **Lukas Kirmann** - se231312
- **Markus Fink** - se231301

**Datum**: 15.07.2025

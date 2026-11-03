# Fullstack-Intranet- und Reporting-Anwendung

Eine Fullstack-Webanwendung zur zentralen Bereitstellung interner Unternehmensinformationen, zur Dokumentenverwaltung und zur Analyse betrieblicher Kennzahlen.

Das Projekt umfasst die Entwicklung interaktiver Benutzeroberflächen, modularer REST-APIs sowie einer flexiblen SQL-Abfragegenerierung für IBM Db2.

Die Portfolio-Version verwendet fiktive Unternehmensinformationen, Musterdokumente und Testdaten.

## Technologien

- **Frontend:** React 19, JavaScript, Redux Toolkit, RTK Query, React Router, Recharts, SCSS, Vite
- **Backend:** Node.js 22, Express, REST-APIs
- **Datenbank:** IBM Db2, SQL, ODBC
- **Authentifizierung:** LDAP, JWT, HTTP-only-Cookies
- **Infrastruktur:** Docker, Docker Compose, Nginx
- **Entwicklung und Debugging:** Vite HMR, Nodemon, Node.js Inspector

## Funktionen

- Interaktive Dashboards und Umsatzberichte
- Dynamische SQL-Abfragen mit konfigurierbaren Feldern, Filtern, Sortierungen, Gruppierungen und Aggregationen
- Wiederverwendbare SQL-Helper zur flexiblen Erstellung von Datenbankabfragen
- Datenvisualisierung mit Tabellen und Diagrammen
- Dokumentenverwaltung mit Dateidownloads und ZIP-Export
- Mitarbeiterverzeichnis und interne Unternehmensinformationen
- Rollenbasierte Zugriffskontrolle
- Modulare Frontend- und Backend-Architektur

## Architektur

Die Anwendung besteht aus separaten Docker-Containern für Frontend, Backend und Nginx. Für die lokale Testumgebung wird zusätzlich eine IBM-Db2-Datenbank in einem eigenen Container betrieben.

Nginx dient in allen Betriebsmodi als Reverse Proxy und leitet die Anfragen an die jeweiligen Dienste weiter.

| Anfrage | Weiterleitung         |
| ------- | --------------------- |
| `/`     | Frontend              |
| `/api/` | Backend auf Port 3200 |

Der öffentliche API-Pfad `/api/` wird beim Weiterleiten an das Backend entfernt.

Das Frontend verwendet in Development und Production denselben relativen API-Basispfad:

```env
VITE_API_BASE_URL=/api
```

Dadurch ist keine feste IP-Adresse für die API-Anbindung erforderlich.

### Development

Im Entwicklungsmodus wird das Frontend über den Vite Development Server auf Port `5173` bereitgestellt. Nginx leitet die Frontend-Anfragen an Vite weiter.

Das Backend wird mit Nodemon gestartet und unterstützt Debugging über den Node.js Inspector auf Port `9229`.

Hot Module Replacement (HMR) ermöglicht die Aktualisierung des Frontends ohne vollständigen Neustart.

### Production

Im Production-Modus wird das Frontend mit Vite erstellt und anschließend über einen Nginx-Container auf Port `3000` bereitgestellt.

Das Backend führt den kompilierten Anwendungscode mit Node.js aus.

Der vorgeschaltete Nginx übernimmt weiterhin die Weiterleitung der Frontend- und API-Anfragen.

## Betriebsmodi

Das Projekt unterstützt drei Konfigurationen:

| Modus            | Frontend                         | Backend              | Datenbank                 |
| ---------------- | -------------------------------- | -------------------- | ------------------------- |
| Production       | Nginx, statische React-Anwendung | Node.js              | Externe IBM-Db2-Datenbank |
| Development      | Vite mit HMR                     | Nodemon mit Debugger | Externe IBM-Db2-Datenbank |
| Development Test | Vite mit HMR                     | Nodemon mit Debugger | Lokale IBM Db2 in Docker  |

Die Konfigurationen werden über Docker-Compose-Dateien und Umgebungsvariablen gesteuert.

## Entwicklungsumgebung einrichten

### Voraussetzungen

- Docker mit Docker Compose
- Git
- IBM Data Server Driver for ODBC and CLI für Linux x64
- Für die lokale Testdatenbank: Unterstützung für `linux/amd64`-Container

### 1. Repository klonen

```bash
git clone <repository-url>
cd wp-app-portfolio
```

Die Repository-URL muss durch die tatsächliche Git-Adresse ersetzt werden.

### 2. IBM-Db2-ODBC-Treiber installieren

Für die Verbindung zur lokalen IBM-Db2-Testdatenbank wird der **IBM Data Server Driver for ODBC and CLI** benötigt.

Der Treiber ist nicht im Repository enthalten und muss separat heruntergeladen werden.

Offizielle IBM-Dokumentation:

[IBM – Db2 ODBC CLI Driver](https://www.ibm.com/support/pages/db2-odbc-cli-driver-download-and-installation-information)

Den Linux-x64-Treiber herunterladen und die Archivdatei hier ablegen:

```text
backend/drivers/linuxx64_odbc_cli.tar.gz
```

**Archiv entpacken**

Die folgenden Befehle im Terminal im Stammverzeichnis des Projekts ausführen:

```bash
mkdir -p backend/drivers/db2-client

tar -xzf backend/drivers/linuxx64_odbc_cli.tar.gz \
  -C backend/drivers/db2-client
```

Anschließend muss folgende Struktur vorhanden sein:

```text
backend/
└── drivers/
    └── db2-client/
        └── clidriver/
            ├── bin/
            ├── cfg/
            └── lib/
```

Der Backend-Dockerfile kopiert den Treiber nach `/opt/ibm/clidriver` und konfiguriert den Bibliothekspfad `LD_LIBRARY_PATH`.

Für den Backend-Container wird die Plattform `linux/amd64` verwendet.

### 3. Umgebungsvariablen konfigurieren

Die erforderlichen Umgebungsvariablen werden anhand der vorhandenen `.env.example`-Dateien konfiguriert.

Die Backend-Konfiguration enthält unter anderem Einstellungen für:

- Datenbankverbindungen und ODBC
- LDAP-Authentifizierung
- JWT
- Server und Dateiverzeichnisse

Die Frontend-Umgebungsvariablen werden von Vite abhängig vom jeweiligen Modus geladen.

```env
VITE_API_BASE_URL=/api
```

Passwörter, Zugangsdaten und andere vertrauliche Konfigurationswerte sind nicht Bestandteil des öffentlichen Repositorys.

### 4. Testdatenbank

Für die lokale Entwicklung steht eine IBM-Db2-Testdatenbank in einem Docker-Container zur Verfügung.

Die Datenbank verwendet den Namen `TESTDB`.

Die SQL-Skripte zur Erstellung der Tabellen und zum Einfügen von Testdaten befinden sich im Verzeichnis:

```text
sql/
```

Die Testdatenbank ermöglicht die Entwicklung und Überprüfung von SQL-Abfragen und Reporting-Funktionen unabhängig von produktiven Unternehmensdaten.

Die Datenbankdateien werden über ein persistentes Docker-Volume gespeichert.

### 5. Anwendung starten

Für die lokale Entwicklung steht das Skript `rundev.sh` zur Verfügung.

Die Docker-Konfigurationen ermöglichen die Entwicklung mit einer externen Datenbank oder mit der lokalen Db2-Testdatenbank.

Der konkrete Startablauf und die Initialisierung der Testdatenbank werden im weiteren Projektverlauf dokumentiert.

## Docker-Konfiguration

| Datei                         | Zweck                                                           |
| ----------------------------- | --------------------------------------------------------------- |
| `docker-compose.yml`          | Gemeinsame Service-Konfiguration                                |
| `docker-compose.dev.yml`      | Entwicklungsumgebung mit Vite, Nodemon und Debugging            |
| `docker-compose.dev.test.yml` | Erweiterung um die lokale Db2-Testdatenbank und Musterdokumente |
| `nginx.conf`                  | Reverse-Proxy-Konfiguration für Production                      |
| `nginx.dev.conf`              | Reverse-Proxy-Konfiguration für Development                     |
| `rundev.sh`                   | Startskript für die lokale Entwicklung                          |

Die produktionsspezifische Datei `docker-compose.prod.yml` sowie weitere interne Start- und Wartungsskripte werden nicht im öffentlichen Repository bereitgestellt.

## Projektstruktur

```text
wp-app-portfolio/
├── backend/
│   ├── containers/
│   │   └── api/                  # Dockerfile und ODBC-Konfiguration
│   ├── daten/                    # Lokale Dateien der Dokumentenverwaltung
│   ├── db_daten/                 # JSON-Demodaten
│   ├── drivers/
│   │   └── db2-client/           # Lokal entpackter Db2-ODBC-Treiber
│   ├── network_data/            # Musterdokumente für Docker-Bind-Mounts
│   ├── src/                     # Backend-Quellcode
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/                     # React-Quellcode
│   ├── Dockerfile
│   ├── nginx.conf               # Nginx-Konfiguration des Frontend-Containers
│   ├── vite.config.js
│   └── package.json
├── sql/                         # SQL-Skripte für die Db2-Testdatenbank
├── docker-compose.yml           # Gemeinsame Docker-Konfiguration
├── docker-compose.dev.yml       # Development-Konfiguration
├── docker-compose.dev.test.yml  # Lokale Testumgebung
├── nginx.conf                   # Reverse Proxy für Production
├── nginx.dev.conf               # Reverse Proxy für Development
├── rundev.sh                    # Startskript für Development
├── .env.example
└── README.md
```

## Datenverzeichnisse

### JSON-Demodaten

`backend/db_daten/` enthält JSON-Dateien mit fiktiven Stammdaten, darunter Mitarbeiter, Filialen, Standorte, Adressen und weitere Unternehmensinformationen.

Diese Daten werden für verschiedene Funktionen der Anwendung verwendet, beispielsweise für das Mitarbeiterverzeichnis und die Anzeige interner Unternehmensinformationen.

### Dokumentenverwaltung

`backend/network_data/` enthält Musterdokumente für die Dateiverwaltung.

Die Verzeichnisse `Sortimentsdaten`, `Werbung`, `Formulare`, `Richtlinien` und `Allgemein` werden über Docker-Bind-Mounts in den Backend-Container unter `/app/daten/` eingebunden.

`backend/daten/` dient als lokales Verzeichnis für Dateien der Dokumentenverwaltung.

### SQL-Testdaten

`sql/` enthält SQL-Skripte zur Erstellung und Befüllung der lokalen IBM-Db2-Testdatenbank.

Die Testdaten ermöglichen die Entwicklung und Überprüfung der Reporting-Funktionen ohne Zugriff auf produktive Unternehmensdaten.

## Projektstatus

Das Projekt befindet sich in der aktiven Weiterentwicklung und schrittweisen Umstrukturierung.

Die lokale Entwicklungsumgebung, die Testdatenbank sowie die Reporting-Funktionen werden kontinuierlich erweitert und angepasst.

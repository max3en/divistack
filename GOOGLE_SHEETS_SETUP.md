# Google Sheets Integration - Setup Anleitung

## 1. Google Cloud Projekt erstellen

1. Gehe zu [Google Cloud Console](https://console.cloud.google.com)
2. Erstelle ein neues Projekt oder wähle ein bestehendes aus
3. Navigiere zu "APIs & Services" → "Library"
4. Suche nach "Google Sheets API" und aktiviere sie

## 2. API Key erstellen

1. Gehe zu "APIs & Services" → "Credentials"
2. Klicke auf "+ CREATE CREDENTIALS" → "API key"
3. Kopiere den generierten API Key
4. Optional: Beschränke den Key auf Google Sheets API und deine Domain

## 3. Google Sheet vorbereiten

### Sheet erstellen:
1. Erstelle ein neues Google Sheet
2. Benenne den ersten Tab "Aktien"
3. Erstelle folgende Spalten in Zeile 1:

| A | B | C | D | E | F | G | H | I | J |
|---|---|---|---|---|---|---|---|---|---|
| Name | ISIN | Ticker | Land | Währung | Sektor | Kurs | Dividende | MarketCap | (Reserve) |

### Beispiel-Daten einfügen:

**Zeile 2 (Apple):**
```
A2: Apple Inc.
B2: US0378331005
C2: AAPL
D2: US
E2: USD
F2: tech
G2: =GOOGLEFINANCE("AAPL","price")
H2: =GOOGLEFINANCE("AAPL","dividend")
I2: =GOOGLEFINANCE("AAPL","marketcap")
```

**Zeile 3 (Allianz):**
```
A3: Allianz SE
B3: DE0008404005
C3: ALV.DE
D3: DE
E3: EUR
F3: finance
G3: =GOOGLEFINANCE("FRA:ALV","price")
H3: =GOOGLEFINANCE("FRA:ALV","dividend")
I3: =GOOGLEFINANCE("FRA:ALV","marketcap")
```

### Weitere Aktien hinzufügen:

Für deutsche Aktien: Prefix "FRA:" (Frankfurt)
- Beispiel: `=GOOGLEFINANCE("FRA:BMW","price")`

Für US-Aktien: Nur Ticker
- Beispiel: `=GOOGLEFINANCE("MSFT","price")`

**Wichtig:** GOOGLEFINANCE funktioniert nur mit börsennotierten Werten!

### Sheet öffentlich machen:

1. Klicke auf "Share" (oben rechts)
2. Wähle "Anyone with the link" → "Viewer"
3. Kopiere die Sheet-ID aus der URL:
   - URL: `https://docs.google.com/spreadsheets/d/ABC123XYZ/edit`
   - Sheet-ID: `ABC123XYZ`

## 4. Environment Variables konfigurieren

1. Kopiere `.env.example` zu `.env`
2. Füge deine Werte ein:

```env
VITE_GOOGLE_API_KEY=AIzaSyC...dein_api_key
VITE_GOOGLE_SHEET_ID=1abc...deine_sheet_id
```

## 5. DiviStack starten

```bash
npm run dev
```

Die Aktiensuche sollte nun funktionieren!

## Troubleshooting

### "Keine Ergebnisse gefunden"
- Prüfe ob Sheet-ID und API-Key korrekt sind
- Öffne Browser DevTools (F12) → Console für Fehler
- Stelle sicher, dass das Sheet öffentlich zugänglich ist

### GOOGLEFINANCE gibt Fehler
- Nicht alle Aktien sind in Google Finance verfügbar
- Verwende die richtigen Ticker-Symbole
- Für deutsche Aktien: `FRA:TICKER` oder `XETRA:TICKER`

### API Limit erreicht
- Google Sheets API: 60 Requests/Minute (kostenlos)
- Die App cached Suchergebnisse für 24h
- Bei Bedarf Cache löschen: Browser DevTools → Application → Local Storage

## Beispiel-Sektoren

- `tech` = Technologie
- `finance` = Finanzen
- `health` = Gesundheit
- `consumer` = Konsum
- `energy` = Energie
- `industry` = Industrie
- `realestate` = Immobilien
- `utilities` = Versorger
- `materials` = Rohstoffe
- `telecom` = Telekommunikation
- `other` = Sonstiges

## Empfohlene Aktien für Demo-Daten

### DAX:
- Allianz SE (FRA:ALV)
- SAP SE (FRA:SAP)
- Siemens AG (FRA:SIE)
- BMW (FRA:BMW)

### S&P 500:
- Apple Inc. (AAPL)
- Microsoft Corp. (MSFT)
- Johnson & Johnson (JNJ)
- Coca-Cola (KO)
- Procter & Gamble (PG)

## Alternativen ohne Google Sheets

Falls Google Sheets nicht funktioniert, kann die App auch ohne Suchfunktion genutzt werden. Einfach Aktien manuell eingeben.

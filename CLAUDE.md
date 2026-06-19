# CLAUDE.md

Guía para trabajar en este repositorio. Resume **qué es el proyecto, cómo está montado y cuál es el flujo de datos completo**. Léelo antes de tocar nada.

## Qué es

`fishing-dashboard` es una **SPA personal de apoyo a la decisión para salir a pescar en mar abierto (offshore)** en la zona de Palma de Mallorca / Baleares. No es un producto multiusuario: está pensado para un único pescador con un spot por defecto y unos umbrales de seguridad concretos.

- **Stack**: React 18 + Create React App (`react-scripts` 5), SCSS por componente, sin TypeScript, sin estado global (solo `useState`/`useMemo` y `localStorage`).
- **Mapas**: `leaflet` + `react-leaflet` (selector de punto), iframe embebido de **Windy**, e imágenes estáticas de **AEMET** y **ElTiempo**.
- **Datos meteo-marinos**: API pública de **Open-Meteo** (sin API key).
- **Luna**: `lunarphase-js` + cálculo propio de iluminación.
- **Deploy**: GitHub Pages vía GitHub Actions (`.github/workflows/main.yml`), dominio `fishing.wozzo.es` (`CNAME`). Cada push a `main` despliega.

## Comandos

```bash
npm start        # desarrollo en http://localhost:3000
npm run build    # build de producción a ./build (lo usa el CI)
npm test         # tests (react-scripts / jest) — actualmente NO hay tests
```

ESLint: config airbnb (`.eslintrc.json` + `eslintConfig` en package.json). Respeta el estilo existente (comillas simples, sin punto y coma omitido, componentes funcionales, `PropTypes` en cada componente).

## Arquitectura y flujo de datos

```
index.jsx
  └─ Dashboard.jsx                         ← orquestador, dueño de TODO el estado
       │
       ├─ useMarineForecast(coordinates)   ← fetch + normalización de datos
       │     ├─ Open-Meteo Marine API  (olas)
       │     └─ Open-Meteo Weather API (viento, rachas, prob. precip., visibilidad)
       │         → forecast[]: array horario normalizado (16 días)
       │
       ├─ evaluateOffshoreHour(hour)       ← utils/offshoreScore.js: puntúa cada hora
       │     → evaluatedForecast[] (forecast + decision por hora)
       │
       ├─ findBestWindow(...)              ← mejor ventana continua ≥4h con score ≥70 (72h)
       ├─ dailyOutlook (useMemo)           ← agregado por día: SALIR / CONDICIONAL / NO_SALIR
       │
       └─ render:
            ├─ Header → DateSlider         ← rejilla 30 días × 8 horas, selección de fecha
            ├─ aside:
            │    ├─ MapPopUp (LocationMarker) ← elegir punto en Leaflet, guarda en localStorage
            │    ├─ FishingDecisionPanel      ← decisión de la hora seleccionada + mejor ventana
            │    └─ selector de capa Windy
            └─ maps:
                 ├─ AemetImage   ← PNG predicción marítima AEMET (modelo AEWAM Baleares)
                 ├─ ElTiempoImage← WEBP oleaje costa Baleares
                 └─ WindyMap     ← iframe embed.windy.com (ECMWF)
```

### Estado (todo vive en `Dashboard.jsx`)
- `selectedDate` — fecha/hora activa, inicializada a la franja de 3h más cercana (`getClosestHour`, franjas `[2,5,8,11,14,17,20,23]`).
- `coordinates` — `{lat, lng}`, persistido en `localStorage` (`coordinates`). Default `DEFAULT_FISHING_SPOT = {39.353, 2.572}`.
- `windyOverlay` — capa de Windy (persistida en `localStorage`).
- `isMapOpen` — abre/cierra el popup de selección de punto.

### `useMarineForecast` (src/hooks/useMarineForecast.js)
- Lanza **dos** fetch en paralelo a Open-Meteo: `marine` (`wave_height`, `wave_direction`, `wave_period`) y `forecast` (`wind_speed_10m`, `wind_direction_10m`, `wind_gusts_10m`, `precipitation_probability`, `visibility`), ambos `forecast_days=16`, `timezone=auto`, viento en `kn`.
- `parseHourly` indexa el clima por timestamp y hace join con las olas por `time`. Devuelve objetos horarios:
  `{ date, waveHeightMeters, waveDirection, wavePeriodSeconds, windSpeedKnots, windDirectionDegrees, windGustKnots, stormProbability, visibilityKilometers }`.
- Reejecuta al cambiar `lat`/`lng`. Expone `{ loading, error, forecast, metadata, refetch }`.

### `offshoreScore.js` (el cerebro de la decisión)
`OFFSHORE_THRESHOLDS` (umbrales DUROS, configurados para una embarcación pequeña / mar muy plano):
- `maxWaveHeightMeters: 0.3`
- `maxWindGustKnots: 25`
- `maxStormProbability: 20`

`evaluateOffshoreHour(hour, date)`:
1. Si supera CUALQUIER umbral duro → `status: 'NO_SALIR'`, `totalScore: 0`, con motivos.
2. Si no, calcula tres sub-scores (0–100):
   - **safety (65%)**: penaliza viento, rachas, ola, prob. tormenta; penaliza viento de componente **sur** (135–225°) y bonifica componente **norte/noreste** (315–70°).
   - **activity (25%)**: actividad lunar (`getLunarActivityScore`) — luna nueva = mejor, llena de día peor, según fase + iluminación + día/noche.
   - **operational (10%)**: penaliza visibilidad < 4 km.
   - `totalScore = round(safety*0.65 + activity*0.25 + operational*0.1)`.
   - `status = 'SALIR'` si `totalScore ≥ 70`, si no `'SALIDA_CONDICIONAL'`.

`findBestWindow(forecast, startDate, minWindowHours=4)`: busca la mejor racha **continua** (horas consecutivas, +1h exacta) de al menos 4h con `status ≠ NO_SALIR` y `score ≥ 70`, mirando las próximas 72h desde `startDate`. Devuelve `{start, end, averageScore, hours}` o `null`.

`dailyOutlook` (en Dashboard): agrupa por día (clave `sv-SE` = `YYYY-MM-DD`), toma los 10 primeros días, cuenta horas SALIR/NO_SALIR y el mejor score; clasifica el día como `SALIR` (≥4 horas SALIR), `SALIDA_CONDICIONAL` o `NO_SALIR`.

### Componentes de imagen (importante para entender los bugs conocidos)
- **AemetImage**: construye URLs del modelo marítimo AEMET probando varios *runs* (00/12 UTC de los últimos 4 días) y *offsets* (múltiplos de 3 desde +9, hasta +120h). Verifica existencia precargando la imagen (`checkImageExists`) y usa la primera que exista. Si ninguna existe muestra un mensaje de error. **Limitación**: puede acabar mostrando una imagen de un run viejo cuyo offset cae en la fecha pedida, sin avisar de que no es el mapa "fresco" de ese día. Offset máximo ≈ 120h ⇒ no hay mapa AEMET más allá de ~5 días.
- **ElTiempoImage**: construye una única URL WEBP por fecha (redondeada a 3h UTC). **No valida** si existe → si no hay mapa, se ve una imagen rota, sin fallback ni aviso.
- **WindyMap**: iframe con `calendar=YYYY-MM-DD-HH`, `product=ecmwf`. ECMWF da ~10 días; más allá Windy puede no tener datos.

## Convenciones y detalles a tener en cuenta
- Cada componente vive en `src/components/<Nombre>/{index.jsx,index.scss}`.
- Fechas: se mezcla hora **local** (UI, slider, scoring) y **UTC** (URLs de AEMET/ElTiempo). Cuidado al tocar formato de fechas.
- No hay capa de tipos ni tests: valida cambios a mano con `npm start`.
- `forecast_days=16` pero los datos solo son **fiables** ~7 días (Open-Meteo), ~10 (Windy/ECMWF), ~5 (AEMET). La UI hoy **no** comunica este horizonte de fiabilidad.

## Inconsistencias / deuda conocida (no romper sin querer)
- El `<select>` de capas Windy en `Dashboard.jsx` ofrece `waves/wind/currents/pressure/rain/clouds`, pero `WindyMap.overlayOptions` (PropTypes) lista `waves/wind/temp/rain/clouds/pressure/snow/currents/sea`. No están alineados.
- `DateSlider` genera **30 días** de celdas pero el forecast solo cubre 16 → celdas lejanas muestran `N/D`.
- `src/utils.js` `calculateIllumination` reimplementa algo que `lunarphase-js` ya podría dar; conviven ambos.
- `metadata.points`/`timezone` apenas se usan en UI.

Cuando propongas mejoras, revisa primero **PLAN.md** (hoja de ruta acordada).

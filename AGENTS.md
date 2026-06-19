# AGENTS.md

Instrucciones para agentes de código que trabajen en `fishing-dashboard`.
La referencia completa de arquitectura y flujo está en **CLAUDE.md** y la hoja de ruta en **PLAN.md**. Este archivo es el resumen operativo.

## Resumen en una frase
SPA en React (CRA) que ayuda a decidir si salir a pescar en mar abierto cerca de Palma de Mallorca, combinando datos de Open-Meteo (olas, viento, tormenta), fase lunar y mapas de Windy/AEMET/ElTiempo, con un sistema de puntuación por hora y por día.

## Cómo ejecutar y validar
```bash
npm start        # dev server (http://localhost:3000)
npm run build    # build producción (lo que corre el CI de GitHub Pages)
npm test         # jest/react-scripts — OJO: ahora mismo no hay tests
```
- No hay TypeScript ni tests: **valida los cambios a mano con `npm start`**.
- Lint: ESLint config airbnb. Sigue el estilo: componentes funcionales, `PropTypes` siempre, comillas simples, SCSS por componente en `src/components/<Nombre>/index.scss`.
- Deploy automático: push a `main` → GitHub Actions → GitHub Pages (`fishing.wozzo.es`). No hagas push/commit salvo que el usuario lo pida.

## Mapa mental del código
- `src/Dashboard.jsx` — orquestador, dueño de todo el estado (`selectedDate`, `coordinates`, `windyOverlay`, `isMapOpen`). Aquí se calculan `evaluatedForecast`, `bestWindow` y `dailyOutlook`.
- `src/hooks/useMarineForecast.js` — fetch a Open-Meteo (marine + weather) y normalización a array horario.
- `src/utils/offshoreScore.js` — lógica de decisión: umbrales duros, `evaluateOffshoreHour`, `findBestWindow`.
- `src/utils.js` — `calculateIllumination` (luna).
- `src/components/` — `Header`/`DateSlider` (selección de fecha + rejilla), `FishingDecisionPanel` (decisión de la hora), `AemetImage`, `ElTiempoImage`, `WindyMap`, `MapPopUp`/`LocationMarker` (elegir punto).

## Modelo de datos (objeto horario)
`{ date, waveHeightMeters, waveDirection, wavePeriodSeconds, windSpeedKnots, windDirectionDegrees, windGustKnots, stormProbability, visibilityKilometers }`
Cada hora se enriquece con `decision: { status: 'SALIR'|'SALIDA_CONDICIONAL'|'NO_SALIR', totalScore, reasons[], factorScores }`.

## Reglas de decisión (resumen)
- Umbrales DUROS (`OFFSHORE_THRESHOLDS`): ola > 0.3 m, racha > 25 kt, o tormenta > 20 % ⇒ `NO_SALIR` (score 0).
- Si pasa: `score = safety*0.65 + activity(luna)*0.25 + operational(visibilidad)*0.1`. `≥70` ⇒ `SALIR`, si no `SALIDA_CONDICIONAL`.
- Viento sur (135–225°) penaliza; norte/noreste (315–70°) bonifica.

## Al hacer cambios, ten en cuenta
- Mezcla de hora **local** (UI/scoring) y **UTC** (URLs AEMET/ElTiempo). No rompas el formateo de fechas.
- Horizonte de fiabilidad real: Open-Meteo ~7 días, Windy/ECMWF ~10, AEMET ~5 (offset máx ≈ +120h). La UI aún no lo refleja.
- `ElTiempoImage` no valida existencia de imagen; `AemetImage` puede mostrar un run viejo sin avisar. (Ver PLAN.md.)
- Cambios de umbrales o pesos de score → todos viven en `offshoreScore.js`; documenta el porqué.

## No hacer
- No introducir dependencias pesadas ni un framework de estado global sin pedirlo: el proyecto es pequeño a propósito.
- No commitear ni desplegar sin permiso explícito.
- No borrar `CNAME` (rompe el dominio).

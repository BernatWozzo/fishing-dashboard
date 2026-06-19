# PLAN.md — Hoja de ruta de mejoras

Plan para evolucionar el dashboard hacia algo más **personalizado, fiable y fácil de leer de un vistazo**. Ordenado por fases (de mayor a menor impacto / menor a mayor esfuerzo). Cada ítem es independiente salvo donde se indique.

> Estado: propuesta inicial. Marca con `[x]` lo implementado.

---

## Fase 0 — Personalización (definir "qué es buen día PARA MÍ")

Hoy los umbrales están fijos en `offshoreScore.js`. El objetivo es que el sistema se adapte al pescador.

- [ ] **Perfil de usuario en `localStorage`** (`profile`): tamaño de embarcación, ola máx. tolerable, racha máx., tolerancia a tormenta, vientos preferidos/temidos, horas del día preferidas (amanecer/atardecer), y si pesca de noche.
- [ ] **Panel de Ajustes** (modal o `aside`) para editar ese perfil sin tocar código. Los umbrales (`OFFSHORE_THRESHOLDS`) y pesos del score pasan a leerse del perfil con *fallback* a los valores actuales.
- [ ] Mover los pesos del score (`0.65 / 0.25 / 0.1`) a constantes configurables.

**Por qué primero**: el resto de mejoras (resumen, colores, ventanas) dependen de qué consideramos "bueno".

---

## Fase 1 — Resumen "¿cuándo voy?" (lo que más pediste)

- [ ] **Tarjeta de resumen arriba del todo**: "Próximo buen día para pescar: **sábado 21 jun, 06:00–11:00** (score medio 82)". Calculada con una versión de `findBestWindow` que recorra TODO el horizonte fiable, no solo 72h, y devuelva la **primera** ventana SALIR (no solo la mejor).
- [ ] Si no hay ningún día bueno en el horizonte fiable: mensaje claro ("Sin ventanas de salida en los próximos N días fiables").
- [ ] **Top 3 ventanas** recomendadas (día + franja horaria + score), clicables para saltar a esa fecha en el slider.
- [ ] Mostrar la **mejor franja de cada día** en el `dailyOutlook`/slider (no solo el color del día), p. ej. "mejor 06–10h".

---

## Fase 2 — Fiabilidad de los datos (horizonte de confianza)

Cada fuente tiene un horizonte distinto; hoy la UI finge que 16 días valen igual.

- [ ] Definir constantes de horizonte fiable: Open-Meteo ~7 días, Windy/ECMWF ~10, AEMET ~5 (+120h máx).
- [ ] **Marca visual en el slider**: a partir del día N, atenuar/rayar las celdas y etiquetar "fiabilidad baja". Tras el límite de Open-Meteo, marcar "sin datos fiables".
- [ ] **Indicador "datos hasta: …"** en la tarjeta de resumen ("Predicción fiable hasta el jue 25 jun").
- [ ] Penalizar/avisar en el score cuando la fecha seleccionada esté fuera del horizonte fiable (no decidir "SALIR" con datos poco fiables).
- [ ] (Opcional) Leer la fecha real del último dato devuelto por Open-Meteo en lugar de asumir 16 días.

---

## Fase 3 — Mapas: "aún no hay mapa para ese día" (bug que reportaste)

Hoy `AemetImage` puede mostrar un run viejo y `ElTiempoImage` muestra una imagen rota sin avisar.

- [ ] **AemetImage**: distinguir "no existe mapa para ese offset/fecha" de "encontré un mapa". Si la imagen disponible corresponde a un run cuyo offset NO cubre la fecha pedida con frescura razonable, mostrar **estado explícito**: "Aún no hay mapa AEMET publicado para esta fecha". Mostrar también la hora del *run* usado ("Run 12 UTC, +X h") para transparencia.
- [ ] **ElTiempoImage**: validar existencia (mismo patrón `checkImageExists` que AEMET o `onError`). Si no existe → "Mapa de ElTiempo no disponible para esta fecha" en vez de imagen rota.
- [ ] **Nunca** mostrar silenciosamente un mapa de otra fecha como si fuera el de la fecha seleccionada. Si hay fallback, etiquetarlo ("mostrando el mapa más reciente: <fecha>").
- [ ] Estado de carga unificado (skeleton) para los tres mapas.

---

## Fase 4 — UI / UX

- [ ] **Layout responsive** (móvil): hoy el grid `aside + maps` no está pensado para pantalla pequeña; el slider de 30×8 celdas es difícil en móvil. Priorizar móvil porque se consulta antes de salir a navegar.
- [ ] **Slider de fecha más legible**: scroll horizontal por día, "hoy" destacado, salto rápido a "próximo buen día". Recortar a los días con datos fiables (ver Fase 2).
- [ ] **Leyenda de colores** y de iconos (🌊 ola, ⛈ tormenta, flecha = dirección viento).
- [ ] **Panel de decisión**: desglosar los `factorScores` (safety/activity/operational) con barras, no solo el total. Explicar en lenguaje natural el "porqué" de la decisión.
- [ ] Alinear el `<select>` de capas Windy con `WindyMap.overlayOptions` (hoy difieren).
- [ ] Sistema de diseño mínimo: variables SCSS (colores de estado SALIR/CONDICIONAL/NO_SALIR, espaciados) compartidas en vez de repetidas por componente.
- [ ] Estados de error/carga consistentes en toda la app.

---

## Fase 5 — Calidad del modelo de decisión

- [ ] Incorporar **periodo y dirección de la ola** (`wavePeriodSeconds`, `waveDirection`) al score — ya se reciben pero no se usan; mar de fondo largo ≠ chop corto.
- [ ] Incorporar **mareas/corrientes** y **amanecer/atardecer** (mejores horas de pesca).
- [ ] Considerar **tendencia** (mar bajando vs subiendo) además del valor puntual.
- [ ] **Tests** de `offshoreScore.js` (jest): casos NO_SALIR por cada umbral, fronteras de score, `findBestWindow` con huecos. Es lógica pura, fácil de testear y es el corazón de la app.

---

## Quick wins (se pueden hacer ya, sueltos)
- [ ] Fallback de `ElTiempoImage` ante imagen rota (Fase 3, mini-versión).
- [ ] Alinear opciones de capa Windy (Fase 4).
- [ ] Tarjeta "próximo buen día" básica reutilizando `findBestWindow` sobre todo el forecast (Fase 1, mini-versión).
- [ ] Tests del scoring (Fase 5).

---

## Orden recomendado de ejecución
1. **Fase 3** (bug de mapas — molestia diaria y autocontenido).
2. **Fase 1 mini** (tarjeta "próximo buen día").
3. **Fase 2** (horizonte de fiabilidad).
4. **Fase 0** (personalización) → desbloquea el resto.
5. **Fase 4** (UI) y **Fase 5** (modelo) en iteraciones.

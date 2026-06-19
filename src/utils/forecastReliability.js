// Horizonte de fiabilidad por fuente de datos.
// Open-Meteo entrega 16 días pero solo ~7 son fiables; Windy/ECMWF ~10; AEMET marítimo ~5 (+120h máx).
export const RELIABILITY_HORIZON = {
  highDays: 3, // 0-3 días: alta confianza
  openMeteoDays: 7, // límite fiable de los datos numéricos (olas/viento)
  windyDays: 10, // ECMWF en Windy
  aemetDays: 5, // mapas AEMET marítimos
};

// Horas (locales) en las que el usuario pesca. Fuera de aquí no se recomiendan ventanas.
export const FISHING_HOURS = { start: 6, end: 18 };

const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

// Días enteros desde hoy hasta `date` (0 = hoy, 1 = mañana, ...).
export const daysAhead = (date, now = new Date()) => Math.round((startOfDay(date) - startOfDay(now)) / 86400000);

// Nivel de fiabilidad de los datos numéricos para una fecha: 'high' | 'medium' | 'low'.
export const getReliabilityLevel = (date, now = new Date()) => {
  const d = daysAhead(date, now);
  if (d <= RELIABILITY_HORIZON.highDays) return 'high';
  if (d <= RELIABILITY_HORIZON.openMeteoDays) return 'medium';
  return 'low';
};

// True si la hora local de la fecha cae dentro del horario de pesca del usuario.
export const isFishingHour = (date) => {
  const h = date.getHours();
  return h >= FISHING_HOURS.start && h <= FISHING_HOURS.end;
};

// Fecha (medianoche local) hasta la que consideramos la predicción numérica fiable.
export const reliableUntil = (now = new Date()) => {
  const limit = new Date(startOfDay(now));
  limit.setDate(limit.getDate() + RELIABILITY_HORIZON.openMeteoDays);
  return limit;
};

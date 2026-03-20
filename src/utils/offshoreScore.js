import { LunarPhase, Moon } from 'lunarphase-js';
import { calculateIllumination } from '../utils';

export const OFFSHORE_THRESHOLDS = {
  maxWaveHeightMeters: 0.3,
  maxWindGustKnots: 25,
  maxStormProbability: 20,
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const isSouthernWind = (degrees) => degrees >= 135 && degrees <= 225;

const isNorthToNortheastWind = (degrees) => (degrees >= 315 && degrees <= 360) || (degrees >= 0 && degrees <= 70);

const getLunarActivityScore = (date) => {
  const phase = Moon.lunarPhase(date);
  const illumination = calculateIllumination(date);
  const hour = date.getHours();
  const isDaytime = hour >= 6 && hour < 18;

  if (phase === LunarPhase.NEW) return 90;
  if (phase === LunarPhase.FULL) return isDaytime ? 35 : 70;
  if (phase === LunarPhase.FIRST_QUARTER || phase === LunarPhase.LAST_QUARTER) {
    return illumination > 60 ? 65 : 55;
  }

  if (illumination > 60) return 70;
  if (illumination > 20) return 58;
  return 45;
};

const getSafetyScore = (metrics) => {
  const windPenalty = clamp((metrics.windSpeedKnots - 10) * 4, 0, 25);
  const gustPenalty = clamp((metrics.windGustKnots - 15) * 3, 0, 35);
  const wavePenalty = clamp((metrics.waveHeightMeters - 0.2) * 70, 0, 35);
  const stormPenalty = clamp(metrics.stormProbability * 0.6, 0, 25);

  const southWindPenalty = (
    typeof metrics.windDirectionDegrees === 'number'
    && isSouthernWind(metrics.windDirectionDegrees)
    && metrics.windSpeedKnots > 8
  )
    ? clamp((metrics.windSpeedKnots - 8) * 2.5, 0, 20)
    : 0;

  const northWindBonus = (
    typeof metrics.windDirectionDegrees === 'number'
    && isNorthToNortheastWind(metrics.windDirectionDegrees)
    && metrics.windSpeedKnots <= 16
  )
    ? 8
    : 0;

  return clamp(100 - windPenalty - gustPenalty - wavePenalty - stormPenalty - southWindPenalty + northWindBonus, 0, 100);
};

const getOperationalScore = (metrics) => {
  const visibilityPenalty = metrics.visibilityKilometers < 4
    ? clamp((4 - metrics.visibilityKilometers) * 20, 0, 60)
    : 0;

  return clamp(100 - visibilityPenalty, 0, 100);
};

export const evaluateOffshoreHour = (hourlyData, date, thresholds = OFFSHORE_THRESHOLDS) => {
  const reasons = [];

  if (hourlyData.waveHeightMeters > thresholds.maxWaveHeightMeters) {
    reasons.push(`Ola ${hourlyData.waveHeightMeters.toFixed(1)} m > ${thresholds.maxWaveHeightMeters.toFixed(1)} m`);
  }

  if (hourlyData.windGustKnots > thresholds.maxWindGustKnots) {
    reasons.push(`Racha ${Math.round(hourlyData.windGustKnots)} kt > ${thresholds.maxWindGustKnots} kt`);
  }

  if (hourlyData.stormProbability > thresholds.maxStormProbability) {
    reasons.push(`Tormenta ${Math.round(hourlyData.stormProbability)}% > ${thresholds.maxStormProbability}%`);
  }

  if (reasons.length > 0) {
    return {
      status: 'NO_SALIR',
      totalScore: 0,
      reasons,
      factorScores: {
        safety: 0,
        activity: 0,
        operational: 0,
      },
    };
  }

  const safety = getSafetyScore(hourlyData);
  const activity = getLunarActivityScore(date);
  const operational = getOperationalScore(hourlyData);

  const totalScore = Math.round((safety * 0.65) + (activity * 0.25) + (operational * 0.1));
  const status = totalScore >= 70 ? 'SALIR' : 'SALIDA_CONDICIONAL';

  const softReasons = [];
  if (hourlyData.windGustKnots > 20) softReasons.push('Rachas moderadas-altas');
  if (hourlyData.stormProbability > 10) softReasons.push('Riesgo de chubascos/tormenta moderado');
  if (typeof hourlyData.windDirectionDegrees === 'number' && isSouthernWind(hourlyData.windDirectionDegrees) && hourlyData.windSpeedKnots > 8) {
    softReasons.push('Viento de componente sur, menos favorable');
  }
  if (typeof hourlyData.windDirectionDegrees === 'number' && isNorthToNortheastWind(hourlyData.windDirectionDegrees) && hourlyData.windSpeedKnots <= 16) {
    softReasons.push('Componente norte/noreste favorable');
  }

  return {
    status,
    totalScore,
    reasons: softReasons,
    factorScores: {
      safety: Math.round(safety),
      activity: Math.round(activity),
      operational: Math.round(operational),
    },
  };
};

export const findBestWindow = (forecast, startDate, minWindowHours = 4) => {
  if (!forecast || forecast.length === 0) return null;

  const startTime = new Date(startDate).getTime();
  const candidates = forecast
    .filter((hour) => hour.date.getTime() >= startTime)
    .slice(0, 72);

  if (candidates.length === 0) return null;

  let bestWindow = null;
  let currentWindow = [];

  candidates.forEach((hour, index) => {
    const previous = candidates[index - 1];
    const isContinuous = !previous || (hour.date.getTime() - previous.date.getTime()) === 3600000;
    const isViable = hour.decision.status !== 'NO_SALIR' && hour.decision.totalScore >= 70;

    if (!isContinuous || !isViable) {
      if (currentWindow.length >= minWindowHours) {
        const avgScore = currentWindow.reduce((acc, item) => acc + item.decision.totalScore, 0) / currentWindow.length;
        if (!bestWindow || avgScore > bestWindow.averageScore) {
          bestWindow = {
            start: currentWindow[0].date,
            end: currentWindow[currentWindow.length - 1].date,
            averageScore: Math.round(avgScore),
            hours: currentWindow.length,
          };
        }
      }
      currentWindow = [];
    }

    if (isViable) {
      currentWindow.push(hour);
    }
  });

  if (currentWindow.length >= minWindowHours) {
    const avgScore = currentWindow.reduce((acc, item) => acc + item.decision.totalScore, 0) / currentWindow.length;
    if (!bestWindow || avgScore > bestWindow.averageScore) {
      bestWindow = {
        start: currentWindow[0].date,
        end: currentWindow[currentWindow.length - 1].date,
        averageScore: Math.round(avgScore),
        hours: currentWindow.length,
      };
    }
  }

  return bestWindow;
};

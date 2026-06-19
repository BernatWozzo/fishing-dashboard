import React, { useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import './index.scss';

// Margen máximo (en horas) entre la fecha pedida y la que realmente representa el mapa
// para considerarlo "el mapa de esa fecha". Los pasos AEMET son de 3h.
const MATCH_TOLERANCE_HOURS = 2;

const formatRepresented = (timestamp) => new Intl.DateTimeFormat('es-ES', {
  weekday: 'short',
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
}).format(new Date(timestamp));

const AemetImage = ({ date }) => {
  // status: 'loading' | 'match' | 'stale' | 'unavailable'
  const [state, setState] = useState({ status: 'loading', url: '', meta: null });

  const checkImageExists = useCallback((url) => new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    setTimeout(() => resolve(false), 5000);
    img.src = url;
  }), []);

  // Genera candidatos {url, representedTime, runTime, offsetHours} para un run.
  const generateCandidatesForRun = useCallback((runDateTime, targetDate) => {
    const year = runDateTime.getUTCFullYear();
    const month = (runDateTime.getUTCMonth() + 1).toString().padStart(2, '0');
    const day = runDateTime.getUTCDate().toString().padStart(2, '0');
    const hour = runDateTime.getUTCHours().toString().padStart(2, '0');

    const idealOffsetHours = Math.max(0, (targetDate - runDateTime) / (1000 * 60 * 60));
    const possibleOffsets = Array.from({ length: 38 }, (_, i) => 9 + (i * 3));

    return possibleOffsets
      .map((offset) => ({ offset, distance: Math.abs(offset - idealOffsetHours) }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 5)
      .map(({ offset }) => {
        const offsetStr = `+${offset.toString().padStart(3, '0')}`;
        return {
          url: `https://www.aemet.es/imagenes_d/eltiempo/prediccion/mod_maritima/${year}${month}${day}${hour}${offsetStr}_aewam_bal_martot.png`,
          runTime: runDateTime.getTime(),
          offsetHours: offset,
          representedTime: runDateTime.getTime() + offset * 3600000,
        };
      });
  }, []);

  const generateCandidates = useCallback((targetDate) => {
    const now = new Date();
    const candidates = [];

    Array.from({ length: 4 }, (_, dayOffset) => {
      const runDate = new Date(now);
      runDate.setUTCDate(runDate.getUTCDate() - dayOffset);

      [0, 12].forEach((runHour) => {
        const runDateTime = new Date(Date.UTC(
          runDate.getUTCFullYear(),
          runDate.getUTCMonth(),
          runDate.getUTCDate(),
          runHour,
          0,
          0,
          0,
        ));

        const hoursFromRun = (now - runDateTime) / (1000 * 60 * 60);
        if (hoursFromRun >= 6) {
          candidates.push(...generateCandidatesForRun(runDateTime, targetDate));
        }
      });
      return null;
    });

    // Prioriza: run más reciente, y dentro del run el que mejor representa la fecha pedida.
    return candidates.sort((a, b) => {
      if (a.runTime !== b.runTime) return b.runTime - a.runTime;
      return Math.abs(a.representedTime - targetDate) - Math.abs(b.representedTime - targetDate);
    });
  }, [generateCandidatesForRun]);

  // Busca la primera imagen existente; devuelve su metadata o null.
  const findBestImage = useCallback(async (targetDate) => {
    const candidates = generateCandidates(targetDate);
    const checks = candidates.map(async (candidate) => {
      const exists = await checkImageExists(candidate.url);
      return exists ? candidate : null;
    });
    const results = await Promise.all(checks);
    return results.find(Boolean) || null;
  }, [generateCandidates, checkImageExists]);

  useEffect(() => {
    let cancelled = false;
    setState({ status: 'loading', url: '', meta: null });

    findBestImage(date).then((found) => {
      if (cancelled) return;
      if (!found) {
        setState({ status: 'unavailable', url: '', meta: null });
        return;
      }
      const diffHours = Math.abs(found.representedTime - date.getTime()) / 3600000;
      const status = diffHours <= MATCH_TOLERANCE_HOURS ? 'match' : 'stale';
      setState({ status, url: found.url, meta: found });
    });

    return () => {
      cancelled = true;
    };
  }, [date, findBestImage]);

  if (state.status === 'loading') {
    return (
      <div className="aemet-image-container">
        <div className="aemet-placeholder">Cargando mapa AEMET…</div>
      </div>
    );
  }

  if (state.status === 'unavailable') {
    return (
      <div className="aemet-image-container">
        <div className="aemet-notice">
          <strong>AEMET aún no ha publicado mapa para esta fecha.</strong>
          <span>Los mapas marítimos de AEMET solo cubren ~5 días.</span>
        </div>
      </div>
    );
  }

  if (state.status === 'stale') {
    return (
      <div className="aemet-image-container">
        <div className="aemet-notice warning">
          <strong>Aún no hay mapa AEMET para esta fecha exacta.</strong>
          <span>{`Mapa más cercano disponible: ${formatRepresented(state.meta.representedTime)}.`}</span>
        </div>
        <img src={state.url} alt="AEMET (fecha más cercana)" className="aemet-image stale" />
      </div>
    );
  }

  return (
    <div className="aemet-image-container">
      <img src={state.url} alt="AEMET Maritime Forecast" className="aemet-image" />
      <small className="aemet-caption">{`AEMET · ${formatRepresented(state.meta.representedTime)}`}</small>
    </div>
  );
};

AemetImage.propTypes = {
  date: PropTypes.instanceOf(Date).isRequired,
};

export default AemetImage;

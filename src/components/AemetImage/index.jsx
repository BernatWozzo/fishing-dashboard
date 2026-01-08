import React, { useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import './index.scss';

const AemetImage = ({ date }) => {
  const [imageSrc, setImageSrc] = useState('');
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Verifica si una imagen existe
  const checkImageExists = useCallback((url) => new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    // Timeout después de 5 segundos
    setTimeout(() => resolve(false), 5000);
    img.src = url;
  }), []);

  // Genera URLs para un run específico
  const generateUrlsForRun = useCallback((runDateTime, targetDate) => {
    const year = runDateTime.getUTCFullYear();
    const month = (runDateTime.getUTCMonth() + 1).toString().padStart(2, '0');
    const day = runDateTime.getUTCDate().toString().padStart(2, '0');
    const hour = runDateTime.getUTCHours().toString().padStart(2, '0');

    const diffInMilliseconds = targetDate - runDateTime;
    const idealOffsetHours = Math.max(0, diffInMilliseconds / (1000 * 60 * 60));

    // AEMET usa offsets múltiplos de 3, empezando por 9
    const possibleOffsets = Array.from({ length: 38 }, (_, i) => 9 + (i * 3));

    // Encuentra los offsets más cercanos al ideal
    const sortedOffsets = possibleOffsets
      .map((offset) => ({ offset, distance: Math.abs(offset - idealOffsetHours) }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 5) // Solo los 5 más cercanos
      .map((item) => item.offset);

    return sortedOffsets.map((offset) => {
      const offsetStr = `+${offset.toString().padStart(3, '0')}`;
      const url = `https://www.aemet.es/imagenes_d/eltiempo/prediccion/mod_maritima/${year}${month}${day}${hour}${offsetStr}_aewam_bal_martot.png`;

      return {
        url,
        runTime: runDateTime.getTime(),
        offsetHours: offset,
        idealOffset: idealOffsetHours,
      };
    });
  }, []);

  // Genera múltiples URLs posibles con diferentes runs y offsets
  const generatePossibleUrls = useCallback((targetDate) => {
    const now = new Date();
    const urls = [];

    // Genera runs para los últimos 3 días
    Array.from({ length: 4 }, (_, dayOffset) => {
      const runDate = new Date(now);
      runDate.setUTCDate(runDate.getUTCDate() - dayOffset);

      // Prueba ambos runs del día (00:00 y 12:00 UTC)
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

        // Solo considera runs que ya han pasado con suficiente margen
        const hoursFromRun = (now - runDateTime) / (1000 * 60 * 60);
        if (hoursFromRun >= 6) { // Mínimo 6 horas de margen
          const urlsForRun = generateUrlsForRun(runDateTime, targetDate);
          urls.push(...urlsForRun);
        }
      });
      return null;
    });

    // Ordena por prioridad: más reciente primero, offset más cercano primero
    return urls.sort((a, b) => {
      if (a.runTime !== b.runTime) return b.runTime - a.runTime;
      return Math.abs(a.offsetHours - a.idealOffset) - Math.abs(b.offsetHours - b.idealOffset);
    }).map((u) => u.url);
  }, [generateUrlsForRun]);

  // Encuentra la mejor URL disponible probando múltiples opciones
  const findBestImageUrl = useCallback(async (targetDate) => {
    const possibleUrls = generatePossibleUrls(targetDate);

    const checkPromises = possibleUrls.map(async (url) => {
      const exists = await checkImageExists(url);
      return exists ? url : null;
    });

    const results = await Promise.all(checkPromises);
    return results.find((url) => url !== null) || null;
  }, [generatePossibleUrls, checkImageExists]);

  const handleImageError = useCallback(() => {
    setImageError(true);
    // Intenta encontrar una imagen alternativa
    findBestImageUrl(date).then((url) => {
      if (url && url !== imageSrc) {
        setImageSrc(url);
        setImageError(false);
      }
    });
  }, [date, imageSrc, findBestImageUrl]);

  useEffect(() => {
    setIsLoading(true);
    setImageError(false);
    findBestImageUrl(date).then((url) => {
      if (url) {
        setImageSrc(url);
      } else {
        setImageError(true);
      }
      setIsLoading(false);
    });
  }, [date, findBestImageUrl]);

  if (isLoading) {
    return (
      <div className="aemet-image-container">
        <div className="aemet-loading">Cargando imagen AEMET...</div>
      </div>
    );
  }

  if (imageError || !imageSrc) {
    return (
      <div className="aemet-image-container">
        <div className="aemet-error">
          No se pudo cargar la imagen de AEMET para esta fecha
        </div>
      </div>
    );
  }

  return (
    <div className="aemet-image-container">
      <img
        src={imageSrc}
        alt="AEMET Maritime Forecast"
        className="aemet-image"
        onError={handleImageError}
      />
    </div>
  );
};

AemetImage.propTypes = {
  date: PropTypes.instanceOf(Date).isRequired,
};

export default AemetImage;

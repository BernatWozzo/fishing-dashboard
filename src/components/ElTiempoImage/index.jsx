import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import './index.scss';

const buildUrl = (date) => {
  const roundedHours = Math.floor(date.getUTCHours() / 3) * 3;
  const year = date.getUTCFullYear();
  const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
  const day = date.getUTCDate().toString().padStart(2, '0');
  const hour = roundedHours.toString().padStart(2, '0');
  const dateString = `${year}${month}${day}${hour}00`;
  const baseUrl = 'https://maps.eltiempo.es/eltiempo/maps';
  return `${baseUrl}/${year}/${month}/${day}/coast/wave/baleares/643x522/baleares-coast-wave-${dateString}.webp`;
};

const ElTiempoImage = ({ date }) => {
  // status: 'loading' | 'ok' | 'unavailable'
  const [status, setStatus] = useState('loading');
  const [imageSrc, setImageSrc] = useState('');

  useEffect(() => {
    setStatus('loading');
    const url = buildUrl(date);
    setImageSrc(url);
  }, [date]);

  if (status === 'unavailable') {
    return (
      <div className="eltiempo-image-container">
        <div className="eltiempo-notice">
          <strong>ElTiempo aún no tiene mapa para esta fecha.</strong>
          <span>Prueba con una fecha más cercana.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="eltiempo-image-container">
      {status === 'loading' && (
        <div className="eltiempo-placeholder">Cargando mapa ElTiempo…</div>
      )}
      {imageSrc && (
        <img
          src={imageSrc}
          alt="ElTiempo Maritime Forecast"
          className="eltiempo-image"
          style={status === 'ok' ? undefined : { display: 'none' }}
          onLoad={() => setStatus('ok')}
          onError={() => setStatus('unavailable')}
        />
      )}
    </div>
  );
};

ElTiempoImage.propTypes = {
  date: PropTypes.instanceOf(Date).isRequired,
};

export default ElTiempoImage;

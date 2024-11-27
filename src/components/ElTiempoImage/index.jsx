import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import './index.scss';

const ElTiempoImage = ({ date }) => {
  const [imageSrc, setImageSrc] = useState('');

  useEffect(() => {
    const formatDateString = () => {
      const roundedDate = new Date(date);
      // Redondear la hora al múltiplo más cercano de 3 horas
      const roundedHours = Math.floor(date.getUTCHours() / 3) * 3;
      roundedDate.setUTCHours(roundedHours, 0, 0, 0); // Ajustar a múltiplo de 3 horas

      const year = roundedDate.getUTCFullYear();
      const month = (roundedDate.getUTCMonth() + 1).toString().padStart(2, '0');
      const day = roundedDate.getUTCDate().toString().padStart(2, '0');
      const hour = roundedDate.getUTCHours().toString().padStart(2, '0'); // Asegura dos dígitos para la hora

      return `${year}${month}${day}${hour}00`; // Añadir "00" para minutos
    };

    const dateString = formatDateString();
    const baseUrl = 'https://maps.eltiempo.es/eltiempo/maps';
    const imageUrl = `${baseUrl}/${date.getUTCFullYear()}/${(date.getUTCMonth() + 1)
      .toString()
      .padStart(2, '0')}/${date
      .getUTCDate()
      .toString()
      .padStart(2, '0')}/coast/wave/baleares/643x522/baleares-coast-wave-${dateString}.webp`;

    setImageSrc(imageUrl);
  }, [date]);

  return (
    <div className="eltiempo-image-container">
      <img src={imageSrc} alt="ElTiempo Maritime Forecast" className="eltiempo-image" />
    </div>
  );
};

ElTiempoImage.propTypes = {
  date: PropTypes.instanceOf(Date).isRequired,
};

export default ElTiempoImage;

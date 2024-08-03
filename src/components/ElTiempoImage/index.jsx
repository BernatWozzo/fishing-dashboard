import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import './index.scss';

const ElTiempoImage = ({ date }) => {
  const [imageSrc, setImageSrc] = useState('');

  useEffect(() => {
    const calculateOffset = (selectedDate) => {
      const modelRunDate = new Date();
      modelRunDate.setUTCHours(0, 0, 0, 0); // Set to midnight UTC of the current day
      const diffInHours = Math.round((selectedDate - modelRunDate) / (1000 * 60 * 60));
      return diffInHours.toString().padStart(2, '0');
    };

    const formatDateString = () => {
      const year = date.getUTCFullYear();
      const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
      const day = date.getUTCDate().toString().padStart(2, '0');
      const hour = (date.getUTCHours() * 100).toString().padStart(4, '0');
      return `${year}${month}${day}${hour}`;
    };

    const offset = calculateOffset(date);
    const dateString = formatDateString(date);
    const baseUrl = 'https://maps.eltiempo.es/eltiempo/maps';
    const imageUrl = `${baseUrl}/${date.getUTCFullYear()}/${(date.getUTCMonth() + 1).toString().padStart(2, '0')}/${date.getUTCDate().toString().padStart(2, '0')}/coast/wave/baleares/643x522/baleares-coast-wave-${dateString}.webp?${offset}`;

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

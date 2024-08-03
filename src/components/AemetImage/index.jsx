import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import './index.scss';

const AemetImage = ({ date }) => {
  const [imageSrc, setImageSrc] = useState('');

  useEffect(() => {
    const calculateOffset = (selectedDate) => {
      // Date of the model run (today's date at 00:00 UTC)
      const modelRunDate = new Date();
      modelRunDate.setUTCHours(0, 0, 0, 0); // Set to midnight UTC of the current day
      const diffInHours = Math.round((selectedDate - modelRunDate) / (1000 * 60 * 60));
      return `+${diffInHours.toString().padStart(3, '0')}`;
    };

    const modelRunDate = new Date();
    modelRunDate.setUTCHours(0, 0, 0, 0); // Set to midnight UTC of the current day
    const year = modelRunDate.getUTCFullYear();
    const month = (modelRunDate.getUTCMonth() + 1).toString().padStart(2, '0');
    const day = modelRunDate.getUTCDate().toString().padStart(2, '0');
    const hour = '00'; // Always use the 00 run
    const offset = calculateOffset(date);

    const imageUrl = `https://www.aemet.es/imagenes_d/eltiempo/prediccion/mod_maritima/${year}${month}${day}${hour}${offset}_aewam_bal_martot.png`;
    setImageSrc(imageUrl);
  }, [date]);

  return (
    <div className="aemet-image-container">
      <img src={imageSrc} alt="AEMET Maritime Forecast" className="aemet-image" />
    </div>
  );
};

AemetImage.propTypes = {
  date: PropTypes.instanceOf(Date).isRequired,
};

export default AemetImage;

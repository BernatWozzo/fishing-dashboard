import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import './index.scss';

const AemetImage = ({ date }) => {
  const [imageSrc, setImageSrc] = useState('');

  useEffect(() => {
    // Determina el último run disponible según la hora UTC actual
    const getLatestAvailableRun = () => {
      const now = new Date();
      const utcHour = now.getUTCHours();
      const utcDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
      if (utcHour >= 13) {
        // Run de las 12 UTC del día actual
        return new Date(Date.UTC(utcDate.getUTCFullYear(), utcDate.getUTCMonth(), utcDate.getUTCDate(), 12, 0, 0, 0));
      } if (utcHour >= 6) {
        // Run de las 00 UTC del día actual
        return new Date(Date.UTC(utcDate.getUTCFullYear(), utcDate.getUTCMonth(), utcDate.getUTCDate(), 0, 0, 0, 0));
      }
      // Run de las 12 UTC del día anterior
      const prevDay = new Date(utcDate);
      prevDay.setUTCDate(prevDay.getUTCDate() - 1);
      return new Date(Date.UTC(prevDay.getUTCFullYear(), prevDay.getUTCMonth(), prevDay.getUTCDate(), 12, 0, 0, 0));
    };

    const modelRunDate = getLatestAvailableRun();
    const year = modelRunDate.getUTCFullYear();
    const month = (modelRunDate.getUTCMonth() + 1).toString().padStart(2, '0');
    const day = modelRunDate.getUTCDate().toString().padStart(2, '0');
    const hour = modelRunDate.getUTCHours().toString().padStart(2, '0');
    const diffInMilliseconds = date - modelRunDate;
    const diffInHours = Math.max(0, Math.round(diffInMilliseconds / (1000 * 60 * 60)));
    const offset = `+${diffInHours.toString().padStart(3, '0')}`;

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

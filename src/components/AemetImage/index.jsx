import React from 'react';
import PropTypes from 'prop-types';

const AemetImage = ({ date }) => {
  const hours = String(date.getHours()).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const url = `https://www.aemet.es/imagenes_d/eltiempo/prediccion/mod_maritima/${year}${month}${day}00+${hours}_aewam_bal_martot.png`;
  return <img src={url} alt="AEMET" width="100%" />;
};

AemetImage.propTypes = {
  date: PropTypes.instanceOf(Date).isRequired,
};

export default AemetImage;

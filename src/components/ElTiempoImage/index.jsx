import React from 'react';
import PropTypes from 'prop-types';

const ElTiempoImage = ({ date }) => {
  const hours = String(date.getHours()).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const url = `https://maps.eltiempo.es/eltiempo/maps/${year}/${month}/${day}/coast/wave/baleares/643x522/baleares-coast-wave-${year}${month}${day}${hours}00.webp?17`;
  return <img src={url} alt="ElTiempo" width="100%" />;
};

ElTiempoImage.propTypes = {
  date: PropTypes.instanceOf(Date).isRequired,
};

export default ElTiempoImage;

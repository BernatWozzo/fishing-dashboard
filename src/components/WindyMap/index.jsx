import React from 'react';
import PropTypes from 'prop-types';

const overlayOptions = [
  'waves',
  'wind',
  'temp',
  'rain',
  'clouds',
  'pressure',
  'snow',
  'currents',
  'sea',
];

const WindyMap = ({
  lat, lng, date, overlay,
}) => {
  const dateStr = date ? date.toISOString().split('T')[0] : '';
  const url = `https://embed.windy.com/embed.html?type=map&location=coordinates&metricRain=default&metricTemp=default&metricWind=default&zoom=11&overlay=${overlay}&product=ecmwf&level=surface&lat=${lat}&lon=${lng}&detailLat=${lat}&detailLon=${lng}&detail=true${dateStr ? `&date=${dateStr}` : ''}`;

  return (
    <iframe
      title="Windy"
      width="650"
      height="450"
      src={url}
    />
  );
};

WindyMap.propTypes = {
  lat: PropTypes.number.isRequired,
  lng: PropTypes.number.isRequired,
  date: PropTypes.instanceOf(Date),
  overlay: PropTypes.oneOf(overlayOptions),
};

WindyMap.defaultProps = {
  overlay: 'waves',
  date: null,
};

export default WindyMap;

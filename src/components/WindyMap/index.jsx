import React from 'react';
import PropTypes from 'prop-types';
import './index.scss';

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
  lat, lng, overlay,
}) => {
  const urlWithDetail = `https://embed.windy.com/embed.html?type=map&location=coordinates&metricRain=mm&metricTemp=°C&metricWind=kt&zoom=10&overlay=${overlay}&product=ecmwf&level=surface&lat=${lat}&lon=${lng}&detailLat=${lat}&detailLon=${lng}&detail=true&pressure=true&message=true`;

  return (
    <div className="windy-maps-container">
      <iframe
        title="WindyMapWithDetail"
        className="windy-map"
        src={urlWithDetail}
      />
    </div>
  );
};

WindyMap.propTypes = {
  lat: PropTypes.number.isRequired,
  lng: PropTypes.number.isRequired,
  overlay: PropTypes.oneOf(overlayOptions),
};

WindyMap.defaultProps = {
  overlay: 'waves',
};

export default WindyMap;

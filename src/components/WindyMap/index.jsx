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
  lat, lng, overlay, date,
}) => {
  const selectedDate = date instanceof Date ? date : new Date();
  const calendarValue = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}-${String(selectedDate.getHours()).padStart(2, '0')}`;
  const urlWithDetail = `https://embed.windy.com/embed.html?type=map&location=coordinates&metricRain=mm&metricTemp=°C&metricWind=kt&zoom=10&overlay=${overlay}&product=ecmwf&level=surface&calendar=${calendarValue}&lat=${lat}&lon=${lng}&detailLat=${lat}&detailLon=${lng}&detail=true&pressure=true&message=true`;

  return (
    <div className="windy-maps-container">
      <iframe
        title="WindyMapWithDetail"
        className="windy-map"
        key={`${overlay}-${calendarValue}-${lat}-${lng}`}
        src={urlWithDetail}
      />
    </div>
  );
};

WindyMap.propTypes = {
  lat: PropTypes.number.isRequired,
  lng: PropTypes.number.isRequired,
  overlay: PropTypes.oneOf(overlayOptions),
  date: PropTypes.instanceOf(Date),
};

WindyMap.defaultProps = {
  overlay: 'waves',
  date: null,
};

export default WindyMap;

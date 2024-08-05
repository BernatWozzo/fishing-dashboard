import React from 'react';
import PropTypes from 'prop-types';
import { CircleMarker, useMapEvents } from 'react-leaflet';

const LocationMarker = ({ setCoordinates, coordinates }) => {
  useMapEvents({
    click(e) {
      setCoordinates(e.latlng);
    },
  });

  return coordinates === null ? null : (
    <CircleMarker
      center={coordinates}
      radius={5} // Adjust size as needed
      fillColor="#007bff" // Adjust color as needed
      color="#007bff" // Border color
      fillOpacity={0.8} // Adjust opacity as needed
    />
  );
};

LocationMarker.propTypes = {
  setCoordinates: PropTypes.func.isRequired,
  coordinates: PropTypes.shape({
    lat: PropTypes.number,
    lng: PropTypes.number,
  }).isRequired,
};

export default LocationMarker;

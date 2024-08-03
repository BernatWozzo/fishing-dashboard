import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Marker, useMapEvents } from 'react-leaflet';

const LocationMarker = ({ setCoordinates }) => {
  const [position, setPosition] = useState(null);

  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      setCoordinates(e.latlng);
    },
  });

  return position === null ? null : (
    <Marker position={position} />
  );
};

LocationMarker.propTypes = {
  setCoordinates: PropTypes.func.isRequired,
};

export default LocationMarker;

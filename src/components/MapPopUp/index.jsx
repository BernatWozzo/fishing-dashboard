/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import LocationMarker from '../LocationMarker';
import './index.scss';

const MapPopup = ({ setCoordinates, onClose, coordinates }) => {
  const [internalCoordinates, setInternalCoordinates] = useState(coordinates);
  useEffect(() => {
    setInternalCoordinates(coordinates);
  }, [coordinates]);

  const showSaveButton = JSON.stringify(coordinates) !== JSON.stringify(internalCoordinates);

  return (
    <>
      <div className="map-overlay" onClick={onClose} />
      <div className="map-popup">
        <button
          className="close-button"
          type="button"
          onClick={onClose}
        >
          X
        </button>
        {showSaveButton && (
        <button
          type="button"
          className="save-button"
          onClick={() => {
            setCoordinates(internalCoordinates);
            onClose();
          }}
        >
          Guardar
        </button>
        )}
        <MapContainer center={[internalCoordinates?.lat, internalCoordinates?.lng]} zoom={10} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker setCoordinates={setInternalCoordinates} coordinates={internalCoordinates} />
        </MapContainer>
      </div>
    </>
  );
};

MapPopup.propTypes = {
  setCoordinates: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  coordinates: PropTypes.shape({
    lat: PropTypes.number,
    lng: PropTypes.number,
  }).isRequired,
};

export default MapPopup;

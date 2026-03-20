/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import LocationMarker from '../LocationMarker';
import './index.scss';

const OFFSHORE_SPOTS = [
  {
    id: 'tu-spot-palma',
    label: 'Tu spot',
    coordinates: { lat: 39.353, lng: 2.572 },
  },
  {
    id: 'palma-noreste-15nm',
    label: 'NE 15nm',
    coordinates: { lat: 39.609, lng: 2.988 },
  },
  {
    id: 'palma-sur-18nm',
    label: 'S 18nm',
    coordinates: { lat: 39.094, lng: 2.66 },
  },
  {
    id: 'palma-suroeste-20nm',
    label: 'SW 20nm',
    coordinates: { lat: 39.173, lng: 2.114 },
  },
];

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
        <div className="spot-presets">
          {OFFSHORE_SPOTS.map((spot) => (
            <button
              key={spot.id}
              type="button"
              onClick={() => setInternalCoordinates(spot.coordinates)}
              className="preset-button"
            >
              {spot.label}
            </button>
          ))}
        </div>
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

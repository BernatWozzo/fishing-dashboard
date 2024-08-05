/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React from 'react';
import PropTypes from 'prop-types';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import LocationMarker from '../LocationMarker';
import './index.scss';

const MapPopup = ({ setCoordinates, onClose, coordinates }) => (
  <>
    <div className="map-overlay" onClick={onClose} />
    <div className="map-popup">
      <button type="button" onClick={onClose}>Cerrar</button>
      <MapContainer center={[coordinates?.lat, coordinates?.lng]} zoom={9} style={{ height: '400px', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker setCoordinates={setCoordinates} coordinates={coordinates} />
      </MapContainer>
    </div>
  </>
);

MapPopup.propTypes = {
  setCoordinates: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  coordinates: PropTypes.shape({
    lat: PropTypes.number,
    lng: PropTypes.number,
  }).isRequired,
};

export default MapPopup;

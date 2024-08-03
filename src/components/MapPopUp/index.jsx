import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  MapContainer, TileLayer,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import LocationMarker from '../LocationMarker';
import './index.scss';

const MapPopup = ({ setCoordinates, onClose }) => (
  <div className="map-popup">
    <button type="button" onClick={onClose}>Cerrar</button>
    <MapContainer center={[39.5696, 2.6502]} zoom={13} style={{ height: '400px', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationMarker setCoordinates={setCoordinates} />
    </MapContainer>
  </div>
);

MapPopup.propTypes = {
  setCoordinates: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default MapPopup;

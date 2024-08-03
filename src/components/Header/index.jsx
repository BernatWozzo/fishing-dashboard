import React, { useState } from 'react';
import PropTypes from 'prop-types';
import MapPopup from '../MapPopUp';
import './index.scss';

const Header = ({ coordinates, changeLocation }) => {
  const [isMapOpen, setIsMapOpen] = useState(false);

  const openMap = () => setIsMapOpen(true);
  const closeMap = () => setIsMapOpen(false);

  return (
    <div className="header">
      <h1>Previsiones Pesca</h1>
      <div>
        <button type="button" className="location-button" onClick={openMap}>
          Seleccionar Ubicación
        </button>
        {isMapOpen && (
          <MapPopup setCoordinates={changeLocation} onClose={closeMap} />
        )}
      </div>
      <div className="coordinates">
        Coordenadas seleccionadas: Latitud:
        {' '}
        <span>{coordinates.lat}</span>
        , Longitud:
        {' '}
        <span>{coordinates.lng}</span>
      </div>
    </div>
  );
};

Header.propTypes = {
  coordinates: PropTypes.shape({
    lat: PropTypes.number,
    lng: PropTypes.number,
  }).isRequired,
  changeLocation: PropTypes.func.isRequired,
};

export default Header;

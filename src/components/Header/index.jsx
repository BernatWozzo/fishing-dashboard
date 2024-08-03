import React, { useState } from 'react';
import PropTypes from 'prop-types';
import MapPopup from '../MapPopUp';

const Header = ({ coordinates, changeLocation }) => {
  const [isMapOpen, setIsMapOpen] = useState(false);

  const openMap = () => setIsMapOpen(true);
  const closeMap = () => setIsMapOpen(false);

  return (
    <div>
      <h1>Previsiones Pesca</h1>
      <div>
        <button type="button" onClick={openMap}>Seleccionar Ubicación</button>
        {isMapOpen && (
          <MapPopup setCoordinates={changeLocation} onClose={closeMap} />
        )}
      </div>
      <div>
        Coordenadas seleccionadas: Latitud:
        {' '}
        {coordinates.lat}
        , Longitud:
        {' '}
        {coordinates.lng}
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

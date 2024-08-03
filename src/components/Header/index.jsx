import React, { useState } from 'react';
import PropTypes from 'prop-types';
import MapPopup from '../MapPopUp';
import './index.scss';
import DateSlider from '../DateSlider';

const Header = ({ changeLocation, selectedDate, onChangeDate }) => {
  const [isMapOpen, setIsMapOpen] = useState(false);

  const openMap = () => setIsMapOpen(true);
  const closeMap = () => setIsMapOpen(false);

  return (
    <div className="header">
      <div className="top">
        <h1 className="header-title">Previsiones Pesca</h1>
        <div className="header-content">
          <button type="button" className="location-button" onClick={openMap}>
            Seleccionar Ubicación
          </button>
          {isMapOpen && (
          <MapPopup setCoordinates={changeLocation} onClose={closeMap} />
          )}
        </div>
      </div>
      <div className="bottom">
        <DateSlider onChange={onChangeDate} selectedDate={selectedDate} />
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
  selectedDate: PropTypes.instanceOf(Date).isRequired,
  onChangeDate: PropTypes.func.isRequired,
};

export default Header;

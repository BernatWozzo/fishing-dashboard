/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import MapPopup from '../MapPopUp';
import './index.scss';
import DateSlider from '../DateSlider';

const Header = ({
  changeLocation, selectedDate, onChangeDate, coordinates,
}) => {
  const [isMapOpen, setIsMapOpen] = useState(false);

  const openMap = () => setIsMapOpen(true);
  const closeMap = () => setIsMapOpen(false);

  return (
    <div className="header">
      <div className="top">
        <h1 className="header-title">Previsiones Pesca</h1>
        <div className="header-content">
          <button type="button" className="location-button" onClick={openMap}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
            >
              <path d="M12 2C8.14 2 5 5.14 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.86-3.14-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5 14.5 7.62 14.5 9 13.38 11.5 12 11.5z" />
            </svg>

          </button>
          {isMapOpen && (
          <MapPopup setCoordinates={changeLocation} onClose={closeMap} coordinates={coordinates} />
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

/* eslint-disable jsx-a11y/control-has-associated-label */
import React from 'react';
import PropTypes from 'prop-types';
import './index.scss';
import DateSlider from '../DateSlider';

const Header = ({
  selectedDate, onChangeDate, dailyOutlook, hourlyForecast,
}) => (
  <div className="header">
    <div className="bottom">
      <DateSlider
        onChange={onChangeDate}
        selectedDate={selectedDate}
        dailyOutlook={dailyOutlook}
        hourlyForecast={hourlyForecast}
      />
    </div>
  </div>
);

Header.propTypes = {
  selectedDate: PropTypes.instanceOf(Date).isRequired,
  onChangeDate: PropTypes.func.isRequired,
  dailyOutlook: PropTypes.arrayOf(PropTypes.shape({
    dayKey: PropTypes.string,
    date: PropTypes.instanceOf(Date),
    status: PropTypes.oneOf(['NO_SALIR', 'SALIDA_CONDICIONAL', 'SALIR']),
    bestScore: PropTypes.number,
  })).isRequired,
  hourlyForecast: PropTypes.arrayOf(PropTypes.shape({
    date: PropTypes.instanceOf(Date).isRequired,
    waveHeightMeters: PropTypes.number,
    windSpeedKnots: PropTypes.number,
    windDirectionDegrees: PropTypes.number,
    windGustKnots: PropTypes.number,
    stormProbability: PropTypes.number,
  })),
};

Header.defaultProps = {
  hourlyForecast: [],
};

export default Header;

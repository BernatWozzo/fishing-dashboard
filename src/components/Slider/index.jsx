import React from 'react';
import PropTypes from 'prop-types';

const Slider = ({ selectedDate, onChange }) => (
  <div>
    <input
      type="range"
      min="0"
      max="23"
      value={selectedDate.getHours()}
      onChange={(e) => {
        const newDate = new Date(selectedDate);
        newDate.setHours(e.target.value);
        onChange(newDate);
      }}
    />
  </div>
);

Slider.propTypes = {
  selectedDate: PropTypes.instanceOf(Date).isRequired,
  onChange: PropTypes.func.isRequired,
};

export default Slider;

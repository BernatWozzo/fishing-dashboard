import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './index.scss';

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const hoursOfDay = [2, 5, 8, 11, 14, 17, 20, 23];

const DateSlider = ({ selectedDate, onChange }) => {
  const [marks, setMarks] = useState([]);
  const [selectedCell, setSelectedCell] = useState(null);

  const generateMarks = () => {
    const now = new Date();
    const nextSevenDays = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(now);
      day.setDate(now.getDate() + i);
      return day;
    });

    const marksArray = nextSevenDays.flatMap((day) => hoursOfDay.map((hour) => ({
      dayLabel: `${daysOfWeek[day.getDay()]} ${day.getDate()}`,
      hourLabel: `${hour}`,
      date: new Date(day.getFullYear(), day.getMonth(), day.getDate(), hour, 0, 0, 0),
    })));

    setMarks(marksArray);
  };

  useEffect(() => {
    generateMarks();
  }, []);

  useEffect(() => {
    setSelectedCell(selectedDate);
  }, [selectedDate]);

  const handleCellClick = (date) => {
    setSelectedCell(date);
    onChange(date);
  };

  const handleKeyDown = (event, date) => {
    if (event.key === 'Enter' || event.key === ' ') {
      setSelectedCell(date);
      onChange(date);
    }
  };

  const groupedMarks = marks.reduce((acc, mark) => {
    const day = mark.dayLabel;
    if (!acc[day]) {
      acc[day] = [];
    }
    acc[day].push(mark);
    return acc;
  }, {});

  return (
    <div className="date-slider">
      <div className="days-row">
        {Object.keys(groupedMarks).map((day, index) => (
          <div key={index} className="day-column">
            <div className="day-label">{day}</div>
            <div className="hours-row">
              {groupedMarks[day].map((mark, idx) => (
                <div
                  key={idx}
                  className={`hour-cell ${selectedCell && selectedCell.getTime() === mark.date.getTime() ? 'selected' : ''}`}
                  onClick={() => handleCellClick(mark.date)}
                  onKeyDown={(e) => handleKeyDown(e, mark.date)}
                  role="button"
                  tabIndex={0}
                >
                  {mark.hourLabel}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

DateSlider.propTypes = {
  selectedDate: PropTypes.instanceOf(Date).isRequired,
  onChange: PropTypes.func.isRequired,
};

export default DateSlider;

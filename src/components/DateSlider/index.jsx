import React, { useState, useEffect } from 'react';
import { LunarPhase, Moon, Hemisphere } from 'lunarphase-js';
import PropTypes from 'prop-types';
import './index.scss';

const hoursOfDay = [2, 5, 8, 11, 14, 17, 20, 23];

// Función para calcular la iluminación lunar basada en fórmulas astronómicas estándar
export const calculateIllumination = (date) => {
  const diff = date - new Date('2001-01-01T00:00:00Z');
  const days = diff / 1000 / 60 / 60 / 24;
  const synodicMonth = 29.53058867;
  const newMoons = days / synodicMonth;
  const phase = newMoons - Math.floor(newMoons);
  const illumination = 0.5 * (1 - Math.cos(phase * 2 * Math.PI));
  return illumination * 100;
};

const getFishingProbability = (illumination, phase, hour) => {
  const isDaytime = hour >= 6 && hour < 18;

  if (phase === LunarPhase.FULL && isDaytime) return 'Baja';
  if (phase === LunarPhase.NEW && !isDaytime) return 'Baja';
  if (illumination > 60) return 'Alta'; // Ajuste para más "Altas"
  if (illumination > 20 && illumination <= 60) return 'Media'; // Ajuste para más "Medias"
  return 'Baja';
};

const getCellStyle = (probability) => {
  switch (probability) {
    case 'Alta':
      return { backgroundColor: 'green' };
    case 'Media':
      return { backgroundColor: 'yellow' };
    case 'Baja':
      return { backgroundColor: 'red' };
    default:
      return {};
  }
};

const DateSlider = ({ selectedDate, onChange }) => {
  const [marks, setMarks] = useState([]);
  const [selectedCell, setSelectedCell] = useState(null);

  const generateMarks = () => {
    const now = new Date();
    const nextSevenDays = Array.from({ length: 30 }, (_, i) => {
      const day = new Date(now);
      day.setDate(now.getDate() + i);
      return day;
    });

    const marksArray = nextSevenDays.flatMap((day) => hoursOfDay.map((hour) => {
      const date = new Date(day.getFullYear(), day.getMonth(), day.getDate(), hour, 0, 0, 0);
      const phase = Moon.lunarPhase(date);
      const phaseEmoji = Moon.lunarPhaseEmoji(date, { hemisphere: Hemisphere.NORTHERN });
      const illumination = calculateIllumination(date);
      const probability = getFishingProbability(illumination, phase, hour);

      return {
        dayLabel: day.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'short' }),
        hourLabel: `${hour}`,
        date,
        phaseEmoji,
        probability,
      };
    }));

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

  const handleArrowNavigation = (direction) => {
    const currentIndex = marks.findIndex((mark) => mark.date.getTime() === selectedCell.getTime());
    if (currentIndex !== -1) {
      const newIndex = direction === 'left' ? currentIndex - 1 : currentIndex + 1;
      if (marks[newIndex]) {
        const newDate = marks[newIndex].date;
        setSelectedCell(newDate);
        onChange(newDate);
      }
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowLeft') {
      handleArrowNavigation('left');
    } else if (event.key === 'ArrowRight') {
      handleArrowNavigation('right');
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedCell, marks]);

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
            <div className="day-label">
              {day}
              {' '}
              {groupedMarks[day][0].phaseEmoji}
            </div>
            <div className="hours-row">
              {groupedMarks[day].map((mark, idx) => (
                <div
                  key={idx}
                  className={`hour-cell ${selectedCell && selectedCell.getTime() === mark.date.getTime() ? 'selected' : ''}`}
                  style={getCellStyle(mark.probability)}
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

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { LunarPhase, Moon, Hemisphere } from 'lunarphase-js';
import './index.scss';
import { calculateIllumination } from '../../utils';

const hoursOfDay = [2, 5, 8, 11, 14, 17, 20, 23];

const getFishingProbability = (illumination, phase, hour) => {
  const isDaytime = hour >= 6 && hour < 18;

  if (phase === LunarPhase.FULL && isDaytime) return 'Baja'; // Durante el día de la luna llena, la probabilidad es baja.
  if (phase === LunarPhase.NEW && isDaytime) return 'Alta'; // Durante el día de la luna nueva, la probabilidad es alta.
  if (phase === LunarPhase.NEW && !isDaytime) return 'Alta'; // Durante la noche de la luna nueva, la probabilidad es alta.
  if (illumination > 60) return 'Alta'; // Ajuste para más "Altas"
  if (illumination > 20 && illumination <= 60) return 'Media'; // Ajuste para más "Medias"
  return 'Baja'; // Todo lo demás es baja probabilidad.
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

const getAverageProbability = (probabilities) => {
  const values = { Alta: 100, Media: 50, Baja: 0 };
  const total = probabilities.length;
  const sum = probabilities.reduce((acc, prob) => acc + values[prob], 0);
  return (sum / total).toFixed(2);
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
      let newIndex = direction === 'left' ? currentIndex - 1 : currentIndex + 1;

      // Asegurarnos de que el nuevo índice está dentro del rango válido
      if (newIndex < 0) {
        newIndex = 0;
      } else if (newIndex >= marks.length) {
        newIndex = marks.length - 1;
      }

      const newDate = marks[newIndex].date;
      setSelectedCell(newDate);
      onChange(newDate);
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
        {Object.keys(groupedMarks).map((day, index) => {
          const dailyProbabilities = groupedMarks[day].map((mark) => mark.probability);
          const averageProbability = getAverageProbability(dailyProbabilities);

          return (
            <div key={index} className="day-column">
              <div className="day-label">
                {day}
                {' '}
                {groupedMarks[day][0].phaseEmoji}
                {' '}
                (
                {averageProbability}
                )
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
          );
        })}
      </div>
    </div>
  );
};

DateSlider.propTypes = {
  selectedDate: PropTypes.instanceOf(Date).isRequired,
  onChange: PropTypes.func.isRequired,
};

export default DateSlider;

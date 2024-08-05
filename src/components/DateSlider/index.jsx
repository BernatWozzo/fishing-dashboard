import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { LunarPhase, Moon, Hemisphere } from 'lunarphase-js';
import './index.scss';
import { calculateIllumination } from '../../utils';

const hoursOfDay = [2, 5, 8, 11, 14, 17, 20, 23];

const getFishingProbability = (illumination, phase, hour) => {
  const isDaytime = hour >= 6 && hour < 18;
  let probability;

  if (phase === LunarPhase.FULL) {
    probability = isDaytime ? 20 : 80; // 20 de día, 80 de noche
  } else if (phase === LunarPhase.NEW) {
    probability = 90; // 90 de día y de noche
  } else if (phase === LunarPhase.FIRST_QUARTER || phase === LunarPhase.LAST_QUARTER) {
    if (isDaytime) {
      probability = illumination > 60 ? 70 : 50; // 70 si la iluminación es alta, 50 si es media
    } else {
      probability = 70; // 70 de noche
    }
  } else if (illumination > 60) {
    probability = 85; // Alta probabilidad si la iluminación es alta
  } else if (illumination > 20 && illumination <= 60) {
    probability = 60; // Media probabilidad
  } else {
    probability = 30; // Baja probabilidad
  }

  return probability;
};

const getCellStyle = (probability) => {
  if (probability >= 80) {
    return { backgroundColor: '#4CAF50' }; // Verde (80-100)
  } if (probability >= 60) {
    return { backgroundColor: 'yellow' }; // Amarillo (60-79)
  } if (probability >= 40) {
    return { backgroundColor: 'orange' }; // Naranja (40-59)
  }
  return { backgroundColor: 'red' }; // Rojo (0-39)
};

const getAverageProbability = (probabilities) => {
  const total = probabilities.length;
  const sum = probabilities.reduce((acc, prob) => acc + prob, 0);
  return `${sum / total}%`;
};

const DateSlider = ({ selectedDate, onChange }) => {
  const [marks, setMarks] = useState([]);
  const [selectedCell, setSelectedCell] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [intervalId, setIntervalId] = useState(null);
  const selectedCellRef = useRef(selectedCell);

  useEffect(() => {
    selectedCellRef.current = selectedCell;
  }, [selectedCell]);

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

  const startPlaying = () => {
    setIsPlaying(true);
    const id = setInterval(() => {
      const currentIndex = marks.findIndex((mark) => mark.date.getTime() === selectedCellRef.current.getTime());
      if (currentIndex !== -1) {
        let newIndex = currentIndex + 1;

        if (newIndex >= marks.length) {
          newIndex = marks.length - 1;
        }

        const newDate = marks[newIndex].date;
        setSelectedCell(newDate);
        onChange(newDate);
      }
    }, 300);
    setIntervalId(id);
  };

  const stopPlaying = () => {
    setIsPlaying(false);
    if (intervalId) {
      clearInterval(intervalId);
    }
  };

  return (
    <div className="date-slider">
      <div className="controls">
        <button type="button" onClick={isPlaying ? stopPlaying : startPlaying}>
          {isPlaying ? (
            <svg viewBox="0 0 24 24">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>
      </div>
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

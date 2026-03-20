import React, {
  useState, useEffect, useRef, useMemo,
} from 'react';
import PropTypes from 'prop-types';
import './index.scss';

const hoursOfDay = [2, 5, 8, 11, 14, 17, 20, 23];
const WAVE_SAFE_THRESHOLD = 0.3;

const DateSlider = ({
  selectedDate,
  onChange,
  dailyOutlook,
  hourlyForecast,
}) => {
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

      return {
        dayLabel: day.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' }),
        hourLabel: `${hour}`,
        date,
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

  const dailyOutlookByKey = dailyOutlook.reduce((accumulator, dayInfo) => {
    accumulator[dayInfo.dayKey] = dayInfo;
    return accumulator;
  }, {});

  const hourlyForecastByKey = useMemo(() => hourlyForecast.reduce((accumulator, hour) => {
    const key = hour.date.getTime();
    accumulator[key] = hour;
    return accumulator;
  }, {}), [hourlyForecast]);

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

  const handleDayOutlookClick = (date) => {
    const firstMarkOfDay = marks.find((mark) => (
      mark.date.getFullYear() === date.getFullYear()
      && mark.date.getMonth() === date.getMonth()
      && mark.date.getDate() === date.getDate()
    ));

    if (firstMarkOfDay) {
      handleCellClick(firstMarkOfDay.date);
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
          const dayDate = groupedMarks[day][0].date;
          const dayKey = dayDate.toLocaleDateString('sv-SE');
          const dayOutlook = dailyOutlookByKey[dayKey];
          const outlookStatusClass = dayOutlook ? dayOutlook.status.toLowerCase() : 'sin-forecast';

          return (
            <div key={index} className={`day-column ${outlookStatusClass}`}>
              <button
                type="button"
                className="day-label"
                onClick={() => handleDayOutlookClick(dayDate)}
                aria-label={`${day}: ${dayOutlook ? dayOutlook.status.replace('_', ' ').toLowerCase() : 'sin forecast'} score ${dayOutlook ? dayOutlook.bestScore : '-'}`}
              >
                {dayOutlook && <span className={`day-status-dot ${outlookStatusClass}`} />}
                {day}
              </button>
              <div className="hours-row">
                {groupedMarks[day].map((mark, idx) => (
                  (() => {
                    const hourData = hourlyForecastByKey[mark.date.getTime()];
                    const waveHeight = typeof hourData?.waveHeightMeters === 'number' ? `${hourData.waveHeightMeters.toFixed(1)}m` : 'N/D';
                    const stormProbability = typeof hourData?.stormProbability === 'number' ? `${Math.round(hourData.stormProbability)}%` : 'N/D';
                    const windSpeed = typeof hourData?.windSpeedKnots === 'number' ? `${Math.round(hourData.windSpeedKnots)}kt` : 'N/D';
                    const windDirectionDegrees = typeof hourData?.windDirectionDegrees === 'number'
                      ? Math.round(hourData.windDirectionDegrees)
                      : null;
                    const isWaveSafe = typeof hourData?.waveHeightMeters === 'number'
                      ? hourData.waveHeightMeters <= WAVE_SAFE_THRESHOLD
                      : false;

                    return (
                      <div
                        key={idx}
                        className={`hour-cell ${isWaveSafe ? 'wave-safe' : 'wave-risk'} ${selectedCell && selectedCell.getTime() === mark.date.getTime() ? 'selected' : ''}`}
                        onClick={() => handleCellClick(mark.date)}
                        onKeyDown={(e) => handleKeyDown(e, mark.date)}
                        role="button"
                        tabIndex={0}
                        aria-label={`${day} ${mark.hourLabel}:00 ola ${waveHeight} tormenta ${stormProbability} viento ${windSpeed} ${windDirectionDegrees ? `${windDirectionDegrees} grados` : ''}`}
                      >
                        <div className="hour-label">{`${mark.hourLabel}h`}</div>
                        <div className="hour-meta">{`🌊 ${waveHeight}`}</div>
                        <div className="hour-meta">{`⛈ ${stormProbability}`}</div>
                        <div className="hour-meta wind-row">
                          <span
                            className="wind-arrow"
                            style={{ transform: `rotate(${windDirectionDegrees || 0}deg)` }}
                            aria-hidden="true"
                          >
                            ↑
                          </span>
                          <span>{windSpeed}</span>
                        </div>
                      </div>
                    );
                  })()
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

DateSlider.defaultProps = {
  hourlyForecast: [],
};

export default DateSlider;

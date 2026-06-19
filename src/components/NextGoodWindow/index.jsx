import React from 'react';
import PropTypes from 'prop-types';
import './index.scss';

const formatDay = (date) => new Intl.DateTimeFormat('es-ES', {
  weekday: 'long',
  day: '2-digit',
  month: 'short',
}).format(date);

const formatHour = (date) => new Intl.DateTimeFormat('es-ES', {
  hour: '2-digit',
  minute: '2-digit',
}).format(date);

const formatRange = (window) => `${formatHour(window.start)}–${formatHour(window.end)}`;

const NextGoodWindow = ({
  loading, error, windows, reliableUntilDate, onSelectDate,
}) => {
  if (loading) {
    return (
      <section className="next-good-window loading">
        Calculando el próximo buen día para pescar…
      </section>
    );
  }

  if (error) {
    return (
      <section className="next-good-window error">
        {`No se pudo calcular el próximo buen día (${error}).`}
      </section>
    );
  }

  const reliableLabel = reliableUntilDate
    ? `Predicción fiable hasta el ${formatDay(reliableUntilDate)}`
    : null;

  if (!windows || windows.length === 0) {
    return (
      <section className="next-good-window empty">
        <div className="ngw-headline">
          <span className="ngw-emoji" role="img" aria-label="sin ventana">🚫</span>
          <div>
            <strong>Sin ventanas de salida en el horizonte fiable</strong>
            <p>No hay franjas de 6:00 a 18:00 con condiciones de salida en los próximos días.</p>
          </div>
        </div>
        {reliableLabel && <small className="ngw-reliable">{reliableLabel}</small>}
      </section>
    );
  }

  const [next, ...rest] = windows;
  const top = rest.slice(0, 2);

  return (
    <section className="next-good-window ok">
      <button
        type="button"
        className="ngw-headline ngw-clickable"
        onClick={() => onSelectDate(next.start)}
      >
        <span className="ngw-emoji" role="img" aria-label="buen día">🎣</span>
        <div>
          <span className="ngw-kicker">Próximo buen día para pescar</span>
          <strong className="ngw-main">
            {formatDay(next.start)}
            {' · '}
            {formatRange(next)}
          </strong>
          <span className="ngw-meta">
            {`${next.hours} h · score medio ${next.averageScore} (máx ${next.bestScore})`}
          </span>
        </div>
      </button>

      {top.length > 0 && (
        <div className="ngw-more">
          <span className="ngw-more-title">Siguientes ventanas</span>
          <div className="ngw-chips">
            {top.map((window) => (
              <button
                key={window.start.getTime()}
                type="button"
                className="ngw-chip"
                onClick={() => onSelectDate(window.start)}
              >
                {`${formatDay(window.start)} · ${formatRange(window)} · ${window.averageScore}`}
              </button>
            ))}
          </div>
        </div>
      )}

      {reliableLabel && <small className="ngw-reliable">{reliableLabel}</small>}
    </section>
  );
};

NextGoodWindow.propTypes = {
  loading: PropTypes.bool.isRequired,
  error: PropTypes.string,
  windows: PropTypes.arrayOf(PropTypes.shape({
    start: PropTypes.instanceOf(Date).isRequired,
    end: PropTypes.instanceOf(Date).isRequired,
    averageScore: PropTypes.number,
    bestScore: PropTypes.number,
    hours: PropTypes.number,
  })),
  reliableUntilDate: PropTypes.instanceOf(Date),
  onSelectDate: PropTypes.func.isRequired,
};

NextGoodWindow.defaultProps = {
  error: null,
  windows: [],
  reliableUntilDate: null,
};

export default NextGoodWindow;

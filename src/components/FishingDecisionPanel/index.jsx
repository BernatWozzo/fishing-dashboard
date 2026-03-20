import React from 'react';
import PropTypes from 'prop-types';
import './index.scss';

const STATUS_LABELS = {
  NO_SALIR: 'NO SALIR',
  SALIDA_CONDICIONAL: 'SALIDA CONDICIONAL',
  SALIR: 'SALIR',
};

const formatHour = (date) => new Intl.DateTimeFormat('es-ES', {
  hour: '2-digit',
  minute: '2-digit',
}).format(date);

const formatDateAndHour = (date) => new Intl.DateTimeFormat('es-ES', {
  weekday: 'short',
  day: '2-digit',
  month: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
}).format(date);

const formatUtcHour = (date) => `${String(date.getUTCHours()).padStart(2, '0')}:${String(date.getUTCMinutes()).padStart(2, '0')} UTC`;

const FishingDecisionPanel = ({
  loading,
  error,
  timezone,
  selectedDate,
  decision,
  hourlyMetrics,
  bestWindow,
}) => {
  if (loading) {
    return (
      <section className="fishing-decision-panel loading">
        Cargando forecast marino para decisión offshore...
      </section>
    );
  }

  if (error) {
    return (
      <section className="fishing-decision-panel error">
        {error}
      </section>
    );
  }

  if (!decision || !hourlyMetrics) {
    return (
      <section className="fishing-decision-panel error">
        Sin datos suficientes para evaluar esta hora.
      </section>
    );
  }

  return (
    <section className={`fishing-decision-panel ${decision.status.toLowerCase()}`}>
      <div className="decision-main">
        <div>
          <p className="decision-kicker">
            {formatDateAndHour(selectedDate)}
          </p>
          <p className="decision-timezone">
            Local /
            {' '}
            {formatUtcHour(selectedDate)}
          </p>
          <h2 className="decision-status">{STATUS_LABELS[decision.status]}</h2>
        </div>
        <div className="decision-score">
          <span>Score</span>
          <strong>{decision.totalScore}</strong>
        </div>
      </div>

      <div className="decision-metrics">
        <span>
          Ola
          {' '}
          <strong>
            {hourlyMetrics.waveHeightMeters.toFixed(1)}
            {' '}
            m
          </strong>
        </span>
        <span>
          Racha
          {' '}
          <strong>
            {Math.round(hourlyMetrics.windGustKnots)}
            {' '}
            kt
          </strong>
        </span>
        <span>
          Viento
          {' '}
          <strong>
            {Math.round(hourlyMetrics.windSpeedKnots)}
            {' '}
            kt
          </strong>
        </span>
        <span>
          Tormenta
          {' '}
          <strong>
            {Math.round(hourlyMetrics.stormProbability)}
            %
          </strong>
        </span>
      </div>

      <div className="decision-reasons">
        <p className="decision-reasons-title">
          Motivos:
          {' '}
          {decision.reasons.length > 0 ? decision.reasons.slice(0, 2).join(' · ') : 'Sin alertas relevantes'}
        </p>
      </div>

      <div className="decision-window">
        {bestWindow ? (
          <p>
            Mejor ventana segura:
            {' '}
            {formatHour(bestWindow.start)}
            {' '}
            -
            {' '}
            {formatHour(bestWindow.end)}
            {' '}
            (
            {bestWindow.hours}
            h, score medio
            {' '}
            {bestWindow.averageScore}
            )
          </p>
        ) : (
          <p>No hay ventana segura de al menos 4h en las próximas 72h.</p>
        )}
        <small>
          Timezone de datos:
          {timezone}
        </small>
      </div>
    </section>
  );
};

FishingDecisionPanel.propTypes = {
  loading: PropTypes.bool.isRequired,
  error: PropTypes.string,
  timezone: PropTypes.string.isRequired,
  selectedDate: PropTypes.instanceOf(Date).isRequired,
  decision: PropTypes.shape({
    status: PropTypes.oneOf(['NO_SALIR', 'SALIDA_CONDICIONAL', 'SALIR']),
    totalScore: PropTypes.number,
    reasons: PropTypes.arrayOf(PropTypes.string),
  }),
  hourlyMetrics: PropTypes.shape({
    waveHeightMeters: PropTypes.number,
    windGustKnots: PropTypes.number,
    windSpeedKnots: PropTypes.number,
    stormProbability: PropTypes.number,
  }),
  bestWindow: PropTypes.shape({
    start: PropTypes.instanceOf(Date),
    end: PropTypes.instanceOf(Date),
    averageScore: PropTypes.number,
    hours: PropTypes.number,
  }),
};

FishingDecisionPanel.defaultProps = {
  error: null,
  decision: null,
  hourlyMetrics: null,
  bestWindow: null,
};

export default FishingDecisionPanel;

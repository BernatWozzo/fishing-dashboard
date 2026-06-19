import React from 'react';
import PropTypes from 'prop-types';
import './index.scss';
import { explainDecision } from '../../utils/offshoreScore';

const STATUS_LABELS = {
  NO_SALIR: 'No salgas',
  SALIDA_CONDICIONAL: 'Con cuidado',
  SALIR: '¡Sal a pescar!',
};

const STATUS_EMOJI = {
  NO_SALIR: '🔴',
  SALIDA_CONDICIONAL: '🟡',
  SALIR: '🟢',
};

const FACTOR_LABELS = {
  safety: 'Seguridad',
  activity: 'Actividad',
  operational: 'Visibilidad',
};

const formatHour = (date) => new Intl.DateTimeFormat('es-ES', {
  hour: '2-digit',
  minute: '2-digit',
}).format(date);

const formatDateAndHour = (date) => new Intl.DateTimeFormat('es-ES', {
  weekday: 'long',
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
}).format(date);

const FishingDecisionPanel = ({
  loading,
  error,
  selectedDate,
  decision,
  hourlyMetrics,
  bestWindow,
}) => {
  if (loading) {
    return (
      <section className="fishing-decision-panel state-msg loading">
        Cargando forecast marino…
      </section>
    );
  }

  if (error) {
    return (
      <section className="fishing-decision-panel state-msg error">{error}</section>
    );
  }

  if (!decision || !hourlyMetrics) {
    return (
      <section className="fishing-decision-panel state-msg error">
        Sin datos suficientes para evaluar esta hora.
      </section>
    );
  }

  const { positives, negatives } = explainDecision(hourlyMetrics, hourlyMetrics.date);
  const statusClass = decision.status.toLowerCase();

  return (
    <section className={`fishing-decision-panel ${statusClass}`}>
      <header className="decision-hero">
        <span className="decision-light" aria-hidden="true">{STATUS_EMOJI[decision.status]}</span>
        <div className="decision-hero-text">
          <p className="decision-kicker">{formatDateAndHour(selectedDate)}</p>
          <h2 className="decision-status">{STATUS_LABELS[decision.status]}</h2>
        </div>
        <div className="decision-score">
          <strong>{decision.totalScore}</strong>
          <span>score</span>
        </div>
      </header>

      <div className="decision-metrics">
        <span className="metric">
          <em>Ola</em>
          <strong>{`${hourlyMetrics.waveHeightMeters.toFixed(1)} m`}</strong>
        </span>
        <span className="metric">
          <em>Racha</em>
          <strong>{`${Math.round(hourlyMetrics.windGustKnots)} kt`}</strong>
        </span>
        <span className="metric">
          <em>Viento</em>
          <strong>{`${Math.round(hourlyMetrics.windSpeedKnots)} kt`}</strong>
        </span>
        <span className="metric">
          <em>Tormenta</em>
          <strong>{`${Math.round(hourlyMetrics.stormProbability)} %`}</strong>
        </span>
      </div>

      {decision.factorScores && (
        <div className="decision-factors">
          {Object.entries(FACTOR_LABELS).map(([key, label]) => {
            const value = decision.factorScores[key] ?? 0;
            let tone = 'bad';
            if (value >= 70) tone = 'good';
            else if (value >= 45) tone = 'mid';
            return (
              <div className="factor-row" key={key}>
                <span className="factor-label">{label}</span>
                <span className="factor-bar">
                  <span
                    className={`factor-fill ${tone}`}
                    style={{ width: `${value}%` }}
                  />
                </span>
                <span className="factor-value">{value}</span>
              </div>
            );
          })}
        </div>
      )}

      <div className="decision-why">
        {positives.length > 0 && (
          <ul className="why-list good">
            {positives.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        )}
        {negatives.length > 0 && (
          <ul className="why-list bad">
            {negatives.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="decision-window">
        {bestWindow ? (
          <p>
            <span role="img" aria-label="ventana">🪟</span>
            {` Mejor ventana: ${formatHour(bestWindow.start)}–${formatHour(bestWindow.end)} `}
            <small>{`(${bestWindow.hours} h · score ${bestWindow.averageScore})`}</small>
          </p>
        ) : (
          <p className="muted">Sin ventana segura de 4h en las próximas 72h.</p>
        )}
      </div>
    </section>
  );
};

FishingDecisionPanel.propTypes = {
  loading: PropTypes.bool.isRequired,
  error: PropTypes.string,
  selectedDate: PropTypes.instanceOf(Date).isRequired,
  decision: PropTypes.shape({
    status: PropTypes.oneOf(['NO_SALIR', 'SALIDA_CONDICIONAL', 'SALIR']),
    totalScore: PropTypes.number,
    reasons: PropTypes.arrayOf(PropTypes.string),
    factorScores: PropTypes.shape({
      safety: PropTypes.number,
      activity: PropTypes.number,
      operational: PropTypes.number,
    }),
  }),
  hourlyMetrics: PropTypes.shape({
    date: PropTypes.instanceOf(Date),
    waveHeightMeters: PropTypes.number,
    windGustKnots: PropTypes.number,
    windSpeedKnots: PropTypes.number,
    windDirectionDegrees: PropTypes.number,
    stormProbability: PropTypes.number,
    visibilityKilometers: PropTypes.number,
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

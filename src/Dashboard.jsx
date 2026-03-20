import React, { useMemo, useState } from 'react';
import Header from './components/Header';
import WindyMap from './components/WindyMap';
import AemetImage from './components/AemetImage';
import ElTiempoImage from './components/ElTiempoImage';
import FishingDecisionPanel from './components/FishingDecisionPanel';
import MapPopup from './components/MapPopUp';
import useMarineForecast from './hooks/useMarineForecast';
import { evaluateOffshoreHour, findBestWindow } from './utils/offshoreScore';

const DEFAULT_FISHING_SPOT = { lat: 39.353, lng: 2.572 };

const getClosestHour = (date) => {
  const hoursArray = [2, 5, 8, 11, 14, 17, 20, 23];
  const currentHour = date.getHours();
  const closestHour = hoursArray.reduce((prev, curr) => (Math.abs(curr - currentHour) < Math.abs(prev - currentHour) ? curr : prev));

  const closestDate = new Date(date);
  closestDate.setHours(closestHour, 0, 0, 0);
  return closestDate;
};

const Dashboard = () => {
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    return getClosestHour(now);
  });

  const [coordinates, setCoordinates] = useState(() => {
    const savedCoordinates = localStorage.getItem('coordinates');
    return savedCoordinates ? JSON.parse(savedCoordinates) : DEFAULT_FISHING_SPOT;
  });

  const [windyOverlay, setWindyOverlay] = useState(() => localStorage.getItem('windyOverlay') || 'waves');
  const [isMapOpen, setIsMapOpen] = useState(false);

  const changeLocation = (newCoordinates) => {
    setCoordinates(newCoordinates);
    localStorage.setItem('coordinates', JSON.stringify(newCoordinates));
  };

  const changeWindyOverlay = (event) => {
    const overlay = event.target.value;
    setWindyOverlay(overlay);
    localStorage.setItem('windyOverlay', overlay);
  };

  const openMap = () => setIsMapOpen(true);
  const closeMap = () => setIsMapOpen(false);

  const {
    loading,
    error,
    forecast,
    metadata,
  } = useMarineForecast(coordinates);

  const evaluatedForecast = useMemo(() => forecast.map((hour) => ({
    ...hour,
    decision: evaluateOffshoreHour(hour, hour.date),
  })), [forecast]);

  const selectedHourData = useMemo(() => {
    if (!evaluatedForecast.length) return null;
    const selectedTime = selectedDate.getTime();
    return evaluatedForecast.reduce((closest, current) => {
      if (!closest) return current;
      const currentDiff = Math.abs(current.date.getTime() - selectedTime);
      const closestDiff = Math.abs(closest.date.getTime() - selectedTime);
      return currentDiff < closestDiff ? current : closest;
    }, null);
  }, [evaluatedForecast, selectedDate]);

  const bestWindow = useMemo(
    () => findBestWindow(evaluatedForecast, selectedDate, 3),
    [evaluatedForecast, selectedDate],
  );

  const dailyOutlook = useMemo(() => {
    const groupedByDay = evaluatedForecast.reduce((accumulator, hour) => {
      const dayKey = hour.date.toLocaleDateString('sv-SE');
      if (!accumulator[dayKey]) {
        accumulator[dayKey] = [];
      }
      accumulator[dayKey].push(hour);
      return accumulator;
    }, {});

    return Object.keys(groupedByDay)
      .sort()
      .slice(0, 10)
      .map((dayKey) => {
        const dayHours = groupedByDay[dayKey];
        const salirHours = dayHours.filter((hour) => hour.decision.status === 'SALIR').length;
        const noSalirHours = dayHours.filter((hour) => hour.decision.status === 'NO_SALIR').length;
        const bestScore = Math.max(...dayHours.map((hour) => hour.decision.totalScore));

        let status = 'NO_SALIR';
        if (salirHours >= 3) {
          status = 'SALIR';
        } else if (salirHours > 0 || bestScore >= 60 || noSalirHours < dayHours.length) {
          status = 'SALIDA_CONDICIONAL';
        }

        return {
          dayKey,
          date: dayHours[0].date,
          status,
          bestScore,
        };
      });
  }, [evaluatedForecast]);

  return (
    <div className="dashboard">
      <Header
        selectedDate={selectedDate}
        onChangeDate={setSelectedDate}
        dailyOutlook={dailyOutlook}
      />
      <div className="dashboard-content">
        <aside className="dashboard-decision-panel-wrapper">
          <button type="button" className="location-sidebar-button" onClick={openMap}>
            Cambiar punto
          </button>
          {isMapOpen && (
            <MapPopup setCoordinates={changeLocation} onClose={closeMap} coordinates={coordinates} />
          )}
          <FishingDecisionPanel
            loading={loading}
            error={error}
            timezone={metadata.timezone}
            selectedDate={selectedDate}
            decision={selectedHourData?.decision}
            hourlyMetrics={selectedHourData}
            bestWindow={bestWindow}
          />
          <div className="windy-overlay-controls">
            <span>Capa Windy</span>
            <select aria-label="Capa Windy" id="windyOverlay" value={windyOverlay} onChange={changeWindyOverlay}>
              <option value="waves">Olas</option>
              <option value="wind">Viento</option>
              <option value="currents">Corrientes</option>
              <option value="pressure">Presión</option>
              <option value="rain">Lluvia</option>
              <option value="clouds">Nubes</option>
            </select>
          </div>
        </aside>
        <div className="maps">
          <AemetImage date={selectedDate} />
          <ElTiempoImage date={selectedDate} />
          <WindyMap lat={coordinates.lat} lng={coordinates.lng} overlay={windyOverlay} date={selectedDate} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

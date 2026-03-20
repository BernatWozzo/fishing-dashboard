import {
  useCallback, useEffect, useMemo, useState,
} from 'react';

const buildMarineUrl = (lat, lng) => `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lng}&hourly=wave_height,wave_direction,wave_period&forecast_days=16&timezone=auto`;

const buildWeatherUrl = (lat, lng) => `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&hourly=wind_speed_10m,wind_direction_10m,wind_gusts_10m,precipitation_probability,visibility&forecast_days=16&timezone=auto&wind_speed_unit=kn`;

const parseHourly = (marineHourly, weatherHourly) => {
  if (!marineHourly?.time || !weatherHourly?.time) return [];

  const weatherByTime = weatherHourly.time.reduce((acc, time, index) => {
    acc[time] = {
      windSpeedKnots: weatherHourly.wind_speed_10m?.[index] ?? 0,
      windDirectionDegrees: weatherHourly.wind_direction_10m?.[index] ?? null,
      windGustKnots: weatherHourly.wind_gusts_10m?.[index] ?? 0,
      stormProbability: weatherHourly.precipitation_probability?.[index] ?? 0,
      visibilityKilometers: ((weatherHourly.visibility?.[index] ?? 10000) / 1000),
    };
    return acc;
  }, {});

  return marineHourly.time
    .map((time, index) => {
      const weather = weatherByTime[time];
      if (!weather) return null;

      return {
        date: new Date(time),
        waveHeightMeters: marineHourly.wave_height?.[index] ?? 0,
        waveDirection: marineHourly.wave_direction?.[index] ?? null,
        wavePeriodSeconds: marineHourly.wave_period?.[index] ?? null,
        ...weather,
      };
    })
    .filter(Boolean);
};

const useMarineForecast = (coordinates) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [timezone, setTimezone] = useState('local');

  const fetchForecast = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [marineResponse, weatherResponse] = await Promise.all([
        fetch(buildMarineUrl(coordinates.lat, coordinates.lng)),
        fetch(buildWeatherUrl(coordinates.lat, coordinates.lng)),
      ]);

      if (!marineResponse.ok || !weatherResponse.ok) {
        throw new Error('No se pudo cargar el forecast marino');
      }

      const [marineData, weatherData] = await Promise.all([
        marineResponse.json(),
        weatherResponse.json(),
      ]);

      const normalized = parseHourly(marineData.hourly, weatherData.hourly);
      setForecast(normalized);
      setTimezone(weatherData.timezone || marineData.timezone || 'local');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, [coordinates.lat, coordinates.lng]);

  useEffect(() => {
    fetchForecast();
  }, [fetchForecast]);

  const metadata = useMemo(() => ({
    points: forecast.length,
    timezone,
  }), [forecast.length, timezone]);

  return {
    loading,
    error,
    forecast,
    metadata,
    refetch: fetchForecast,
  };
};

export default useMarineForecast;

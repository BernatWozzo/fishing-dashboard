import React, { useState } from 'react';
import Header from './components/Header';
import WindyMap from './components/WindyMap';
import AemetImage from './components/AemetImage';
import ElTiempoImage from './components/ElTiempoImage';

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
    return savedCoordinates ? JSON.parse(savedCoordinates) : { lat: 39.36628848860643, lng: 2.590713500976563 };
  });

  const changeLocation = (newCoordinates) => {
    setCoordinates(newCoordinates);
    localStorage.setItem('coordinates', JSON.stringify(newCoordinates));
  };

  return (
    <div className="dashboard">
      <Header coordinates={coordinates} changeLocation={changeLocation} selectedDate={selectedDate} onChangeDate={setSelectedDate} />
      <div className="maps">
        <AemetImage date={selectedDate} />
        <ElTiempoImage date={selectedDate} />
        <WindyMap lat={coordinates.lat} lng={coordinates.lng} date={selectedDate} />
      </div>
    </div>
  );
};

export default Dashboard;

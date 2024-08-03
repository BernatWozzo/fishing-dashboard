import React, { useState } from 'react';
import Header from './components/Header';
import WindyMap from './components/WindyMap';
import AemetImage from './components/AemetImage';
import ElTiempoImage from './components/ElTiempoImage';
import DateSlider from './components/DateSlider';

const Dashboard = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [coordinates, setCoordinates] = useState({ lat: 39.36628848860643, lng: 2.590713500976563 });

  const changeLocation = (newCoordinates) => {
    setCoordinates(newCoordinates);
  };

  return (
    <div>
      <Header coordinates={coordinates} changeLocation={changeLocation} />
      <DateSlider selectedDate={selectedDate} onChange={setSelectedDate} />
      <WindyMap lat={coordinates.lat} lng={coordinates.lng} date={selectedDate} />
      <AemetImage date={selectedDate} />
      <ElTiempoImage date={selectedDate} />
    </div>
  );
};

export default Dashboard;

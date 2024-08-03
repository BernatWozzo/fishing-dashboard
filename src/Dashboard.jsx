import React, { useState } from 'react';
import Header from './components/Header';
import Slider from './components/Slider';
import WindyMap from './components/WindyMap';
import AemetImage from './components/AemetImage';
import ElTiempoImage from './components/ElTiempoImage';

const Dashboard = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [coordinates, setCoordinates] = useState({ lat: 0, lng: 0 });

  const changeLocation = (newCoordinates) => {
    setCoordinates(newCoordinates);
  };

  return (
    <div>
      <Header coordinates={coordinates} changeLocation={changeLocation} />
      <Slider selectedDate={selectedDate} onChange={setSelectedDate} />
      <WindyMap lat={coordinates.lat} lng={coordinates.lng} date={selectedDate} />
      <AemetImage date={selectedDate} />
      <ElTiempoImage date={selectedDate} />
    </div>
  );
};

export default Dashboard;

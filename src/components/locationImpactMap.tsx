import React, { useEffect, useRef, useState } from 'react';
import { Marker, MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { msgData } from '../types';

interface LocationImpactMapProps {
  data: msgData[];
}

const LocationImpactMap: React.FC<LocationImpactMapProps> = ({ data }) => {
  // console.log(`data from LocationImpactMap: ${JSON.stringify(data, null, 2)}`)
  console.log(JSON.parse(data[0].heterogenous_geo).lat)
  const [impactMetric, setImpactMetric] = useState<'accuracy' | 'deltaDistance'>('accuracy');

  const getColor = (value: number, max: number) => {
    const hue = ((1 - value / max) * 120).toString(10);
    return `hsl(${hue}, 100%, 50%)`;
  };

  const renderMarkers = () => {
    const maxValue = Math.max(...data.map(msg =>
      impactMetric === 'accuracy' ? JSON.parse(msg.heterogenous_geo).accuracy : msg.delta_distance
    ));

    return data.map((msg: msgData, index) => {
      const value = impactMetric === 'accuracy' ? JSON.parse(msg.heterogenous_geo).accuracy : msg.delta_distance;
      const color = getColor(value, maxValue);
      return (
        <Marker
          key={index}
          position={[JSON.parse(msg.heterogenous_geo).lat, JSON.parse(msg.heterogenous_geo).lng]}
        >
          <Popup>
            <div>
              <p>Delta Distance: {msg.delta_distance} m</p>
              <p>Accuracy: {JSON.parse(msg.heterogenous_geo).accuracy} m</p>
              <p>Tech: {JSON.parse(msg.msg_geo).tech}</p>
              <p>GSM Count: {JSON.parse(msg.data).filter(d => d.type === 'gsm').length}</p>
              <p>WiFi Count: {JSON.parse(msg.data).filter(d => d.type === 'wifi').length}</p>
            </div>
          </Popup>
        </Marker>
      );
    });
  };

  return (
    <div className="h-screen">
      <div className="mb-4">
        <label className="mr-2">Color by:</label>
        <select
          value={impactMetric}
          onChange={(e) => setImpactMetric(e.target.value as 'accuracy' | 'deltaDistance')}
          className="p-2 border rounded"
        >
          <option value="accuracy">Accuracy</option>
          <option value="deltaDistance">Delta Distance</option>
        </select>
      </div>
      <MapContainer center={[51.505, -0.09]} zoom={2} style={{ height: '100%', width: '100%' }} scrollWheelZoom={true}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {renderMarkers()}
      </MapContainer>
    </div>
  );
};

export default LocationImpactMap;

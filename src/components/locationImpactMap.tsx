import React, { useState, useMemo } from 'react';
import { Marker, MapContainer, TileLayer, Polyline, LayersControl, LayerGroup, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { msgData } from '../types';
import BoundsUpdater from './boundsUpdates';

export interface LocationImpactMapProps {
  data: msgData[];
}

const LocationImpactMap: React.FC<LocationImpactMapProps> = ({ data }) => {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const redIcon = useMemo(() => new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  }), []);

  const renderMarkers = (msg: msgData, index: number) => {
    const heteroGeo = JSON.parse(msg.heterogenous_geo);
    const msgGeo = JSON.parse(msg.msg_geo);

    const heteroPosition: L.LatLngExpression = [heteroGeo.lat, heteroGeo.lng];
    const msgGeoPosition: L.LatLngExpression = [msgGeo.lat, msgGeo.lng];

    const uuid = msgGeo.msg_source;

    const handleClick = () => {
      setActiveFilter(activeFilter === uuid ? null : uuid);
    }

    return (
      <LayerGroup key={`group-${index}`}>
        <Marker position={heteroPosition} icon={redIcon} eventHandlers={{ click: handleClick }}>
          <Tooltip>
            <div>
              <h2>Heterogeneous Geo</h2>
              <p>Location: [lat: {heteroGeo.lat}, lng: {heteroGeo.lng}]</p>
              <p>Msg_uuid: {msgGeo.msg_source}</p>
              <p>Date: {msg.created_date}</p>
              <p>Delta Distance: {msg.delta_distance}m</p>
              <p>Accuracy: {heteroGeo.accuracy}m</p>
              <p>GSM Count: {JSON.parse(msg.data).filter(d => d.type === 'gsm').length}</p>
              <p>WiFi Count: {JSON.parse(msg.data).filter(d => d.type === 'wifi').length}</p>
            </div>
          </Tooltip>
        </Marker>
        <Marker position={msgGeoPosition} eventHandlers={{ click: handleClick }}>
          <Tooltip>
            <div>
              <h2>Message Geo</h2>
              <p>Tech: {msgGeo.tech.toUpperCase()}</p>
              <p>Imei: {msg.bee_imei}</p>
              <p>Msg_uuid: {msgGeo.msg_source}</p>
              <p>Date: {msg.created_date}</p>
              <p>Location: [lat: {msgGeo.lat}, lng: {msgGeo.lng}]</p>
              <p>Reported Accuracy: {msgGeo.reported_accuracy}m</p>
              <p>Actual Accuracy: {msgGeo.accuracy}m</p>
            </div>
          </Tooltip>
        </Marker>
        <Polyline positions={[msgGeoPosition, heteroPosition]} color="blue" />
      </LayerGroup>
    );
  };

  const groupedByUuid = useMemo(() => {
    return data.reduce((acc, msg) => {
      const uuid = JSON.parse(msg.msg_geo).msg_source;
      if (!acc[uuid]) {
        acc[uuid] = [];
      }
      acc[uuid].push(msg);
      return acc;
    }, {} as Record<string, msgData[]>);
  }, [data]);

  const filteredData = useMemo(() => {
    if (!activeFilter) return data;
    return data.filter(msg => JSON.parse(msg.msg_geo).msg_source === activeFilter);
  }, [data, activeFilter]);

  return (
    <div className="h-full w-full">
      <MapContainer center={[0, 0]} zoom={2} style={{ height: '100%', width: '100%' }} scrollWheelZoom={true}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LayersControl position="topright">

          <LayersControl.Overlay checked name="All Markers">
            <LayerGroup>
              {filteredData.map((msg, index) => renderMarkers(msg, index))}
            </LayerGroup>
          </LayersControl.Overlay>

          <LayersControl.Overlay name="By UUID">
            {Object.entries(groupedByUuid).map(([uuid, messages]) => (
              <LayersControl.Overlay key={uuid} name={`UUID: ${uuid}`}>
                <LayerGroup>
                  {messages
                    .filter(msg => !activeFilter || JSON.parse(msg.msg_geo).msg_source === activeFilter)
                    .map((msg, index) => renderMarkers(msg, index))}
                </LayerGroup>
              </LayersControl.Overlay>
            ))}
          </LayersControl.Overlay>
        </LayersControl>

        <BoundsUpdater data={data} />
      </MapContainer>
    </div>
  );
};

export default LocationImpactMap;
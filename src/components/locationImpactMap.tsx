import React, { useEffect } from 'react';
import { Marker, MapContainer, TileLayer, Polyline, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { msgData } from '../types';

interface LocationImpactMapProps {
  data: msgData[];
}

const BoundsUpdater = ({ data }) => {
  const map = useMap();

  useEffect(() => {
    if (data.length > 0) {
      const bounds = data.reduce((acc: L.LatLngBounds, msg: msgData) => {
        const heteroGeo = JSON.parse(msg.heterogenous_geo);
        const msgGeo = JSON.parse(msg.msg_geo);
        return acc
          .extend([heteroGeo.lat, heteroGeo.lng])
          .extend([msgGeo.lat, msgGeo.lng]);
      }, L.latLngBounds([]));

      map.fitBounds(bounds);
    }
  }, [map, data]);

  return null;
};

const LocationImpactMap: React.FC<LocationImpactMapProps> = ({ data }) => {
  console.log(`impactMap rendering data: ${JSON.stringify(data, null, 2)}`)

  const renderMarkers = () => {
    const redIcon = new L.Icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    return data.flatMap((msg: msgData, index) => {
      const heteroGeo = JSON.parse(msg.heterogenous_geo);
      const msgGeo = JSON.parse(msg.msg_geo);

      const heteroPosition: L.LatLngExpression = [heteroGeo.lat, heteroGeo.lng];
      const msgGeoPosition: L.LatLngExpression = [msgGeo.lat, msgGeo.lng];

      return [
        // Marker for heterogeneous geo (red)
        <Marker
          key={`hetero-${index}`}
          position={heteroPosition}
          icon={redIcon}
        >
          <Popup>
            <div>
              <h2>Heterogeneous Geo </h2>
              <p>Lat: {heteroGeo.lat}, Lng: {heteroGeo.lng} </p>
              <p>Delta Distance: {msg.delta_distance}m </p>
              <p>Accuracy: {heteroGeo.accuracy}m </p>
              <p>GSM Count: {JSON.parse(msg.data).filter(d => d.type === 'gsm').length} </p>
              <p>WiFi Count: {JSON.parse(msg.data).filter(d => d.type === 'wifi').length} </p>
              <p>Msg_uuid: {msgGeo.msg_source} </p>
              <p>Date: {msg.created_date} </p>
            </div>
          </Popup>
        </Marker>,

        // Marker for msg geo (blue)
        <Marker
          key={`msg-${index}`}
          position={msgGeoPosition}
        >
          <Popup>
            <div>
              <h2>Message Geo </h2>
              <p>Tech: {msgGeo.tech.toUpperCase()} </p>
              <p>Imei: {msg.bee_imei} </p>
              <p>Lat: {msgGeo.lat}, Lng: {msgGeo.lng} </p>
              <p>Reported Accuracy: {msgGeo.reported_accuracy}m </p>
              <p>Actual Accuracy: {msgGeo.accuracy}m </p>
              <p>Msg_uuid: {msgGeo.msg_source} </p>
              <p>Date: {msg.created_date} </p>
            </div>
          </Popup>
        </Marker>,

        // Line between the two positions
        <Polyline
          key={`line-${index}`}
          positions={[msgGeoPosition, heteroPosition]}
          color="blue"
        />
      ];
    });
  };

  return (
    <div className="h-full w-full">
      <MapContainer center={[0, 0]} zoom={2} style={{ height: '100%', width: '100%' }} scrollWheelZoom={true}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {renderMarkers()}
        <BoundsUpdater data={data} />
      </MapContainer>
    </div>
  );
};

export default LocationImpactMap;

import React, { useState, useMemo, useCallback, useRef } from 'react';
import { Marker, MapContainer, TileLayer, Polyline, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { msgData } from '../../types';
import AdditionalPoints from './additionalPoints';
import BoundsUpdater from './boundsUpdates'
import MsgUuidSelector from './uuidSelector';

export interface LocationImpactMapProps {
  data: msgData[];
}

export interface InspectedUuid {
  uuid: string;
  msgData: msgData;
}

const LocationImpactMap: React.FC<LocationImpactMapProps> = ({ data }) => {
  const [selectedUuids, setSelectedUuids] = useState<string[]>([]);
  const [inspectedUuid, setInspectedUuid] = useState<InspectedUuid | null>(null);
  const mapRef = useRef<L.Map | null>(null);

  const uniqueMsgUuids = useMemo(() => {
    return Array.from(new Set(data.map(msg => JSON.parse(msg.msg_geo).msg_source)));
  }, [data]);

  const redIcon = useMemo(() => new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  }), []);

  const handleMarkerClick = useCallback((uuid: string, msg: msgData) => {
    setInspectedUuid(prevInspected =>
      prevInspected?.uuid === uuid ? null : { uuid, msgData: msg }
    );
  }, []);

  const renderMarkers = useCallback((msg: msgData) => {
    const heteroGeo = JSON.parse(msg.heterogenous_geo);
    const msgGeo = JSON.parse(msg.msg_geo);

    const heteroPosition: L.LatLngExpression = [heteroGeo.lat, heteroGeo.lng];
    const msgGeoPosition: L.LatLngExpression = [msgGeo.lat, msgGeo.lng];

    const uuid = msgGeo.msg_source;

    return (
      <React.Fragment key={`group-${uuid}`}>
        <Marker
          position={heteroPosition}
          icon={redIcon}
          eventHandlers={{ click: () => handleMarkerClick(uuid, msg) }}
          zIndexOffset={1000}
        >
          <Tooltip>
            <div>
              <h2>Heterogeneous Geo</h2>
              <p>Location: [lat: {heteroGeo.lat}, lng: {heteroGeo.lng}]</p>
              <p>Imei: {msg.bee_imei}</p>
              <p>Msg_uuid: {msgGeo.msg_source}</p>
              <p>Date: {msg.created_date}</p>
              <p>Delta Distance: {msg.delta_distance}m</p>
              <p>Accuracy: {heteroGeo.accuracy}m</p>
              <p>GSM Count: {JSON.parse(msg.data).filter(d => d.type === 'gsm').length}</p>
              <p>WiFi Count: {JSON.parse(msg.data).filter(d => d.type === 'wifi').length}</p>
            </div>
          </Tooltip>
        </Marker>
        <Marker
          position={msgGeoPosition}
          eventHandlers={{ click: () => handleMarkerClick(uuid, msg) }}
        >
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
        {inspectedUuid?.uuid === uuid && (
          <AdditionalPoints msg={msg} />
        )}
      </React.Fragment>
    );
  }, [redIcon, handleMarkerClick, inspectedUuid]);

  const filteredData = useMemo(() => {
    if (inspectedUuid) {
      return data.filter(msg => JSON.parse(msg.msg_geo).msg_source === inspectedUuid.uuid);
    }
    if (selectedUuids.length === 0) return data;
    return data.filter(msg => selectedUuids.includes(JSON.parse(msg.msg_geo).msg_source));
  }, [data, selectedUuids, inspectedUuid]);

  const PerformanceOptimizer = () => {
    const map = useMap();
    mapRef.current = map;

    React.useEffect(() => {
      if (!map) return;

      const updateVisibility = () => {
        const bounds = map.getBounds();
        const zoom = map.getZoom();
        const visibleMarkers = filteredData.filter(msg => {
          const heteroGeo = JSON.parse(msg.heterogenous_geo);
          return bounds.contains([heteroGeo.lat, heteroGeo.lng]);
        });

        // Adjust this threshold based on your performance needs
        const maxVisibleMarkers = zoom > 10 ? 1000 : 200;

        if (visibleMarkers.length > maxVisibleMarkers) {
          // If too many markers are visible, only show a subset
          const step = Math.ceil(visibleMarkers.length / maxVisibleMarkers);
          return visibleMarkers.filter((_, index) => index % step === 0);
        }

        return visibleMarkers;
      };

      map.on('moveend', updateVisibility);
      return () => {
        map.off('moveend', updateVisibility);
      };
    }, [map]);

    return null;
  };

  const renderAllMarkers = () => {
    console.time("Render All Markers");
    const markers = filteredData.map(renderMarkers);
    console.timeEnd("Render All Markers");
    return markers;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 bg-white shadow-md z-10">
        <MsgUuidSelector
          options={uniqueMsgUuids}
          onChange={setSelectedUuids}
        />
      </div>
      <div className="flex-grow relative">
        <MapContainer
          center={[0, 0]}
          zoom={2}
          style={{ height: '100%', width: '100%', zIndex: 1 }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {renderAllMarkers()}
          <BoundsUpdater data={filteredData} inspectedUuid={inspectedUuid} />
          <PerformanceOptimizer />
        </MapContainer>
      </div>
    </div>
  );
};

export default LocationImpactMap;
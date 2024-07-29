import React, { useState, useMemo, useCallback, useRef } from 'react';
import { Marker, MapContainer, TileLayer, Polyline, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { GsmData, msgData, WifiData } from '../../types';
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
  console.log(`data: ${data}`)
  const [selectedUuids, setSelectedUuids] = useState<string[]>([]);
  const [inspectedUuid, setInspectedUuid] = useState<InspectedUuid | null>(null);
  const mapRef = useRef<L.Map | null>(null);


  const uniqueMsgUuids = useMemo(() => {
    if (data.length === 0) return [];
    return Array.from(new Set(data.map(msg => {
      if (msg.msg_geo !== null) {
        const msgGeo = JSON.parse(JSON.stringify(msg.msg_geo));
        if (msgGeo.msg_source !== null) {
          return msgGeo.msg_source;
        }
      }
    })));
  }, [data]);

  // Updated to accept a color parameter and dynamically set the iconUrl based on type
  const getIcon = useCallback((type: string) => {
    let iconColorUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png'; // default red
    if (type === 'gps') {
      iconColorUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png';
    } else if (type === 'wifi') {
      iconColorUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png'; // Change to your yellow icon URL
    } else if (type === 'gsm') {
      iconColorUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png'; // Change to your green icon URL
    }

    return new L.Icon({
      iconUrl: iconColorUrl,
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
  }, []);

  const handleMarkerClick = useCallback((uuid: string, msg: msgData) => {
    setInspectedUuid(prevInspected =>
      prevInspected?.uuid === uuid ? null : { uuid, msgData: msg }
    );
  }, []);

  const renderMarkers = useCallback((msg: msgData) => {

    const heteroGeo = JSON.parse(msg.heterogenous_geo);
    const msgGeo = JSON.parse(msg.msg_geo);

    const heteroPosition: L.LatLngExpression = [heteroGeo.lat, heteroGeo.lng];
    if (msgGeo === null) return
    const msgGeoPosition: L.LatLngExpression = [msgGeo.lat, msgGeo.lng];

    const uuid = msgGeo.msg_source;

    return (
      <React.Fragment key={`group-${uuid}`}>
        <Marker
          position={heteroPosition}
          icon={getIcon('hetero')}
          eventHandlers={{ click: () => handleMarkerClick(uuid, msg) }}
        // zIndexOffset={1000}
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
              <p>GSM Count: {JSON.parse(msg.data).filter((d) => d.type === 'gsm').length}</p>
              <p>WiFi Count: {JSON.parse(msg.data).filter((d) => d.type === 'wifi').length}</p>
            </div>
          </Tooltip>
        </Marker>
        <Marker
          position={msgGeoPosition}
          eventHandlers={{ click: () => handleMarkerClick(uuid, msg) }}
          icon={getIcon(msgGeo.tech)}
        >
          <Tooltip>
            <div>
              <h2>Message Geo</h2>
              <p>Tech: {msgGeo.tech.toUpperCase()}</p>
              <p>IsHet: {msgGeo.heterogenousLookup ? "True" : "False"}</p>
              <p>Imei: {msg.bee_imei}</p>
              <p>Msg_uuid: {msgGeo.msg_source}</p>
              <p>Delta Distance: {msg.delta_distance}m</p>
              <p>Date: {msg.created_date}</p>
              <p>Location: [lat: {msgGeo.lat}, lng: {msgGeo.lng}]</p>
              <p>Reported Accuracy: {msgGeo.reported_accuracy}m</p>
              <p>Actual Accuracy: {msgGeo.accuracy}m</p>
            </div>
          </Tooltip>
        </Marker>
        <Polyline positions={[msgGeoPosition, heteroPosition]} color="blue">
          <Tooltip>{uuid}</Tooltip>
        </Polyline>
        {inspectedUuid?.uuid === uuid && (
          <AdditionalPoints msg={msg} />
        )}
      </React.Fragment>
    );
  }, [getIcon, handleMarkerClick, inspectedUuid]);

  const filteredData = useMemo(() => {
    if (data.length === 0) return [];
    if (inspectedUuid) {
      return data.filter(msg => {
        const msgGeo = JSON.parse(msg.msg_geo);
        if (msgGeo === null || msgGeo === undefined) return
        return msgGeo.msg_source === inspectedUuid.uuid;
      });
    }
    if (selectedUuids.length === 0) return data;
    return data.filter(msg => {
      const msgGeo = JSON.parse(msg.heterogenous_geo);
      if (msgGeo === null || msgGeo === undefined) return
      return selectedUuids.includes(msgGeo.msg_source);
    });
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

  // func to render all markers from constructured filteredData
  const renderAllMarkers = () => {
    if (filteredData.length === 0) return null;
    console.time("Render All Markers");
    const markers = filteredData.map(renderMarkers);
    console.timeEnd("Render All Markers");
    return markers;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 flex bg-white shadow-md z-10">
        <MsgUuidSelector
          options={uniqueMsgUuids}
          onChange={setSelectedUuids}
        />
        <div className='w-1/2 p-2 ml-4 border border-gray-300 rounded-md'>
          <h1>Tool Box Component</h1>
        </div>
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
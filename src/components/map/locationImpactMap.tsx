import React, { useState, useMemo, useCallback } from 'react';
import { Marker, MapContainer, TileLayer, Polyline, LayersControl, LayerGroup, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { msgData } from '../../types';
import BoundsUpdater from './boundsUpdates';

export interface LocationImpactMapProps {
  data: msgData[];
}

const gsmIcon = L.divIcon({
  html: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="16" width="4" height="4" fill="green" stroke="black" stroke-width="1"/>
    <rect x="8" y="12" width="4" height="8" fill="green" stroke="black" stroke-width="1"/>
    <rect x="14" y="8" width="4" height="12" fill="green" stroke="black" stroke-width="1"/>
    <rect x="20" y="4" width="4" height="16" fill="green" stroke="black" stroke-width="1"/>
  </svg>`,
  className: 'gsm-icon',
  iconSize: [24, 24],
  iconAnchor: [12, 12]
})

const wifiIcon = L.divIcon({
  html: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12 21L15.5 16.5C14.5 15.5 13.3 15 12 15C10.7 15 9.5 15.5 8.5 16.5L12 21Z" fill="#bcbc06" stroke="black" stroke-width="1"/>
<path d="M12 3C7.95 3 4.21 4.34 1.2 6.6L3 9C5.5 7.12 8.62 6 12 6C15.38 6 18.5 7.12 21 9L22.8 6.6C19.79 4.34 16.05 3 12 3Z" fill="#bcbc06" stroke="black" stroke-width="1"/>
<path d="M12 9C9.3 9 6.81 9.89 4.8 11.4L6.6 13.8C8.1 12.67 9.97 12 12 12C14.03 12 15.9 12.67 17.4 13.8L19.2 11.4C17.19 9.89 14.7 9 12 9Z" fill="#bcbc06" stroke="black" stroke-width="1"/>
</svg>`,
  className: 'wifi-icon',
  iconSize: [24, 24],
  iconAnchor: [12, 12]
})

const AdditionalPoints: React.FC<{ msg: msgData }> = ({ msg }) => {
  const hetData = JSON.parse(msg.data)
  console.log(hetData)

  return hetData.map((d) => {
    if (d.type === 'wifi') {
      return <Marker position={[d.lat, d.lng]} icon={wifiIcon} key={`${d.type}-${d.uuid}`} />
    } else if (d.type === 'gsm') {
      return <Marker position={[d.lat, d.lng]} icon={gsmIcon} key={`${d.type}-${d.uuid}`} />
    }
  });
};

const LocationImpactMap: React.FC<LocationImpactMapProps> = ({ data }) => {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [visibleLayers, setVisibleLayers] = useState<Set<string>>(new Set(['All Markers']));
  const [inspectedUuid, setInspectedUuid] = useState<string | null>(null);

  const redIcon = useMemo(() => new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  }), []);

  const handleMarkerClick = useCallback((uuid: string) => {
    setActiveFilter(prevFilter => {
      console.log(`prevFilter: ${prevFilter}, uuid: ${uuid}`);
      setInspectedUuid(prevUuid => prevUuid === uuid ? null : uuid); // Toggle inspectedUuid
      if (prevFilter === uuid) {
        // Clicking the active marker again, show all markers
        setVisibleLayers(prev => {
          const newSet = new Set(prev);
          newSet.delete(`UUID: ${uuid}`);
          return newSet;
        });
        return null;
      } else {
        // Clicking a new marker, hide others and check the layer
        setVisibleLayers(prev => {
          const newSet = new Set(prev);
          newSet.add(`UUID: ${uuid}`);
          return newSet;
        });
        return uuid;
      }
    });
  }, [inspectedUuid]);

  const renderMarkers = useCallback((msg: msgData) => {

    const heteroGeo = JSON.parse(msg.heterogenous_geo);
    const msgGeo = JSON.parse(msg.msg_geo);

    const heteroPosition: L.LatLngExpression = [heteroGeo.lat, heteroGeo.lng];
    const msgGeoPosition: L.LatLngExpression = [msgGeo.lat, msgGeo.lng];

    const uuid = msgGeo.msg_source;

    return (
      <LayerGroup key={`group-${uuid}`}>
        <Marker
          position={heteroPosition}
          icon={redIcon}
          eventHandlers={{ click: () => handleMarkerClick(uuid) }}
          zIndexOffset={1000}
        >
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
        <Marker
          position={msgGeoPosition}
          eventHandlers={{ click: () => handleMarkerClick(uuid) }}>
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
        {inspectedUuid === uuid && (
          <AdditionalPoints msg={msg} />
        )}
      </LayerGroup>
    );
  }, [redIcon, handleMarkerClick, inspectedUuid]);

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

  const handleOverlayChange = useCallback((e: L.LayersControlEvent) => {
    const layerName = e.name;
    setVisibleLayers(prev => {
      const newSet = new Set(prev);
      if (e.type === 'overlayadd') {
        newSet.add(layerName);
      } else {
        newSet.delete(layerName);
      }
      return newSet;
    });

    if (e.type === 'overlayadd' && layerName.startsWith('UUID:')) {
      const uuid = layerName.split('UUID:')[1].trim();
      setActiveFilter(uuid);
    } else if (e.type === 'overlayremove' && layerName === 'All Markers') {
      setActiveFilter(null);
    }
  }, []);

  return (
    <div className="h-full w-full">
      <MapContainer
        center={[0, 0]}
        zoom={2}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
        whenCreated={(map) => {
          map.on('overlayadd overlayremove', handleOverlayChange);
        }}
      >
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

          {Object.entries(groupedByUuid).map(([uuid, messages]) => (
            <LayersControl.Overlay
              key={uuid}
              name={`UUID: ${uuid}`}
              checked={visibleLayers.has(`UUID: ${uuid}`)}
            >
              <LayerGroup>
                {messages.map((msg, index) => renderMarkers(msg, index))}
              </LayerGroup>
            </LayersControl.Overlay>
          ))}
        </LayersControl>

        <BoundsUpdater data={filteredData} />
      </MapContainer>
    </div>
  );
};

export default LocationImpactMap;
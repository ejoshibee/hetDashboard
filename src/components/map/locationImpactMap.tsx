import { LatLngExpression } from 'leaflet';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { MapContainer, Marker, TileLayer, Tooltip, useMap } from 'react-leaflet';

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import BoundsUpdater from './locationImpactMap/boundsUpdates';
import MarkerGroup from './locationImpactMap/customMarkerGroup';
import SideDrawer from './locationImpactMap/sideDrawer';
import MsgUuidSelector from './locationImpactMap/uuidSelector';
import Toolbox from './toolbox/toolbox';

import { HeterogenousGeo, msgData, MsgGeo } from '../../types';

export interface LocationImpactMapProps {
  uuidView: boolean;
  data: msgData[];
}

export interface InspectedUuid {
  uuid: string;
  msgData: msgData;
}

const LocationImpactMap: React.FC<LocationImpactMapProps> = ({ data, uuidView }) => {
  const [selectedUuids, setSelectedUuids] = useState<string[]>([]);
  const [inspectedUuid, setInspectedUuid] = useState<InspectedUuid | null>(null);
  const [relocatedPoint, setRelocatedPoint] = useState<{ lat: number, lng: number, accuracy: number } | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const mapRef = useRef<L.Map | null>(null);

  // Used for the uuidSelector component msg_uuid filter list
  const uniqueMsgUuids = useMemo(() => {
    if (data.length === 0) return [];
    return Array.from(new Set(data.map(msg => {
      if (msg.msg_geo !== null) {
        const msgGeo: MsgGeo = JSON.parse(msg.msg_geo as unknown as string)
        if (msgGeo.msg_source !== null) {
          return msgGeo.msg_source;
        }
      }
      return undefined;
    }).filter((uuid): uuid is string => uuid !== undefined)));
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
    } else if (type === 'relocate') {
      iconColorUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png'; // Change to your orange icon URL
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

  // func to handle the marker click to inspect a msg
  const handleMarkerClick = useCallback((uuid: string, msg: msgData) => {
    setInspectedUuid(prevInspected =>
      prevInspected?.uuid === uuid ? null : { uuid, msgData: msg }
    );
    // Add this line to center the map on the clicked marker
    if (mapRef.current) {
      const msgGeo = JSON.parse(msg.msg_geo as unknown as string);
      mapRef.current.setView([msgGeo.lat, msgGeo.lng], 15);
    }
  }, []);

  // Define the renderMarkers function
  const renderMarkers = useCallback((msg: msgData) => {
    const heteroGeo = JSON.parse(msg.heterogenous_geo as unknown as string);
    const msgGeo = JSON.parse(msg.msg_geo as unknown as string);
    console.log(`heterogenous_geo: ${typeof heteroGeo}\n msg_geo: ${typeof msgGeo}`)

    if (msgGeo === null) return null;

    const heteroPosition: LatLngExpression = [heteroGeo.lat, heteroGeo.lng];
    const msgGeoPosition: LatLngExpression = [parseFloat(msgGeo.lat), parseFloat(msgGeo.lng)];

    const uuid = msg.msg_uuid;

    return (
      <MarkerGroup
        key={`group-${uuid}`}
        uuid={uuid}
        msg={msg}
        heteroPosition={heteroPosition}
        msgGeoPosition={msgGeoPosition}
        handleMarkerClick={handleMarkerClick}
        getIcon={getIcon}
        inspectedUuid={inspectedUuid}
      />
    );
  }, [getIcon, handleMarkerClick, inspectedUuid]);

  const filteredData = useMemo(() => {
    if (data.length === 0) return [];

    // filter by onclick (inspectedUuid set onClick of marker)
    if (inspectedUuid) {
      return data.filter(msg => {
        const msgGeo: MsgGeo | null = JSON.parse(msg.msg_geo as unknown as string);
        if (msgGeo === null || msgGeo === undefined) return
        return msgGeo.msg_source === inspectedUuid.uuid;
      });
    }

    // filter by uuid selector inputs
    if (selectedUuids.length === 0) return data;
    return data.filter(msg => {
      const msgGeo: MsgGeo | null = JSON.parse(msg.msg_geo as unknown as string);
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
          const heteroGeo: HeterogenousGeo = JSON.parse(msg.heterogenous_geo as unknown as string);
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
    console.log(`Rendered markers: ${JSON.stringify(filteredData, null, 2)}`)
    return markers;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 flex flex-col sm:flex-row items-start sm:items-center bg-white shadow-md z-30">
        <div className="w-full sm:w-2/3 mb-4 sm:mb-0 sm:mr-4">
          <MsgUuidSelector
            uuidView={uuidView}
            options={uniqueMsgUuids}
            onChange={setSelectedUuids}
          />
        </div>
        <div className="z-50"> {/* Wrap Toolbox in a div with highest z-index */}
          <Toolbox
            data={data}
            filteredData={filteredData}
            setRelocatedPoint={setRelocatedPoint}
          />
        </div>
        <button onClick={() => setIsDrawerOpen(!isDrawerOpen)} className="ml-auto text-gray-500 hover:text-gray-700">
          {isDrawerOpen ? 'Close Drawer' : 'Open Drawer'}
        </button>
      </div>

      {/* MAP COMPONENT AND DRAWER */}
      <div className="flex-grow flex relative">
        <div className={`transition-all duration-300 ease-in-out ${isDrawerOpen ? 'w-3/4' : 'w-full'} absolute inset-0 z-10`}>
          <MapContainer
            center={[0, 0]}
            zoom={2}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
            ref={mapRef}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {renderAllMarkers()}
            {relocatedPoint && (
              <Marker position={[relocatedPoint.lat, relocatedPoint.lng]} icon={getIcon('relocate')}>
                <Tooltip>
                  <div>
                    <h2>Relocated Point</h2>
                    <p>Location: [lat: {relocatedPoint.lat}, lng: {relocatedPoint.lng}]</p>
                    <p>Accuracy: {relocatedPoint.accuracy}m</p>
                  </div>
                </Tooltip>
              </Marker>
            )}
            <BoundsUpdater data={filteredData} inspectedUuid={inspectedUuid} />
            <PerformanceOptimizer />
          </MapContainer>
        </div>
        {/* SIDE DRAWER */}
        {isDrawerOpen && (
          <div className="w-1/4 absolute right-0 top-0 bottom-0 bg-white shadow-lg z-20">
            <SideDrawer data={filteredData} onClose={() => setIsDrawerOpen(false)} onItemClick={handleMarkerClick} />
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationImpactMap;
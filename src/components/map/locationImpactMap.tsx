import React, { useState, useMemo, useCallback, useRef } from 'react';
import { Marker, MapContainer, TileLayer, Polyline, Tooltip, useMap } from 'react-leaflet';

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import AdditionalPoints from './locationImpactMap/additionalPoints';
import BoundsUpdater from './locationImpactMap/boundsUpdates'
import MsgUuidSelector from './locationImpactMap/uuidSelector';

import { relocate, mute } from '../../lib/mapHelpers'
import { GsmData, msgData, WifiData } from '../../types';

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
  const [showDropdown, setShowDropdown] = useState(false);

  // For dropdown hetData items
  const [selectedItems, setSelectedItems] = useState<number[]>([]);


  const mapRef = useRef<L.Map | null>(null);


  // Used for the uuidSelector component msg_uuid filter list
  const uniqueMsgUuids = useMemo(() => {
    if (data.length === 0) return [];
    return Array.from(new Set(data.map(msg => {
      if (msg.msg_geo !== null) {
        const msgGeo = JSON.parse(msg.msg_geo);
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

  // Used when clicking on a marker to inspect the uuid
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
      const msgGeo = JSON.parse(msg.msg_geo);
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

  // func to handle the muteOrRelocate tool usage
  // const handleMuteOrRelocate = () => {
  //   if (relocatedPoint) {
  //     setRelocatedPoint(null);
  //   } else {
  //     const result = muteOrRelocate(filteredData);
  //     setRelocatedPoint(result);
  //   }
  // };
  const handleMuteOrRelocate = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault()
    if (!showDropdown) {
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
    }
  };

  const handleItemClick = (index: number) => {
    setSelectedItems(prevSelected =>
      prevSelected.includes(index)
        ? prevSelected.filter((i: number) => i !== index)
        : [...prevSelected, index]
    );
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
      <div className="p-4 flex flex-col sm:flex-row items-start sm:items-center bg-white shadow-md z-10">
        <div className="w-full sm:w-2/3 mb-4 sm:mb-0 sm:mr-4">
          <MsgUuidSelector
            uuidView={uuidView}
            options={uniqueMsgUuids}
            onChange={setSelectedUuids}
          />
        </div>
        <div className='w-full sm:w-1/3'>
          <div className="grid grid-cols-3 gap-2">
            <button
              className="p-2 flex items-center justify-center rounded-md bg-yellow-bee-200 hover:bg-orange-200 cursor-pointer transition duration-300"
              onClick={handleMuteOrRelocate}
            >
              <p className='text-button-bold text-yellow-bee-800 truncate'>Mute or Relocate Geo</p>
            </button>

            {/* BREAK THIS AWAY INTO CUSTOM DROPDOWN COMPONENT */}
            {showDropdown && (
              <div className="absolute z-10 mt-14 w-96 bg-neutral-000 border border-neutral-300 rounded-md shadow-lg font-sans">
                <div className="p-4 max-h-80 overflow-y-auto">
                  <div className="grid grid-cols-2 gap-4">
                    {JSON.parse(filteredData[0].data).map((msg: GsmData | WifiData, index: number) => (
                      <div
                        key={`het_point_${index}`}
                        className={`text-center bg-yellow-bee-100 p-3 rounded-lg hover:bg-yellow-bee-200 transition duration-300 cursor-pointer ${selectedItems.includes(index) ? 'bg-yellow-bee-200 ring-2 ring-yellow-bee-400' : ''
                          }`}
                        onClick={() => handleItemClick(index)}
                      >
                        <p className="text-small-bold uppercase text-neutral-600">{msg.type}</p>
                        <p className="text-caption text-neutral-900 truncate">
                          {msg.type === 'gsm' ? msg.cid : msg.mac_address}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-4 border-t border-neutral-200 flex gap-4">
                  <button
                    className="flex-1 py-2 px-4 bg-orange-100 hover:bg-orange-200 text-orange-800 text-button-bold rounded-md transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={selectedItems.length === 0}
                    onClick={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
                      e.preventDefault()
                      console.log(`Muting selected items: ${selectedItems}`);
                      mute(filteredData, selectedItems);
                      setShowDropdown(false);
                    }}
                  >
                    Mute Selected ({selectedItems.length})
                  </button>
                  <button
                    className="flex-1 py-2 px-4 bg-orange-100 hover:bg-orange-200 text-yellow-bee-800 text-button-bold rounded-md transition duration-300"
                    onClick={() => {
                      if (relocatedPoint) {
                        setRelocatedPoint(null);
                        setShowDropdown(false);
                      } else {
                        // call muteOrRelocate map helper
                        const result = relocate(filteredData);
                        setRelocatedPoint(result);
                        setShowDropdown(false);
                      }
                    }}
                  >
                    {relocatedPoint ? 'Hide Relocation' : 'Relocate'}
                  </button>
                </div>
              </div>
            )}
            {/* BREAK THIS AWAY INTO CUSTOM DROPDOWN COMPONENT */}

            <button
              className="p-2 flex items-center justify-center rounded-md bg-yellow-bee-200 hover:bg-orange-200 cursor-pointer transition duration-300"
            >
              <p className='text-button-bold text-neutral-800 truncate'>Validate Signal</p>
            </button>
            <button
              className="p-2 flex items-center justify-center rounded-md bg-yellow-bee-200 hover:bg-orange-200 cursor-pointer transition duration-300"
            >
              <p className='text-button-bold text-neutral-800 truncate'>Third Tool OTW!</p>
            </button>
          </div>
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
          {/* effectively filteredData.map(renderMarkers); */}
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
    </div>
  );
};

export default LocationImpactMap;
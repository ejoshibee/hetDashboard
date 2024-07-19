// import React, { useState, useMemo, useCallback } from 'react';
// import { Marker, MapContainer, TileLayer, Polyline, LayersControl, LayerGroup, Tooltip, useMapEvents } from 'react-leaflet';
// import L from 'leaflet';
// import 'leaflet/dist/leaflet.css';
// import { msgData } from '../../types';
// import BoundsUpdater from './boundsUpdates';
// import AdditionalPoints from './additionalPoints';

// export interface LocationImpactMapProps {
//   data: msgData[];
// }

// const LocationImpactMap: React.FC<LocationImpactMapProps> = ({ data }) => {
//   const [activeFilter, setActiveFilter] = useState<string | null>(null);
//   const [visibleLayers, setVisibleLayers] = useState<Set<string>>(new Set(['All Markers']));
//   const [inspectedUuid, setInspectedUuid] = useState<string | null>(null);

//   const redIcon = useMemo(() => new L.Icon({
//     iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
//     shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
//     iconSize: [25, 41],
//     iconAnchor: [12, 41],
//     popupAnchor: [1, -34],
//     shadowSize: [41, 41]
//   }), []);

//   const handleMarkerClick = useCallback((uuid: string) => {
//     setActiveFilter(prevFilter => {
//       console.log(`prevFilter: ${prevFilter}, uuid: ${uuid}`);
//       setInspectedUuid(prevUuid => prevUuid === uuid ? null : uuid); // Toggle inspectedUuid
//       if (prevFilter === uuid) {
//         // Clicking the active marker again, show all markers
//         setVisibleLayers(prev => {
//           const newSet = new Set(prev);
//           newSet.delete(`UUID: ${uuid}`);
//           return newSet;
//         });
//         return null;
//       } else {
//         // Clicking a new marker, hide others and check the layer
//         setVisibleLayers(prev => {
//           const newSet = new Set(prev);
//           newSet.add(`UUID: ${uuid}`);
//           return newSet;
//         });
//         return uuid;
//       }
//     });
//   }, [inspectedUuid]);

//   const renderMarkers = useCallback((msg: msgData) => {
//     const heteroGeo = JSON.parse(msg.heterogenous_geo);
//     const msgGeo = JSON.parse(msg.msg_geo);

//     const heteroPosition: L.LatLngExpression = [heteroGeo.lat, heteroGeo.lng];
//     const msgGeoPosition: L.LatLngExpression = [msgGeo.lat, msgGeo.lng];

//     const uuid = msgGeo.msg_source;

//     return (
//       <LayerGroup key={`group-${uuid}`}>
//         <Marker
//           position={heteroPosition}
//           icon={redIcon}
//           eventHandlers={{ click: () => handleMarkerClick(uuid) }}
//           zIndexOffset={1000}
//         >
//           <Tooltip>
//             <div>
//               <h2>Heterogeneous Geo</h2>
//               <p>Location: [lat: {heteroGeo.lat}, lng: {heteroGeo.lng}]</p>
//               <p>Imei: {msg.bee_imei}</p>
//               <p>Msg_uuid: {msgGeo.msg_source}</p>
//               <p>Date: {msg.created_date}</p>
//               <p>Delta Distance: {msg.delta_distance}m</p>
//               <p>Accuracy: {heteroGeo.accuracy}m</p>
//               <p>GSM Count: {JSON.parse(msg.data).filter(d => d.type === 'gsm').length}</p>
//               <p>WiFi Count: {JSON.parse(msg.data).filter(d => d.type === 'wifi').length}</p>
//             </div>
//           </Tooltip>
//         </Marker>
//         <Marker
//           position={msgGeoPosition}
//           eventHandlers={{ click: () => handleMarkerClick(uuid) }}>
//           <Tooltip>
//             <div>
//               <h2>Message Geo</h2>
//               <p>Tech: {msgGeo.tech.toUpperCase()}</p>
//               <p>Imei: {msg.bee_imei}</p>
//               <p>Msg_uuid: {msgGeo.msg_source}</p>
//               <p>Date: {msg.created_date}</p>
//               <p>Location: [lat: {msgGeo.lat}, lng: {msgGeo.lng}]</p>
//               <p>Reported Accuracy: {msgGeo.reported_accuracy}m</p>
//               <p>Actual Accuracy: {msgGeo.accuracy}m</p>
//             </div>
//           </Tooltip>
//         </Marker>
//         <Polyline positions={[msgGeoPosition, heteroPosition]} color="blue" />
//         {inspectedUuid === uuid && (
//           <AdditionalPoints msg={msg} />
//         )}
//       </LayerGroup>
//     );
//   }, [redIcon, handleMarkerClick, inspectedUuid]);


//   const groupedByUuid = useMemo(() => {
//     return data.reduce((acc, msg) => {
//       const uuid = JSON.parse(msg.msg_geo).msg_source;
//       if (!acc[uuid]) {
//         acc[uuid] = [];
//       }
//       acc[uuid].push(msg);
//       return acc;
//     }, {} as Record<string, msgData[]>);
//   }, [data]);

//   const filteredData = useMemo(() => {
//     if (!activeFilter) return data;
//     return data.filter(msg => JSON.parse(msg.msg_geo).msg_source === activeFilter);
//   }, [data, activeFilter]);

//   const handleOverlayChange = useCallback((e: L.LayersControlEvent) => {
//     const layerName = e.name;
//     setVisibleLayers(prev => {
//       const newSet = new Set(prev);
//       if (e.type === 'overlayadd') {
//         newSet.add(layerName);
//       } else {
//         newSet.delete(layerName);
//       }
//       return newSet;
//     });

//     if (e.type === 'overlayadd' && layerName.startsWith('UUID:')) {
//       const uuid = layerName.split('UUID:')[1].trim();
//       setActiveFilter(uuid);
//     } else if (e.type === 'overlayremove' && layerName === 'All Markers') {
//       setActiveFilter(null);
//     }
//   }, []);

//   return (
//     <div className="h-full w-full">
//       <MapContainer
//         center={[0, 0]}
//         zoom={2}
//         style={{ height: '100%', width: '100%' }}
//         scrollWheelZoom={true}
//       >
//         <TileLayer
//           attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//           url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//         />
//         <LayersControl position="topright">

//           <LayersControl.Overlay checked name="All Markers">
//             <LayerGroup>
//               {filteredData.map((msg) => renderMarkers(msg))}
//             </LayerGroup>
//           </LayersControl.Overlay>

//           {/* loop over uuid, creating layers. There must be a better way to do this, right? */}
//           {Object.entries(groupedByUuid).map(([uuid, messages]) => (
//             <LayersControl.Overlay
//               key={uuid}
//               name={`UUID: ${uuid}`}
//               checked={visibleLayers.has(`UUID: ${uuid}`)}
//             >
//               <LayerGroup>
//                 {messages.map((msg) => renderMarkers(msg))}
//               </LayerGroup>
//             </LayersControl.Overlay>
//           ))}

//         </LayersControl>
//         <BoundsUpdater data={filteredData} inspectedUuid={inspectedUuid} />
//         <LayerHandler handleOverlayChange={handleOverlayChange} />
//       </MapContainer>
//     </div>
//   );
// };

// export default LocationImpactMap;

// const LayerHandler = ({ handleOverlayChange }: { handleOverlayChange: (e: L.LayersControlEvent) => void }) => {
//   const map = useMapEvents({
//     click: () => {
//       console.log('clicked')
//     },
//     overlayadd: (e) => {
//       handleOverlayChange(e)
//     },
//     overlayremove: (e) => {
//       handleOverlayChange(e)
//     }
//   })
//   return null
// }
import React, { useState, useMemo, useCallback, useRef } from 'react';
import { Marker, MapContainer, TileLayer, Polyline, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { msgData } from '../../types';
import AdditionalPoints from './additionalPoints';
import BoundsUpdater from './boundsUpdates'

export interface LocationImpactMapProps {
  data: msgData[];
}

export interface InspectedUuid {
  uuid: string;
  msgData: msgData;
}

const LocationImpactMap: React.FC<LocationImpactMapProps> = ({ data }) => {
  const [filterUuid, setFilterUuid] = useState<string>('');
  const [inspectedUuid, setInspectedUuid] = useState<InspectedUuid | null>(null);
  const mapRef = useRef<L.Map | null>(null);

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
      console.time("Filtering by inspectedUuid");
      const result = data.filter(msg => JSON.parse(msg.msg_geo).msg_source.includes(inspectedUuid.uuid));
      console.timeEnd("Filtering by inspectedUuid");
      return result;
    }

    console.time("Filtering by filterUuid");
    if (!filterUuid) {
      console.timeEnd("Filtering by filterUuid");
      return data;
    }

    const result = data.filter(msg => JSON.parse(msg.msg_geo).msg_source.includes(filterUuid));
    console.timeEnd("Filtering by filterUuid");
    console.log("filtData:", result);
    return result;
  }, [data, filterUuid, inspectedUuid]);

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
    }, [map, filteredData]);

    return null;
  };

  const renderAllMarkers = () => {
    console.time("Render All Markers");
    const markers = filteredData.map(renderMarkers);
    console.timeEnd("Render All Markers");
    return markers;
  };

  return (
    <div className="h-full w-full">
      <div className="p-2">
        <input
          type="text"
          value={filterUuid}
          onChange={(e) => setFilterUuid(e.target.value)}
          placeholder="Enter msg_uuid to filter"
          className="p-2 border rounded"
        />
      </div>
      <MapContainer
        center={[0, 0]}
        zoom={2}
        style={{ height: 'calc(100% - 50px)', width: '100%' }}
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
  );
};

export default LocationImpactMap;
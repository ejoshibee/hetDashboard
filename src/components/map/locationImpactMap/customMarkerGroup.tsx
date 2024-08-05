import React from 'react';
import { Marker, Tooltip, Polyline } from 'react-leaflet';
import { LatLngExpression } from 'leaflet';
import { GsmData, HeterogenousGeo, msgData, MsgGeo, WifiData } from '../../../types';
import AdditionalPoints from './additionalPoints';

interface MarkerGroupProps {
  uuid: string;
  msg: msgData;
  heteroPosition: LatLngExpression;
  msgGeoPosition: LatLngExpression;
  handleMarkerClick: (uuid: string, msg: msgData) => void;
  getIcon: (type: string) => L.Icon;
  inspectedUuid: { uuid: string } | null;
}

const MarkerGroup: React.FC<MarkerGroupProps> = ({
  uuid,
  msg,
  heteroPosition,
  msgGeoPosition,
  handleMarkerClick,
  getIcon,
  inspectedUuid,
}) => {
  const heteroGeo: HeterogenousGeo = JSON.parse(msg.heterogenous_geo as unknown as string);
  const msgGeo: MsgGeo = JSON.parse(msg.msg_geo as unknown as string);
  const hetData = JSON.parse(msg.data as unknown as string);

  if (!msgGeo || !heteroGeo) return null;

  return (
    <React.Fragment key={`group-${uuid}`}>
      <Marker
        position={heteroPosition}
        icon={getIcon('hetero')}
        eventHandlers={{
          click: () => handleMarkerClick(uuid, msg),

        }}
      >
        <Tooltip>
          <div>
            <h2>Heterogeneous Geo</h2>
            <p>Location: [lat: {heteroGeo.lat}, lng: {heteroGeo.lng}]</p>
            <p>Imei: {msg.bee_imei}</p>
            <p>Msg_uuid: {msgGeo.msg_source}</p>
            <p>Date: {new Date(msg.created_date).toLocaleString()}</p>
            <p>Delta Distance: {msg.delta_distance}m</p>
            <p>Accuracy: {heteroGeo.accuracy}m</p>
            <p>GSM Count: {hetData.filter((d: GsmData) => d.type === 'gsm').length}</p>
            <p>WiFi Count: {hetData.filter((d: WifiData) => d.type === 'wifi').length}</p>
          </div>
        </Tooltip>
      </Marker>
      <Marker
        position={msgGeoPosition}
        eventHandlers={{
          click: () => handleMarkerClick(uuid, msg)
        }}
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
            <p>Date: {new Date(msg.created_date).toLocaleString()}</p>
            <p>Location: [lat: {msgGeo.lat}, lng: {msgGeo.lng}]</p>
            <p>Reported Accuracy: {msgGeo.reported_accuracy}m</p>
            <p>Actual Accuracy: {msgGeo.accuracy}m</p>
          </div>
        </Tooltip>
      </Marker>
      <Polyline positions={[msgGeoPosition, heteroPosition]} color="blue">
        <Tooltip>{uuid}</Tooltip>
      </Polyline>
      {
        inspectedUuid?.uuid === uuid && (
          <AdditionalPoints msg={msg} />
        )
      }
    </React.Fragment >
  );
};

export default MarkerGroup;
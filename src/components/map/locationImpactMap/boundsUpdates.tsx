import React, { useEffect } from 'react';
import L from 'leaflet';
import { useMap } from 'react-leaflet';
import { msgData } from '../../types';
import { InspectedUuid } from './locationImpactMap';

interface BoundsUpdaterProps {
  inspectedUuid: InspectedUuid | null;
  data: msgData[];
}

const BoundsUpdater: React.FC<BoundsUpdaterProps> = ({ data, inspectedUuid }) => {
  const map = useMap();
  // console.log(data)
  // console.log(JSON.stringify(inspectedUuid, null, 2))
  useEffect(() => {
    if (data.length === 0) return;

    let bounds: L.LatLngBounds = L.latLngBounds([]);

    if (inspectedUuid) {
      // If we have an inspected UUID, focus on its data
      const inspectedData = JSON.parse(inspectedUuid.msgData.data);
      bounds = inspectedData.reduce((acc: L.LatLngBounds, point: any) => {
        if (point.lat && point.lng) {
          return acc.extend([point.lat, point.lng]);
        }
        return acc;
      }, bounds);

      // Also include the heterogeneous and message geo points for the inspected message
      const heteroGeo = JSON.parse(inspectedUuid.msgData.heterogenous_geo);
      const msgGeo = JSON.parse(inspectedUuid.msgData.msg_geo);
      bounds.extend([heteroGeo.lat, heteroGeo.lng])
        .extend([msgGeo.lat, msgGeo.lng]);
    } else {
      // If no UUID is inspected, show bounds for all data points
      bounds = data.reduce((acc: L.LatLngBounds, msg: msgData) => {
        const heteroGeo = JSON.parse(msg.heterogenous_geo);
        const msgGeo = JSON.parse(msg.msg_geo);
        if (msgGeo === null || msgGeo === undefined) return acc
        return acc
          .extend([heteroGeo.lat, heteroGeo.lng])
          .extend([msgGeo.lat, msgGeo.lng]);
      }, bounds);
    }

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50] });
    } else {
      // If bounds are not valid, set a default view
      map.setView([0, 0], 2);
    }
  }, [map, data, inspectedUuid]);

  return null;
};

export default BoundsUpdater;
import React, { useEffect } from 'react';
import L from 'leaflet';
import { useMap } from 'react-leaflet';
import { msgData } from '../../types';
import { LocationImpactMapProps } from './locationImpactMap';



const BoundsUpdater: React.FC<LocationImpactMapProps> = ({ data }) => {
  const map = useMap();

  useEffect(() => {
    if (data.length > 0) {
      const bounds = data.reduce((acc: L.LatLngBounds, msg: msgData) => {
        // @ts-expect-error types are correct, but only after parse
        const heteroGeo = JSON.parse(msg.heterogenous_geo);
        // @ts-expect-error types are correct, but only after parse
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

export default BoundsUpdater;
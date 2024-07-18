import React, { useEffect } from 'react';
import L from 'leaflet';
import { useMap } from 'react-leaflet';
import { msgData } from '../../types';
import { LocationImpactMapProps } from './locationImpactMap';

interface BoundsUpdatedProps extends LocationImpactMapProps {
  inspectedUuid: string | null;
}

const BoundsUpdater: React.FC<BoundsUpdatedProps> = ({ data, inspectedUuid }) => {
  console.log(data)

  const hetData: msgData["data"] = JSON.parse(data[0].data)

  const map = useMap();

  useEffect(() => {
    // this useEffect checks over the provided datapoints and creates bounds where within all msg points are visible. 
    // if the inspectedUuid is provided, it will also create bounds around inspectedUuid and hetDatapoints
    let bounds: L.LatLngBounds

    if (data.length > 0) {
      if (inspectedUuid) {
        bounds = hetData.reduce((acc: L.LatLngBounds, point: any) => {
          return acc
            .extend([point.lat, point.lng])
        }, L.latLngBounds([]));
        map.fitBounds(bounds);
      } else {
        bounds = data.reduce((acc: L.LatLngBounds, msg: msgData) => {
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
    }
  }, [map, data]);

  return null;
};

export default BoundsUpdater;
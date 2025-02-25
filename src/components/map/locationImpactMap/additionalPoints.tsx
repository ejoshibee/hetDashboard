import L from 'leaflet';
import React from 'react';
import { Circle, Marker, Popup } from 'react-leaflet';
import { msgData } from '../../../types';

// Function to create icon
const createIcon = (color: string, type: 'gsm' | 'wifi') => {
  const html = type === 'gsm' ?
    `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="16" width="4" height="4" fill="${color}" stroke="black" stroke-width="1"/>
      <rect x="8" y="12" width="4" height="8" fill="${color}" stroke="black" stroke-width="1"/>
      <rect x="14" y="8" width="4" height="12" fill="${color}" stroke="black" stroke-width="1"/>
      <rect x="20" y="4" width="4" height="16" fill="${color}" stroke="black" stroke-width="1"/>
    </svg>` :
    `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 21L15.5 16.5C14.5 15.5 13.3 15 12 15C10.7 15 9.5 15.5 8.5 16.5L12 21Z" fill="${color}" stroke="black" stroke-width="1"/>
      <path d="M12 3C7.95 3 4.21 4.34 1.2 6.6L3 9C5.5 7.12 8.62 6 12 6C15.38 6 18.5 7.12 21 9L22.8 6.6C19.79 4.34 16.05 3 12 3Z" fill="${color}" stroke="black" stroke-width="1"/>
      <path d="M12 9C9.3 9 6.81 9.89 4.8 11.4L6.6 13.8C8.1 12.67 9.97 12 12 12C14.03 12 15.9 12.67 17.4 13.8L19.2 11.4C17.19 9.89 14.7 9 12 9Z" fill="${color}" stroke="black" stroke-width="1"/>
    </svg>`;
  return L.divIcon({ html, className: `${type}-icon`, iconSize: [24, 24], iconAnchor: [12, 12] });
};

const gsmIcon = createIcon('green', 'gsm');
const wifiIcon = createIcon('#bcbc06', 'wifi');
const unusedgsmIcon = createIcon('red', 'gsm');
const unusedwifiIcon = createIcon('red', 'wifi');

const AdditionalPoints: React.FC<{ msg: msgData }> = ({ msg }) => {
  let hetData: msgData["data"];
  try {
    // @ts-expect-error type parsing...
    hetData = JSON.parse(msg.data);
    // @ts-expect-error type parsing...
    const msg_geo = JSON.parse(msg.msg_geo);
    console.log(msg_geo);
    // @ts-expect-error type parsing...
    const het_geo = JSON.parse(msg.heterogenous_geo);
    console.log(het_geo);
  } catch (error) {
    console.error('Failed to parse data:', error);
    return null; // or a fallback UI
  }

  return hetData.map((d) => {
    const icon = d.type === 'wifi' ? (d.used ? wifiIcon : unusedwifiIcon) : (d.used ? gsmIcon : unusedgsmIcon);
    const key = d.type === 'wifi' ? `${d.type}-${d.mac_address}` : d.type === 'gsm' ? `${d.type}-${d.cid}` : `${d.type}}`;
    const radius = d.type === 'wifi' ? 500 : 1500; // Meters 
    const color = d.type === 'wifi' ? 'yellow' : 'green';

    return (
      <React.Fragment key={key}>
        <Marker position={[Number(d.lat), Number(d.lng)]} icon={icon}>
          <Popup>
            <div>
              <p>
                Lat: <a href={`https://www.google.com/maps?q=${d.lat},${d.lng}`} target="_blank" rel="noopener noreferrer">
                  {d.lat}
                </a>
              </p>
              <p>
                Lng: <a href={`https://www.google.com/maps?q=${d.lat},${d.lng}`} target="_blank" rel="noopener noreferrer">
                  {d.lng}
                </a>
              </p>
              <p>{d.type === "wifi" ? `Mac Address: ${d.mac_address}` : d.type === "gsm" ? `CID: ${d.cid}` : d.type}</p>
              <p>{d.type === "gsm" ? `LAC: ${d.lac}` : ""}</p>
              <p>{d.type === "gsm" ? `MCC: ${d.mcc}` : ""}</p>
              <p>{d.type === "gsm" ? `MNC: ${d.mnc}` : ""}</p>
              <p>{d.type === "gsm" ? `Accuracy: ${d.accuracy}` : ""}</p>
            </div>
          </Popup>
        </Marker>
        <Circle
          center={[Number(d.lat), Number(d.lng)]}
          radius={radius}
          color={color}
          fillColor={color}
          fillOpacity={0.2}
        />
      </React.Fragment>
    );
  });
};

export default React.memo(AdditionalPoints);
// So apparently, lat, lng are strings and require an extra parse
export interface GpsData {
  accuracy: number;
  lat: string;
  lng: string;
  type: 'gps';
  used?: boolean;
}
export interface WifiData {
  mac_address: string;
  accuracy: number;
  lat: number;
  lng: number;
  type: 'wifi';
  used?: boolean;
}

export interface GsmData {
  cid: number;
  lac: number;
  mcc: number;
  mnc: number;
  accuracy: number;
  lat: number;
  lng: number;
  type: 'gsm';
  used?: boolean;
}

export interface MsgGeo {
  status: string;
  tech: string;
  lat: string;
  lng: string;
  reported_accuracy: number;
  accuracy: number;
  msg_source: string;
  heterogenousLookup: boolean;
  source?: string;
}

export interface HeterogenousGeo {
  lat: number;
  lng: number;
  accuracy: number;
}

export interface msgData {
  id: number;
  data: (WifiData | GsmData | GpsData)[];
  msg_geo: MsgGeo;
  heterogenous_geo: HeterogenousGeo;
  created_date: number;
  bee_imei: string;
  msg_uuid: string;
  account_id: number;
  msg_geo_distance: number;
  heterogenous_geo_distance: number;
  delta_distance: number;
}

export type Bin = {
  bin: string;
  count: number;
  gsmCount: number;
  wifiCount: number;
  gpsCount: number;
  gsmCont: number;
  wifiCont: number;
  gpsCont: number;
  items: msgData[]
};

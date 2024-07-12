import { useState, Suspense } from "react"
import { defer, Await, useLoaderData, useNavigate } from "react-router-dom"
import DeltaDistanceHistogram from "../components/deltaDistanceHistogram";


interface WifiData {
  mac_address: string;
  accuracy: number;
  lat: number;
  lng: number;
  type: 'wifi';
  used?: boolean;
}

interface GsmData {
  cid: number;
  lac: number;
  mcc: number;
  mnc: number;
  accuracy: number;
  lat: number;
  lng: number;
  type: 'gsm';
}

interface MsgGeo {
  status: string;
  tech: string;
  lat: string;
  lng: string;
  reported_accuracy: number;
  accuracy: number;
  msg_source: string;
  heterogenousLookup: boolean;
}

interface HeterogenousGeo {
  lat: number;
  lng: number;
  accuracy: number;
}

export interface msgData {
  id: number;
  data: (WifiData | GsmData)[];
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

export const loader = async ({ request }: { request: Request }) => {
  const url = new URL(request.url);
  console.log(url)
  const imei = url.searchParams.get('imei');
  console.log(imei)

  // TODO: switch default fetch to be last 24 hours of data
  const resp = await fetch(`http://localhost:3007/heterogenous_lookup${imei ? `?imei=${imei}` : ''}`);
  if (resp.status !== 200) {
    return defer({ success: false, data: 'There was an error fetching data' });
  }
  const data = await resp.json();

  return defer({ success: true, data: data });
};


export default function Dashboard() {
  const data = useLoaderData() as { success: boolean, data: msgData[] };
  const navigate = useNavigate();
  const [imei, setImei] = useState('');

  const handleImeiChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImei(e.target.value);
  };

  const handleImeiSubmit = () => {
    // Use the provided imei to navigate to the dashboard route with the query parameter
    navigate(`/dashboard?imei=${imei}`);
  };

  const handleSendToMap = () => {
    // Save the data in local storage using the IMEI as the key
    localStorage.setItem(`map-data-${imei}`, JSON.stringify(data.data));

    // Navigate to the map route with the IMEI as a query parameter
    navigate(`/map?imei=${imei}`);
  };

  return (
    <div className="">
      {/*<h1 className="text-3xl font-bold mb-4">Dashboard</h1> */}
      <div className="mb-4 flex items-center">
        <label className="mr-2 font-lg font-semibold">IMEI:</label>
        <input
          type="text"
          value={imei}
          onChange={handleImeiChange}
          placeholder="Enter device imei..."
          className="border rounded p-1 mr-2"
        />
        <button
          onClick={handleImeiSubmit}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded mr-2"
        >
          View IMEI
        </button>
        <button
          onClick={handleSendToMap}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
        >
          Send to Map
        </button>
      </div>
      <Suspense fallback={<div className="text-gray-500 font-semibold">Loading...</div>}>
        <Await resolve={data?.data}>
          {(data: msgData[]) => <DeltaDistanceHistogram data={data} />}
        </Await>
      </Suspense>
    </div>
  );
}

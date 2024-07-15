import {
  useState,
  Suspense
} from "react"
import {
  defer,
  Await,
  useLoaderData,
  useNavigate,
  Form
} from "react-router-dom"
import DeltaDistanceHistogram from "../components/deltaDistanceHistogram";
import { msgData } from "../types";

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

  const handleSendToMap = () => {
    // Save the data in local storage using the IMEI as the key
    localStorage.setItem(`map-data-${imei}`, JSON.stringify(data.data));

    // Navigate to the map route with the IMEI as a query parameter
    navigate(`/map?imei=${imei}`);
  };

  return (
    <div className="">
      <div className="mb-4 flex items-center">
        <Form method="get" action="/dashboard">
          <label className="mr-2 font-lg font-semibold">IMEI:</label>
          <input
            type="text"
            name="imei"
            value={imei}
            onChange={handleImeiChange}
            placeholder="Enter device imei..."
            className="border rounded p-1 mr-2"
          />
          <button
            type="submit"
            // onClick={handleImeiSubmit}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded mr-2"
          >
            View IMEI
          </button>
        </Form>
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
    </div >
  );
}

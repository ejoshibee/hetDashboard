import {
  useState,
  Suspense,
  useRef
} from "react"

import {
  defer,
  Await,
  useLoaderData,
  useNavigate,
  Form,
  useSearchParams
} from "react-router-dom"

import DeltaDistanceHistogram from "../components/deltaDistanceHistogram";
import { handleSendToMap } from '../lib/navHelpers';

import { msgData } from "../types";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";


export const loader = async ({ request }: { request: Request }) => {
  const url = new URL(request.url);
  const imei = url.searchParams.get('imei');
  const startDate = url.searchParams.get('startDate');
  const endDate = url.searchParams.get('endDate');

  let apiUrl = `http://localhost:3007/heterogenous_lookup`;
  if (imei) apiUrl += `?imei=${imei}`;
  if (startDate) apiUrl += `${imei ? '&' : '?'}startDate=${startDate}`;
  if (endDate) apiUrl += `&endDate=${endDate}`;

  const dataPromise = fetch(apiUrl).then(async (resp) => {
    if (resp.status !== 200) {
      throw new Error('There was an error fetching data');
    }
    const data = await resp.json();
    return data.data;
  });

  return defer({ data: dataPromise });
};

export default function Dashboard() {
  const { data } = useLoaderData() as { data: Promise<msgData[]> };
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [imei, setImei] = useState(params.get("imei"));
  const resolvedDataRef = useRef<msgData[] | null>(null);
  const [dateRange, setDateRange] = useState<[number | null, number | null]>([null, null]);
  const [startDate, endDate] = dateRange;

  const handleImeiChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImei(e.target.value);
  };

  const handleDateChange = (update: [Date | null, Date | null]) => {
    const [start, end] = update;
    setDateRange([
      start ? Math.floor(start.getTime() / 1000) : null,
      end ? Math.floor(end.getTime() / 1000) : null
    ]);
  };

  // Dashboard send to map
  const dashboardSendToMap = () => {
    handleSendToMap({
      navigate,
      data: resolvedDataRef.current,
      imei: imei
    });
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="sticky top-0 bg-white z-10 p-4 shadow-md">
        <div className="mb-4 flex items-center">
          <Form method="get" action="/dashboard">
            <label className="mr-2 font-lg font-semibold">IMEI:</label>
            <input
              type="text"
              name="imei"
              value={imei || ''}
              onChange={handleImeiChange}
              placeholder={imei ? imei : "Enter device imei..."}
              className="border rounded p-1 mr-2"
            />
            <input
              type="hidden"
              name="startDate"
              value={startDate || ''}
            />
            <input
              type="hidden"
              name="endDate"
              value={endDate || ''}
            />
            <DatePicker
              selectsRange={true}
              startDate={startDate ? new Date(startDate * 1000) : undefined}
              endDate={endDate ? new Date(endDate * 1000) : undefined}
              onChange={handleDateChange}
              isClearable={true}
              placeholderText="Select date range"
              className="border rounded p-1 mr-2"
            />
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded mr-2"
            >
              View Data
            </button>
          </Form>
          <button
            onClick={dashboardSendToMap}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
          >
            Send to Map
          </button>
        </div>
      </div>
      <div className="flex-grow overflow-y-auto p-4">
        <Suspense fallback={<div className="text-gray-500 font-semibold">Loading...</div>}>
          <Await
            resolve={data}
            errorElement={<div>Error loading data</div>}
          >
            {(resolvedData: msgData[]) => {
              resolvedDataRef.current = resolvedData;
              return <DeltaDistanceHistogram filteredDataRef={resolvedDataRef} data={resolvedData} imei={imei} />;
            }}
          </Await>
        </Suspense>
        {/* Add more statistical analysis components here */}
      </div>
    </div>
  );
}
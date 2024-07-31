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
} from "react-router-dom"

import ErrorPage from './error';
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

  let apiUrl = `/api/heterogenous_lookup`;

  // Use the same logic for default dates as in the component
  const twoWeeksAgo = Math.floor((Date.now() - 14 * 24 * 60 * 60 * 1000) / 1000);
  const defaultStartDate = imei ? null : twoWeeksAgo;
  const usedStartDate = startDate || defaultStartDate;

  if (imei) {
    apiUrl += `?imei=${imei}`;
    if (usedStartDate) apiUrl += `&startDate=${usedStartDate}`;
    if (endDate) apiUrl += `&endDate=${endDate}`;
  } else {
    apiUrl += `?startDate=${usedStartDate}`;
    if (endDate) apiUrl += `&endDate=${endDate}`;
  }

  const dataPromise = fetch(apiUrl).then(async (resp) => {
    if (resp.status === 404) {
      console.log('No data found for the given criteria');
      throw new Response('No data found for the given criteria', { status: 404 });
    } else if (resp.status !== 200) {
      throw new Response('There was an error fetching data', { status: resp.status });
    }
    const data = await resp.json();
    return data.data;
  });

  return defer({
    data: dataPromise,
    initialImei: imei,
    initialStartDate: usedStartDate,
    initialEndDate: endDate
  });
};

export default function Dashboard() {
  const { data, initialImei, initialStartDate, initialEndDate } = useLoaderData() as {
    data: Promise<msgData[]>;
    initialImei: string | null;
    initialStartDate: number | null;
    initialEndDate: string | null;
  };
  const navigate = useNavigate();

  const [imei, setImei] = useState(initialImei);
  const resolvedDataRef = useRef<msgData[] | null>(null);
  const [dateRange, setDateRange] = useState<[number | null, number | null]>(() => [
    initialStartDate,
    initialEndDate ? Number(initialEndDate) : null
  ]);
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
      imei: imei,
      startDate: startDate,
      endDate: endDate
    });
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="sticky top-0 bg-white z-10 p-2 shadow-md">
        <div className="mb-2 flex items-center">
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
            errorElement={<ErrorPage />}
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
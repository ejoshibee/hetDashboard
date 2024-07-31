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
      <div className="sticky top-0 bg-neutral-000 z-10 p-4 shadow-md">
        <Form method="get" action="/dashboard" className="flex flex-wrap items-center gap-4">
          <div className="flex items-center">
            <label htmlFor="imei" className="text-small-bold text-neutral-800 mr-2">
              <h4>IMEI:</h4>
            </label>
            <input
              id="imei"
              type="text"
              name="imei"
              value={imei || ''}
              onChange={handleImeiChange}
              placeholder={imei ? imei : "Enter device imei..."}
              className="w-full border border-neutral-300 rounded-md p-2 text-small text-neutral-900 focus:outline-none focus:ring-2 focus:ring-yellow-bee-400 focus:border-transparent"
            />
          </div>
          <input type="hidden" name="startDate" value={startDate || ''} />
          <input type="hidden" name="endDate" value={endDate || ''} />
          <div className="flex-grow custom-datepicker">
            <DatePicker
              selectsRange={true}
              startDate={startDate ? new Date(startDate * 1000) : undefined}
              endDate={endDate ? new Date(endDate * 1000) : undefined}
              onChange={handleDateChange}
              isClearable={true}
              placeholderText="Select date range"
              className="w-52 border border-neutral-300 rounded-md p-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-yellow-bee-400 focus:border-transparent"
            />
          </div>
          <div className="flex gap-4 ml-auto">
            <button
              type="submit"
              className="p-2 flex items-center justify-center rounded-md bg-yellow-bee-200 hover:bg-orange-200 cursor-pointer transition duration-300 min-w-[120px]"
            >
              <p className='text-button-bold text-neutral-800 truncate'>View Data</p>
            </button>
            <button
              onClick={dashboardSendToMap}
              className="p-2 flex items-center justify-center rounded-md bg-yellow-bee-200 hover:bg-orange-200 cursor-pointer transition duration-300 min-w-[120px]"
            >
              <p className='text-button-bold text-neutral-800 truncate'>Send to Map</p>
            </button>
          </div>
        </Form>
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
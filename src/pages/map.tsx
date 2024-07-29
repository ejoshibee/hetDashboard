import React, { Suspense } from 'react';
import {
  useSearchParams,
  useNavigate,
  useLocation,
  defer,
  useLoaderData,
  Await,
  LoaderFunctionArgs
} from 'react-router-dom';
import LocationImpactMap from '../components/map/locationImpactMap';
import { msgData } from '../types';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const uuid = url.searchParams.get('uuid');
  const startDate = url.searchParams.get('startDate');
  const endDate = url.searchParams.get('endDate');

  console.log(`UUID: ${uuid}, Start Date: ${startDate}, End Date: ${endDate}`);

  if (uuid) {
    const dataPromise = fetch(`/api/heterogenous_lookup/${uuid}?startDate=${startDate}&endDate=${endDate}`).then(async (resp) => {
      if (resp.status === 404) {
        console.log('No data found for the given criteria');
        throw new Response('No data found for the given criteria', { status: 404 });
      }
      const data = await resp.json();
      return data.data;
    });

    return defer({
      data: dataPromise,
    });
  }
  return defer({ data: Promise.resolve([]) });
};

export default function Map() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const bin = searchParams.get('bin');
  const imei = searchParams.get('imei');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  const { data } = useLoaderData() as { data: Promise<msgData[] | []> };

  const handleNavToDashboard = () => {
    let url = `/dashboard?imei=${imei ? imei : ""}`;
    if (startDate) url += `&startDate=${startDate}`;
    if (endDate) url += `&endDate=${endDate}`;
    navigate(url);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">{bin ? `Map view for bin ${bin}` : `No bin selected. Viewing imei: ${imei}`}</h1>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold my-2 py-2 px-4 rounded"
          onClick={handleNavToDashboard}
        >
          View on dashboard
        </button>
      </div>
      <div className='flex-1 overflow-hidden'>
        <Suspense fallback={<div>Loading map data...</div>}>
          <Await
            resolve={data}
            errorElement={<div>Error loading map data</div>}
          >
            {(resolvedData: msgData[]) => {
              const navState = location.state?.mapData;
              console.log(`Data from navstate: ${navState}`);
              if (navState) {
                return (
                  <LocationImpactMap data={navState} />
                );
              }
              return (
                <LocationImpactMap data={resolvedData} />
              );
            }}
          </Await>
        </Suspense>
      </div>
    </div>
  );
}
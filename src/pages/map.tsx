import { Suspense } from 'react';
import {
  useSearchParams,
  useNavigate,
  useLocation,
  defer,
  useLoaderData,
  Await,
  LoaderFunctionArgs,
} from 'react-router-dom';
import LocationImpactMap from '../components/map/locationImpactMap';
import { msgData } from '../types';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const uuid = url.searchParams.get('uuid');
  const startDate = url.searchParams.get('startDate');
  const endDate = url.searchParams.get('endDate');

  console.log(`UUID: ${uuid}, Start Date: ${startDate}, End Date: ${endDate}`);

  if (uuid !== null) {
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
  const uuid = searchParams.get('uuid');

  const { data } = useLoaderData() as { data: Promise<msgData[] | []> };

  const handleNavToDashboard = () => {
    let url = `/dashboard?imei=${imei ? imei : ""}`;
    if (startDate) url += `&startDate=${startDate}`;
    if (endDate) url += `&endDate=${endDate}`;
    navigate(url);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 flex justify-between items-center border-b border-neutral-200">
        <h1 className="text-title-bold text-neutral-900">
          {bin ? `Map view for bin ${bin}` :
            imei ? `No bin selected. Viewing imei: ${imei}` :
              uuid ? `Viewing map for UUID: ${uuid}` :
                `No bin, imei, or uuid selected. Search for a message`}
        </h1>
        <button
          className="bg-yellow-bee-200 hover:bg-orange-200 text-neutral-800 text-button-bold py-2 px-4 rounded-md transition duration-300"
          onClick={handleNavToDashboard}
        >
          View on dashboard
        </button>
      </div>
      <div className="flex-1 overflow-hidden">
        <Suspense fallback={<div className="text-small text-neutral-600 p-4">Loading map data...</div>}>
          <Await
            resolve={data}
            errorElement={<div className="text-small text-red-400 p-4">Error loading map data</div>}
          >
            {(resolvedData: msgData[]) => {
              const navState = location.state?.mapData;
              console.log(`Data from navstate: ${navState}`);
              if (navState) {
                return (
                  <LocationImpactMap data={navState} uuidView={false} />
                );
              }
              return (
                <LocationImpactMap data={resolvedData} uuidView={true} />
              );
            }}
          </Await>
        </Suspense>
      </div>
    </div>
  );
}
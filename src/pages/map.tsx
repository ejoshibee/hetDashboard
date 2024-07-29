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
import { msgData } from '../types'; // Ensure this path is correct

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const uuid = params.uuid;
  console.log(`UUID from params: ${uuid}`)
  if (uuid) {
    const dataPromise = fetch(`/api/heterogenous_lookup/${uuid}`).then(async (resp) => {
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

  const { data } = useLoaderData() as { data: Promise<msgData[] | []> };

  const handleNavClick = () => {
    navigate(`/dashboard?imei=${imei ? imei : ""}`);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">{bin ? `Map view for bin ${bin}` : `No bin selected. Viewing imei: ${imei}`}</h1>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold my-2 py-2 px-4 rounded"
          onClick={handleNavClick}
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
              const navState = location.state.mapData
              console.log(`Data from navstate: ${navState}`)
              if (navState) {
                return (
                  <LocationImpactMap data={navState} />
                )
              }
              return (
                <LocationImpactMap data={resolvedData} />
              )
            }}
          </Await>
        </Suspense>
      </div>
    </div>
  );
}
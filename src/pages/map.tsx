import { Suspense } from 'react';
import { defer, Await, useLoaderData, useSearchParams, useNavigate } from 'react-router-dom';
import LocationImpactMap from '../components/locationImpactMap';

export const loader = async ({ request }: { request: Request }) => {
  const url = new URL(request.url);
  const bin = url.searchParams.get('bin');

  const imei = url.searchParams.get('imei')
  console.log(`imei: ${imei}`)

  if (!bin && !imei) {
    return defer({ success: false, error: "No bin or imei provided" });
  }

  let mapData = localStorage.getItem('map-data')
  if (localStorage.getItem(`map-data-${imei}`)) {
    mapData = localStorage.getItem(`map-data-${imei}`);
  }

  if (!mapData) {
    return defer({ success: false, error: "No data found for this bin" });
  }

  console.log(`mapData found for bin ${bin}`);
  return defer({ success: true, data: JSON.parse(mapData) });
};

export default function Map() {
  const data = useLoaderData();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate()
  const bin = searchParams.get('bin');
  const imei = searchParams.get('imei')

  const handleNavClick = () => {
    // console.log(imei)
    navigate(`/dashboard?imei=${imei ? imei : ""}`)
  }


  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Map View for Bin: {bin}</h1>
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold my-2 py-2 px-4 rounded"
          onClick={handleNavClick}>
          View on dashboard
        </button>
      </div>
      <div className='flex-1 overflow-hidden'>
        <Suspense fallback={<div>Loading map data...</div>}>
          <Await
            resolve={data}
            errorElement={<div>Error loading map data</div>}
          >
            {(resolvedData) =>
              resolvedData.success ? (
                <LocationImpactMap data={resolvedData.data} />
              ) : (
                <div className="text-red-500">{resolvedData.error}</div>
              )
            }
          </Await>
        </Suspense>
      </div>
    </div>
  );
}

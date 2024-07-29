import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import LocationImpactMap from '../components/map/locationImpactMap';

export default function Map() {
  const location = useLocation();
  // const data = useLoaderData();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const bin = searchParams.get('bin');
  const imei = searchParams.get('imei');

  const handleNavClick = () => {
    navigate(`/dashboard?imei=${imei ? imei : ""}`);
  };

  // Accessing state passed via navigate
  const mapData = location.state?.mapData || [];
  console.log(mapData)

  return (
    <>
      <div className="flex flex-col h-full">
        <div className="px-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">{bin ? `Map view for bin ${bin}` : `No bin selected. Viewing imei: ${imei}`}</h1>
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold my-2 py-2 px-4 rounded"
            onClick={handleNavClick}>
            View on dashboard
          </button>
        </div>
        <div className='flex-1 overflow-hidden'>
          <LocationImpactMap data={mapData} />
        </div>
      </div>
    </>
  );
}
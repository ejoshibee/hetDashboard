import React, { useState, Suspense } from 'react';
import { defer, Await, useLoaderData, useSearchParams } from 'react-router-dom';
import LocationImpactMap from '../components/locationImpactMap';

export const loader = async ({ request }) => {
  const url = new URL(request.url);
  const bin = url.searchParams.get('bin');

  if (!bin) {
    return defer({ success: false, error: "No bin provided" });
  }

  const mapData = localStorage.getItem('map-data');
  if (!mapData) {
    return defer({ success: false, error: "No data found for this bin" });
  }

  console.log(`mapData found for bin ${bin}`);
  return defer({ success: true, data: JSON.parse(mapData) });
};

export default function Map() {
  const data = useLoaderData();
  const [searchParams] = useSearchParams();
  const bin = searchParams.get('bin');

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Map View for Bin: {bin}</h1>
      <Suspense fallback={<div>Loading map data...</div>}>
        <Await
          resolve={data}
          errorElement={<div>Error loading map data</div>}
        >
          {(resolvedData) => {
            console.log(resolvedData)
            return resolvedData.success ? (
              <LocationImpactMap data={resolvedData.data} />
            ) : (
              <div className="text-red-500">{resolvedData.error}</div>
            )
          }
          }
        </Await>
      </Suspense>
    </div>
  );
}

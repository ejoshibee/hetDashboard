import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { msgData } from '../pages/dashboard';
import Modal from './modal';

type Bin = { bin: string; count: number; gsmCount: number; wifiCount: number; gpsCount: number; gsmCont: number; wifiCont: number; gpsCont: number; items: msgData[] };

const TopBucketsBox = ({ binData }) => {
  const sortedBins = [...binData.bins].sort((a, b) => b.count - a.count);
  const topBins = sortedBins.slice(0, 5);
  const totalCount = binData.totalCount;

  return (
    <div className="w-full bg-white border-3px rounded-lg shadow-md p-4 flex flex-col">
      <h2 className="text-xl text-center font-bold mb-4">Top Buckets</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {topBins.map((bin) => (
          <div key={bin.bin} className="bg-gray-100 p-3 rounded">
            <div className="flex justify-between items-center">
              <span className="font-medium">Range: {bin.bin}</span>
              <div className="flex items-baseline">
                <span className="font-bold">{bin.count}</span>
                <span className="ml-2 text-gray-500">
                  ({((bin.count / totalCount) * 100).toFixed(2)}%)
                </span>
              </div>
            </div>
            <div className="mt-2 text-center font-semibold">Average Counts</div>
            <div className="text-gray-500 text-center">
              GSM: {(bin.gsmCount / bin.count).toFixed(4)}, WiFi: {(bin.wifiCount / bin.count).toFixed(4)}, GPS: {(bin.gpsCount / bin.count).toFixed(4)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const DeltaDistanceHistogram: React.FC<{ data: msgData[] }> = ({ data }) => {
  const [binWidth, setBinWidth] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedBin, setSelectedBin] = useState<Bin | null>(null);

  const handleBinWidthChange = (e) => {
    const newBinWidth = parseInt(e.target.value, 10);
    if (!isNaN(newBinWidth) && newBinWidth > 0) {
      setBinWidth(newBinWidth);
    }
  };

  const binData = useMemo(() => {
    const bins: Bin[] = [];
    let totalCount = 0;

    for (const item of data.data) {
      const km = item.delta_distance / 1000;
      const binIndex = Math.floor(km / binWidth);

      if (!bins[binIndex]) {
        bins[binIndex] = {
          bin: `${binIndex * binWidth} - ${(binIndex + 1) * binWidth} km`,
          count: 0,
          gsmCount: 0,
          wifiCount: 0,
          gpsCount: 0,
          gsmCont: 0,
          wifiCont: 0,
          gpsCont: 0,
          items: [],
        };
      }

      bins[binIndex].count++;
      bins[binIndex].items.push(item);
      totalCount++;

      let gsmCount = 0;
      let wifiCount = 0;
      let gpsCount = 0;
      for (const dataPoint of JSON.parse(item.data)) {
        if (dataPoint.type === 'gsm') {
          gsmCount++;
        } else if (dataPoint.type === 'wifi') {
          wifiCount++;
        } else if (dataPoint.type === 'gps') {
          gpsCount++;
        }
      }
      if (item.msg_geo) {
        const techType = JSON.parse(item.msg_geo).tech;
        if (techType === 'gsm') {
          bins[binIndex].gsmCont++;
        } else if (techType === 'wifi') {
          bins[binIndex].wifiCont++;
        } else if (techType === 'gps') {
          bins[binIndex].gpsCont++;
        }
      }

      bins[binIndex].gsmCount += gsmCount;
      bins[binIndex].wifiCount += wifiCount;
      bins[binIndex].gpsCount += gpsCount;
    }

    const usefulBins = bins.filter((bin) => bin !== undefined);
    return { bins: usefulBins, totalCount };
  }, [data.data, binWidth]);

  const handleBarClick = (bin) => {
    if (bin.activePayload[0].payload.items.length > 5000) {
      // TODO: implement Toast mechanism  
      return
    }
    setSelectedBin(bin.activePayload[0].payload);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedBin(null);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const count = payload[0].value;
      const percentage = ((count / binData.totalCount) * 100).toFixed(4);
      const gsmCount = (payload[0].payload.gsmCount / count).toFixed(4);
      const wifiCount = (payload[0].payload.wifiCount / count).toFixed(4);
      const gpsCount = (payload[0].payload.gpsCount / count).toFixed(4);
      const gsmCont = payload[0].payload.gsmCont
      const wifiCont = payload[0].payload.wifiCont
      const gpsCont = payload[0].payload.gpsCont
      return (
        <div className="bg-white border border-gray-300 rounded-lg p-2">
          <p>Range: {label}</p>
          <p>Count: {count}</p>
          <p>Percentage: {percentage}%</p>
          <p>GSM: {gsmCount}, WiFi: {wifiCount}, GPS: {gpsCount}</p>
          <p>---Accepted Contributions---</p>
          <p>GSM: {gsmCont}, WiFi: {wifiCont}, GPS: {gpsCont}</p>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="relative">
      <div className="mb-6 flex flex-col md:flex-row justify-between">
        <div className="h-full flex flex-col justify-center">
          <h2 className="text-2xl font-bold mb-2">Delta Distance Histogram</h2>
          <div className="flex items-center">
            <label className="mr-2">Bin Width (km):</label>
            <input
              type="number"
              value={binWidth}
              onChange={handleBinWidthChange}
              className="border rounded p-1 mr-4"
            />
          </div>
        </div>
        <div className="w-full md:w-auto">
          <TopBucketsBox binData={binData} />
        </div>
      </div>
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={binData.bins} onClick={handleBarClick}>
            <XAxis dataKey="bin" axisLine={false} tickLine={false} />
            <YAxis type="number" scale="log" domain={['auto', 'auto']} axisLine={false} tickLine={false} />
            <CartesianGrid strokeDasharray="3 3" />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" fill="url(#colorUv)" />
            <defs>
              <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#82ca9d" stopOpacity={0.8} />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>
      {showModal && selectedBin && (
        <Modal binData={selectedBin} onClose={handleModalClose} />
      )}
    </div>
  );
};

export default DeltaDistanceHistogram;

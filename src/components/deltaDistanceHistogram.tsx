import React, { useEffect, useState, useMemo, MutableRefObject } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { msgData, Bin } from '../types';
import Modal from './modal';
import { useNavigate } from 'react-router-dom';
import { handleSendToMap } from '../lib/navHelpers';

export type BinData = { binData: { bins: Bin[]; totalCount: number } }

const TopBucketsBox: React.FC<BinData> = ({ binData }) => {
  const sortedBins = [...binData.bins].sort((a, b) => b.count - a.count);
  const topBins = sortedBins.slice(0, 5);
  const totalCount = binData.totalCount;

  return (
    <div className="w-full bg-neutral-000 border border-neutral-300 rounded-lg shadow-md p-4 flex flex-col">
      <h2 className="text-title-bold text-neutral-900 text-center mb-4">Top Buckets: {totalCount} points</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {topBins.map((bin) => (
          <div key={bin.bin} className="bg-yellow-bee-100 ring-2 ring-orange-100 p-3 rounded-md">
            <div className="flex justify-between items-center">
              <span className="text-small-bold text-neutral-800">Range: {bin.bin}</span>
              <div className="flex items-baseline">
                <span className="text-small-bold text-neutral-900">{bin.count}</span>
                <span className="ml-2 text-small text-neutral-600">
                  ({((bin.count / totalCount) * 100).toFixed(2)}%)
                </span>
              </div>
            </div>
            <div className="mt-2 text-center text-small-bold text-neutral-800">Average Counts</div>
            <div className="text-caption text-neutral-600 text-center">
              GSM: {(bin.gsmCount / bin.count).toFixed(4)}, WiFi: {(bin.wifiCount / bin.count).toFixed(4)}, GPS: {(bin.gpsCount / bin.count).toFixed(4)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const DeltaDistanceHistogram: React.FC<{ data: msgData[]; imei: string | null, filteredDataRef: MutableRefObject<msgData[] | null> }> = ({ data, imei, filteredDataRef }) => {
  const [binWidth, setBinWidth] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedBin, setSelectedBin] = useState<Bin | null>(null);
  const [showHetOnly, setShowHetOnly] = useState(false);
  const [isBuilding, setIsBuilding] = useState(true)

  const navigate = useNavigate()

  const binData = useMemo(() => {
    const bins: Bin[] = [];
    let totalCount = 0;

    // filter by msgGeo.heteroLookup if showHetOnly is true
    const filteredData = showHetOnly
      ? data.filter(item => {
        const msgGeo = JSON.parse(item.msg_geo)
        return msgGeo !== null
          && Object.prototype.hasOwnProperty.call(msgGeo, "heterogenousLookup")
          && msgGeo.heterogenousLookup === true
      })
      : data;

    // set the filteredData as data for filteredDataRef from dashboard
    filteredDataRef.current = filteredData

    for (const item of filteredData) {
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

    setIsBuilding(false);

    return { bins: usefulBins, totalCount };
  }, [data, binWidth, showHetOnly]);

  const handleBinWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newBinWidth = parseInt(e.target.value, 10);
    if (!isNaN(newBinWidth) && newBinWidth > 0) {
      setBinWidth(newBinWidth);
    }
  };

  // @ts-expect-error hidden bin typing from recharts
  const handleBarClick = (bin) => {
    if (bin.activePayload[0].payload.items.length > 5000) {
      // TODO: implement Toast mechanism  
      return
    }
    setSelectedBin(bin.activePayload[0].payload);
    setShowModal(true);
  };

  // Modal sendToMap
  const modalSentToMap = () => {
    if (selectedBin) {
      handleSendToMap({
        navigate,
        data: selectedBin.items,
        imei: imei,
        binLabel: selectedBin.bin
      });
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedBin(null);
  };

  // @ts-expect-error hidden bin typing from recharts
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
        <div className="bg-neutral-000 border border-neutral-300 rounded-lg p-4">
          <p className="text-small-bold text-neutral-800 mb-2">Range: <span className="text-small text-neutral-600">{label}</span></p>
          <p className="text-small-bold text-neutral-800 mb-2">Count: <span className="text-small text-neutral-600">{count}</span></p>
          <p className="text-small-bold text-neutral-800 mb-2">Percentage: <span className="text-small text-neutral-600">{percentage}%</span></p>
          <p className="text-small-bold text-neutral-800 mt-4">Average Counts</p>
          <p className="text-small-bold text-neutral-800 mb-2">
            GSM: <span className="text-small text-neutral-600">{gsmCount}</span>{' '}
            WiFi: <span className="text-small text-neutral-600">{wifiCount}</span>{' '}
            GPS: <span className="text-small text-neutral-600">{gpsCount}</span>
          </p>
          <p className="text-small-bold text-neutral-800 mt-4">Accepted Contributions</p>
          <p className="text-small text-neutral-600">
            GSM: {gsmCont}{' '} WiFi: {wifiCont}{' '} GPS: {gpsCont}
          </p>
        </div>
      );
    }

    return null;
  };

  // suppress recharts X and Y axis errors
  useEffect(() => {
    const originalConsoleError = console.error;

    console.error = (...args: unknown[]) => {
      if (typeof args[0] === "string" && /defaultProps/.test(args[0])) {
        return;
      }

      originalConsoleError(...args);
    };

    return () => {
      console.error = originalConsoleError;
    };
  }, []);

  if (isBuilding) {
    return <div className="text-gray-500 font-semibold">Building histogram...</div>;
  }

  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row justify-between gap-6 mb-6">
        <div className="flex flex-col ">
          <h2 className="mb-2">Delta Distance Histogram</h2>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center">
              <label htmlFor="binWidth" className="text-small-bold text-neutral-800 mr-2">
                Bin Width (km):
              </label>
              <input
                id="binWidth"
                type="number"
                value={binWidth}
                onChange={handleBinWidthChange}
                className="border border-neutral-300 rounded-md p-2 text-small text-neutral-900 focus:ring-2 focus:ring-yellow-bee-400 focus:border-transparent w-24"
              />
            </div>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={showHetOnly}
                onChange={(e) => setShowHetOnly(e.target.checked)}
                className="mr-2 h-4 w-4 text-yellow-bee-400 focus:ring-yellow-bee-400 border-neutral-300 rounded"
              />
              <span className="text-small text-neutral-800">Show HeteroLookup Only</span>
            </label>
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
            {/* @ts-expect-error hidden bin typing from recharts */}
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" fill="#FDB933" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      {showModal && selectedBin && (
        <Modal binData={selectedBin} onClose={handleModalClose} handleSendToMap={modalSentToMap} />
      )}
    </div>
  );
};

export default DeltaDistanceHistogram;
import React, { useState, useRef } from 'react';
import { VariableSizeList as List } from 'react-window';
import { msgData } from '../../../types';

interface SideDrawerProps {
  data: msgData[];
  onClose: () => void;
  onItemClick: (uuid: string, msg: msgData) => void;
}

const SideDrawer: React.FC<SideDrawerProps> = ({ data, onClose, onItemClick }) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const listRef = useRef<List>(null);

  const toggleItem = (uuid: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(uuid)) {
        newSet.delete(uuid);
      } else {
        newSet.add(uuid);
      }
      return newSet;
    });
    if (listRef.current) {
      listRef.current.resetAfterIndex(0);
    }
  };

  const getItemSize = (index: number) => {
    return expandedItems.has(data[index].msg_uuid) ? 200 : 80;
  };

  const ArrowIcon = ({ isExpanded }: { isExpanded: boolean }) => (
    <svg
      className="w-4 h-4 text-neutral-500"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d={isExpanded ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'}
      />
    </svg>
  );

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000); // Convert seconds to milliseconds
    return date.toLocaleString(); // This will use the user's locale settings
  };

  return (
    <div className="flex flex-col h-full bg-white shadow-lg">
      <div className="flex justify-between items-center p-4 border-b border-neutral-200">
        <h2 className="text-lg font-semibold">Points</h2>
        <button onClick={onClose} className="text-neutral-500 hover:text-neutral-700">
          &times;
        </button>
      </div>
      <div className="flex-grow overflow-hidden">
        <List
          ref={listRef}
          height={window.innerHeight - 64}
          itemCount={data.length}
          itemSize={getItemSize}
          width="100%"
        >
          {({ index, style }) => {
            const msg = data[index];
            const msgGeo = JSON.parse(msg.msg_geo as unknown as string);
            const isExpanded = expandedItems.has(msg.msg_uuid);

            return (
              <div
                style={{
                  ...style,
                  height: isExpanded ? 'auto' : style.height,
                }}
                className="p-3 border-b border-neutral-200 hover:bg-neutral-100"
              >
                <div
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() => toggleItem(msg.msg_uuid)}
                >
                  <div className="flex-grow">
                    <h3 className="text-sm font-semibold break-all">{msg.msg_uuid}</h3>
                    <p className="text-xs text-neutral-600 break-all">{msgGeo.msg_source}</p>
                  </div>
                  <ArrowIcon isExpanded={isExpanded} />
                </div>
                {isExpanded && (
                  <div className="mt-2 text-xs">
                    <p className="break-all">IMEI: {msg.bee_imei}</p>
                    <p>Date: {formatDate(msg.created_date)}</p>
                    <p>Delta Distance: {msg.delta_distance}m</p>
                    <p>Lat: {msgGeo.lat}, Lng: {msgGeo.lng}</p>
                    <button
                      className="mt-2 px-2 py-1 bg-blue-500 text-white rounded"
                      onClick={(e) => {
                        e.stopPropagation();
                        onItemClick(msg.msg_uuid, msg);
                      }}
                    >
                      View on Map
                    </button>
                  </div>
                )}
              </div>
            );
          }}
        </List>
      </div>
    </div>
  );
};

export default SideDrawer;
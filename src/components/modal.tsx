import React from 'react';
import { Bin, GpsData, GsmData, WifiData } from '../types';

type ModalProps = {
  binData: Bin;
  onClose: () => void;
  handleSendToMap: () => void;
}

const Modal: React.FC<ModalProps> = ({ binData, onClose, handleSendToMap }) => {
  return (
    <div className="fixed z-10 inset-0 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-neutral-900 bg-opacity-75 transition-opacity" aria-hidden="true" />
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
          &#8203;
        </span>
        <div className="inline-block align-bottom bg-neutral-000 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-neutral-000 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <div className="flex justify-between items-center">
                  <h3 className="text-title-bold text-neutral-900">Details for Bin: {binData.bin}</h3>
                  <button
                    type="button"
                    className="ml-2 inline-flex justify-center rounded-md px-4 py-2 bg-yellow-bee-200 text-button-bold text-neutral-900 hover:bg-yellow-bee-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-bee-400 transition duration-300"
                    onClick={handleSendToMap}
                  >
                    View on Map
                  </button>
                </div>
                <div className="mt-4 overflow-y-auto max-h-96">
                  {binData.items.sort((a, b) => b.delta_distance - a.delta_distance).map((item, index) => (
                    <div key={index} className="border-b border-neutral-300 py-4">
                      <h4 className="text-small-bold text-neutral-900">{item.msg_uuid}</h4>
                      <div className="mt-2 text-small text-neutral-600">
                        <p>IMEI: {item.bee_imei}</p>
                        <p>Created Date: {new Date(item.created_date).toLocaleString()}</p>
                        <p>Delta Distance: {item.delta_distance}m</p>
                        <p>MSG Geo Distance: {item.msg_geo_distance}m</p>
                        <p>Heterogeneous Geo Distance: {item.heterogenous_geo_distance}m</p>
                        <p>GSM Data: {JSON.parse(item.data).filter((d) => d.type === 'gsm').length}</p>
                        <p>WiFi Data: {JSON.parse(item.data).filter((d) => d.type === 'wifi').length}</p>
                        <p>GPS Data: {JSON.parse(item.data).filter((d) => d.type === 'gps').length}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-neutral-100 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-md px-4 py-2 bg-yellow-bee-200 text-button-bold text-neutral-900 hover:bg-yellow-bee-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-bee-400 sm:ml-3 sm:w-auto transition duration-300"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;

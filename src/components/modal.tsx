const Modal = ({ binData, onClose, handleSendToMap }: { binData: any, onClose: () => void, handleSendToMap: () => void }) => {
  console.log(binData);
  return (
    <div className="fixed z-10 inset-0 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" />
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
          &#8203;
        </span>
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Details for Bin: {binData.bin}</h3>
                  <button
                    type="button"
                    className="ml-2 inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={handleSendToMap}
                  >
                    View on Map
                  </button>
                </div>
                <div className="mt-2 overflow-y-auto max-h-96">
                  {binData.items.sort((a, b) => b.delta_distance - a.delta_distance).map((item, index) => (
                    <div key={index} className="border-b border-gray-200 py-4">
                      <h4 className="text-md font-medium text-gray-900">Message {index + 1}</h4>
                      <div className="mt-2 text-gray-500">
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
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
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

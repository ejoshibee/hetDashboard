import React, { ReactNode, useRef, useState } from 'react';
import { Form } from 'react-router-dom';
import { GpsData, GsmData, msgData, WifiData } from '../../../types';
import { validate, relocate } from '../../../lib/mapHelpers';
import Popover from '../../popover';

interface ToolboxButtonProps {
  label: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  children: ReactNode;
  disabled?: boolean;
  variant: "primary" | "secondary"
}

interface ToolboxProps {
  data: msgData[];
  filteredData: msgData[];
  setRelocatedPoint: (point: { lat: number; lng: number; accuracy: number }) => void;
}

const ToolboxButton: React.FC<ToolboxButtonProps> = ({ label, onClick, children, disabled = false, variant }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const buttonRef = useRef<HTMLDivElement>(null);

  const isprimary = variant === "primary"

  const handleClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    if (disabled) return;
    if (onClick) onClick(e);
    setIsOpen(!isOpen);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <div className="relative flex-1" ref={buttonRef}>
      <button
        className={`w-full p-2 flex items-center justify-center rounded-md ${disabled
          ? 'bg-orange-150 cursor-not-allowed text-neutral-400'
          : `${isprimary ? 'bg-yellow-bee-300 hover:bg-yellow-bee-100' : 'bg-neutral-200 hover:bg-neutral-300'} cursor-pointer text-neutral-800`
          } transition duration-300`}
        onClick={handleClick}
        disabled={disabled}
      >
        <p className='text-button-bold truncate'>{label}</p>
      </button>
      {isOpen && !disabled && (
        <Popover isOpen={isOpen} onClose={handleClose} parentRef={buttonRef}>
          {children}
        </Popover>
      )}
    </div>
  );
};


const Toolbox: React.FC<ToolboxProps> = ({ data, filteredData, setRelocatedPoint }) => {
  console.log(filteredData)
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  const isDisabled = filteredData.length > 1 || data.length === 0 || filteredData.length === 0;

  const handleItemClick = (index: number) => {
    setSelectedItems(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const handlevalidateOrRelocate = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault()
    if (isDisabled) {
      console.log("Cannot validate or relocate: Invalid data state");
      return;
    }
    // Additional logic for validate or relocate if needed
  };

  const handleValidateSignal = () => {
    // Logic for validate signal
    console.log("Validating signal...");
  };

  const handleThirdTool = () => {
    // Logic for third tool
    console.log("Third tool activated!");
  };

  return (
    <div className='w-full sm:w-full md:w-2/3 lg:w-1/2 xl:w-1/3'>
      <div className="flex flex-row justify-between gap-2">
        <ToolboxButton
          label="Relocate Message"
          onClick={handlevalidateOrRelocate}
          disabled={isDisabled}
          variant='primary'
        >
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-2">Relocate Message</h3>
            <p>Once a new location has been decided on, possibly allow for input of new lat,lng </p>
            {/* Add more content for the Inspect Message popover */}
            <Form navigate={false}>
              <input
                type="text"
                placeholder="Enter latitude"
                className="w-full mt-2 p-2 border border-neutral-300 rounded-md text-small text-neutral-900 focus:outline-none focus:ring-2 focus:ring-yellow-bee-400 focus:border-transparent"
              />
              <input
                type="text"
                placeholder="Enter longitude"
                className="w-full mt-2 p-2 border border-neutral-300 rounded-md text-small text-neutral-900 focus:outline-none focus:ring-2 focus:ring-yellow-bee-400 focus:border-transparent"
              />
              <button type="submit" onClick={() => setRelocatedPoint(relocate(filteredData))} className="mt-4 py-2 px-4 bg-yellow-bee-400 text-button rounded-md">Relocate</button>
            </Form>
          </div>
        </ToolboxButton>

        <ToolboxButton
          label="Validate Signal"
          variant='secondary'
          disabled={isDisabled}
        >
          <div>
            <div className="grid grid-cols-2 gap-4">
              {/* @ts-expect-error sql data parsing */}
              {!isDisabled && JSON.parse(filteredData[0].data).map((msg: GsmData | WifiData | GpsData, index: number) => (
                <div
                  key={`het_point_${index}`}
                  className={`text-button text-center bg-yellow-bee-100 p-3 rounded-lg hover:bg-yellow-bee-200 transition duration-300 cursor-pointer ${selectedItems.includes(index) ? 'bg-yellow-bee-200 ring-2 ring-yellow-bee-400' : ''
                    }`}
                  onClick={() => handleItemClick(index)}
                >
                  <p className="text-small-bold uppercase text-neutral-600">{msg.type}</p>
                  <p className="text-caption text-neutral-900 truncate">
                    {msg.type === 'gsm' ? msg.cid : msg.type === 'wifi' ? msg.mac_address : 'gps nonsense'}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-2 p-4 border-t border-neutral-200 flex gap-4">
              <button
                className="text-button flex-1 py-2 px-4 bg-orange-100 hover:bg-orange-200 text-orange-800 text-button-bold rounded-md transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={selectedItems.length === 0}
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.preventDefault();
                  console.log(`Muting selected items: ${selectedItems}`);
                  validate(filteredData, selectedItems);
                }}
              >
                Validated Selected ({selectedItems.length})
              </button>
            </div>
          </div>
        </ToolboxButton>

        <ToolboxButton
          label="Third Tool OTW!"
          onClick={handleThirdTool}
          variant='secondary'
          disabled={isDisabled}
        >
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-2">Third Tool</h3>
            <p>Content for the third tool goes here.</p>
            {/* Add more content for the Third Tool popover */}
          </div>
        </ToolboxButton>
      </div>
    </div>
  );
};

export default Toolbox;
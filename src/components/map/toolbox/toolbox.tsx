import React, { useState, ReactNode, useRef } from 'react'
import Popover from '../../popover';
import { GsmData, msgData, WifiData } from '../../../types';

interface ToolboxButtonProps {
  label: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  children: ReactNode;
  disabled?: boolean;
}

interface ToolboxProps {
  data: msgData[];
  filteredData: msgData[];
  mute: (data: msgData[], selectedItems: number[]) => void;
  relocate: (data: msgData[]) => { lat: number; lng: number; accuracy: number } | null;
  setRelocatedPoint: React.Dispatch<React.SetStateAction<{ lat: number; lng: number; accuracy: number } | null>>;
  relocatedPoint: { lat: number; lng: number; accuracy: number } | null;
}

const ToolboxButton: React.FC<ToolboxButtonProps> = ({ label, onClick, children, disabled = false }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const buttonRef = useRef<HTMLDivElement>(null);

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
          : 'bg-yellow-bee-300 hover:bg-yellow-bee-100 cursor-pointer text-neutral-800'
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

const Toolbox: React.FC<ToolboxProps> = ({ data, filteredData, mute, relocate, setRelocatedPoint, relocatedPoint }) => {
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  const isDisabled = filteredData.length > 1 || data.length === 0 || filteredData.length === 0;

  const handleItemClick = (index: number) => {
    setSelectedItems(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const handleMuteOrRelocate = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault()
    if (isDisabled) {
      console.log("Cannot mute or relocate: Invalid data state");
      return;
    }
    // Additional logic for mute or relocate if needed
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
          label="Mute or Relocate"
          onClick={handleMuteOrRelocate}
          disabled={isDisabled}
        >
          {!isDisabled && filteredData.length > 0 && (
            <div>
              <div className="grid grid-cols-2 gap-4">
                {/* @ts-expect-error sql data parsing */}
                {JSON.parse(filteredData[0].data).map((msg: GsmData | WifiData, index: number) => (
                  <div
                    key={`het_point_${index}`}
                    className={`text-center bg-yellow-bee-100 p-3 rounded-lg hover:bg-yellow-bee-200 transition duration-300 cursor-pointer ${selectedItems.includes(index) ? 'bg-yellow-bee-200 ring-2 ring-yellow-bee-400' : ''
                      }`}
                    onClick={() => handleItemClick(index)}
                  >
                    <p className="text-small-bold uppercase text-neutral-600">{msg.type}</p>
                    <p className="text-caption text-neutral-900 truncate">
                      {msg.type === 'gsm' ? msg.cid : msg.mac_address}
                    </p>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-neutral-200 flex gap-4">
                <button
                  className="flex-1 py-2 px-4 bg-orange-100 hover:bg-orange-200 text-orange-800 text-button-bold rounded-md transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={selectedItems.length === 0}
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.preventDefault();
                    console.log(`Muting selected items: ${selectedItems}`);
                    mute(filteredData, selectedItems);
                  }}
                >
                  Mute Selected ({selectedItems.length})
                </button>
                <button
                  className="flex-1 py-2 px-4 bg-orange-100 hover:bg-orange-200 text-yellow-bee-800 text-button-bold rounded-md transition duration-300"
                  onClick={() => {
                    if (relocatedPoint) {
                      setRelocatedPoint(null);
                    } else {
                      const result = relocate(filteredData);
                      setRelocatedPoint(result);
                    }
                  }}
                >
                  {relocatedPoint ? 'Hide Relocation' : 'Relocate'}
                </button>
              </div>
            </div>
          )}
        </ToolboxButton>

        <ToolboxButton label="Validate Signal" onClick={handleValidateSignal}>
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-2">Validate Signal</h3>
            <p>Add your validation options and controls here.</p>
            {/* Add more content for the Validate Signal popover */}
          </div>
        </ToolboxButton>

        <ToolboxButton label="Third Tool OTW!" onClick={handleThirdTool}>
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
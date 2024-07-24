import React, { useState, useMemo, useCallback } from 'react';

interface MsgUuidSelectorProps {
  options: string[];
  onChange: (selected: string[]) => void;
}

const MsgUuidSelector: React.FC<MsgUuidSelectorProps> = ({ options, onChange }) => {
  const [inputValue, setInputValue] = useState('');
  const [selectedUuids, setSelectedUuids] = useState<string[]>([]);

  const filteredOptions = useMemo(() => {
    return options.filter(option => {
      console.log(`option: ${option}`)
      if (option === undefined) return
      return option.toLowerCase().includes(inputValue.toLowerCase()) &&
        !selectedUuids.includes(option)
    }
    );
  }, [options, inputValue, selectedUuids]);

  const handleSelect = useCallback((uuid: string) => {
    const newSelected = [...selectedUuids, uuid];
    setSelectedUuids(newSelected);
    onChange(newSelected);
    setInputValue('');
  }, [selectedUuids, onChange]);

  const handleRemove = useCallback((uuid: string) => {
    const newSelected = selectedUuids.filter(id => id !== uuid);
    setSelectedUuids(newSelected);
    onChange(newSelected);
  }, [selectedUuids, onChange]);

  return (
    <div className="relative z-50 w-1/2">
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type to search UUIDs"
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {inputValue && (
          <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
            {filteredOptions.slice(0, 5).map((option) => (
              <li
                key={option}
                onClick={() => handleSelect(option)}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              >
                {option}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="flex flex-wrap gap-2 mt-2">
        {selectedUuids.map((uuid) => (
          <div key={uuid} className="flex items-center bg-blue-100 text-blue-800 text-sm font-medium px-2 py-1 rounded-full">
            {uuid}
            <button
              onClick={() => handleRemove(uuid)}
              className="ml-1 text-blue-600 hover:text-blue-800 focus:outline-none"
            >
              &times;
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MsgUuidSelector;
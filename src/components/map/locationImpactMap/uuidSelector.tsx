import React, {
  useState,
  useMemo,
  useCallback
} from 'react';

import {
  Form,
  useNavigate
} from 'react-router-dom';

interface MsgUuidSelectorProps {
  options: string[];
  onChange: (selected: string[]) => void;
  uuidView: boolean;
}

const MsgUuidSelector: React.FC<MsgUuidSelectorProps> = ({ options, onChange, uuidView }) => {
  const [inputValue, setInputValue] = useState('');
  const [selectedUuids, setSelectedUuids] = useState<string[]>([]);
  const navigate = useNavigate();

  const filteredOptions = useMemo(() => {
    return options.filter(option => {
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

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && uuidView) {
      console.log(`navigating to /map?uuid=${inputValue}`)
      e.preventDefault()
      navigate(`/map?uuid=${inputValue}`);
    }
  }, [uuidView, inputValue, navigate]);


  return (
    <div className="w-2/3">
      <div className="relative mb-4">
        <Form method="get" action="/map">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type to search UUIDs"
            className="w-full p-2 border border-neutral-300 rounded-md text-small text-neutral-900 focus:outline-none focus:ring-2 focus:ring-yellow-bee-400 focus:border-transparent"
          />
        </Form>
        {inputValue && !uuidView && (
          <ul className="absolute z-10 w-full mt-1 bg-neutral-000 border border-neutral-300 rounded-md shadow-lg max-h-60 overflow-auto">
            {filteredOptions.slice(0, 5).map((option) => (
              <li
                key={option}
                onClick={() => handleSelect(option)}
                className="px-4 py-2 hover:bg-yellow-bee-50 cursor-pointer text-small text-neutral-800 transition duration-300"
              >
                {option}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {selectedUuids.map((uuid) => (
          <div key={uuid} className="flex items-center bg-yellow-bee-100 text-yellow-bee-800 text-caption font-bold px-2 py-1 rounded-full overflow-hidden">
            <span className="truncate flex-grow">{uuid}</span>
            <button
              onClick={() => handleRemove(uuid)}
              className="ml-1 text-yellow-bee-600 hover:text-yellow-bee-800 focus:outline-none transition duration-300"
              aria-label="Remove UUID"
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
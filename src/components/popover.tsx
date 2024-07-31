import React, { useRef, useEffect, ReactNode } from 'react'

interface PopoverProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

const Popover: React.FC<PopoverProps> = ({ isOpen, onClose, children }) => {
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div ref={popoverRef} className="absolute z-10 mt-2 w-96 bg-neutral-000 border border-neutral-300 rounded-md shadow-lg font-sans">
      <div className="p-4 max-h-80 overflow-y-auto">
        {children}
      </div>
    </div>
  );
};

export default Popover;
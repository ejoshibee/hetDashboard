import React, { useRef, useEffect, ReactNode, useState } from 'react'

interface PopoverProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  parentRef: React.RefObject<HTMLElement>;
}

const Popover: React.FC<PopoverProps> = ({ isOpen, onClose, children, parentRef }) => {
  const popoverRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<'left' | 'right'>('left');

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const updatePosition = () => {
      if (parentRef.current && popoverRef.current) {
        const parentRect = parentRef.current.getBoundingClientRect();
        const popoverRect = popoverRef.current.getBoundingClientRect();
        const viewportWidth = window.innerWidth;

        if (parentRect.right + popoverRect.width > viewportWidth) {
          setPosition('right');
        } else {
          setPosition('left');
        }
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      updatePosition();
      window.addEventListener('resize', updatePosition);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen, onClose, parentRef]);

  if (!isOpen) return null;

  return (
    <div
      ref={popoverRef}
      className={`absolute z-10 mt-2 w-96 bg-neutral-000 border border-neutral-300 rounded-md shadow-lg font-sans ${position === 'right' ? 'right-0' : 'left-0'
        }`}
    >
      <div className="p-4 max-h-80 overflow-y-auto">
        {children}
      </div>
    </div>
  );
};

export default Popover;
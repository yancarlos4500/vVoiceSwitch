// components/AreaThree.tsx
'use client'

import React, { useState } from 'react';
import SquareSelectorButton from '../base_button/SquareSelectorButton';

const AreaThree: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1); // State to track current page

  const buttons = [
    { topLine: 'PHBK', action: () => console.log('PHBK clicked') },
    { topLine: '', action: () => console.log('Overflow button clicked') },
    { topLine: '', action: () => console.log('Overflow button clicked') },
    { topLine: '', action: () => console.log('Overflow button clicked') },
    { topLine: '', action: () => console.log('Overflow button clicked') },
    { topLine: '', action: () => console.log('Overflow button clicked') },
    { topLine: '', action: () => console.log('Overflow button clicked') },
    { topLine: 'IA', action: () => console.log('IA clicked') },
    { topLine: 'CA', action: () => console.log('CA clicked') },
    { topLine: 'RECN', bottomLine: 'ENB', action: () => console.log('RECN ENB clicked') },
    { topLine: 'CALL', bottomLine: 'FWD', action: () => console.log('CALL FWD clicked') },
    { topLine: 'FREQ', bottomLine: 'FWD', action: () => console.log('FREQ FWD clicked') },
    { topLine: 'KEY', bottomLine: 'PAD', action: () => console.log('KEY PAD clicked') },
    { topLine: 'REL', action: () => console.log('REL clicked') },
  ];

  return (
    <div className="p-4 space-y-2.5">
      {/* Render buttons */}
      <div className="grid grid-flow-col grid-rows-7 grid-cols-2 gap-2.5">
        {buttons.map((button, index) => (
          <SquareSelectorButton
            key={index}
            topLine={button.topLine}
            bottomLine={button.bottomLine}
            onClick={button.action}
          />
        ))}
      </div>

      {/* Status Text - Not Implemented */}
      <div className="text-white text-center items-center justify-center font-bold text-lg mt-4">
        
      </div>
    </div>
  );
};

export default AreaThree;
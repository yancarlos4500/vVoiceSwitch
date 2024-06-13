// components/DAButton.tsx

import React, { useState } from 'react';

type DAButtonProps = {
  topLine: string;
  bottomLine?: string;
  onClick?: () => void; // Optional onClick handler
  latching: boolean; // True for latching button, False for momentary button
  showIndicator?: boolean; // Optional prop to show indicator
  dialLine?: number; // Dial line number. Could be phone number, IA code, or Function Code
  style?: React.CSSProperties;
};

const DAButton: React.FC<DAButtonProps> = ({ topLine, bottomLine, onClick, showIndicator = false, style, latching, dialLine }) => {
  const [isActive, setIsActive] = useState(false);
  const [isIndicatorVisible, setIndicatorVisible] = useState(showIndicator);

  const handleMouseDown = () => {
    setIsActive(true);
    setIndicatorVisible(!isIndicatorVisible); // Toggle indicator visibility
  };

  const handleMouseUp = () => {
    setIsActive(false);
    if (onClick) onClick();
    // if non-latching, hide indicator on release
    if (!latching) setIndicatorVisible(false);
  };

  return (
    <button
      className={`relative w-16 h-16 bg-customBlue text-customYellow 
    border-4 border-customGray flex items-start justify-center text-center
    ${isActive ? 'border-customBlue' : ' border-customWhite'}`}
      style={{
        borderBottomColor: isActive ? '#000080' : '#818181',
        borderRightColor: isActive ? '#000080' : '#818181',
        ...style
      }}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => setIsActive(false)} // Handle case where mouse leaves without release
    >
      {/* Centered and styled text */}
      <div className="absolute top-0 flex flex-col items-center space-y-0">
        <span className="text-lg font-bold uppercase break-words -mb-2 -mt-1">
          {topLine}
        </span>
        <span className="text-lg font-bold uppercase break-words -mt-2">
          {bottomLine}
        </span>
      </div>
      {isIndicatorVisible && (
        <div className="absolute bottom-1 left-1 right-1 h-3 bg-customGreen"></div>
      )}
    </button>
  );
};

export default DAButton;

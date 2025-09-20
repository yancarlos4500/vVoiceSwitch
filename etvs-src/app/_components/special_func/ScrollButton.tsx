// components/ScrollButton.tsx

import React, { useState } from 'react';

type ScrollButtonProps = {
  direction: 'up' | 'down';
  onClick?: () => void; // Optional onClick handler
  style?: React.CSSProperties;
};

const ScrollButton: React.FC<ScrollButtonProps> = ({ direction, onClick, style }) => {
  const [isActive, setIsActive] = useState(false);

  const handleMouseDown = () => {
    setIsActive(true);
  };

  const handleMouseUp = () => {
    setIsActive(false);
    if (onClick) onClick();
  };

  return (
    <button
      className={`relative w-14 h-8 bg-customBlue text-customYellow 
    border-4 border-black flex items-center justify-center text-center
    ${isActive ? 'border-black' : 'border-customLightBlue'}`}
      style={{
        borderTopColor: isActive ? '#000000' : '#1f67fa',
        borderLeftColor: isActive ? '#000000' : '#1f67fa',
        borderBottomColor: isActive ? '#1f67fa' : '#000000',
        borderRightColor: isActive ? '#1f67fa' : '#000000',
        backgroundImage: `
          linear-gradient(45deg, #1f67fa 25%, transparent 25%), 
          linear-gradient(-45deg, #1f67fa 25%, transparent 25%), 
          linear-gradient(45deg, transparent 75%, #1f67fa 75%), 
          linear-gradient(-45deg, transparent 75%, #1f67fa 75%)
        `,
        backgroundSize: '2px 2px',
        backgroundPosition: '0 0, 0 1px, 1px -1px, -1px 0px',
        backgroundColor: '#000000',
        ...style
      }}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => setIsActive(false)} // Handle case where mouse leaves without release
    >
      <span
        className={`text-5xl leading-none select-none origin-center transform scale-100 ${direction === 'up' ? 'rotate-[-90deg]' : 'rotate-90'}`}
      >
        &#10095;
      </span>
    </button>
  );
};

export default ScrollButton;

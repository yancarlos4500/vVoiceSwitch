// components/SquareButton.tsx

import React, { useState } from 'react';

type SquareButtonProps = {
  topLine: string;
  bottomLine?: string;
  onClick?: () => void; // Optional onClick handler
  showIndicator?: boolean; // Optional prop to show indicator
  style?: React.CSSProperties;
};

const SquareButton: React.FC<SquareButtonProps> = ({ topLine, bottomLine, onClick, showIndicator = false, style }) => {
  const [isActive, setIsActive] = useState(false);
  const [isIndicatorVisible, setIndicatorVisible] = useState(showIndicator);

  const handleMouseDown = () => {
    setIsActive(true);
    setIndicatorVisible(!isIndicatorVisible); // Toggle indicator visibility
  };

  const handleMouseUp = () => {
    setIsActive(false);
    if (onClick) onClick();
  };

  return (
    <button
      className={`etvs-btn ${isActive ? 'etvs-btn-active' : 'etvs-btn-inactive'}`}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => setIsActive(false)}
      style={style}
    >
      <div className="etvs-btn-label">
        <span>{topLine}</span>
        {bottomLine && <span>{bottomLine}</span>}
      </div>
      {isIndicatorVisible && (
        <div className="etvs-btn-indicator"></div>
      )}
    </button>
  );
};

export default SquareButton;

// components/SquareSelectorButton.tsx

import React, { useState } from 'react';

type SquareSelectorButtonProps = {
  topLine: string;
  bottomLine?: string;
  onClick?: () => void; // Optional onClick handler
  style?: React.CSSProperties;
};

const SquareSelectorButton: React.FC<SquareSelectorButtonProps> = ({ topLine, bottomLine, onClick, style }) => {
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
      className={`etvs-btn ${isActive ? 'etvs-btn-active' : 'etvs-btn-inactive'}`}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => setIsActive(false)}
      style={style}
    >
      <div className={`etvs-btn-label ${bottomLine ? '' : 'items-center'}`}>
        <span>{topLine}</span>
        {bottomLine && <span className="etvs-btn-label-bold">{bottomLine}</span>}
      </div>
    </button>
  );
};

export default SquareSelectorButton;

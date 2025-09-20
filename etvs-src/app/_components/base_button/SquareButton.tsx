// components/SquareButton.tsx

import React from 'react';

interface SquareButtonProps {
  topLine?: string;
  bottomLine?: string;
  showIndicator?: boolean;
  indicatorClassName?: string; // panel-style indicator class: e.g., "flutter active", "steady green"
  onClick?: () => void;
}

const SquareButton: React.FC<SquareButtonProps> = ({
  topLine = '',
  bottomLine = '',
  showIndicator = false,
  indicatorClassName = '',
  onClick,
}) => {
  // Parse the indicatorClassName to determine if it should flutter
  const shouldFlutter = indicatorClassName.includes('flutter active');
  const shouldFlutterRed = indicatorClassName.includes('flutter red');
  const isSteady = indicatorClassName.includes('steady');
  
  return (
    <button
      className="etvs-btn etvs-btn-inactive"
      onClick={onClick}
      style={{
        position: 'relative',
      }}
    >
      {/* Button text content */}
      <div className="etvs-btn-label">
        <div className="etvs-btn-label-small">{topLine}</div>
        <div className="etvs-btn-label-small">{bottomLine}</div>
      </div>
      
      {/* ETVS-style indicator bar with flutter animation */}
      {(showIndicator || indicatorClassName) && (
        <div 
          className={`etvs-btn-indicator ${shouldFlutter ? 'etvs-flutter' : ''} ${shouldFlutterRed ? 'etvs-flutter-red' : ''} ${isSteady ? 'etvs-steady' : ''}`}
        />
      )}
    </button>
  );
};

export default SquareButton;

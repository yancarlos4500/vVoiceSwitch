// components/OOSFreqButton.tsx

import React from 'react';
import { FaHeadphones, FaVolumeOff } from 'react-icons/fa';

type OOSFreqButtonProps = {
  style?: React.CSSProperties;
};

const OOSFreqButton: React.FC<OOSFreqButtonProps> = ({ style }) => {
  return (
    <button
      className={`relative w-28 h-16 bg-customBlue text-customYellow border-[4px] flex items-start justify-center text-center group`}
      style={{
        fontFamily: "ivsr, sans-serif",
        borderTopColor: '#3275ff',
        borderLeftColor: '#3275ff',
        borderBottomColor: '#000000',
        borderRightColor: '#000000',
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
      disabled
    >
      {/* Preferred Individual A/G Routing (faded) */}
      <div className="absolute top-[2px] left-[1px] opacity-40">
        <FaHeadphones className="text-customYellow border border-customYellow" />
      </div>
      {/* Current A/G Routing (faded) */}
      <div className="absolute top-[2px] right-[3px] opacity-40">
        <FaHeadphones className="text-customYellow" />
      </div>
      {/* No frequency text */}
    </button>
  );
};

export default OOSFreqButton;

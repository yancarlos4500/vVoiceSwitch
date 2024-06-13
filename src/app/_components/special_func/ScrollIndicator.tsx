// components/ScrollIndicator.tsx

import React from 'react';

type ScrollIndicatorProps = {
  indicate: boolean; // Prop to control the color change
};

const ScrollIndicator: React.FC<ScrollIndicatorProps> = ({ indicate }) => {
  return (
    <div
      className={`w-5 h-5 ${indicate ? 'bg-customYellow' : 'bg-customBlue'}`}
    ></div>
  );
};

export default ScrollIndicator;

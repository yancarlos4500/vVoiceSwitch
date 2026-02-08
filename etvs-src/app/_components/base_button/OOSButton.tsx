// components/OOSButton.tsx

import React, { useState } from 'react';

type OOSButtonProps = {
  style?: React.CSSProperties;
};

const OOSButton: React.FC<OOSButtonProps> = ({ style }) => {
  return (
    <button
      className="etvs-btn etvs-btn-inactive"
      style={style}
    >
    </button>
  );
};

export default OOSButton;

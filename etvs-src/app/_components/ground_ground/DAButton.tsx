// components/DAButton.tsx

import React, { useState } from 'react';
import { useCoreStore } from '~/model';

type DAButtonProps = {
  topLine: string;
  middleLine?: string;
  bottomLine?: string;
  onClick?: () => void; // Optional onClick handler
  latching: boolean; // True for latching button, False for momentary button
  showIndicator?: boolean; // Optional prop to show indicator
  dialLine?: number; // Dial line number. Could be phone number, IA code, or Function Code
  style?: React.CSSProperties;
  controlledIndicator?: boolean;
  indicatorClassName?: string;
};

const DAButton: React.FC<DAButtonProps> = ({ topLine, middleLine, bottomLine, onClick, showIndicator = false, style, latching, dialLine, controlledIndicator, indicatorClassName }) => {
  const [isActive, setIsActive] = useState(false);
  const [isIndicatorVisible, setIndicatorVisible] = useState(showIndicator);

  const sendMsg = useCoreStore((s: any) => s.sendMessageNow);

  const handleMouseDown = () => {
    setIsActive(true);
    setIndicatorVisible(!isIndicatorVisible); // Toggle indicator visibility
  };

  const handleMouseUp = () => {
    setIsActive(false);
    if (onClick) onClick();
    // if non-latching, hide indicator on release
    if (!latching) setIndicatorVisible(false);

    // Send backend message similar to src implementation when dialLine present
    try {
      if (dialLine !== undefined && dialLine !== null) {
        sendMsg({ type: 'add', cmd1: '' + dialLine, dbl1: 2 });
      }
    } catch (ex) {
      console.error('sendMsg failed', ex);
    }
  };

  const indicatorVisible = controlledIndicator ?? isIndicatorVisible;
  return (
    <button
      className={`etvs-btn relative flex items-center justify-center text-center select-none ${isActive ? 'etvs-btn-active' : 'etvs-btn-inactive'}`}
      style={style}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => setIsActive(false)}
    >
      {/* Label area, styled to match etvs-btn-label */}
      <div className="etvs-btn-label">
        <span>{topLine}</span>
        {middleLine && <span>{middleLine}</span>}
        {bottomLine && <span>{bottomLine}</span>}
      </div>
      {/* Indicator bar, if needed */}
      {indicatorClassName ? (
        <div className={indicatorClassName}>
          <div className="ct">
            <div className="inner"></div>
          </div>
        </div>
      ) : indicatorVisible && (
        <div className="etvs-btn-indicator"></div>
      )}
    </button>
  );
};

export default DAButton;
